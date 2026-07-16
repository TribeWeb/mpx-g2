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
  /** Pedal / demo starting value (within min…max). */
  default: number
  /** Short description from the manual parameter table. */
  description: string
  /** Value width when writing SysEx; Object Description may override. */
  bytes?: 1 | 2
  /** Display Units Type id (MIDI appendix) for formatting / docs. */
  displayUnits?: number
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
  /** Param ids for the stompbox top row (up to 3 character knobs). Mix/Level always sit on the bottom row when present. */
  softRow: string[]
  params: AlgorithmParamDef[]
  /** Pedal accent colour from Content frontmatter. */
  color: string
}
