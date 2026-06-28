import {
  DEFAULT_DEVICE_ID,
  LEXICON_MANUFACTURER_ID,
  MPX_G2_PRODUCT_ID,
  type HandshakeCommandValue,
  type SysExMessageTypeValue
} from '../types/midi'

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
  messageType: SysExMessageTypeValue
}

/** Build the standard Lexicon MPX-G2 SysEx header. */
export function buildSysExHeader({
  deviceId = DEFAULT_DEVICE_ID,
  messageType
}: SysExHeaderOptions): number[] {
  return [SYSEX_START, LEXICON_MANUFACTURER_ID, MPX_G2_PRODUCT_ID, deviceId, messageType]
}

/** Build a handshake SysEx message. */
export function buildHandshakeMessage(
  command: HandshakeCommandValue,
  deviceId = DEFAULT_DEVICE_ID
): Uint8Array {
  return new Uint8Array([
    ...buildSysExHeader({ deviceId, messageType: 0x12 }),
    command,
    SYSEX_END
  ])
}

/** Build a panel button press SysEx data message (stub — address mapping TBD). */
export function buildPanelButtonMessage(
  buttonValue: number,
  deviceId = DEFAULT_DEVICE_ID
): Uint8Array {
  const payload = nibblize([buttonValue])
  return new Uint8Array([
    ...buildSysExHeader({ deviceId, messageType: 0x01 }),
    ...payload,
    SYSEX_END
  ])
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

  if (bytes[1] !== LEXICON_MANUFACTURER_ID || bytes[2] !== MPX_G2_PRODUCT_ID) {
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
    buttons: {
      gain: false,
      fx1: false,
      fx2: false,
      program: false,
      chorus: false,
      delay: false,
      reverb: false,
      edit: false,
      eq: false,
      insert: false,
      bypass: false,
      system: false,
      tempo: false,
      a: false,
      softRow: false,
      store: false,
      midi: false,
      b: false,
      option: false
    },
    segments: [0, 0, 0] as [number, number, number],
    scanBits: [0, 0, 0]
  }
}

export function createEmptyPanelState() {
  return {
    leds: createEmptyPanelLedState(),
    display: {
      characters: Array.from({ length: 32 }, () => ' ')
    },
    connected: false,
    lastUpdated: null
  }
}
