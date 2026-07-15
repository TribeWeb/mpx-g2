/** Decode a parameter payload as a signed integer (1- or 2-byte little-endian). */
export function decodeParamValue(data: number[]): number {
  if (data.length >= 2) {
    const unsigned = (data[0]! & 0xff) | ((data[1]! & 0xff) << 8)
    return unsigned > 32767 ? unsigned - 65536 : unsigned
  }

  if (data.length === 1) {
    const unsigned = data[0]! & 0xff
    return unsigned > 127 ? unsigned - 256 : unsigned
  }

  return 0
}

/** Encode a signed parameter value as little-endian bytes (default 1 byte). */
export function encodeParamValue(value: number, byteCount = 1): number[] {
  if (byteCount >= 2) {
    const unsigned = value < 0 ? value + 65536 : value
    return [unsigned & 0xff, (unsigned >> 8) & 0xff]
  }

  const unsigned = value < 0 ? value + 256 : value
  return [unsigned & 0xff]
}
