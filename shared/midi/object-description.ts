import { denibblize } from './sysex'

/** One unit/limit triple from an Object Description (04 hex). */
export interface ObjectLimit {
  min: number
  max: number
  displayUnits: number
  signed: boolean
}

/** Parsed Object Description attributes (MIDI doc message type 04). */
export interface ObjectDescription {
  objectTypeId: number
  name: string
  byteCount: number
  controlFlags: number
  optionObjectTypeId: number | null
  limits: ObjectLimit[]
}

export interface ParsedObjectTypeId {
  objectTypeId: number
  levels: number[] | null
}

/** Strip optional trailing checksum (single 0–127 byte) before denibblizing. */
function payloadBytes(payload: number[]): number[] {
  const nibbles = payload.length % 2 === 1 ? payload.slice(0, -1) : payload
  return denibblize(nibbles)
}

function readU16(bytes: number[], offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8)
}

function readLimitWord(bytes: number[], offset: number, signed: boolean): number {
  const unsigned = readU16(bytes, offset)
  if (signed) {
    return unsigned > 32767 ? unsigned - 65536 : unsigned
  }
  return unsigned
}

/**
 * Cast a description min/max word to the parameter's wire width.
 * MIDI doc: limits are signed words; for 1-byte params cast to signed/unsigned byte.
 */
export function castObjectLimit(word: number, byteCount: number, signed: boolean): number {
  if (byteCount <= 1) {
    const low = word & 0xff
    return signed ? (low > 127 ? low - 256 : low) : low
  }
  if (!signed) {
    return word < 0 ? word + 65536 : word
  }
  return word
}

/** Parse Object Type ID response (03 hex). */
export function parseObjectTypeIdPayload(payload: number[]): ParsedObjectTypeId | null {
  const bytes = payloadBytes(payload)
  if (bytes.length < 2) {
    return null
  }

  const objectTypeId = readU16(bytes, 0)
  if (bytes.length < 4) {
    return { objectTypeId, levels: null }
  }

  const levelCount = readU16(bytes, 2)
  if (levelCount <= 0 || bytes.length < 4 + levelCount * 2) {
    return { objectTypeId, levels: null }
  }

  const levels: number[] = []
  for (let i = 0; i < levelCount; i++) {
    levels.push(readU16(bytes, 4 + i * 2))
  }
  return { objectTypeId, levels }
}

/** Parse Object Description response (04 hex). */
export function parseObjectDescriptionPayload(payload: number[]): ObjectDescription | null {
  const bytes = payloadBytes(payload)
  if (bytes.length < 6) {
    return null
  }

  let offset = 0
  const objectTypeId = readU16(bytes, offset)
  offset += 2

  const nameLen = bytes[offset] ?? 0
  offset += 1
  if (bytes.length < offset + nameLen + 6) {
    return null
  }

  const name = bytes
    .slice(offset, offset + nameLen)
    .map(b => String.fromCharCode(b))
    .join('')
    .replace(/\0/g, '')
    .trimEnd()
  offset += nameLen

  const byteCount = readU16(bytes, offset)
  offset += 2

  const controlFlags = bytes[offset] ?? 0
  offset += 1

  const optionRaw = readU16(bytes, offset)
  offset += 2
  const optionObjectTypeId = optionRaw === 0xffff ? null : optionRaw

  const unitCount = bytes[offset] ?? 0
  offset += 1

  const limits: ObjectLimit[] = []
  for (let i = 0; i < unitCount; i++) {
    if (bytes.length < offset + 6) {
      break
    }
    const displayUnits = readU16(bytes, offset + 4)
    const signed = (displayUnits & 0x8000) !== 0
    const minWord = readLimitWord(bytes, offset, signed)
    const maxWord = readLimitWord(bytes, offset + 2, signed)
    limits.push({
      min: castObjectLimit(minWord, byteCount, signed),
      max: castObjectLimit(maxWord, byteCount, signed),
      displayUnits: displayUnits & 0x7fff,
      signed
    })
    offset += 6
  }

  return {
    objectTypeId,
    name,
    byteCount,
    controlFlags,
    optionObjectTypeId,
    limits
  }
}

/** Primary min/max for editors (first unit/limit). */
export function primaryObjectRange(
  description: ObjectDescription
): { min: number, max: number } | null {
  const limit = description.limits[0]
  if (!limit) {
    return null
  }
  return { min: limit.min, max: limit.max }
}
