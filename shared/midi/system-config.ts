import { denibblize } from './sysex'

/** Parsed System Configuration (00 hex) fields we need for harvesting. */
export type SystemConfiguration = {
  majorVersion: number
  minorVersion: number
  buildTime: string
  buildDate: string
  /** Total Object Type IDs (0 … count-1 are legal description requests). */
  objectTypeCount: number
  maxControlLevels: number
}

function readU16(bytes: number[], offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8)
}

function readAscii(bytes: number[], offset: number, length: number): string {
  return bytes
    .slice(offset, offset + length)
    .map(b => String.fromCharCode(b))
    .join('')
    .replace(/\0/g, '')
    .trim()
}

/**
 * Parse System Configuration payload (nibbles after message type, optional checksum).
 * Layout per MIDI impl doc § System Configuration.
 */
export function parseSystemConfigPayload(payload: number[]): SystemConfiguration | null {
  const nibbles = payload.length % 2 === 1 ? payload.slice(0, -1) : payload
  const bytes = denibblize(nibbles)
  // major, minor, time(8), date(11), objectTypes(2) → at least 23 bytes
  if (bytes.length < 23) {
    return null
  }

  return {
    majorVersion: bytes[0] ?? 0,
    minorVersion: bytes[1] ?? 0,
    buildTime: readAscii(bytes, 2, 8),
    buildDate: readAscii(bytes, 10, 11),
    objectTypeCount: readU16(bytes, 21),
    maxControlLevels: bytes.length >= 27 ? readU16(bytes, 25) : 0
  }
}
