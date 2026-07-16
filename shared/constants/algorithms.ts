import {
  GENERATED_ALGORITHM_BY_BLOCK_ALG,
  GENERATED_ALGORITHMS,
  type GeneratedAlgorithmId
} from './algorithms.generated'
import type { AlgorithmDef, AlgorithmParamDef } from '#shared/types/algorithm'
import type { EffectBlockId } from '#shared/types/effect-blocks'
import type { EffectPedalParam } from '#shared/types/effect-pedal'
import type { ParamRange } from '#shared/types/midi'

export {
  GENERATED_ALGORITHM_BY_BLOCK_ALG,
  GENERATED_ALGORITHM_IDS,
  GENERATED_ALGORITHMS,
  type GeneratedAlgorithmId
} from './algorithms.generated'

/** Lookup compiled algorithm by Content id. */
export function algorithmById(id: string): AlgorithmDef | null {
  return (GENERATED_ALGORITHMS as Record<string, AlgorithmDef>)[id] ?? null
}

/** Resolve algorithm loaded in a program block (1-based alg index). */
export function algorithmForBlockAlg(block: EffectBlockId, alg: number): AlgorithmDef | null {
  if (alg <= 0) {
    return null
  }
  const byBlock = GENERATED_ALGORITHM_BY_BLOCK_ALG as Partial<
    Record<EffectBlockId, Record<number, string>>
  >
  const id = byBlock[block]?.[alg]
  return id ? algorithmById(id) : null
}

export function algorithmParamById(def: AlgorithmDef, paramId: string): AlgorithmParamDef | null {
  return def.params.find(param => param.id === paramId) ?? null
}

export function algorithmParamByIndex(def: AlgorithmDef, paramIndex: number): AlgorithmParamDef | null {
  return def.params.find(param => param.index === paramIndex) ?? null
}

export function algorithmFallbackRange(param: AlgorithmParamDef): ParamRange {
  return { min: param.min, max: param.max }
}

export function normalizeAlgorithmDescriptionName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

/** Match an Object Description LCD name against param id / label. */
export function algorithmParamMatchesDescription(param: AlgorithmParamDef, name: string): boolean {
  const normalized = normalizeAlgorithmDescriptionName(name)
  const keys = [
    normalizeAlgorithmDescriptionName(param.id),
    normalizeAlgorithmDescriptionName(param.label)
  ]
  return keys.some(key => key.length > 0 && (normalized === key || normalized.startsWith(key)))
}

export function algorithmPedalParams(
  def: AlgorithmDef,
  ranges?: Record<string, ParamRange>
): EffectPedalParam[] {
  return def.params.map((param) => {
    const range = ranges?.[param.id] ?? algorithmFallbackRange(param)
    return {
      id: param.id,
      label: param.label,
      min: range.min,
      max: range.max,
      step: 1
    }
  })
}

export function algorithmMeta(def: AlgorithmDef) {
  return {
    name: def.name,
    modelName: def.modelName,
    description: def.summary,
    dspSteps: def.dspSteps,
    manualSection: def.manualSection,
    color: def.color
  }
}

/** Mix / Level always sit on the stompbox bottom row when the algorithm has them. */
export const ALGORITHM_FACE_BOTTOM_IDS = ['mix', 'level'] as const

export type AlgorithmFaceParamIds = {
  /** Character knobs on the top row (≤3). */
  top: string[]
  /** Mix and/or Level on the bottom row. */
  bottom: string[]
  /** Union of face ids (top + bottom). */
  all: string[]
}

/**
 * Resolve stompbox face knobs: curated softRow on top, Mix/Level on bottom.
 * softRow entries that are mix/level (or missing) are skipped.
 */
export function algorithmFaceParamIds(
  params: readonly { id: string }[],
  softRow: readonly string[]
): AlgorithmFaceParamIds {
  const paramIds = new Set(params.map(param => param.id))
  const bottom = ALGORITHM_FACE_BOTTOM_IDS.filter(id => paramIds.has(id))
  const bottomSet = new Set<string>(bottom)
  const top = softRow
    .filter(id => paramIds.has(id) && !bottomSet.has(id))
    .slice(0, 3)
  return {
    top,
    bottom,
    all: [...top, ...bottom]
  }
}

/** Pedal accent for a loaded algorithm; falls back when unloaded / unknown. */
export function algorithmColorForBlockAlg(
  block: EffectBlockId,
  alg: number,
  fallback: string
): string {
  return algorithmForBlockAlg(block, alg)?.color ?? fallback
}

/** Advanced (non-face) params for a Gain algorithm, when defined. */
export function gainAdvancedParamsForAlg(alg: number): EffectPedalParam[] {
  const def = algorithmForBlockAlg('gain', alg)
  if (!def) {
    return []
  }
  const face = new Set(algorithmFaceParamIds(def.params, def.softRow).all)
  return algorithmPedalParams(def).filter(param => !face.has(param.id))
}

export function isGeneratedAlgorithmId(id: string): id is GeneratedAlgorithmId {
  return id in GENERATED_ALGORITHMS
}
