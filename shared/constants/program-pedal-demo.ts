import type { EffectBlockId } from '#shared/types/effect-blocks'
import type { FrontPanelButtonName, MpxG2PanelState } from '#shared/types/midi'
import { createEmptyProgramState } from '#shared/types/midi'
import {
  createDemoPanelKnobState,
  GAIN_PEDAL_DEMO
} from './gain-pedal-demo'
import { createEmptyPanelLedState, createEmptyPanelState } from '#shared/midi/sysex'

/** Demo algorithm indices for each block in simulated / offline pedalboard previews. */
export const PROGRAM_PEDAL_DEMO_ALGS: Record<EffectBlockId, number> = {
  gain: GAIN_PEDAL_DEMO.gainAlg,
  fx1: 1,
  fx2: 0,
  chorus: 1,
  delay: 1,
  reverb: 1,
  eq: 1
}

/** Which effect bypass LEDs are lit in the demo program. */
export const PROGRAM_PEDAL_DEMO_ENABLED: Record<EffectBlockId, boolean> = {
  gain: GAIN_PEDAL_DEMO.enabled,
  fx1: true,
  fx2: false,
  chorus: true,
  delay: true,
  reverb: true,
  eq: false
}

export function createDemoProgramState() {
  return {
    ...createEmptyProgramState(),
    algByBlock: { ...PROGRAM_PEDAL_DEMO_ALGS }
  }
}

/** Placeholder Mix / Level values for non-wired blocks in demo mode. */
export const PROGRAM_PEDAL_DEMO_PARAM_VALUES: Record<string, number> = {
  mix: 55,
  level: 0
}

/** Demo Chorus Mix / Level for offline + simulated pedalboard. */
export const CHORUS_PEDAL_DEMO = {
  mix: 45,
  level: 0,
  mixRange: { min: 0, max: 100 },
  levelRange: { min: -89, max: 6 }
} as const

/** Panel state seed for simulator / offline pedalboard previews. */
export function createDemoPanelState(): MpxG2PanelState {
  const leds = createEmptyPanelLedState()
  for (const [block, enabled] of Object.entries(PROGRAM_PEDAL_DEMO_ENABLED)) {
    if (enabled) {
      leds.buttons[block as EffectBlockId as FrontPanelButtonName] = true
    }
  }

  const knobs = createDemoPanelKnobState()
  knobs.chorusMix = CHORUS_PEDAL_DEMO.mix
  knobs.chorusLevel = CHORUS_PEDAL_DEMO.level
  knobs.chorusMixRange = { ...CHORUS_PEDAL_DEMO.mixRange }
  knobs.chorusLevelRange = { ...CHORUS_PEDAL_DEMO.levelRange }
  knobs.chorusValues = {
    ...knobs.chorusValues,
    mix: CHORUS_PEDAL_DEMO.mix,
    level: CHORUS_PEDAL_DEMO.level,
    rate1: 2,
    pw1: 50,
    dpth1: 40,
    rate2: 3,
    pw2: 50,
    dpth2: 35,
    res1: 0,
    res2: 0
  }
  knobs.chorusRanges = {
    ...knobs.chorusRanges,
    mix: { ...CHORUS_PEDAL_DEMO.mixRange },
    level: { ...CHORUS_PEDAL_DEMO.levelRange }
  }

  return {
    ...createEmptyPanelState(),
    connected: true,
    leds,
    knobs,
    program: createDemoProgramState(),
    lastUpdated: Date.now()
  }
}
