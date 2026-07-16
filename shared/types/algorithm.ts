import type { EffectBlockId } from './effect-blocks'

/** Shared DSP step budget for Effect1/2, Chorus, Delay, and EQ (manual §7). */
export const DSP_STEP_BUDGET = 190

/** Machine-facing algorithm param (subset of Content frontmatter). */
export type AlgorithmParamDef = {
  id: string
  /** Control-tree D-level index within the algorithm. */
  index: number
  label: string
  min: number
  max: number
  /** Short description from the manual parameter table. */
  description: string
  /** Value width when writing SysEx; Object Description may override. */
  bytes?: 1 | 2
}

/** Compiled algorithm definition used by MIDI sync + pedal UI. */
export type AlgorithmDef = {
  /** Filename stem from content/effects/{id}.md (Content path `/effects/{id}`). */
  id: string
  name: string
  modelName: string
  /** Short blurb for pedal chrome (full prose lives in Content body). */
  summary: string
  /**
   * Shared DSP processing steps consumed (of {@link DSP_STEP_BUDGET}).
   * Gain and Reverb use dedicated resources and report 0.
   */
  dspSteps: number
  /** Manual chapter reference, e.g. "7-21". */
  manualSection?: string
  /** Block → 1-based algorithm index where this effect can be loaded. */
  availableIn: Partial<Record<EffectBlockId, number>>
  /** Param ids shown on the soft-row / pedal face. */
  softRow: string[]
  params: AlgorithmParamDef[]
}
