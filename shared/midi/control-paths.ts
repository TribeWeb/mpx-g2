/** System-level object type IDs from the MIDI implementation doc. */
export const OBJECT_TYPE_DISPLAY_DUMP = 0x0154
export const OBJECT_TYPE_LED_DUMP = 0x0165

/** System branch root (first control level). */
export const SYSTEM_BRANCH = 0x0001

/**
 * Control-tree paths for on-demand panel state requests.
 * Pattern follows Setup Select (L:0003 A:0001 B:0001 C:000D) in the MIDI doc.
 */
export const DISPLAY_DUMP_PATH = [SYSTEM_BRANCH, 0x0001, OBJECT_TYPE_DISPLAY_DUMP] as const
export const LED_DUMP_PATH = [SYSTEM_BRANCH, 0x0001, OBJECT_TYPE_LED_DUMP] as const

/** Alternate 2-level path seen on some Lexicon products. */
export const LED_DUMP_PATH_ALT = [SYSTEM_BRANCH, OBJECT_TYPE_LED_DUMP] as const

export function pathsEqual(a: number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export function isLedDumpPath(levels: number[]): boolean {
  return pathsEqual(levels, LED_DUMP_PATH)
    || pathsEqual(levels, LED_DUMP_PATH_ALT)
    || levels[levels.length - 1] === OBJECT_TYPE_LED_DUMP
}

export function isDisplayDumpPath(levels: number[]): boolean {
  return pathsEqual(levels, DISPLAY_DUMP_PATH)
    || levels[levels.length - 1] === OBJECT_TYPE_DISPLAY_DUMP
}

/**
 * LED dump is 10 bytes but the object type may advertise 32 — trailing bytes are zero padding.
 */
export function isLikelyLedDumpData(data: number[]): boolean {
  if (data.length === 10) {
    return true
  }
  if (data.length === 32 && data.slice(10).every(byte => byte === 0)) {
    return true
  }
  return false
}

export function ledDumpBytes(data: number[]): number[] {
  return data.slice(0, 10)
}
