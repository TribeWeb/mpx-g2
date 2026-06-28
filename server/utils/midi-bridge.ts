import type { MidiBridgeClientMessage, MidiBridgeServerMessage } from '#shared/types/midi'
import { createEmptyPanelState } from '#shared/midi/sysex'
import { WebSocketServer, type WebSocket } from 'ws'

let wss: WebSocketServer | null = null

function send(socket: WebSocket, message: MidiBridgeServerMessage) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

function handleClientMessage(socket: WebSocket, raw: string) {
  let message: MidiBridgeClientMessage

  try {
    message = JSON.parse(raw) as MidiBridgeClientMessage
  } catch {
    send(socket, { type: 'error', message: 'Invalid JSON message' })
    return
  }

  switch (message.type) {
    case 'handshake':
      send(socket, { type: 'connected', deviceName: 'MPX-G2 (simulated)' })
      send(socket, {
        type: 'panel_state',
        state: {
          ...createEmptyPanelState(),
          connected: true,
          lastUpdated: Date.now()
        }
      })
      break
    case 'enable_auto_display':
    case 'request_display_dump':
      send(socket, {
        type: 'display_dump',
        characters: Array.from({ length: 32 }, (_, index) => {
          if (index < 16) return 'MPX-G2 READY   '[index] ?? ' '
          return 'BRIDGE ONLINE  '[index - 16] ?? ' '
        })
      })
      break
    case 'request_led_dump':
      send(socket, {
        type: 'led_dump',
        leds: createEmptyPanelState().leds
      })
      break
    case 'panel':
      // Hardware MIDI forwarding will be implemented here
      break
    case 'encoder':
      // Hardware MIDI forwarding will be implemented here
      break
  }
}

export function startMidiBridge(port: number) {
  if (wss) {
    return wss
  }

  wss = new WebSocketServer({ port })

  wss.on('connection', (socket) => {
    send(socket, { type: 'connected' })

    socket.on('message', (data) => {
      handleClientMessage(socket, String(data))
    })

    socket.on('close', () => {
      send(socket, { type: 'disconnected', reason: 'Client disconnected' })
    })
  })

  console.log(`[mpx-g2] MIDI bridge listening on ws://localhost:${port}`)

  return wss
}

export function stopMidiBridge() {
  if (!wss) return
  wss.close()
  wss = null
}
