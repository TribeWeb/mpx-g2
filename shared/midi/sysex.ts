import {
  DEFAULT_DEVICE_ID,
  FrontPanelButtons,
  LEXICON_MANUFACTURER_ID,
  MPX_G2_PRODUCT_ID,
  MPX_G2_PRODUCT_IDS,
  type HandshakeCommandValue,
  type SysExMessageTypeValue
} from '../types/midi'
import { emptyDisplayFlashing, emptyLedFlashStable, emptyLedFlashing } from './flash-detect'

const SYSEX_START = 0xf0
const SYSEX_END = 0xf7

/** Nibblize a byte into low-nibble then high-nibble bytes (Lexicon format). */
export function nibblizeByte(byte: number): [number, number] {
  const value = byte & 0xff
  return [value & 0x0f, (value >> 4) & 0x0f]
}

/** De-nibblize two Lexicon-format bytes back into one byte. */
export function denibblizeByte(low: number, high: number): number {
  return ((high & 0x0f) << 4) | (low & 0x0f)
}

/** Nibblize an array of bytes for SysEx payload fields. */
export function nibblize(bytes: number[]): number[] {
  return bytes.flatMap(byte => nibblizeByte(byte))
}

/** De-nibblize a Lexicon SysEx payload field. */
export function denibblize(bytes: number[]): number[] {
  const result: number[] = []
  for (let i = 0; i < bytes.length; i += 2) {
    result.push(denibblizeByte(bytes[i] ?? 0, bytes[i + 1] ?? 0))
  }
  return result
}

export interface SysExHeaderOptions {
  deviceId?: number
  productId?: number
  messageType: SysExMessageTypeValue
}

/** Build the standard Lexicon MPX-G2 SysEx header. */
export function buildSysExHeader({
  deviceId = DEFAULT_DEVICE_ID,
  productId = MPX_G2_PRODUCT_ID,
  messageType
}: SysExHeaderOptions): number[] {
  return [SYSEX_START, LEXICON_MANUFACTURER_ID, productId, deviceId, messageType]
}

export interface MpxG2SysExOptions {
  deviceId?: number
  productId?: number
}

/** Append Lexicon checksum (low 7 bits of sum of bytes after message type). */
export function withSysExChecksum(message: Uint8Array): Uint8Array {
  if (message.length < 6 || message[0] !== SYSEX_START || message[message.length - 1] !== SYSEX_END) {
    return message
  }

  // Sum bytes after message type (index 4), excluding the existing end marker.
  let sum = 0
  for (let i = 5; i < message.length - 1; i++) {
    sum += message[i] ?? 0
  }
  const checksum = sum & 0x7f
  const withoutEnd = message.slice(0, -1)
  return new Uint8Array([...withoutEnd, checksum, SYSEX_END])
}

/** Build a handshake SysEx message. */
export function buildHandshakeMessage(
  command: HandshakeCommandValue,
  options: MpxG2SysExOptions = {}
): Uint8Array {
  const { deviceId = DEFAULT_DEVICE_ID, productId = MPX_G2_PRODUCT_ID } = options
  return new Uint8Array([
    ...buildSysExHeader({ deviceId, productId, messageType: 0x12 }),
    command,
    SYSEX_END
  ])
}

/** Build a generic SysEx data message (type 0x01) at a control-tree address. */
export function buildDataMessage(
  data: number[],
  controlLevels: number[],
  options: MpxG2SysExOptions = {}
): Uint8Array {
  const { deviceId = DEFAULT_DEVICE_ID, productId = MPX_G2_PRODUCT_ID } = options
  const numBytes = nibblize([data.length & 0xff, (data.length >> 8) & 0xff])
  const dataNibbles = nibblize(data)
  const numLevels = nibblize([controlLevels.length & 0xff, (controlLevels.length >> 8) & 0xff])
  const address = nibblize(controlLevels.flatMap(level => [level & 0xff, (level >> 8) & 0xff]))

  return withSysExChecksum(new Uint8Array([
    ...buildSysExHeader({ deviceId, productId, messageType: 0x01 }),
    ...numBytes,
    ...dataNibbles,
    ...numLevels,
    ...address,
    SYSEX_END
  ]))
}

/** Build a panel button press SysEx data message. */
export function buildPanelButtonMessage(
  buttonValue: number,
  options: MpxG2SysExOptions = {}
): Uint8Array {
  return buildDataMessage([buttonValue], [1, 8, 0], options)
}

/** Parse raw MIDI bytes; returns SysEx payload if message is MPX-G2 SysEx. */
export function parseMpxG2SysEx(data: number[] | Uint8Array): {
  deviceId: number
  messageType: number
  payload: number[]
} | null {
  const bytes = Array.from(data)
  if (bytes.length < 6 || bytes[0] !== SYSEX_START || bytes[bytes.length - 1] !== SYSEX_END) {
    return null
  }

  if (bytes[1] !== LEXICON_MANUFACTURER_ID) {
    return null
  }

  if (!MPX_G2_PRODUCT_IDS.includes(bytes[2] as typeof MPX_G2_PRODUCT_IDS[number])) {
    return null
  }

  return {
    deviceId: bytes[3] ?? DEFAULT_DEVICE_ID,
    messageType: bytes[4] ?? 0,
    payload: bytes.slice(5, -1)
  }
}

/** Convert a Uint8Array SysEx message to a hex string for debugging. */
export function formatSysExHex(data: number[] | Uint8Array): string {
  return Array.from(data)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join(' ')
}

export function createEmptyPanelLedState() {
  return {
    buttons: Object.fromEntries(
      FrontPanelButtons.map(button => [button, false])
    ) as Record<(typeof FrontPanelButtons)[number], boolean>,
    flashing: emptyLedFlashing(),
    flashStable: emptyLedFlashStable(),
    segments: [0, 0, 0] as [number, number, number],
    scanBits: [0, 0, 0]
  }
}

export function createEmptyPanelKnobState() {
  // Wide defaults until Object Description replies narrow them per algorithm.
  return {
    gainLow: 0,
    gainMid: 0,
    gainHigh: 0,
    gainAlg: 1,
    gainValueBytes: 2 as 1 | 2,
    gainLowRange: { min: -25, max: 25 },
    gainMidRange: { min: -25, max: 25 },
    gainHighRange: { min: -25, max: 50 }
  }
}

export function createEmptyPanelState() {
  return {
    leds: createEmptyPanelLedState(),
    display: {
      characters: Array.from({ length: 32 }, () => ' '),
      flashing: emptyDisplayFlashing()
    },
    knobs: createEmptyPanelKnobState(),
    connected: false,
    lastUpdated: null
  }
}
