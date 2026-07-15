import type { MpxG2PanelState } from '../types/midi'
import { createEmptyPanelKnobState, createEmptyPanelLedState, createEmptyPanelState } from '../midi/sysex'

/** Classic Ibanez Tube Screamer enclosure green. */
export const TUBE_SCREAMER_GREEN = '#009739'

/** Screamer-style ranges and values for UI mockups / simulated mode. */
export const GAIN_PEDAL_DEMO = {
  gainAlg: 3,
  enabled: true,
  knobs: {
    gainLow: -2,
    gainMid: 1,
    gainHigh: 3,
    gainLowRange: { min: -5, max: 5 },
    gainMidRange: { min: -5, max: 5 },
    gainHighRange: { min: 0, max: 5 }
  },
  advanced: {
    drive: 22,
    tone: 14,
    inLvl: -8,
    level: 36
  }
} as const

export function createDemoPanelKnobState() {
  return {
    ...createEmptyPanelKnobState(),
    gainAlg: GAIN_PEDAL_DEMO.gainAlg,
    gainLow: GAIN_PEDAL_DEMO.knobs.gainLow,
    gainMid: GAIN_PEDAL_DEMO.knobs.gainMid,
    gainHigh: GAIN_PEDAL_DEMO.knobs.gainHigh,
    gainLowRange: { ...GAIN_PEDAL_DEMO.knobs.gainLowRange },
    gainMidRange: { ...GAIN_PEDAL_DEMO.knobs.gainMidRange },
    gainHighRange: { ...GAIN_PEDAL_DEMO.knobs.gainHighRange }
  }
}

/** Panel state seed for simulator / offline pedal previews. */
export function createDemoPanelState(): MpxG2PanelState {
  const leds = createEmptyPanelLedState()
  leds.buttons.gain = GAIN_PEDAL_DEMO.enabled

  return {
    ...createEmptyPanelState(),
    connected: true,
    leds,
    knobs: createDemoPanelKnobState(),
    lastUpdated: Date.now()
  }
}
