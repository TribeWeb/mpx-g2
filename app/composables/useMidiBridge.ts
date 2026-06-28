import type {
  FrontPanelButtonName,
  MidiBridgeClientMessage,
  MidiBridgeConnectionStatus,
  MidiBridgeServerMessage,
  MpxG2PanelState
} from '#shared/types/midi'
import { createEmptyPanelState } from '#shared/midi/sysex'

export function useMidiBridge() {
  const config = useRuntimeConfig()

  const status = useState<MidiBridgeConnectionStatus>('midi-bridge-status', () => 'disconnected')
  const error = useState<string | null>('midi-bridge-error', () => null)
  const panelState = useState<MpxG2PanelState>('midi-panel-state', () => createEmptyPanelState())

  let socket: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function handleServerMessage(message: MidiBridgeServerMessage) {
    switch (message.type) {
      case 'connected':
        status.value = 'connected'
        error.value = null
        panelState.value.connected = true
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
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false
    }

    socket.send(JSON.stringify(message))
    return true
  }

  function connect(url = config.public.midiBridgeUrl as string) {
    if (import.meta.server) {
      return
    }

    disconnect()
    status.value = 'connecting'
    error.value = null

    socket = new WebSocket(url)

    socket.addEventListener('open', () => {
      status.value = 'connected'
      send({ type: 'handshake', command: 'im_alive' })
      send({ type: 'enable_auto_display' })
    })

    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data)) as MidiBridgeServerMessage
        handleServerMessage(message)
      } catch {
        error.value = 'Received invalid message from MIDI bridge'
        status.value = 'error'
      }
    })

    socket.addEventListener('close', () => {
      status.value = 'disconnected'
      panelState.value.connected = false
      reconnectTimer = setTimeout(() => connect(url), 3000)
    })

    socket.addEventListener('error', () => {
      status.value = 'error'
      error.value = 'WebSocket connection failed'
    })
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (socket) {
      socket.close()
      socket = null
    }

    status.value = 'disconnected'
    panelState.value.connected = false
  }

  function pressButton(button: FrontPanelButtonName) {
    send({ type: 'panel', action: 'press', button })
  }

  function releaseButton(button: FrontPanelButtonName) {
    send({ type: 'panel', action: 'release', button })
  }

  function rotateEncoder(delta: number) {
    send({ type: 'encoder', delta })
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    status: readonly(status),
    error: readonly(error),
    panelState: readonly(panelState),
    connect,
    disconnect,
    send,
    pressButton,
    releaseButton,
    rotateEncoder
  }
}
