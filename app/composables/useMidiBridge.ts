import type {
  FrontPanelButtonName,
  GainEqBand,
  MidiBridgeClientMessage,
  MidiBridgeConnectionStatus,
  MidiBridgeServerMessage,
  MpxG2PanelState
} from '#shared/types/midi'
import { GAIN_EQ_DISPLAY_RANGE } from '#shared/midi/control-paths'
import { createEmptyPanelState } from '#shared/midi/sysex'

/** Shared across all `useMidiBridge()` callers and Vite HMR reloads. */
function getBridgeRuntime() {
  const g = globalThis as typeof globalThis & {
    __mpxG2MidiBridge?: {
      socket: WebSocket | null
      reconnectTimer: ReturnType<typeof setTimeout> | null
      /** When false, close events must not schedule auto-reconnect (explicit disconnect). */
      allowReconnect: boolean
    }
  }
  if (!g.__mpxG2MidiBridge) {
    g.__mpxG2MidiBridge = {
      socket: null,
      reconnectTimer: null,
      allowReconnect: false
    }
  }
  return g.__mpxG2MidiBridge
}

const bridgeRuntime = getBridgeRuntime()

export function useMidiBridge() {
  const config = useRuntimeConfig()

  const status = useState<MidiBridgeConnectionStatus>('midi-sim-status', () => 'disconnected')
  const error = useState<string | null>('midi-sim-error', () => null)
  const deviceMode = useState<'simulated' | 'hardware' | null>('midi-sim-device-mode', () => null)
  const deviceName = useState<string | null>('midi-sim-device-name', () => null)
  const panelState = useState<MpxG2PanelState>('midi-sim-panel-state', () => createEmptyPanelState())

  function resetPanelState() {
    panelState.value = createEmptyPanelState()
  }

  function handleServerMessage(message: MidiBridgeServerMessage) {
    switch (message.type) {
      case 'connected':
        status.value = 'connected'
        error.value = null
        panelState.value.connected = true
        deviceMode.value = message.deviceMode ?? null
        deviceName.value = message.deviceName ?? null
        break
      case 'disconnected':
        status.value = 'disconnected'
        panelState.value.connected = false
        break
      case 'panel_state':
        panelState.value = message.state
        break
      case 'display_dump':
        panelState.value.display.characters = message.characters
        panelState.value.lastUpdated = Date.now()
        break
      case 'led_dump':
        panelState.value.leds = message.leds
        panelState.value.lastUpdated = Date.now()
        break
      case 'error':
        status.value = 'error'
        error.value = message.message
        break
    }
  }

  function send(message: MidiBridgeClientMessage) {
    if (!bridgeRuntime.socket || bridgeRuntime.socket.readyState !== WebSocket.OPEN) {
      return false
    }

    bridgeRuntime.socket.send(JSON.stringify(message))
    return true
  }

  function connect(_options?: { inputId?: string, outputId?: string }) {
    if (import.meta.server) {
      return
    }

    const url = config.public.midiBridgeUrl as string
    disconnect()
    bridgeRuntime.allowReconnect = true
    status.value = 'connecting'
    error.value = null

    bridgeRuntime.socket = new WebSocket(url)

    bridgeRuntime.socket.addEventListener('open', () => {
      status.value = 'connected'
      send({ type: 'handshake', command: 'im_alive' })
      send({ type: 'enable_auto_display' })
    })

    bridgeRuntime.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data)) as MidiBridgeServerMessage
        handleServerMessage(message)
      } catch {
        error.value = 'Received invalid message from MIDI bridge'
        status.value = 'error'
      }
    })

    bridgeRuntime.socket.addEventListener('close', () => {
      status.value = 'disconnected'
      panelState.value.connected = false
      bridgeRuntime.socket = null
      if (bridgeRuntime.allowReconnect) {
        bridgeRuntime.reconnectTimer = setTimeout(() => connect(), 3000)
      }
    })

    bridgeRuntime.socket.addEventListener('error', () => {
      status.value = 'error'
      error.value = 'WebSocket connection failed'
    })
  }

  function disconnect() {
    bridgeRuntime.allowReconnect = false

    if (bridgeRuntime.reconnectTimer) {
      clearTimeout(bridgeRuntime.reconnectTimer)
      bridgeRuntime.reconnectTimer = null
    }

    if (bridgeRuntime.socket) {
      bridgeRuntime.socket.close()
      bridgeRuntime.socket = null
    }

    status.value = 'disconnected'
    panelState.value.connected = false
  }

  function pressButton(button: FrontPanelButtonName): boolean {
    return send({ type: 'panel', action: 'press', button })
  }

  function releaseButton(button: FrontPanelButtonName): boolean {
    return send({ type: 'panel', action: 'release', button })
  }

  function rotateEncoder(delta: number): boolean {
    return send({ type: 'encoder', delta })
  }

  function setGainKnob(band: GainEqBand, value: number) {
    const range = GAIN_EQ_DISPLAY_RANGE[band]
    const knobs = panelState.value.knobs
    const live = band === 'low'
      ? knobs.gainLowRange
      : band === 'mid'
        ? knobs.gainMidRange
        : knobs.gainHighRange
    const min = live?.min ?? range.min
    const max = live?.max ?? range.max
    const clamped = Math.min(max, Math.max(min, Math.round(value)))
    panelState.value.knobs = {
      ...knobs,
      gainLow: band === 'low' ? clamped : knobs.gainLow,
      gainMid: band === 'mid' ? clamped : knobs.gainMid,
      gainHigh: band === 'high' ? clamped : knobs.gainHigh
    }
    panelState.value.lastUpdated = Date.now()

    return send({ type: 'gain_knob', band, value: clamped })
  }

  return {
    status: readonly(status),
    error: readonly(error),
    deviceMode: readonly(deviceMode),
    deviceName: readonly(deviceName),
    panelState: readonly(panelState),
    connect,
    disconnect,
    resetPanelState,
    send,
    pressButton,
    releaseButton,
    rotateEncoder,
    setGainKnob
  }
}
