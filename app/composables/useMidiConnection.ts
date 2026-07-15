import type { GainEqBand, MidiConnectionMode } from '#shared/types/midi'

export function useMidiConnection() {
  const config = useRuntimeConfig()
  const mode = useState<MidiConnectionMode>(
    'midi-connection-mode',
    () => config.public.midiDefaultMode as MidiConnectionMode
  )

  const simulator = useMidiBridge()
  const hardware = useWebMidi()

  const active = computed(() => (mode.value === 'hardware' ? hardware : simulator))

  function setMode(next: MidiConnectionMode) {
    if (mode.value === next) {
      return
    }
    if (mode.value === 'hardware') {
      hardware.disconnect()
    } else {
      simulator.disconnect()
    }
    mode.value = next
  }

  function connect(options?: { inputId?: string, outputId?: string }) {
    if (mode.value === 'hardware') {
      return hardware.connect(options)
    }
    return simulator.connect()
  }

  function disconnect() {
    if (mode.value === 'hardware') {
      hardware.disconnect()
    } else {
      simulator.disconnect()
    }
  }

  function pressButton(button: Parameters<typeof simulator.pressButton>[0]) {
    return active.value.pressButton(button)
  }

  function releaseButton(button: Parameters<typeof simulator.releaseButton>[0]) {
    return active.value.releaseButton(button)
  }

  function rotateEncoder(delta: number) {
    return active.value.rotateEncoder(delta)
  }

  function setGainKnob(band: GainEqBand, value: number) {
    return active.value.setGainKnob(band, value)
  }

  const status = computed(() => active.value.status.value)
  const error = computed(() => active.value.error.value)
  const deviceMode = computed(() => active.value.deviceMode.value)
  const deviceName = computed(() => active.value.deviceName.value)
  const panelState = computed(() => active.value.panelState.value)

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
    isWebMidiSupported: hardware.isSupported,
    availableInputs: hardware.availableInputs,
    availableOutputs: hardware.availableOutputs,
    midiLog: hardware.midiLog,
    midiRxStats: hardware.midiRxStats,
    midiRxPathStatus: hardware.midiRxPathStatus,
    remoteDetected: hardware.remoteDetected,
    refreshPorts: hardware.refreshPorts,
    pingDevice: hardware.pingDevice,
    requestPanelDumps: hardware.requestPanelDumps,
    requestGainEqState: hardware.requestGainEqState,
    clearLog: hardware.clearLog
  }
}
