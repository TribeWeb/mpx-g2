import type { GainEqBand, ChorusParam, MidiConnectionMode } from '#shared/types/midi'
import type { MidiTransport } from '#shared/types/midi-transport'

let hardwareTransport: ReturnType<typeof useWebMidi> | null = null
let simulatorTransport: ReturnType<typeof useMidiBridge> | null = null
/** Ensures simulated/hardware auto-connect runs once per page load. */
let clientAutoInitDone = false

function getHardware() {
  if (!hardwareTransport) {
    hardwareTransport = useWebMidi()
  }
  return hardwareTransport
}

function getSimulator() {
  if (!simulatorTransport) {
    simulatorTransport = useMidiBridge()
  }
  return simulatorTransport
}

function getTransport(mode: MidiConnectionMode): MidiTransport {
  return mode === 'hardware' ? getHardware() : getSimulator()
}

export function useMidiConnection() {
  const config = useRuntimeConfig()
  const mode = useState<MidiConnectionMode>(
    'midi-connection-mode',
    () => config.public.midiDefaultMode as MidiConnectionMode
  )

  const active = computed(() => getTransport(mode.value))

  function resetInactivePanelState(previousMode: MidiConnectionMode) {
    if (previousMode === 'hardware') {
      getHardware().resetPanelState()
    } else {
      getSimulator().resetPanelState()
    }
  }

  function setMode(next: MidiConnectionMode) {
    if (mode.value === next) {
      return
    }
    const previous = mode.value
    getTransport(previous).disconnect()
    resetInactivePanelState(previous)
    mode.value = next
  }

  function connect(options?: { inputId?: string, outputId?: string }) {
    if (mode.value === 'hardware') {
      return getHardware().connect(options)
    }
    return getSimulator().connect()
  }

  function disconnect() {
    getTransport(mode.value).disconnect()
  }

  function pressButton(button: Parameters<MidiTransport['pressButton']>[0]) {
    return active.value.pressButton(button)
  }

  function releaseButton(button: Parameters<MidiTransport['releaseButton']>[0]) {
    return active.value.releaseButton(button)
  }

  function rotateEncoder(delta: number) {
    return active.value.rotateEncoder(delta)
  }

  function setGainKnob(band: GainEqBand, value: number) {
    return active.value.setGainKnob(band, value)
  }

  function setChorusParam(param: ChorusParam, value: number) {
    return active.value.setChorusParam(param, value)
  }

  const status = computed(() => active.value.status.value)
  const error = computed(() => active.value.error.value)
  const deviceMode = computed(() => active.value.deviceMode.value)
  const deviceName = computed(() => active.value.deviceName.value)
  const panelState = computed(() => active.value.panelState.value)

  const isHardwareMode = computed(() => mode.value === 'hardware')

  const midiLog = computed(() => (isHardwareMode.value ? getHardware().midiLog.value : []))
  const midiRxStats = computed(() =>
    isHardwareMode.value
      ? getHardware().midiRxStats.value
      : { count: 0, lastAt: null, listeningOn: [] as string[] }
  )
  const midiRxPathStatus = computed(() =>
    isHardwareMode.value ? getHardware().midiRxPathStatus.value : 'unknown' as const
  )
  const remoteDetected = computed(() =>
    isHardwareMode.value ? getHardware().remoteDetected.value : false
  )
  const availableInputs = computed(() =>
    isHardwareMode.value ? getHardware().availableInputs.value : []
  )
  const availableOutputs = computed(() =>
    isHardwareMode.value ? getHardware().availableOutputs.value : []
  )

  function isWebMidiSupported() {
    return getHardware().isSupported()
  }

  function refreshPorts() {
    return getHardware().refreshPorts()
  }

  function pingDevice(note?: string, productId?: number) {
    return getHardware().pingDevice(note, productId)
  }

  function requestPanelDumps(note?: string) {
    getHardware().requestPanelDumps(note)
  }

  function requestGainEqState(note?: string) {
    getHardware().requestGainEqState(note)
  }

  function clearLog() {
    getHardware().clearLog()
  }

  function sendSysEx(data: Uint8Array, note?: string, options?: { silent?: boolean }) {
    return getHardware().sendSysEx(data, note, options)
  }

  function sendMidi(data: Uint8Array, note?: string, options?: { silent?: boolean }) {
    return getHardware().sendMidi(data, note, options)
  }

  function getSysexOptions() {
    return getHardware().getSysexOptions()
  }

  function setHarvestHandler(handler: (data: Uint8Array) => void) {
    getHardware().setHarvestHandler(handler)
  }

  function clearHarvestHandler() {
    getHardware().clearHarvestHandler()
  }

  function beginHarvestQuiet() {
    getHardware().beginHarvestQuiet()
  }

  function endHarvestQuiet() {
    getHardware().endHarvestQuiet()
  }

  if (import.meta.client) {
    onMounted(() => {
      if (clientAutoInitDone) {
        return
      }
      clientAutoInitDone = true

      if (mode.value === 'simulated' && status.value === 'disconnected') {
        connect()
        return
      }

      if (mode.value === 'hardware') {
        getHardware().trySessionReconnect()
      }
    })
  }

  return {
    mode: readonly(mode),
    setMode,
    status,
    error,
    deviceMode,
    deviceName,
    panelState,
    connect,
    disconnect,
    pressButton,
    releaseButton,
    rotateEncoder,
    setGainKnob,
    setChorusParam,
    isWebMidiSupported,
    availableInputs,
    availableOutputs,
    midiLog,
    midiRxStats,
    midiRxPathStatus,
    remoteDetected,
    refreshPorts,
    pingDevice,
    requestPanelDumps,
    requestGainEqState,
    clearLog,
    sendSysEx,
    sendMidi,
    getSysexOptions,
    setHarvestHandler,
    clearHarvestHandler,
    beginHarvestQuiet,
    endHarvestQuiet
  }
}
