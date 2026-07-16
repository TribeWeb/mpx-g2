import type { FrontPanelButtonName } from './midi'

/** MPX-G2 program effect blocks (seven slots in alg_nums / param_data). */
export const EFFECT_BLOCK_IDS = [
  'gain',
  'fx1',
  'fx2',
  'chorus',
  'delay',
  'reverb',
  'eq'
] as const

export type EffectBlockId = typeof EFFECT_BLOCK_IDS[number]

export type EffectBlockMeta = {
  name: string
  modelName: string
  description: string
}

export type EffectBlockDef = {
  id: EffectBlockId
  /** Program branch effect-type index (B level). */
  effectType: number
  panelButton: FrontPanelButtonName
  displayName: string
  color: string
  /** Left-to-right pedalboard order. */
  pedalOrder: number
  metadataForAlg: (alg: number) => EffectBlockMeta
}
