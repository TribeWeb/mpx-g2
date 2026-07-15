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
import { handleInboundSysEx } from '#shared/midi/inbound'
import { applyCcToPanelState } from '#shared/midi/midi-cc'
import { splitMidiRealtime } from '#shared/midi/midi-clock'
import { getPanelButtonSysExValue } from '#shared/midi/panel-buttons'
import { encodeParamValue } from '#shared/midi/param-value'
import {
  buildSystemConfigRequest,
  buildDisplayDumpRequest,
  buildLedDumpRequest
} from '#shared/midi/requests'
import {
  buildDataMessage,
  buildHandshakeMessage,
  buildPanelButtonMessage,
  createEmptyPanelState,
  formatSysExHex,
  parseMpxG2SysEx
} from '#shared/midi/sysex'
import { createGainEqSync } from './web-midi/gain-eq-sync'
import { clearRxProbeTimer, startPanelMirrorPoll, stopPanelMirrorPoll } from './web-midi/panel-mirror'
import { describeMidiMessage, matchesMpxPort, resolveInputPorts } from './web-midi/port-utils'
import { getWebMidiRuntime, MODULE_HANDLER_EPOCH, resetGainSyncState } from './web-midi/runtime'
import {
  clearPersistedPorts,
  readPersistedPorts,
  wantsAutoReconnect,
  writePersistedPorts
} from './web-midi/session'
import { createTempoLedController } from './web-midi/tempo-led'

const LOG_LIMIT = 200
const RX_PROBE_MS = 3500

const webMidiRuntime = getWebMidiRuntime()

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

  function resetPanelState() {
    panelState.value = createEmptyPanelState()
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

  const mirrorDeps = { runtime: webMidiRuntime, status, getSysexOptions, sendSysEx }

  const gainEq = createGainEqSync({
    runtime: webMidiRuntime,
    panelState,
    status,
    getSysexOptions,
    sendSysEx
  })

  const tempoLed = createTempoLedController({ runtime: webMidiRuntime, panelState })

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
        gainEq.scheduleGainEqResync('program change')
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
      gainEq.noteGainAlgResponse()
      gainEq.requestGainEqParams(result.gainAlg)
    }

    if (result.gainEqObjectType) {
      gainEq.acceptObjectTypeId(
        result.gainEqObjectType.band,
        result.gainEqObjectType.objectTypeId
      )
    } else if (result.objectTypeId != null) {
      gainEq.acceptOrphanObjectTypeId(result.objectTypeId)
    }

    if (result.objectDescription) {
      gainEq.applyObjectDescription(result.objectDescription)
    }

    if (isLedUpdate && tempoLed.isMidiClockDrivingTempo()) {
      tempoLed.setTempoLed(webMidiRuntime.tempoLedLit, { fromDump: true })
    }

    if (isLedUpdate) {
      if (digitsChanged) {
        gainEq.scheduleGainEqResync(`program digits ${webMidiRuntime.programDigits} → ${nextDigits}`)
      }
      webMidiRuntime.programDigits = nextDigits
    } else if (prevDigits !== nextDigits) {
      if (webMidiRuntime.programDigits != null && webMidiRuntime.programDigits !== nextDigits) {
        gainEq.scheduleGainEqResync(`program digits ${webMidiRuntime.programDigits} → ${nextDigits}`)
      }
      webMidiRuntime.programDigits = nextDigits
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
      tempoLed.handleMidiRealtime(byte)
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
      sendSysEx(buildHandshakeMessage(HandshakeCommand.TurnOnAllMidiOutput, opts), 'TurnOnAllMidiOutput')
    }, 50)
    window.setTimeout(() => {
      sendSysEx(buildHandshakeMessage(HandshakeCommand.TurnOnAutoDisplay, opts), 'TurnOnAutoDisplay')
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
      gainEq.requestGainEqState('after handshake')
    }, 1100)
    window.setTimeout(() => {
      sendSysEx(
        buildHandshakeMessage(HandshakeCommand.TurnOnAutoDisplay, opts),
        'TurnOnAutoDisplay (reassert)'
      )
      startPanelMirrorPoll(mirrorDeps)
    }, 1400)

    clearRxProbeTimer(webMidiRuntime)
    webMidiRuntime.rxProbeTimer = setTimeout(() => {
      if (midiRxStats.value.count === 0 && status.value === 'connected') {
        midiRxPathStatus.value = 'no_reply'
        console.warn(
          '[mpx-g2] No inbound MIDI after connect. Check G2 MIDI Out → interface MIDI In cable.'
        )
      }
    }, RX_PROBE_MS)
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
    clearRxProbeTimer(webMidiRuntime)
    stopPanelMirrorPoll(mirrorDeps)
    if (webMidiRuntime.gainSync.resyncTimer) {
      clearTimeout(webMidiRuntime.gainSync.resyncTimer)
      webMidiRuntime.gainSync.resyncTimer = null
    }
    tempoLed.clearTempoLedTimers()
    detachAllInputs()

    if (webMidiRuntime.midiAccess) {
      webMidiRuntime.midiAccess.onstatechange = null
    }

    webMidiRuntime.midiOutput = null
    webMidiRuntime.midiAccess = null
    webMidiRuntime.connectOptions = undefined
    webMidiRuntime.programDigits = null
    webMidiRuntime.handlerEpoch = null
    resetGainSyncState(webMidiRuntime)

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
      console.warn(`[mpx-g2] No SysEx value mapped for button release: ${button}`)
      return false
    }
    return sendSysEx(
      buildPanelButtonMessage(value, getSysexOptions()),
      `Panel release: ${button}`
    )
  }

  function rotateEncoder(delta: number) {
    const steps = Math.max(1, Math.min(8, Math.abs(Math.round(delta)) || 1))
    const code = delta >= 0 ? 0x42 : 0x43
    const label = delta >= 0 ? 'Encoder CW' : 'Encoder CCW'
    let sent = false
    for (let i = 0; i < steps; i++) {
      sent = sendPanelButtonCode(code, `${label} (${i + 1}/${steps})`) || sent
    }
    return sent
  }

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
    const alg = knobs.gainAlg >= 1
      ? knobs.gainAlg
      : webMidiRuntime.gainSync.alg >= 1
        ? webMidiRuntime.gainSync.alg
        : 1
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

  function trySessionReconnect() {
    if (!webMidiRuntime.midiOutput && wantsAutoReconnect()) {
      scheduleAutoReconnect('mounted')
    }
  }

  ensureMidiHandlersBound()

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
    resetPanelState,
    refreshPorts,
    pingDevice,
    requestPanelDumps,
    requestGainEqState: gainEq.requestGainEqState,
    pressButton,
    releaseButton,
    rotateEncoder,
    setGainKnob,
    clearLog,
    sendSysEx,
    trySessionReconnect
  }
}
