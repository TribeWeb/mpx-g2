import type { MpxG2PanelState, GainEqBand, ParamRange } from '../types/midi'
import { HandshakeCommand, SysExMessageType } from '../types/midi'
import { describeDataMessage, parseDataMessagePayload } from './data-message'
import {
  gainEqRangeKey,
  isDisplayDumpPath,
  isGainAlgPath,
  isLedDumpPath,
  isLikelyLedDumpData,
  ledDumpBytes,
  parseGainEqPath
} from './control-paths'
import {
  parseObjectDescriptionPayload,
  parseObjectTypeIdPayload,
  primaryObjectRange,
  type ObjectDescription
} from './object-description'
import { decodeParamValue } from './param-value'
import { displayBytesToCharacters } from './display-format'
import { mergeLcdWithFlashHighlight, updateLedFlashing } from './flash-detect'
import { createEmptyPanelKnobState, denibblize, parseMpxG2SysEx } from './sysex'
import { parseLedDumpBytes } from './led-dump'

function applyDisplayCharacters(
  panelState: MpxG2PanelState,
  incoming: string[]
): { prev: string, next: string } {
  const prev = panelState.display.characters.join('')
  const merged = mergeLcdWithFlashHighlight(
    panelState.display.characters,
    panelState.display.flashing ?? [],
    incoming
  )
  const next = merged.characters.join('')
  panelState.display.characters = merged.characters
  panelState.display.flashing = merged.flashing
  panelState.lastUpdated = Date.now()
  return { prev, next }
}

export interface InboundSysExResult {
  handled: boolean
  note?: string
  /** Set when the active Gain algorithm index was updated from a data reply. */
  gainAlg?: number
  /** Object Type ID reply for a Gain EQ path (used to fetch ranges). */
  gainEqObjectType?: { band: GainEqBand, alg: number, objectTypeId: number }
  /** Object Type ID when path was omitted (use pending FIFO). */
  objectTypeId?: number
  /** Parsed Object Description (min/max source). */
  objectDescription?: ObjectDescription
  /** True when the 32-char LCD image changed (Auto Display / dump). */
  displayChanged?: boolean
  /** True when a Gain Lo/Mid/Hi value was applied from a data message. */
  gainEqUpdated?: boolean
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
    case SysExMessageType.ObjectTypeId:
      return handleObjectTypeId(parsed.payload, panelState)
    case SysExMessageType.ObjectDescription:
      return handleObjectDescription(parsed.payload, panelState)
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

function applyGainEqValue(
  panelState: MpxG2PanelState,
  band: 'low' | 'mid' | 'high',
  alg: number,
  value: number,
  valueBytes: 1 | 2
) {
  const knobs = panelState.knobs ?? createEmptyPanelKnobState()
  panelState.knobs = {
    ...knobs,
    gainAlg: alg,
    gainValueBytes: valueBytes,
    gainLow: band === 'low' ? value : knobs.gainLow,
    gainMid: band === 'mid' ? value : knobs.gainMid,
    gainHigh: band === 'high' ? value : knobs.gainHigh
  }
  // Do not overwrite LCD here — Auto Display / display dumps own the panel text.
  panelState.lastUpdated = Date.now()
}

export function applyGainEqRange(
  panelState: MpxG2PanelState,
  band: GainEqBand,
  range: ParamRange,
  valueBytes?: number
) {
  const knobs = panelState.knobs ?? createEmptyPanelKnobState()
  const key = gainEqRangeKey(band)
  panelState.knobs = {
    ...knobs,
    [key]: range,
    ...(valueBytes === 1 || valueBytes === 2 ? { gainValueBytes: valueBytes } : {})
  }
  panelState.lastUpdated = Date.now()
}

function handleObjectTypeId(payload: number[], _panelState: MpxG2PanelState): InboundSysExResult {
  const parsed = parseObjectTypeIdPayload(payload)
  if (!parsed) {
    return { handled: false, note: 'Malformed Object Type ID' }
  }

  const gainEq = parsed.levels ? parseGainEqPath(parsed.levels) : null
  if (gainEq) {
    return {
      handled: true,
      note: `Object Type ID ${parsed.objectTypeId} (Gain ${gainEq.band}, alg ${gainEq.alg})`,
      objectTypeId: parsed.objectTypeId,
      gainEqObjectType: {
        band: gainEq.band,
        alg: gainEq.alg,
        objectTypeId: parsed.objectTypeId
      }
    }
  }

  const path = parsed.levels
    ? parsed.levels.map(l => l.toString(16)).join('/')
    : 'no path'
  return {
    handled: true,
    note: `Object Type ID ${parsed.objectTypeId} @ ${path}`,
    objectTypeId: parsed.objectTypeId
  }
}

function handleObjectDescription(payload: number[], _panelState: MpxG2PanelState): InboundSysExResult {
  const description = parseObjectDescriptionPayload(payload)
  if (!description) {
    return { handled: false, note: 'Malformed Object Description' }
  }

  const range = primaryObjectRange(description)
  const rangeNote = range ? ` min=${range.min} max=${range.max}` : ''

  return {
    handled: true,
    note: `Object Description "${description.name}" (${description.byteCount} byte)${rangeNote}`,
    objectDescription: description
  }
}

function handleDataMessage(payload: number[], panelState: MpxG2PanelState): InboundSysExResult {
  const parsed = parseDataMessagePayload(payload)
  if (!parsed) {
    return { handled: false, note: 'Malformed data message' }
  }

  const { data } = parsed

  if (isLedDumpPath(parsed.levels) || isLikelyLedDumpData(data)) {
    const previous = panelState.leds
    const next = parseLedDumpBytes(ledDumpBytes(data))
    const flash = updateLedFlashing(
      previous.buttons,
      next.buttons,
      previous.flashing ?? next.flashing,
      previous.flashStable ?? next.flashStable
    )
    next.flashing = flash.flashing
    next.flashStable = flash.flashStable
    panelState.leds = next
    panelState.lastUpdated = Date.now()
    return { handled: true, note: `LED dump @ ${describeDataMessage(parsed).split('@')[1]?.trim() ?? 'panel'}` }
  }

  if (isDisplayDumpPath(parsed.levels) || data.length === 32) {
    const { prev, next } = applyDisplayCharacters(panelState, displayBytesToCharacters(data))
    return {
      handled: true,
      note: describeDataMessage(parsed),
      displayChanged: prev !== next
    }
  }

  if (isGainAlgPath(parsed.levels) && data.length > 0 && data.length <= 2) {
    const alg = decodeParamValue(data)
    const knobs = panelState.knobs ?? createEmptyPanelKnobState()
    panelState.knobs = { ...knobs, gainAlg: Math.max(0, alg) }
    panelState.lastUpdated = Date.now()
    return {
      handled: true,
      note: `Gain alg = ${alg}`,
      gainAlg: Math.max(0, alg)
    }
  }

  const gainEq = parseGainEqPath(parsed.levels)
  if (gainEq && data.length > 0 && data.length <= 2) {
    const value = decodeParamValue(data)
    const valueBytes: 1 | 2 = data.length >= 2 ? 2 : 1
    applyGainEqValue(panelState, gainEq.band, gainEq.alg, value, valueBytes)
    const label = gainEq.band === 'low' ? 'Gain Low' : gainEq.band === 'mid' ? 'Gain Mid' : 'Gain High'
    return {
      handled: true,
      note: `${label} = ${value} (alg ${gainEq.alg}, ${valueBytes} byte) @ ${describeDataMessage(parsed).split('@')[1]?.trim() ?? ''}`,
      gainEqUpdated: true
    }
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

  const chars = displayBytesToCharacters(denibblize(stringNibbles))

  if (charCount === 32) {
    const { prev, next } = applyDisplayCharacters(panelState, chars)
    return {
      handled: true,
      note: 'Formatted string display (32 chars)',
      displayChanged: prev !== next
    }
  }

  return { handled: true, note: `Formatted string (${charCount} chars)` }
}
