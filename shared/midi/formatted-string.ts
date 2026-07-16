import { denibblize } from './sysex'

/** Parsed Formatted String reply (message type 02 hex). */
export type ParsedFormattedString = {
  text: string
  /** Raw character bytes (before ASCII mapping) — needed for 32-char LCD dumps. */
  charBytes: number[]
  levels: number[] | null
}

function payloadBytes(payload: number[]): number[] {
  const nibbles = payload.length % 2 === 1 ? payload.slice(0, -1) : payload
  return denibblize(nibbles)
}

function readU16(bytes: number[], offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8)
}

/**
 * Parse a Formatted String payload (nibbles after message type).
 * Layout: charCount(u16) + ASCII bytes + optional levelCount(u16) + levels.
 */
export function parseFormattedStringPayload(payload: number[]): ParsedFormattedString | null {
  const bytes = payloadBytes(payload)
  if (bytes.length < 2) {
    return null
  }

  const charCount = readU16(bytes, 0)
  if (charCount < 0 || bytes.length < 2 + charCount) {
    return null
  }

  const charBytes = bytes.slice(2, 2 + charCount)
  const text = charBytes
    .map(b => (b >= 32 && b < 127 ? String.fromCharCode(b) : ' '))
    .join('')
    .trimEnd()

  let levels: number[] | null = null
  const afterString = 2 + charCount
  if (bytes.length >= afterString + 2) {
    const levelCount = readU16(bytes, afterString)
    if (levelCount > 0 && bytes.length >= afterString + 2 + levelCount * 2) {
      levels = []
      for (let i = 0; i < levelCount; i++) {
        levels.push(readU16(bytes, afterString + 2 + i * 2))
      }
    }
  }

  return { text, charBytes, levels }
}
