import type { MpxG2PanelState } from '../types/midi'
import { HandshakeCommand, SysExMessageType } from '../types/midi'
import { describeDataMessage, parseDataMessagePayload } from './data-message'
import {
  isDisplayDumpPath,
  isLedDumpPath,
  isLikelyLedDumpData,
  ledDumpBytes
} from './control-paths'
import { denibblize, parseMpxG2SysEx } from './sysex'
import { parseLedDumpBytes } from './led-dump'

export interface InboundSysExResult {
  handled: boolean
  note?: string
}

/** Parse inbound MPX-G2 SysEx and update panel state where possible. */
export function handleInboundSysEx(
  data: Uint8Array,
  panelState: MpxG2PanelState
): InboundSysExResult {
  const parsed = parseMpxG2SysEx(data)
  if (!parsed) {
    const bytes = Array.from(data)
    if (bytes[0] === 0xf0 && bytes[1] === 0x06) {
      return {
        handled: false,
        note: `Unknown Lexicon SysEx (product 0x${(bytes[2] ?? 0).toString(16)})`
      }
    }
    return { handled: false, note: 'Non-MPX SysEx' }
  }

  switch (parsed.messageType) {
    case SysExMessageType.Handshake:
      return handleHandshake(parsed.payload, panelState)
    case SysExMessageType.Data:
      return handleDataMessage(parsed.payload, panelState)
    case SysExMessageType.FormattedString:
      return handleFormattedString(parsed.payload, panelState)
    default:
      return { handled: false, note: `Unhandled message type 0x${parsed.messageType.toString(16)}` }
  }
}

function handleHandshake(payload: number[], panelState: MpxG2PanelState): InboundSysExResult {
  const command = payload[0] ?? HandshakeCommand.Nop
  panelState.connected = command !== HandshakeCommand.Error
  panelState.lastUpdated = Date.now()

  const commandNames: Record<number, string> = {
    [HandshakeCommand.AreYouThere]: 'AreYouThere',
    [HandshakeCommand.ImAlive]: 'ImAlive',
    [HandshakeCommand.Busy]: 'Busy',
    [HandshakeCommand.Ready]: 'Ready',
    [HandshakeCommand.Error]: 'Error'
  }

  return {
    handled: true,
    note: `Handshake: ${commandNames[command] ?? `0x${command.toString(16)}`}`
  }
}

function handleDataMessage(payload: number[], panelState: MpxG2PanelState): InboundSysExResult {
  const parsed = parseDataMessagePayload(payload)
  if (!parsed) {
    return { handled: false, note: 'Malformed data message' }
  }

  const { data } = parsed

  if (isLedDumpPath(parsed.levels) || isLikelyLedDumpData(data)) {
    panelState.leds = parseLedDumpBytes(ledDumpBytes(data))
    panelState.lastUpdated = Date.now()
    return { handled: true, note: `LED dump @ ${describeDataMessage(parsed).split('@')[1]?.trim() ?? 'panel'}` }
  }

  if (isDisplayDumpPath(parsed.levels) || data.length === 32) {
    panelState.display.characters = data.map(byte => String.fromCharCode(byte))
    panelState.lastUpdated = Date.now()
    return { handled: true, note: describeDataMessage(parsed) }
  }

  if (data.length >= 10) {
    panelState.leds = parseLedDumpBytes(ledDumpBytes(data))
    panelState.lastUpdated = Date.now()
    return { handled: true, note: describeDataMessage(parsed) }
  }

  return { handled: true, note: describeDataMessage(parsed) }
}

function handleFormattedString(payload: number[], panelState: MpxG2PanelState): InboundSysExResult {
  if (payload.length < 4) {
    return { handled: false }
  }

  const sizeBytes = denibblize(payload.slice(0, 4))
  const charCount = sizeBytes[0]! | ((sizeBytes[1] ?? 0) << 8)
  const stringNibbles = payload.slice(4, 4 + charCount * 2)

  if (stringNibbles.length < charCount * 2) {
    return { handled: false }
  }

  const chars = denibblize(stringNibbles).map(byte => String.fromCharCode(byte))

  if (charCount === 32) {
    panelState.display.characters = chars
    panelState.lastUpdated = Date.now()
    return { handled: true, note: 'Formatted string display (32 chars)' }
  }

  return { handled: true, note: `Formatted string (${charCount} chars)` }
}
