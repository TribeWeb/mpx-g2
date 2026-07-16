import { algorithmForBlockAlg, algorithmMeta } from './algorithms'

/** Chorus-block algorithm metadata (manual §7 Chorus column). Index is 1-based; 0 = off. */
export const CHORUS_EFFECTS = [
  {
    alg: 1,
    name: 'Chorus',
    modelName: 'Stereo chorus',
    description:
      'True stereo multi-voice chorus with dual 2-tap modulators and cross resonance — enrich guitars and keyboards.'
  },
  {
    alg: 2,
    name: 'Flanger (M)',
    modelName: 'Mono flanger',
    description: 'Classic mono flanger with rate, depth and resonance controls.'
  },
  {
    alg: 3,
    name: 'Flanger24 (M)',
    modelName: '24-stage flanger',
    description: 'Deeper mono flanger with a longer delay line for more dramatic sweeps.'
  },
  {
    alg: 4,
    name: 'Flanger (S)',
    modelName: 'Stereo flanger',
    description: 'Stereo flanger with independent left/right modulation.'
  },
  {
    alg: 5,
    name: 'Rotary Cab',
    modelName: 'Leslie / rotary',
    description: 'Rotary speaker cabinet simulation with speed and mix controls.'
  },
  {
    alg: 6,
    name: 'Aerosol',
    modelName: 'Modulation wash',
    description: 'Dense modulated wash — Lexicon’s Aerosol effect.'
  },
  {
    alg: 7,
    name: 'Orbits',
    modelName: 'Orbiting modulation',
    description: 'Spatial orbiting modulation effect.'
  },
  {
    alg: 8,
    name: 'Centrifuge1',
    modelName: 'Centrifuge',
    description: 'Spinning modulation effect (Centrifuge 1).'
  },
  {
    alg: 9,
    name: 'Centrifuge2',
    modelName: 'Centrifuge 2',
    description: 'Alternate centrifuge / spinning modulation variant.'
  },
  {
    alg: 10,
    name: 'Comb 1',
    modelName: 'Comb filter',
    description: 'Comb effect combining the input with a micro-delayed copy.'
  },
  {
    alg: 11,
    name: 'Comb 2',
    modelName: 'Comb filter 2',
    description: 'Second comb-filter variant.'
  },
  {
    alg: 12,
    name: 'Volume (M)',
    modelName: 'Mono volume',
    description: 'Mono volume / level utility in the Chorus block.'
  },
  {
    alg: 13,
    name: 'Volume (S)',
    modelName: 'Stereo volume',
    description: 'Stereo volume utility in the Chorus block.'
  },
  {
    alg: 14,
    name: 'Volume (D)',
    modelName: 'Dual volume',
    description: 'Dual-path volume utility in the Chorus block.'
  },
  {
    alg: 15,
    name: 'PedalVol',
    modelName: 'Pedal volume',
    description: 'Volume controlled by the expression pedal.'
  },
  {
    alg: 16,
    name: 'ExtPedalVol',
    modelName: 'External pedal volume',
    description: 'Volume controlled by an external pedal source.'
  },
  {
    alg: 17,
    name: 'Phaser',
    modelName: 'Phaser',
    description: 'Classic phaser (when loaded in the Chorus block).'
  },
  {
    alg: 18,
    name: 'OrangePhase',
    modelName: 'Orange phaser',
    description: 'OrangePhase phaser variant.'
  }
] as const

export function chorusEffectForAlg(alg: number) {
  if (alg <= 0) {
    return {
      alg: 0,
      name: 'Off',
      modelName: 'No effect',
      description: 'Chorus block has no algorithm loaded in this program.'
    }
  }
  const fromLibrary = algorithmForBlockAlg('chorus', alg)
  if (fromLibrary) {
    const meta = algorithmMeta(fromLibrary)
    return {
      alg,
      name: meta.name,
      modelName: meta.modelName,
      description: meta.description,
      dspSteps: meta.dspSteps,
      manualSection: meta.manualSection
    }
  }
  return CHORUS_EFFECTS.find(effect => effect.alg === alg) ?? {
    alg,
    name: `Algorithm ${alg}`,
    modelName: 'Chorus',
    description: `Chorus algorithm ${alg} is active.`
  }
}
