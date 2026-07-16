import {
  algorithmForBlockAlg,
  algorithmMeta,
  gainAdvancedParamsForAlg
} from './algorithms'
import { TUBE_SCREAMER_GREEN } from './gain-pedal-demo'

/** Gain algorithm metadata (manual §7-3–7-6). Index matches G2 `gainAlg` (1-based). */
export const GAIN_EFFECTS = [
  {
    alg: 1,
    name: 'Tone',
    modelName: 'Clean boost',
    description:
      'Analog tone controls usable as a clean-boost stomp box in front of your amp, or as a simple clean preamp when used without an external guitar amp.'
  },
  {
    alg: 2,
    name: 'Crunch',
    modelName: 'Overdrive',
    description:
      'Overdrive with separate drive controls for low, mid and high frequencies. Designed to be used like a stomp box in front of your amp.'
  },
  {
    alg: 3,
    name: 'Screamer',
    modelName: 'Tube Screamer',
    description:
      'Analog model of a vintage Tube Screamer overdrive (powered by a fresh carbon-zinc battery). Lo, Mid and Hi tone controls extend the original — leave them flat for authentic sounds.'
  },
  {
    alg: 4,
    name: 'Overdrive',
    modelName: 'Dynamic Gain',
    description:
      'More aggressive than Screamer — pushes a clean amp into bluesy overdrive or takes a high-gain channel over the top. Feel mimics power-supply dynamics from AC adapters to carbon-zinc batteries.'
  },
  {
    alg: 5,
    name: 'Distortion',
    modelName: 'Classic fuzz',
    description:
      'More than 100 dB of analog gain with Bass and Treble controls following the distortion stage. Sonic kinship with several classic distortion pedals and fuzz boxes.'
  },
  {
    alg: 6,
    name: 'Preamp',
    modelName: 'Amp model',
    description:
      'Highly editable preamp for DI recording or amp simulation, with Lo/Mid/Hi, Drive, Feel, Bass, Treble and Level controls.'
  },
  {
    alg: 7,
    name: 'SplitPreamp',
    modelName: 'Dual preamp',
    description:
      'Preamp variant with split routing for parallel paths — same core controls as Preamp with flexible signal routing.'
  }
] as const

export function gainEffectForAlg(alg: number) {
  const fromLibrary = algorithmForBlockAlg('gain', alg)
  if (fromLibrary) {
    const meta = algorithmMeta(fromLibrary)
    return {
      alg,
      name: meta.name,
      modelName: meta.modelName,
      description: meta.description,
      dspSteps: meta.dspSteps,
      manualSection: meta.manualSection,
      color: meta.color
    }
  }
  const fallback = GAIN_EFFECTS.find(effect => effect.alg === alg) ?? GAIN_EFFECTS[0]
  return {
    ...fallback,
    color: TUBE_SCREAMER_GREEN
  }
}

/**
 * Advanced Gain params (not on soft row).
 * Tube Screamer (alg 3) comes from content/effects/tube-screamer.md;
 * other algs keep the previous placeholder set until authored.
 */
export const GAIN_ADVANCED_PARAMS = [
  { id: 'drive', label: 'Drive', min: 0, max: 40, step: 1 },
  { id: 'tone', label: 'Tone', min: 0, max: 25, step: 1 },
  { id: 'inLvl', label: 'In Lvl', min: -64, max: 0, step: 1 },
  { id: 'level', label: 'Level', min: 0, max: 64, step: 1 }
] as const

export function gainAdvancedParams(alg: number) {
  const fromLibrary = gainAdvancedParamsForAlg(alg)
  if (fromLibrary.length > 0) {
    return fromLibrary
  }
  return GAIN_ADVANCED_PARAMS.map(param => ({ ...param }))
}
