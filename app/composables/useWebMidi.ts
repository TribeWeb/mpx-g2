import type {
  FrontPanelButtonName,
  MidiBridgeConnectionStatus,
  MidiLogEntry,
  MidiPortInfo,
  MidiRxPathStatus,
  MidiRxStats,
  MpxG2PanelState
} from '#shared/types/midi'
import { HandshakeCommand, SysExMessageType } from '#shared/types/midi'
import { handleInboundSysEx } from '#shared/midi/inbound'
import { applyCcToPanelState } from '#shared/midi/midi-cc'
import { getPanelButtonSysExValue } from '#shared/midi/panel-buttons'
import { buildSystemConfigRequest, buildDisplayDumpRequest, buildLedDumpRequest, buildLedDumpRequestAlt } from '#shared/midi/requests'
import {
  buildHandshakeMessage,
  buildPanelButtonMessage,
  createEmptyPanelState,
  formatSysExHex,
  parseMpxG2SysEx
} from '#shared/midi/sysex'

const LOG_LIMIT = 200
const RX_PROBE_MS = 3500

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

  const status = useState<MidiBridgeConnectionStatus>('midi-bridge-status', () => 'disconnected')
  const error = useState<string | null>('midi-bridge-error', () => null)
  const deviceMode = useState<'simulated' | 'hardware' | null>('midi-device-mode', () => null)
  const deviceName = useState<string | null>('midi-device-name', () => null)
  const panelState = useState<MpxG2PanelState>('midi-panel-state', () => createEmptyPanelState())
  const midiLog = useState<MidiLogEntry[]>('midi-debug-log', () => [])
  const midiRxStats = useState<MidiRxStats>('midi-rx-stats', () => ({
    count: 0,
    lastAt: null,
    listeningOn: []
  }))
  const midiRxPathStatus = useState<MidiRxPathStatus>('midi-rx-path-status', () => 'unknown')
  const remoteDetected = useState<boolean>('midi-remote-detected', () => false)
  const availableInputs = useState<MidiPortInfo[]>('midi-available-inputs', () => [])
  const availableOutputs = useState<MidiPortInfo[]>('midi-available-outputs', () => [])

  let midiAccess: MIDIAccess | null = null
  let midiOutput: MIDIOutput | null = null
  let connectOptions: { inputId?: string, outputId?: string } | undefined
  let rxProbeTimer: ReturnType<typeof setTimeout> | null = null
  const attachedInputs = new Map<string, MIDIInput>()
  const sysexBuffers = new Map<string, number[]>()

  const sysexOptions = computed(() => ({
    deviceId: Number(config.public.midiDeviceId ?? 0),
    productId: Number(config.public.midiProductId ?? 0x09)
  }))

  function isSupported(): boolean {
    return import.meta.client && typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
  }

  function clearRxProbeTimer() {
    if (rxProbeTimer) {
      clearTimeout(rxProbeTimer)
      rxProbeTimer = null
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

  function sendSysEx(data: Uint8Array, note?: string): boolean {
    if (!midiOutput) {
      return false
    }

    midiOutput.send(data, 0)
    addLog('tx', data, note)
    return true
  }

  function refreshPortLists() {
    if (!midiAccess) {
      availableInputs.value = []
      availableOutputs.value = []
      return
    }

    availableInputs.value = [...midiAccess.inputs.values()].map(port => ({
      id: port.id,
      name: port.name ?? 'Unknown input',
      manufacturer: port.manufacturer ?? undefined
    }))

    availableOutputs.value = [...midiAccess.outputs.values()].map(port => ({
      id: port.id,
      name: port.name ?? 'Unknown output',
      manufacturer: port.manufacturer ?? undefined
    }))
  }

  function respondImAlive(note = 'ImAlive (reply)') {
    sendSysEx(buildHandshakeMessage(HandshakeCommand.ImAlive, sysexOptions.value), note)
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
    sysexBuffers.delete(portId)
    recordRx()

    if (data[0] !== 0xf0) {
      const ccNote = applyCcToPanelState(data, panelState.value)
      addLog('rx', data, ccNote ?? describeMidiMessage(data), portName)
      return
    }

    const parsed = parseMpxG2SysEx(data)
    const handshakeNote = parsed?.messageType === SysExMessageType.Handshake
      ? handleHandshakeInbound(parsed.payload)
      : undefined

    if (parsed?.messageType === SysExMessageType.SystemConfiguration) {
      remoteDetected.value = true
    }

    const result = handleInboundSysEx(data, panelState.value)
    addLog('rx', data, handshakeNote ?? result.note, portName)
  }

  function onMidiMessage(port: MIDIInput, event: MIDIMessageEvent) {
    const raw = event.data
    if (!raw || raw.length === 0) {
      return
    }

    const portName = port.name ?? port.id
    const portId = port.id
    const data = new Uint8Array(raw)

    if (data[0] === 0xf0) {
      const buffer = [...data]
      sysexBuffers.set(portId, buffer)
      if (data[data.length - 1] === 0xf7) {
        handleCompleteMessage(new Uint8Array(buffer), portName, portId)
      }
      return
    }

    const buffer = sysexBuffers.get(portId)
    if (buffer) {
      buffer.push(...data)
      if (data[data.length - 1] === 0xf7) {
        handleCompleteMessage(new Uint8Array(buffer), portName, portId)
      } else {
        sysexBuffers.set(portId, buffer)
      }
      return
    }

    handleCompleteMessage(data, portName, portId)
  }

  function runInitialHandshake() {
    const opts = sysexOptions.value
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

    clearRxProbeTimer()
    rxProbeTimer = setTimeout(() => {
      if (midiRxStats.value.count === 0 && status.value === 'connected') {
        midiRxPathStatus.value = 'no_reply'
        console.warn(
          '[mpx-g2] No inbound MIDI after connect. Check G2 MIDI Out → interface MIDI In cable.'
        )
      }
    }, RX_PROBE_MS)
  }

  function detachAllInputs() {
    for (const input of attachedInputs.values()) {
      input.onmidimessage = null
    }
    attachedInputs.clear()
    sysexBuffers.clear()
  }

  function attachInputs(ports: MIDIInput[]) {
    detachAllInputs()

    for (const port of ports) {
      port.onmidimessage = event => onMidiMessage(port, event)
      attachedInputs.set(port.id, port)
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
    if (!midiAccess || !midiOutput || status.value !== 'connected') {
      return
    }

    const inputs = [...midiAccess.inputs.values()]
    const inputPorts = resolveInputPorts(inputs, connectOptions?.inputId)
    if (inputPorts.length > 0) {
      attachInputs(inputPorts)
    }
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

    disconnect()
    connectOptions = options
    status.value = 'connecting'
    error.value = null
    midiLog.value = []
    remoteDetected.value = false
    midiRxPathStatus.value = 'unknown'
    midiRxStats.value = { count: 0, lastAt: null, listeningOn: [] }

    try {
      midiAccess = await navigator.requestMIDIAccess({ sysex: true })
      refreshPortLists()

      midiAccess.onstatechange = () => {
        refreshPortLists()
        reattachInputs()
      }

      const inputs = [...midiAccess.inputs.values()]
      const outputs = [...midiAccess.outputs.values()]

      console.info(
        '[mpx-g2] Ports:',
        `inputs=${inputs.map(p => p.name).join(', ') || '(none)'}`,
        `outputs=${outputs.map(p => p.name).join(', ') || '(none)'}`
      )

      const preferredOutputs = outputs.filter(p => matchesMpxPort(p.name ?? ''))

      const outputPort = options?.outputId
        ? midiAccess.outputs.get(options.outputId) ?? null
        : preferredOutputs[0] ?? outputs[0] ?? null

      if (!outputPort) {
        throw new Error('No MIDI output port found. Connect your interface and try again.')
      }

      const inputPorts = resolveInputPorts(inputs, options?.inputId)
      if (inputPorts.length === 0) {
        throw new Error(
          'No MIDI input ports in Chrome. Plug G2 MIDI Out into your interface MIDI In, then click Re-scan.'
        )
      }

      midiOutput = outputPort
      attachInputs(inputPorts)

      deviceMode.value = 'hardware'
      deviceName.value = outputPort.name ?? 'MPX-G2'
      status.value = 'connected'
      panelState.value.connected = true
      panelState.value.lastUpdated = Date.now()

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

  function disconnect() {
    clearRxProbeTimer()
    detachAllInputs()

    if (midiAccess) {
      midiAccess.onstatechange = null
    }

    midiOutput = null
    midiAccess = null
    connectOptions = undefined

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

    if (!midiAccess) {
      midiAccess = await navigator.requestMIDIAccess({ sysex: true })
    }

    refreshPortLists()
    reattachInputs()
  }

  function pingDevice(note = 'SystemConfigRequest (manual ping)', productId?: number) {
    const opts = sysexOptions.value
    return sendSysEx(
      buildSystemConfigRequest(opts.deviceId, productId ?? opts.productId),
      note
    )
  }

  function requestPanelDumps(note = 'panel sync') {
    const opts = sysexOptions.value
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
      buildPanelButtonMessage(value, sysexOptions.value),
      `Panel press: ${button}`
    )
  }

  function releaseButton(button: FrontPanelButtonName) {
    const value = getPanelButtonSysExValue(button, 'release')
    if (value == null) {
      return false
    }
    return sendSysEx(
      buildPanelButtonMessage(value, sysexOptions.value),
      `Panel release: ${button}`
    )
  }

  function rotateEncoder(delta: number) {
    console.log(`[mpx-g2] Encoder delta ${delta} (hardware mapping TBD)`)
    return false
  }

  function clearLog() {
    midiLog.value = []
  }

  onBeforeUnmount(() => {
    disconnect()
  })

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
    pressButton,
    releaseButton,
    rotateEncoder,
    clearLog,
    sendSysEx
  }
}
