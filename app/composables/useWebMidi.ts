import type {
  FrontPanelButtonName,
  GainEqBand,
  MidiBridgeConnectionStatus,
  MidiLogEntry,
  MidiPortInfo,
  MidiRxPathStatus,
  MidiRxStats,
  MpxG2PanelState
} from '#shared/types/midi'
import { HandshakeCommand, SysExMessageType } from '#shared/types/midi'
import { gainEqControlPath, gainEqRangeKey, GAIN_EQ_DISPLAY_RANGE } from '#shared/midi/control-paths'
import { applyGainEqRange, handleInboundSysEx } from '#shared/midi/inbound'
import { applyCcToPanelState } from '#shared/midi/midi-cc'
import {
  MIDI_CLOCK,
  MIDI_CLOCK_ACTIVE_MS,
  MIDI_CLOCKS_PER_QUARTER,
  MIDI_CONTINUE,
  MIDI_START,
  MIDI_STOP,
  splitMidiRealtime,
  TEMPO_LED_FLASH_MS
} from '#shared/midi/midi-clock'
import { getPanelButtonSysExValue } from '#shared/midi/panel-buttons'
import { encodeParamValue } from '#shared/midi/param-value'
import { primaryObjectRange, type ObjectDescription } from '#shared/midi/object-description'
import {
  buildSystemConfigRequest,
  buildDisplayDumpRequest,
  buildLedDumpRequest,
  buildGainAlgRequest,
  buildGainEqRequest,
  buildGainEqObjectTypeIdRequest,
  buildObjectDescriptionRequest
} from '#shared/midi/requests'
import {
  buildDataMessage,
  buildHandshakeMessage,
  buildPanelButtonMessage,
  createEmptyPanelState,
  formatSysExHex,
  parseMpxG2SysEx
} from '#shared/midi/sysex'

const LOG_LIMIT = 200
const RX_PROBE_MS = 3500
const SESSION_PORTS_KEY = 'mpx-g2-webmidi-ports'
const SESSION_WANT_KEY = 'mpx-g2-webmidi-want-connected'

type PersistedMidiPorts = {
  inputId?: string
  outputId?: string
  productId?: number
}

type WebMidiRuntime = {
  midiAccess: MIDIAccess | null
  midiOutput: MIDIOutput | null
  connectOptions: { inputId?: string, outputId?: string } | undefined
  rxProbeTimer: ReturnType<typeof setTimeout> | null
  gainResyncTimer: ReturnType<typeof setTimeout> | null
  ledPollTimer: ReturnType<typeof setInterval> | null
  /** Second display dump mid-interval to catch the opposite blink phase. */
  displayBlinkFollowUpTimer: ReturnType<typeof setTimeout> | null
  attachedInputs: Map<string, MIDIInput>
  sysexBuffers: Map<string, number[]>
  /** Learned from inbound G2 SysEx (unit transmits 0x0f). */
  productId: number
  /** Last seen 7-segment digits (typically program number). */
  programDigits: string | null
  /** Identifies which module instance last bound input handlers (HMR-safe). */
  handlerEpoch: string | null
  /** Cache of Object Descriptions by type ID. */
  objectDescriptions: Map<number, ObjectDescription>
  /** Object Type IDs still awaiting description, mapped to Gain bands. */
  pendingDescriptionBands: Map<number, Set<GainEqBand>>
  /** FIFO when Object Type ID replies omit the control path (serialized requests). */
  pendingObjectTypeBands: GainEqBand[]
  /** Band we are currently awaiting an Object Type ID reply for (serial range fetch). */
  rangeAwaitingBand: GainEqBand | null
  /** Alg for the in-flight serialized range fetch. */
  rangeAwaitingAlg: number
  /** Cancels in-flight range requests when a newer sync starts. */
  rangeRequestGen: number
  /** Prevents overlapping auto-reconnect after HMR / page reload. */
  autoReconnectStarted: boolean
  /** MIDI Clock pulse count within the current quarter (0–23). */
  midiClockCount: number
  /** Until this timestamp, tempo LED is owned by MIDI Clock (ignore LED dump). */
  midiClockActiveUntil: number
  /** Current tempo LED level from clock flashes. */
  tempoLedLit: boolean
  tempoLedOffTimer: ReturnType<typeof setTimeout> | null
}

/**
 * Shared across all `useWebMidi()` callers AND Vite HMR reloads.
 * A plain module `const` is wiped on composable reload while Nuxt `useState`
 * still says "connected" — that produced "TX skipped (no MIDI output)".
 */
function getWebMidiRuntime(): WebMidiRuntime {
  const g = globalThis as typeof globalThis & { __mpxG2WebMidi?: WebMidiRuntime }
  if (!g.__mpxG2WebMidi) {
    g.__mpxG2WebMidi = {
      midiAccess: null,
      midiOutput: null,
      connectOptions: undefined,
      rxProbeTimer: null,
      gainResyncTimer: null,
      ledPollTimer: null,
      displayBlinkFollowUpTimer: null,
      attachedInputs: new Map(),
      sysexBuffers: new Map(),
      productId: 0x0f,
      programDigits: null,
      handlerEpoch: null,
      objectDescriptions: new Map(),
      pendingDescriptionBands: new Map(),
      pendingObjectTypeBands: [],
      rangeAwaitingBand: null,
      rangeAwaitingAlg: 0,
      rangeRequestGen: 0,
      autoReconnectStarted: false,
      midiClockCount: 0,
      midiClockActiveUntil: 0,
      tempoLedLit: false,
      tempoLedOffTimer: null
    }
  } else {
    // HMR may load a newer runtime shape onto an older global object.
    const runtime = g.__mpxG2WebMidi
    runtime.autoReconnectStarted ??= false
    runtime.displayBlinkFollowUpTimer ??= null
    runtime.midiClockCount ??= 0
    runtime.midiClockActiveUntil ??= 0
    runtime.tempoLedLit ??= false
    runtime.tempoLedOffTimer ??= null
    runtime.objectDescriptions ??= new Map()
    runtime.pendingDescriptionBands ??= new Map()
    runtime.pendingObjectTypeBands ??= []
    runtime.rangeAwaitingBand ??= null
    runtime.rangeAwaitingAlg ??= 0
  }
  return g.__mpxG2WebMidi
}

const webMidiRuntime = getWebMidiRuntime()
/** Unique per module evaluation; used to rebind port handlers after HMR. */
const MODULE_HANDLER_EPOCH = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function readPersistedPorts(): PersistedMidiPorts | null {
  if (!import.meta.client) {
    return null
  }
  try {
    const raw = sessionStorage.getItem(SESSION_PORTS_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as PersistedMidiPorts
  } catch {
    return null
  }
}

function writePersistedPorts(ports: PersistedMidiPorts) {
  if (!import.meta.client) {
    return
  }
  sessionStorage.setItem(SESSION_PORTS_KEY, JSON.stringify(ports))
  sessionStorage.setItem(SESSION_WANT_KEY, '1')
}

function clearPersistedPorts() {
  if (!import.meta.client) {
    return
  }
  sessionStorage.removeItem(SESSION_PORTS_KEY)
  sessionStorage.removeItem(SESSION_WANT_KEY)
}

function wantsAutoReconnect(): boolean {
  return import.meta.client && sessionStorage.getItem(SESSION_WANT_KEY) === '1'
}

function matchesMpxPort(name: string): boolean {
  const lower = name.toLowerCase()
  return lower.includes('mpx') || lower.includes('lexicon') || lower.includes('g2')
}

function describeMidiMessage(data: Uint8Array): string {
  const status = data[0] ?? 0
  if (status === 0xf0) {
    return 'SysEx (fragment?)'
  }
  if (status >= 0xf8) {
    return 'System realtime'
  }
  const channel = (status & 0x0f) + 1
  const type = status & 0xf0
  if (type === 0xb0 && data.length >= 3) {
    return `CC ch${channel} #${data[1]} = ${data[2]}`
  }
  if (type === 0xc0 && data.length >= 2) {
    return `Program ch${channel} = ${data[1]}`
  }
  return `MIDI 0x${status.toString(16)}`
}

export function useWebMidi() {
  const config = useRuntimeConfig()

  const status = useState<MidiBridgeConnectionStatus>('midi-hw-status', () => 'disconnected')
  const error = useState<string | null>('midi-hw-error', () => null)
  const deviceMode = useState<'simulated' | 'hardware' | null>('midi-hw-device-mode', () => null)
  const deviceName = useState<string | null>('midi-hw-device-name', () => null)
  const panelState = useState<MpxG2PanelState>('midi-hw-panel-state', () => createEmptyPanelState())
  const midiLog = useState<MidiLogEntry[]>('midi-hw-debug-log', () => [])
  const midiRxStats = useState<MidiRxStats>('midi-hw-rx-stats', () => ({
    count: 0,
    lastAt: null,
    listeningOn: []
  }))
  const midiRxPathStatus = useState<MidiRxPathStatus>('midi-hw-rx-path-status', () => 'unknown')
  const remoteDetected = useState<boolean>('midi-hw-remote-detected', () => false)
  const availableInputs = useState<MidiPortInfo[]>('midi-hw-available-inputs', () => [])
  const availableOutputs = useState<MidiPortInfo[]>('midi-hw-available-outputs', () => [])

  function getSysexOptions() {
    return {
      deviceId: Number(config.public.midiDeviceId ?? 0),
      productId: webMidiRuntime.productId
    }
  }

  function isSupported(): boolean {
    return import.meta.client && typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
  }

  function clearRxProbeTimer() {
    if (webMidiRuntime.rxProbeTimer) {
      clearTimeout(webMidiRuntime.rxProbeTimer)
      webMidiRuntime.rxProbeTimer = null
    }
  }

  function addLog(direction: 'tx' | 'rx', data: Uint8Array, note?: string, port?: string) {
    const hex = formatSysExHex(data)
    const entry: MidiLogEntry = { ts: Date.now(), direction, hex, note, port }

    midiLog.value = [entry, ...midiLog.value].slice(0, LOG_LIMIT)
    console.log(`[mpx-g2 ${direction}]`, port ? `[${port}]` : '', note ?? hex, note ? hex : '')
  }

  function recordRx() {
    midiRxStats.value = {
      count: midiRxStats.value.count + 1,
      lastAt: Date.now(),
      listeningOn: midiRxStats.value.listeningOn
    }
    midiRxPathStatus.value = 'ok'
  }

  function sendSysEx(data: Uint8Array, note?: string, options?: { silent?: boolean }): boolean {
    ensureMidiHandlersBound()
    if (!webMidiRuntime.midiOutput) {
      scheduleAutoReconnect('tx')
      if (status.value === 'connected' && deviceMode.value === 'hardware') {
        console.warn(
          `[mpx-g2] TX skipped (no MIDI output): ${note ?? formatSysExHex(data)} — reconnecting…`
        )
        status.value = 'disconnected'
        panelState.value.connected = false
      } else {
        console.warn(`[mpx-g2] TX skipped (no MIDI output): ${note ?? formatSysExHex(data)}`)
      }
      return false
    }

    try {
      webMidiRuntime.midiOutput.send(data)
    } catch (cause) {
      console.warn('[mpx-g2] MIDI send failed — clearing output and reconnecting', cause)
      webMidiRuntime.midiOutput = null
      scheduleAutoReconnect('send-error')
      return false
    }

    if (!options?.silent) {
      addLog('tx', data, note, webMidiRuntime.midiOutput.name ?? webMidiRuntime.midiOutput.id)
    }
    return true
  }

  function refreshPortLists() {
    if (!webMidiRuntime.midiAccess) {
      availableInputs.value = []
      availableOutputs.value = []
      return
    }

    availableInputs.value = [...webMidiRuntime.midiAccess.inputs.values()].map(port => ({
      id: port.id,
      name: port.name ?? 'Unknown input',
      manufacturer: port.manufacturer ?? undefined
    }))

    availableOutputs.value = [...webMidiRuntime.midiAccess.outputs.values()].map(port => ({
      id: port.id,
      name: port.name ?? 'Unknown output',
      manufacturer: port.manufacturer ?? undefined
    }))
  }

  function respondImAlive(note = 'ImAlive (reply)') {
    sendSysEx(buildHandshakeMessage(HandshakeCommand.ImAlive, getSysexOptions()), note)
  }

  function handleHandshakeInbound(payload: number[]) {
    const command = payload[0]
    if (command === HandshakeCommand.AreYouThere) {
      respondImAlive()
      return `Handshake: AreYouThere → replied ImAlive`
    }
    if (command === HandshakeCommand.Error) {
      return `Handshake: Error (G2 may have rejected our last message)`
    }
    return undefined
  }

  function handleCompleteMessage(data: Uint8Array, portName: string, portId: string) {
    webMidiRuntime.sysexBuffers.delete(portId)
    recordRx()

    if (data[0] !== 0xf0) {
      const statusByte = data[0] ?? 0
      if ((statusByte & 0xf0) === 0xc0) {
        const program = data[1] ?? 0
        addLog('rx', data, `Program change ch${(statusByte & 0x0f) + 1} = ${program}`, portName)
        scheduleGainEqResync('program change')
        return
      }

      const ccNote = applyCcToPanelState(data, panelState.value)
      addLog('rx', data, ccNote ?? describeMidiMessage(data), portName)
      return
    }

    const parsed = parseMpxG2SysEx(data)
    if (parsed && data[2] != null) {
      webMidiRuntime.productId = data[2]
    }
    const handshakeNote = parsed?.messageType === SysExMessageType.Handshake
      ? handleHandshakeInbound(parsed.payload)
      : undefined

    if (parsed?.messageType === SysExMessageType.SystemConfiguration) {
      remoteDetected.value = true
    }

    const prevDigits = panelState.value.leds.segments.join('')
    const result = handleInboundSysEx(data, panelState.value)

    const nextDigits = panelState.value.leds.segments.join('')
    const isLedUpdate = Boolean(
      result.note?.startsWith('LED') || result.note?.includes('LED dump')
    )
    const digitsChanged = isLedUpdate
      && webMidiRuntime.programDigits != null
      && webMidiRuntime.programDigits !== nextDigits

    // LED / display poll replies are frequent — only log when something changed.
    const isDisplayUpdate = Boolean(
      result.displayChanged != null
      || result.note?.includes('Display dump')
      || result.note?.includes('Formatted string display')
    )
    const quietPoll = (isLedUpdate && !digitsChanged && webMidiRuntime.programDigits != null)
      || (isDisplayUpdate && result.displayChanged === false)
    if (!quietPoll) {
      addLog('rx', data, handshakeNote ?? result.note, portName)
    }

    if (result.gainAlg != null && result.gainAlg >= 1) {
      requestGainEqParams(result.gainAlg)
    }

    if (result.gainEqObjectType) {
      acceptGainObjectTypeId(result.gainEqObjectType.band, result.gainEqObjectType.objectTypeId)
    } else if (result.objectTypeId != null) {
      // Pathless reply: only safe because range requests are serialized.
      const band = webMidiRuntime.rangeAwaitingBand
      if (band) {
        acceptGainObjectTypeId(band, result.objectTypeId)
      }
    }

    if (result.objectDescription) {
      applyObjectDescription(result.objectDescription)
    }

    // App LCD mirrors G2 solely via display dumps (Auto Display push or poll reply).
    // No trigger-specific display logic — whatever changed the G2 LCD shows up here.

    // Tempo LED is driven by MIDI Clock when present — don't let poll snapshots fight it.
    if (isLedUpdate && isMidiClockDrivingTempo()) {
      setTempoLed(webMidiRuntime.tempoLedLit, { fromDump: true })
    }

    if (isLedUpdate) {
      if (digitsChanged) {
        scheduleGainEqResync(`program digits ${webMidiRuntime.programDigits} → ${nextDigits}`)
      }
      webMidiRuntime.programDigits = nextDigits
    } else if (prevDigits !== nextDigits) {
      if (webMidiRuntime.programDigits != null && webMidiRuntime.programDigits !== nextDigits) {
        scheduleGainEqResync(`program digits ${webMidiRuntime.programDigits} → ${nextDigits}`)
      }
      webMidiRuntime.programDigits = nextDigits
    }
  }

  function isMidiClockDrivingTempo(): boolean {
    return Date.now() < webMidiRuntime.midiClockActiveUntil
  }

  function setTempoLed(on: boolean, options?: { fromDump?: boolean }) {
    webMidiRuntime.tempoLedLit = on
    const leds = panelState.value.leds
    if (leds.buttons.tempo === on) {
      return
    }
    panelState.value.leds = {
      ...leds,
      buttons: { ...leds.buttons, tempo: on }
    }
    if (!options?.fromDump) {
      panelState.value.lastUpdated = Date.now()
    }
  }

  function flashTempoLed() {
    if (webMidiRuntime.tempoLedOffTimer) {
      clearTimeout(webMidiRuntime.tempoLedOffTimer)
      webMidiRuntime.tempoLedOffTimer = null
    }
    setTempoLed(true)
    webMidiRuntime.tempoLedOffTimer = setTimeout(() => {
      webMidiRuntime.tempoLedOffTimer = null
      setTempoLed(false)
    }, TEMPO_LED_FLASH_MS)
  }

  function handleMidiRealtime(byte: number) {
    if (byte === MIDI_CLOCK) {
      webMidiRuntime.midiClockActiveUntil = Date.now() + MIDI_CLOCK_ACTIVE_MS
      webMidiRuntime.midiClockCount = (webMidiRuntime.midiClockCount + 1) % MIDI_CLOCKS_PER_QUARTER
      if (webMidiRuntime.midiClockCount === 0) {
        flashTempoLed()
      }
      return
    }
    if (byte === MIDI_START || byte === MIDI_CONTINUE) {
      webMidiRuntime.midiClockActiveUntil = Date.now() + MIDI_CLOCK_ACTIVE_MS
      webMidiRuntime.midiClockCount = 0
      flashTempoLed()
      return
    }
    if (byte === MIDI_STOP) {
      webMidiRuntime.midiClockCount = 0
      webMidiRuntime.midiClockActiveUntil = 0
      if (webMidiRuntime.tempoLedOffTimer) {
        clearTimeout(webMidiRuntime.tempoLedOffTimer)
        webMidiRuntime.tempoLedOffTimer = null
      }
      setTempoLed(false)
    }
  }

  function onMidiMessage(port: MIDIInput, event: MIDIMessageEvent) {
    const raw = event.data
    if (!raw || raw.length === 0) {
      return
    }

    const portName = port.name ?? port.id
    const portId = port.id
    const { realtime, rest } = splitMidiRealtime(new Uint8Array(raw))

    for (const byte of realtime) {
      handleMidiRealtime(byte)
    }
    if (rest.length === 0) {
      return
    }

    if (rest[0] === 0xf0) {
      const buffer = [...rest]
      webMidiRuntime.sysexBuffers.set(portId, buffer)
      if (rest[rest.length - 1] === 0xf7) {
        handleCompleteMessage(new Uint8Array(buffer), portName, portId)
      }
      return
    }

    const buffer = webMidiRuntime.sysexBuffers.get(portId)
    if (buffer) {
      buffer.push(...rest)
      if (rest[rest.length - 1] === 0xf7) {
        handleCompleteMessage(new Uint8Array(buffer), portName, portId)
      } else {
        webMidiRuntime.sysexBuffers.set(portId, buffer)
      }
      return
    }

    handleCompleteMessage(rest, portName, portId)
  }

  function runInitialHandshake() {
    const opts = getSysexOptions()
    window.setTimeout(() => {
      sendSysEx(
        buildHandshakeMessage(HandshakeCommand.TurnOnAllMidiOutput, opts),
        'TurnOnAllMidiOutput'
      )
    }, 50)
    window.setTimeout(() => {
      sendSysEx(
        buildHandshakeMessage(HandshakeCommand.TurnOnAutoDisplay, opts),
        'TurnOnAutoDisplay'
      )
    }, 120)
    window.setTimeout(() => {
      respondImAlive('ImAlive (announce)')
    }, 200)
    window.setTimeout(() => {
      pingDevice('SystemConfigRequest (RX probe)')
    }, 400)
    window.setTimeout(() => {
      pingDevice('SystemConfigRequest (product 0x0f)', 0x0f)
    }, 700)
    window.setTimeout(() => {
      requestPanelDumps('after handshake')
    }, 900)
    window.setTimeout(() => {
      requestGainEqState('after handshake')
    }, 1100)
    window.setTimeout(() => {
      // Re-assert Auto Display after the unit has settled.
      sendSysEx(
        buildHandshakeMessage(HandshakeCommand.TurnOnAutoDisplay, opts),
        'TurnOnAutoDisplay (reassert)'
      )
      startPanelMirrorPoll()
    }, 1400)

    clearRxProbeTimer()
    webMidiRuntime.rxProbeTimer = setTimeout(() => {
      if (midiRxStats.value.count === 0 && status.value === 'connected') {
        midiRxPathStatus.value = 'no_reply'
        console.warn(
          '[mpx-g2] No inbound MIDI after connect. Check G2 MIDI Out → interface MIDI In cable.'
        )
      }
    }, RX_PROBE_MS)
  }

  /**
   * Keep the virtual panel in sync with the G2.
   * - LED dump: program digits (G2 does not TX MIDI Program Change on front-panel loads)
   * - Display dump: LCD text (Auto Display is unreliable on this unit; poll is the fallback)
   * Inbound dumps always update panelState — that is the only path that writes the app LCD.
   */
  function startPanelMirrorPoll() {
    stopPanelMirrorPoll()
    webMidiRuntime.ledPollTimer = setInterval(() => {
      if (status.value !== 'connected' || !webMidiRuntime.midiOutput) {
        return
      }
      const opts = getSysexOptions()
      sendSysEx(
        buildLedDumpRequest(opts.deviceId, opts.productId),
        'LED dump poll',
        { silent: true }
      )
      sendSysEx(
        buildDisplayDumpRequest(opts.deviceId, opts.productId),
        'Display dump poll',
        { silent: true }
      )
      // Active-param / LED highlight blink: second sample helps detect toggles;
      // the UI then flashes locally (phase need not match the G2).
      if (webMidiRuntime.displayBlinkFollowUpTimer) {
        clearTimeout(webMidiRuntime.displayBlinkFollowUpTimer)
      }
      webMidiRuntime.displayBlinkFollowUpTimer = setTimeout(() => {
        webMidiRuntime.displayBlinkFollowUpTimer = null
        if (status.value !== 'connected' || !webMidiRuntime.midiOutput) {
          return
        }
        const followOpts = getSysexOptions()
        sendSysEx(
          buildDisplayDumpRequest(followOpts.deviceId, followOpts.productId),
          'Display dump poll (blink phase)',
          { silent: true }
        )
      }, 280)
    }, 1000)
  }

  function stopPanelMirrorPoll() {
    if (webMidiRuntime.ledPollTimer) {
      clearInterval(webMidiRuntime.ledPollTimer)
      webMidiRuntime.ledPollTimer = null
    }
    if (webMidiRuntime.displayBlinkFollowUpTimer) {
      clearTimeout(webMidiRuntime.displayBlinkFollowUpTimer)
      webMidiRuntime.displayBlinkFollowUpTimer = null
    }
  }

  function detachAllInputs() {
    for (const input of webMidiRuntime.attachedInputs.values()) {
      input.onmidimessage = null
    }
    webMidiRuntime.attachedInputs.clear()
    webMidiRuntime.sysexBuffers.clear()
  }

  function attachInputs(ports: MIDIInput[]) {
    detachAllInputs()

    for (const port of ports) {
      port.onmidimessage = event => onMidiMessage(port, event)
      webMidiRuntime.attachedInputs.set(port.id, port)
      console.info(
        `[mpx-g2] Attached input "${port.name}" id=${port.id} connection=${port.connection}`
      )
    }

    midiRxStats.value = {
      ...midiRxStats.value,
      listeningOn: ports.map(port => port.name ?? port.id)
    }
  }

  function resolveInputPorts(inputs: MIDIInput[], inputId?: string): MIDIInput[] {
    if (inputId) {
      const selected = inputs.find(port => port.id === inputId)
      return selected ? [selected] : []
    }
    return inputs
  }

  function reattachInputs() {
    if (!webMidiRuntime.midiAccess || !webMidiRuntime.midiOutput || status.value !== 'connected') {
      return
    }

    const inputs = [...webMidiRuntime.midiAccess.inputs.values()]
    const inputPorts = resolveInputPorts(inputs, webMidiRuntime.connectOptions?.inputId)
    if (inputPorts.length > 0) {
      attachInputs(inputPorts)
    }
  }

  /**
   * After Vite HMR, this module's closures are new but the MIDI port may still be open
   * on globalThis. Rebind input handlers so RX uses the current code path.
   */
  function ensureMidiHandlersBound() {
    if (!import.meta.client || !webMidiRuntime.midiOutput || !webMidiRuntime.midiAccess) {
      return
    }
    if (status.value !== 'connected' || deviceMode.value !== 'hardware') {
      return
    }
    if (webMidiRuntime.handlerEpoch === MODULE_HANDLER_EPOCH) {
      return
    }
    reattachInputs()
    webMidiRuntime.handlerEpoch = MODULE_HANDLER_EPOCH
    console.info('[mpx-g2] Rebound MIDI input handlers after module reload')
  }

  function scheduleAutoReconnect(reason: string) {
    if (!import.meta.client || !wantsAutoReconnect() || webMidiRuntime.autoReconnectStarted) {
      return
    }
    if (webMidiRuntime.midiOutput) {
      return
    }
    webMidiRuntime.autoReconnectStarted = true
    const ports = webMidiRuntime.connectOptions ?? readPersistedPorts() ?? undefined
    console.info(`[mpx-g2] Auto-reconnect after ${reason}`)
    void connect(ports).finally(() => {
      webMidiRuntime.autoReconnectStarted = false
    })
  }

  async function connect(options?: { inputId?: string, outputId?: string }) {
    if (import.meta.server) {
      return
    }

    if (!isSupported()) {
      status.value = 'error'
      error.value = 'Web MIDI is not supported. Use Google Chrome on desktop.'
      return
    }

    // Keep session ports until a new connection succeeds (HMR-friendly).
    disconnect({ forgetSession: false })
    const persisted = readPersistedPorts()
    const resolvedOptions = {
      inputId: options?.inputId ?? persisted?.inputId,
      outputId: options?.outputId ?? persisted?.outputId
    }
    webMidiRuntime.connectOptions = resolvedOptions
    webMidiRuntime.productId = Number(
      persisted?.productId ?? config.public.midiProductId ?? 0x0f
    )
    webMidiRuntime.programDigits = null
    status.value = 'connecting'
    error.value = null
    midiLog.value = []
    remoteDetected.value = false
    midiRxPathStatus.value = 'unknown'
    midiRxStats.value = { count: 0, lastAt: null, listeningOn: [] }

    try {
      webMidiRuntime.midiAccess = await navigator.requestMIDIAccess({ sysex: true })
      refreshPortLists()

      webMidiRuntime.midiAccess.onstatechange = () => {
        refreshPortLists()
        reattachInputs()
      }

      const inputs = [...webMidiRuntime.midiAccess.inputs.values()]
      const outputs = [...webMidiRuntime.midiAccess.outputs.values()]

      console.info(
        '[mpx-g2] Ports:',
        `inputs=${inputs.map(p => p.name).join(', ') || '(none)'}`,
        `outputs=${outputs.map(p => p.name).join(', ') || '(none)'}`
      )

      const preferredOutputs = outputs.filter(p => matchesMpxPort(p.name ?? ''))

      const outputPort = resolvedOptions.outputId
        ? webMidiRuntime.midiAccess.outputs.get(resolvedOptions.outputId) ?? null
        : preferredOutputs[0] ?? outputs[0] ?? null

      if (!outputPort) {
        throw new Error('No MIDI output port found. Connect your interface and try again.')
      }

      const inputPorts = resolveInputPorts(inputs, resolvedOptions.inputId)
      if (inputPorts.length === 0) {
        throw new Error(
          'No MIDI input ports in Chrome. Plug G2 MIDI Out into your interface MIDI In, then click Re-scan.'
        )
      }

      await outputPort.open()
      webMidiRuntime.midiOutput = outputPort
      attachInputs(inputPorts)
      webMidiRuntime.handlerEpoch = MODULE_HANDLER_EPOCH

      deviceMode.value = 'hardware'
      deviceName.value = outputPort.name ?? 'MPX-G2'
      status.value = 'connected'
      panelState.value.connected = true
      panelState.value.lastUpdated = Date.now()

      writePersistedPorts({
        inputId: resolvedOptions.inputId ?? inputPorts[0]?.id,
        outputId: outputPort.id,
        productId: webMidiRuntime.productId
      })

      runInitialHandshake()

      console.info(
        `[mpx-g2] TX → "${outputPort.name}" | RX ← ${inputPorts.map(p => `"${p.name}"`).join(', ')}`
      )
    } catch (cause) {
      status.value = 'error'
      error.value = cause instanceof Error ? cause.message : 'Failed to open MIDI ports'
      deviceMode.value = null
      deviceName.value = null
      panelState.value.connected = false
    }
  }

  function disconnect(options?: { forgetSession?: boolean }) {
    clearRxProbeTimer()
    stopPanelMirrorPoll()
    if (webMidiRuntime.gainResyncTimer) {
      clearTimeout(webMidiRuntime.gainResyncTimer)
      webMidiRuntime.gainResyncTimer = null
    }
    if (webMidiRuntime.tempoLedOffTimer) {
      clearTimeout(webMidiRuntime.tempoLedOffTimer)
      webMidiRuntime.tempoLedOffTimer = null
    }
    webMidiRuntime.midiClockCount = 0
    webMidiRuntime.midiClockActiveUntil = 0
    webMidiRuntime.tempoLedLit = false
    detachAllInputs()

    if (webMidiRuntime.midiAccess) {
      webMidiRuntime.midiAccess.onstatechange = null
    }

    webMidiRuntime.midiOutput = null
    webMidiRuntime.midiAccess = null
    webMidiRuntime.connectOptions = undefined
    webMidiRuntime.programDigits = null
    webMidiRuntime.handlerEpoch = null
    webMidiRuntime.pendingObjectTypeBands = []
    webMidiRuntime.rangeAwaitingBand = null
    webMidiRuntime.rangeAwaitingAlg = 0
    webMidiRuntime.pendingDescriptionBands.clear()

    if (options?.forgetSession !== false) {
      clearPersistedPorts()
    }

    status.value = 'disconnected'
    panelState.value.connected = false
    deviceMode.value = null
    deviceName.value = null
    remoteDetected.value = false
    midiRxPathStatus.value = 'unknown'
    availableInputs.value = []
    availableOutputs.value = []
    midiRxStats.value = { count: 0, lastAt: null, listeningOn: [] }
  }

  async function refreshPorts() {
    if (!isSupported()) {
      return
    }

    if (!webMidiRuntime.midiAccess) {
      webMidiRuntime.midiAccess = await navigator.requestMIDIAccess({ sysex: true })
    }

    refreshPortLists()
    reattachInputs()
  }

  function pingDevice(note = 'SystemConfigRequest (manual ping)', productId?: number) {
    const opts = getSysexOptions()
    return sendSysEx(
      buildSystemConfigRequest(opts.deviceId, productId ?? opts.productId),
      note
    )
  }

  function requestPanelDumps(note = 'panel sync') {
    const opts = getSysexOptions()
    sendSysEx(buildLedDumpRequest(opts.deviceId, opts.productId), `LED dump request (${note})`)
    sendSysEx(buildDisplayDumpRequest(opts.deviceId, opts.productId), `Display dump request (${note})`)
  }

  function requestGainEqParams(alg: number, note = 'gain eq sync') {
    if (alg < 1) {
      return
    }
    const opts = getSysexOptions()
    const bands = ['low', 'mid', 'high'] as const
    bands.forEach((band, index) => {
      window.setTimeout(() => {
        sendSysEx(
          buildGainEqRequest(alg, band, opts.deviceId, opts.productId),
          `Gain ${band} request (${note}, alg ${alg})`
        )
      }, index * 60)
    })
    requestGainEqRanges(alg, note)
  }

  /**
   * Request Object Type IDs for Gain Lo/Mid/Hi, then Object Descriptions for min/max.
   * Serialized one band at a time so pathless Object Type ID replies cannot be
   * FIFO-mismatched (that assigned Hi’s 0…5 range to Lo and left Hi bipolar → 0 at noon).
   */
  function requestGainEqRanges(alg: number, note = 'gain ranges') {
    if (alg < 1) {
      return
    }
    const gen = ++webMidiRuntime.rangeRequestGen
    webMidiRuntime.pendingObjectTypeBands = ['low', 'mid', 'high']
    webMidiRuntime.rangeAwaitingBand = null
    webMidiRuntime.rangeAwaitingAlg = alg
    pumpGainRangeRequests(note, gen)
  }

  function pumpGainRangeRequests(note: string, gen = webMidiRuntime.rangeRequestGen) {
    if (webMidiRuntime.rangeRequestGen !== gen) {
      return
    }
    if (webMidiRuntime.rangeAwaitingBand) {
      return
    }
    const band = webMidiRuntime.pendingObjectTypeBands[0]
    const alg = webMidiRuntime.rangeAwaitingAlg
    if (!band || alg < 1) {
      return
    }
    webMidiRuntime.rangeAwaitingBand = band
    const opts = getSysexOptions()
    sendSysEx(
      buildGainEqObjectTypeIdRequest(alg, band, opts.deviceId, opts.productId),
      `Gain ${band} Object Type ID (${note}, alg ${alg})`
    )
  }

  function acceptGainObjectTypeId(band: GainEqBand, objectTypeId: number) {
    const pendingIdx = webMidiRuntime.pendingObjectTypeBands.indexOf(band)
    if (pendingIdx >= 0) {
      webMidiRuntime.pendingObjectTypeBands.splice(pendingIdx, 1)
    }
    if (webMidiRuntime.rangeAwaitingBand === band) {
      webMidiRuntime.rangeAwaitingBand = null
    }
    resolveGainObjectType(band, objectTypeId)
    pumpGainRangeRequests('gain ranges')
  }

  function resolveGainObjectType(band: GainEqBand, objectTypeId: number) {
    const cached = webMidiRuntime.objectDescriptions.get(objectTypeId)
    if (cached) {
      applyObjectDescriptionToBand(band, cached)
      return
    }

    let pending = webMidiRuntime.pendingDescriptionBands.get(objectTypeId)
    if (!pending) {
      pending = new Set()
      webMidiRuntime.pendingDescriptionBands.set(objectTypeId, pending)
      const opts = getSysexOptions()
      sendSysEx(
        buildObjectDescriptionRequest(objectTypeId, opts.deviceId, opts.productId),
        `Object Description request type=${objectTypeId} (${band})`
      )
    }
    pending.add(band)
  }

  function applyObjectDescriptionToBand(band: GainEqBand, description: ObjectDescription) {
    const range = primaryObjectRange(description)
    if (!range) {
      return
    }
    applyGainEqRange(
      panelState.value,
      band,
      range,
      description.byteCount === 1 || description.byteCount === 2 ? description.byteCount : undefined
    )
    // Keep the live value inside the new travel so the encoder angle is meaningful.
    const knobs = panelState.value.knobs
    const valueKey = band === 'low' ? 'gainLow' : band === 'mid' ? 'gainMid' : 'gainHigh'
    const value = knobs[valueKey]
    if (value < range.min || value > range.max) {
      panelState.value.knobs = {
        ...knobs,
        [valueKey]: Math.min(range.max, Math.max(range.min, value))
      }
    }
    console.info(
      `[mpx-g2] Gain ${band} range ← "${description.name}" ${range.min}…${range.max} (${description.byteCount} byte)`
    )
  }

  function applyObjectDescription(description: ObjectDescription) {
    webMidiRuntime.objectDescriptions.set(description.objectTypeId, description)
    const pending = webMidiRuntime.pendingDescriptionBands.get(description.objectTypeId)
    if (!pending || pending.size === 0) {
      return
    }
    for (const band of pending) {
      applyObjectDescriptionToBand(band, description)
    }
    webMidiRuntime.pendingDescriptionBands.delete(description.objectTypeId)
  }

  /** Ask the G2 for the active Gain algorithm, then Lo / Mid / Hi (+ ranges). */
  function requestGainEqState(note = 'gain sync') {
    const opts = getSysexOptions()
    sendSysEx(buildGainAlgRequest(opts.deviceId, opts.productId), `Gain alg request (${note})`)

    // Fallback if the alg reply is slow/missing: poll using last-known alg.
    window.setTimeout(() => {
      const alg = panelState.value.knobs.gainAlg
      if (alg >= 1) {
        requestGainEqParams(alg, `${note} fallback`)
      }
    }, 400)
  }

  /** Debounced resync after program loads (via Auto Display / digits / rare MIDI PC). */
  function scheduleGainEqResync(note: string) {
    if (webMidiRuntime.gainResyncTimer) {
      clearTimeout(webMidiRuntime.gainResyncTimer)
    }
    webMidiRuntime.gainResyncTimer = setTimeout(() => {
      webMidiRuntime.gainResyncTimer = null
      if (status.value !== 'connected') {
        return
      }
      console.info(`[mpx-g2] Gain EQ resync (${note})`)
      requestGainEqState(note)
    }, 450)
  }

  function pressButton(button: FrontPanelButtonName) {
    const value = getPanelButtonSysExValue(button, 'press')
    if (value == null) {
      console.warn(`[mpx-g2] No SysEx value mapped for button: ${button}`)
      return false
    }
    return sendSysEx(
      buildPanelButtonMessage(value, getSysexOptions()),
      `Panel press: ${button}`
    )
  }

  function releaseButton(button: FrontPanelButtonName) {
    const value = getPanelButtonSysExValue(button, 'release')
    if (value == null) {
      return false
    }
    return sendSysEx(
      buildPanelButtonMessage(value, getSysexOptions()),
      `Panel release: ${button}`
    )
  }

  function rotateEncoder(delta: number) {
    // MPX 1 keyboard-driver codes; G2 may honor these for the data wheel.
    const steps = Math.max(1, Math.min(8, Math.abs(Math.round(delta)) || 1))
    const code = delta >= 0 ? 0x42 : 0x43
    const label = delta >= 0 ? 'Encoder CW' : 'Encoder CCW'
    let sent = false
    for (let i = 0; i < steps; i++) {
      sent = sendPanelButtonCode(code, `${label} (${i + 1}/${steps})`) || sent
    }
    return sent
  }

  /** Raw Panel Button SysEx (System → Panel → Pnl Button). */
  function sendPanelButtonCode(code: number, note?: string): boolean {
    return sendSysEx(
      buildPanelButtonMessage(code & 0xff, getSysexOptions()),
      note ?? `Panel button 0x${(code & 0xff).toString(16)}`
    )
  }

  function setGainKnob(band: GainEqBand, value: number) {
    const knobs = panelState.value.knobs
    const rangeKey = gainEqRangeKey(band)
    const range = knobs[rangeKey] ?? GAIN_EQ_DISPLAY_RANGE[band]
    const clamped = Math.min(range.max, Math.max(range.min, Math.round(value)))
    const alg = knobs.gainAlg || 1
    // Match last inbound size (Gain EQ automation from this unit is 1 byte).
    const valueBytes: 1 | 2 = knobs.gainValueBytes === 1 ? 1 : 2

    panelState.value.knobs = {
      ...knobs,
      gainAlg: alg,
      gainValueBytes: valueBytes,
      gainLow: band === 'low' ? clamped : knobs.gainLow,
      gainMid: band === 'mid' ? clamped : knobs.gainMid,
      gainHigh: band === 'high' ? clamped : knobs.gainHigh
    }
    panelState.value.lastUpdated = Date.now()

    // Do not drive Edit → Gain → >: that opens the effect editor and shows
    // "Effect not loaded" when Gain isn't the active Edit target (and even when
    // Gain is in the program). Soft Lo/Mid/Hi are written by path alone — same
    // as turning the physical pots. LCD follows via Auto Display / dumps.

    const opts = getSysexOptions()
    return sendSysEx(
      buildDataMessage(
        encodeParamValue(clamped, valueBytes),
        gainEqControlPath(alg, band),
        opts
      ),
      `Gain ${band} = ${clamped} (alg ${alg})`
    )
  }

  function clearLog() {
    midiLog.value = []
  }

  ensureMidiHandlersBound()
  // Defer auto-reconnect until after mount so SSR + first client paint both
  // show "Disconnected" (avoids hydration mismatch with "Connecting…").
  if (import.meta.client) {
    onMounted(() => {
      if (!webMidiRuntime.midiOutput && wantsAutoReconnect()) {
        scheduleAutoReconnect('mounted')
      }
    })
  }

  return {
    status: readonly(status),
    error: readonly(error),
    deviceMode: readonly(deviceMode),
    deviceName: readonly(deviceName),
    panelState: readonly(panelState),
    midiLog: readonly(midiLog),
    midiRxStats: readonly(midiRxStats),
    midiRxPathStatus: readonly(midiRxPathStatus),
    remoteDetected: readonly(remoteDetected),
    availableInputs: readonly(availableInputs),
    availableOutputs: readonly(availableOutputs),
    isSupported,
    connect,
    disconnect,
    refreshPorts,
    pingDevice,
    requestPanelDumps,
    requestGainEqState,
    pressButton,
    releaseButton,
    rotateEncoder,
    setGainKnob,
    clearLog,
    sendSysEx
  }
}
