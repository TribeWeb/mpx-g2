import type { MidiBridgeClientMessage, MidiBridgeServerMessage } from '#shared/types/midi'
import { WebSocketServer, type WebSocket } from 'ws'
import { MidiSimulator } from './midi-simulator'

let wss: WebSocketServer | null = null
const simulators = new WeakMap<WebSocket, MidiSimulator>()

function send(socket: WebSocket, message: MidiBridgeServerMessage) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

function getSimulator(socket: WebSocket): MidiSimulator {
  let simulator = simulators.get(socket)
  if (!simulator) {
    simulator = new MidiSimulator()
    simulators.set(socket, simulator)
  }
  return simulator
}

function pushPanelState(socket: WebSocket, simulator: MidiSimulator) {
  send(socket, { type: 'panel_state', state: simulator.getPanelState() })
}

function handleClientMessage(socket: WebSocket, raw: string) {
  let message: MidiBridgeClientMessage

  try {
    message = JSON.parse(raw) as MidiBridgeClientMessage
  } catch {
    send(socket, { type: 'error', message: 'Invalid JSON message' })
    return
  }

  const simulator = getSimulator(socket)

  switch (message.type) {
    case 'handshake':
      send(socket, {
        type: 'connected',
        deviceName: 'MPX-G2 (simulated)',
        deviceMode: 'simulated'
      })
      pushPanelState(socket, simulator)
      break
    case 'enable_auto_display':
    case 'request_display_dump':
      send(socket, {
        type: 'display_dump',
        characters: simulator.getDisplayCharacters()
      })
      break
    case 'request_led_dump':
      send(socket, {
        type: 'led_dump',
        leds: simulator.getLedState()
      })
      break
    case 'panel':
      simulator.handlePanel(message.action, message.button)
      send(socket, { type: 'display_dump', characters: simulator.getDisplayCharacters() })
      send(socket, { type: 'led_dump', leds: simulator.getLedState() })
      break
    case 'encoder':
      simulator.handleEncoder(message.delta)
      send(socket, { type: 'display_dump', characters: simulator.getDisplayCharacters() })
      send(socket, { type: 'led_dump', leds: simulator.getLedState() })
      break
    case 'gain_knob':
      simulator.handleGainKnob(message.band, message.value)
      pushPanelState(socket, simulator)
      break
  }
}

export function startMidiBridge(port: number) {
  if (wss) {
    return wss
  }

  wss = new WebSocketServer({ port })

  wss.on('connection', (socket) => {
    send(socket, {
      type: 'connected',
      deviceName: 'MPX-G2 (simulated)',
      deviceMode: 'simulated'
    })

    socket.on('message', (data) => {
      handleClientMessage(socket, String(data))
    })

    socket.on('close', () => {
      simulators.delete(socket)
    })
  })

  console.log(`[mpx-g2] MIDI bridge listening on ws://localhost:${port} (simulation mode)`)

  return wss
}

export function stopMidiBridge() {
  if (!wss) return
  wss.close()
  wss = null
}
