/** System-level object type IDs from the MIDI implementation doc. */
export const OBJECT_TYPE_DISPLAY_DUMP = 0x0154
export const OBJECT_TYPE_LED_DUMP = 0x0165

/** System branch root (first control level). */
export const SYSTEM_BRANCH = 0x0001

/** Program branch root (first control level). */
export const PROGRAM_BRANCH = 0x0000

/** Effect-type index for Gain in the program control tree. */
export const GAIN_EFFECT_TYPE = 0x0006

/** Param index within a Gain algorithm for front-panel Lo / Mid / Hi knobs. */
export const GAIN_EQ_PARAM_INDEX = {
  low: 0,
  mid: 1,
  high: 2
} as const

/** Program → Gain algorithm select (L:0002 A:0000 B:0006). */
export const GAIN_ALG_PATH = [PROGRAM_BRANCH, GAIN_EFFECT_TYPE] as const

/**
 * Fallback Gain Lo/Mid/Hi ranges until Object Description replies arrive.
 * Real limits are effect-dependent (e.g. Screamer Lo/Mid −5…+5, Hi 0…+5).
 */
export const GAIN_EQ_DISPLAY_RANGE = {
  low: { min: -25, max: 25 },
  mid: { min: -25, max: 25 },
  high: { min: -25, max: 50 }
} as const

export function gainEqRangeKey(band: 'low' | 'mid' | 'high'): 'gainLowRange' | 'gainMidRange' | 'gainHighRange' {
  if (band === 'low') {
    return 'gainLowRange'
  }
  if (band === 'mid') {
    return 'gainMidRange'
  }
  return 'gainHighRange'
}

/**
 * Control-tree paths for on-demand panel state requests / writes.
 * Panel LCD lives at System → Panel → Pnl Disply (MIDI doc: display dump).
 */
export const PANEL_DISPLAY_PATH = [SYSTEM_BRANCH, 0x0008, 0x0001] as const
/** @deprecated Prefer PANEL_DISPLAY_PATH; kept for inbound path matching. */
export const DISPLAY_DUMP_PATH = PANEL_DISPLAY_PATH
export const LED_DUMP_PATH = [SYSTEM_BRANCH, 0x0008, 0x0002] as const

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
  return pathsEqual(levels, PANEL_DISPLAY_PATH)
    || levels[levels.length - 1] === OBJECT_TYPE_DISPLAY_DUMP
    || levels[levels.length - 1] === 0x0155
}

export function isGainAlgPath(levels: number[]): boolean {
  return pathsEqual(levels, GAIN_ALG_PATH)
}

/**
 * Front-panel Gain Low/Mid/High knobs write Gain-effect EQ params:
 * L:0004 A:0000 B:0006 C:{alg} D:0000|0001|0002
 */
export function parseGainEqPath(levels: number[]): {
  alg: number
  band: 'low' | 'mid' | 'high'
} | null {
  if (
    levels.length !== 4
    || levels[0] !== PROGRAM_BRANCH
    || levels[1] !== GAIN_EFFECT_TYPE
  ) {
    return null
  }

  const alg = levels[2] ?? 0
  const param = levels[3] ?? -1
  if (alg < 1) {
    return null
  }

  if (param === GAIN_EQ_PARAM_INDEX.low) {
    return { alg, band: 'low' }
  }
  if (param === GAIN_EQ_PARAM_INDEX.mid) {
    return { alg, band: 'mid' }
  }
  if (param === GAIN_EQ_PARAM_INDEX.high) {
    return { alg, band: 'high' }
  }
  return null
}

export function gainEqControlPath(alg: number, band: 'low' | 'mid' | 'high'): number[] {
  return [PROGRAM_BRANCH, GAIN_EFFECT_TYPE, alg, GAIN_EQ_PARAM_INDEX[band]]
}

export function gainAlgControlPath(): number[] {
  return [...GAIN_ALG_PATH]
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
