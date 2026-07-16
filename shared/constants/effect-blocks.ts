import { algorithmForBlockAlg, algorithmMeta } from './algorithms'
import { DSP_STEP_BUDGET } from '#shared/types/algorithm'
import { chorusEffectForAlg } from './chorus-effects'
import { gainEffectForAlg } from './gain-effects'
import { TUBE_SCREAMER_GREEN } from './gain-pedal-demo'
import type { EffectBlockDef, EffectBlockId, EffectBlockMeta } from '#shared/types/effect-blocks'
import { EFFECT_BLOCK_IDS } from '#shared/types/effect-blocks'
import type { EffectPedalParam } from '#shared/types/effect-pedal'
import type { ParamRange } from '#shared/types/midi'
import { STANDARD_EFFECT_DISPLAY_RANGE } from '#shared/midi/control-paths'

/** Mix / Level — common to virtually every MPX-G2 effect algorithm. */
export const STANDARD_EFFECT_PARAMS: EffectPedalParam[] = [
  { id: 'mix', label: 'Mix', min: 0, max: 100, step: 1 },
  { id: 'level', label: 'Level', min: -89, max: 6, step: 1 }
]

/**
 * Fallback pedal accent when no algorithm is loaded (or Content lacks `color`).
 * Loaded effects use frontmatter `color` via {@link algorithmColorForBlockAlg}.
 */
export const EFFECT_BLOCK_FALLBACK_COLORS: Record<EffectBlockId, string> = {
  gain: TUBE_SCREAMER_GREEN,
  fx1: '#7c3aed',
  fx2: '#a855f7',
  chorus: '#0ea5e9',
  delay: '#f59e0b',
  reverb: '#6366f1',
  eq: '#14b8a6'
}

function genericMeta(blockLabel: string, alg: number): EffectBlockMeta {
  if (alg <= 0) {
    return {
      name: 'Off',
      modelName: 'No effect',
      description: `${blockLabel} is bypassed or has no algorithm loaded in this program.`
    }
  }
  return {
    name: `Algorithm ${alg}`,
    modelName: blockLabel,
    description: `${blockLabel} algorithm ${alg} is active. Parameter sync for this block is not wired yet — values shown are demo placeholders.`
  }
}

function dspStepsNote(dspSteps: number): string {
  if (dspSteps <= 0) {
    return ` Uses dedicated processing (0 of ${DSP_STEP_BUDGET} shared steps).`
  }
  return ` Uses ${dspSteps} of ${DSP_STEP_BUDGET} processing steps.`
}

function gainMeta(alg: number): EffectBlockMeta {
  const effect = gainEffectForAlg(alg)
  const stepsNote
    = 'dspSteps' in effect && typeof effect.dspSteps === 'number'
      ? dspStepsNote(effect.dspSteps)
      : ''
  return {
    name: effect.name,
    modelName: effect.modelName,
    description: `${effect.description}${stepsNote}`
  }
}

function chorusMeta(alg: number): EffectBlockMeta {
  const fromLibrary = algorithmForBlockAlg('chorus', alg)
  if (fromLibrary) {
    const meta = algorithmMeta(fromLibrary)
    return {
      name: meta.name,
      modelName: meta.modelName,
      description: `${meta.description}${dspStepsNote(meta.dspSteps)}`
    }
  }
  const effect = chorusEffectForAlg(alg)
  return {
    name: effect.name,
    modelName: effect.modelName,
    description: effect.description
  }
}

export const EFFECT_BLOCK_REGISTRY: EffectBlockDef[] = [
  {
    id: 'gain',
    effectType: 0x0006,
    panelButton: 'gain',
    displayName: 'Gain',
    color: EFFECT_BLOCK_FALLBACK_COLORS.gain,
    pedalOrder: 0,
    metadataForAlg: gainMeta
  },
  {
    id: 'fx1',
    effectType: 0x0000,
    panelButton: 'fx1',
    displayName: 'FX 1',
    color: EFFECT_BLOCK_FALLBACK_COLORS.fx1,
    pedalOrder: 1,
    metadataForAlg: alg => genericMeta('FX 1', alg)
  },
  {
    id: 'fx2',
    effectType: 0x0001,
    panelButton: 'fx2',
    displayName: 'FX 2',
    color: EFFECT_BLOCK_FALLBACK_COLORS.fx2,
    pedalOrder: 2,
    metadataForAlg: alg => genericMeta('FX 2', alg)
  },
  {
    id: 'chorus',
    effectType: 0x0002,
    panelButton: 'chorus',
    displayName: 'Chorus',
    color: EFFECT_BLOCK_FALLBACK_COLORS.chorus,
    pedalOrder: 3,
    metadataForAlg: chorusMeta
  },
  {
    id: 'delay',
    effectType: 0x0003,
    panelButton: 'delay',
    displayName: 'Delay',
    color: EFFECT_BLOCK_FALLBACK_COLORS.delay,
    pedalOrder: 4,
    metadataForAlg: alg => genericMeta('Delay', alg)
  },
  {
    id: 'reverb',
    effectType: 0x0004,
    panelButton: 'reverb',
    displayName: 'Reverb',
    color: EFFECT_BLOCK_FALLBACK_COLORS.reverb,
    pedalOrder: 5,
    metadataForAlg: alg => genericMeta('Reverb', alg)
  },
  {
    id: 'eq',
    effectType: 0x0005,
    panelButton: 'eq',
    displayName: 'EQ',
    color: EFFECT_BLOCK_FALLBACK_COLORS.eq,
    pedalOrder: 6,
    metadataForAlg: alg => genericMeta('EQ', alg)
  }
]

export const EFFECT_BLOCKS_BY_ID = Object.fromEntries(
  EFFECT_BLOCK_REGISTRY.map(block => [block.id, block])
) as Record<EffectBlockId, EffectBlockDef>

export const EFFECT_BLOCKS_PEDAL_ORDER = [...EFFECT_BLOCK_REGISTRY].sort(
  (a, b) => a.pedalOrder - b.pedalOrder
)

export function isEffectBlockId(value: string): value is EffectBlockId {
  return (EFFECT_BLOCK_IDS as readonly string[]).includes(value)
}

export function demoParamsForBlock(blockId: EffectBlockId): EffectPedalParam[] {
  if (blockId === 'gain' || blockId === 'chorus') {
    return []
  }
  return STANDARD_EFFECT_PARAMS.map(param => ({ ...param }))
}

export function chorusParamsFromRanges(
  mixRange: ParamRange = STANDARD_EFFECT_DISPLAY_RANGE.mix,
  levelRange: ParamRange = STANDARD_EFFECT_DISPLAY_RANGE.level
): EffectPedalParam[] {
  return [
    { id: 'mix', label: 'Mix', min: mixRange.min, max: mixRange.max, step: 1 },
    { id: 'level', label: 'Level', min: levelRange.min, max: levelRange.max, step: 1 }
  ]
}

export function demoParamValuesForBlock(blockId: EffectBlockId): Record<string, number> {
  if (blockId === 'gain' || blockId === 'chorus') {
    return {}
  }
  return { mix: 50, level: 0 }
}

export function softRowParamIdsForBlock(blockId: EffectBlockId, alg?: number): string[] {
  if (alg != null && alg > 0) {
    const fromLibrary = algorithmForBlockAlg(blockId, alg)
    if (fromLibrary) {
      return [...fromLibrary.softRow]
    }
  }
  if (blockId === 'gain') {
    return ['lo', 'mid', 'hi']
  }
  // Mix/Level are always on the bottom row; unknown blocks start with an empty top row.
  return []
}
