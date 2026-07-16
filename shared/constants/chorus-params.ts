import {
  algorithmFallbackRange,
  algorithmForBlockAlg,
  algorithmParamMatchesDescription,
  algorithmPedalParams,
  GENERATED_ALGORITHMS
} from './algorithms'
import type { AlgorithmParamDef } from '#shared/types/algorithm'
import type { EffectPedalParam } from '#shared/types/effect-pedal'
import type { ParamRange } from '#shared/types/midi'

/** Known Chorus parameter ids (Stereo Chorus + shared Mix/Level). */
export const CHORUS_PARAM_IDS = [
  'mix',
  'level',
  'rate1',
  'pw1',
  'dpth1',
  'rate2',
  'pw2',
  'dpth2',
  'res1',
  'res2'
] as const

export type ChorusParamId = typeof CHORUS_PARAM_IDS[number]

export type ChorusParamDef = {
  id: ChorusParamId
  /** Control-tree D-level index within the algorithm. */
  index: number
  label: string
  fallbackRange: ParamRange
  /** Short description from the manual parameter table. */
  description: string
}

function toChorusParamDef(param: AlgorithmParamDef): ChorusParamDef {
  return {
    id: param.id as ChorusParamId,
    index: param.index,
    label: param.label,
    fallbackRange: algorithmFallbackRange(param),
    description: param.description
  }
}

/**
 * Stereo Chorus (alg 1) — from content/effects/stereo-chorus.md.
 * Mix/Level are always 0/1; modulators follow in LCD order.
 */
export const CHORUS_STEREO_PARAMS: ChorusParamDef[]
  = GENERATED_ALGORITHMS['stereo-chorus'].params.map(toChorusParamDef)

/** Fallback when algorithm-specific layout is unknown: Mix + Level only. */
export const CHORUS_BASIC_PARAMS: ChorusParamDef[] = [
  CHORUS_STEREO_PARAMS[0]!,
  CHORUS_STEREO_PARAMS[1]!
]

/** Soft-row ids shown on the Chorus pedal face. */
export const CHORUS_SOFT_ROW_IDS: ChorusParamId[]
  = [...GENERATED_ALGORITHMS['stereo-chorus'].softRow] as ChorusParamId[]

export function chorusParamsForAlg(alg: number): ChorusParamDef[] {
  const fromLibrary = algorithmForBlockAlg('chorus', alg)
  if (fromLibrary) {
    return fromLibrary.params.map(toChorusParamDef)
  }
  if (alg >= 1) {
    return CHORUS_BASIC_PARAMS
  }
  return []
}

export function chorusParamDefByIndex(alg: number, paramIndex: number): ChorusParamDef | null {
  return chorusParamsForAlg(alg).find(param => param.index === paramIndex) ?? null
}

export function chorusParamDefById(alg: number, paramId: string): ChorusParamDef | null {
  return chorusParamsForAlg(alg).find(param => param.id === paramId) ?? null
}

export function normalizeChorusDescriptionName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s_\-]+/g, '')
}

export function chorusParamMatchesDescription(def: ChorusParamDef, name: string): boolean {
  return algorithmParamMatchesDescription(
    {
      id: def.id,
      index: def.index,
      label: def.label,
      min: def.fallbackRange.min,
      max: def.fallbackRange.max,
      description: def.description
    },
    name
  )
}

export function chorusPedalParamsFromState(
  defs: ChorusParamDef[],
  ranges: Record<string, ParamRange>
): EffectPedalParam[] {
  return defs.map((def) => {
    const range = ranges[def.id] ?? def.fallbackRange
    return {
      id: def.id,
      label: def.label,
      min: range.min,
      max: range.max,
      step: 1
    }
  })
}

export function createEmptyChorusValues(): Record<string, number> {
  const values: Record<string, number> = {}
  for (const def of CHORUS_STEREO_PARAMS) {
    values[def.id] = def.id === 'mix' ? 50 : 0
  }
  return values
}

export function createEmptyChorusRanges(): Record<string, ParamRange> {
  const ranges: Record<string, ParamRange> = {}
  for (const def of CHORUS_STEREO_PARAMS) {
    ranges[def.id] = { ...def.fallbackRange }
  }
  return ranges
}

export function createEmptyChorusValueBytes(): Record<string, 1 | 2> {
  const bytes: Record<string, 1 | 2> = {}
  for (const def of CHORUS_STEREO_PARAMS) {
    bytes[def.id] = 1
  }
  return bytes
}

/** Pedal param list for an algorithm when ranges are already known. */
export function chorusLibraryPedalParams(
  alg: number,
  ranges?: Record<string, ParamRange>
): EffectPedalParam[] {
  const def = algorithmForBlockAlg('chorus', alg)
  if (!def) {
    return chorusPedalParamsFromState(chorusParamsForAlg(alg), ranges ?? {})
  }
  return algorithmPedalParams(def, ranges)
}
