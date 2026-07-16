---
name: Flange24(M)
modelName: Flange24(M)
color: "#0ea5e9"
summary: "Flanger (S) ===== PAGE 115 ===== Rotary Cab This effect simulates a Leslie speaker with one pair of stereo mics on the rotating low-frequency drum, and another pair on the rotatin\u2026"
dspSteps: 76
manualSection: 7-23
availableIn:
  chorus: 4
softRow:
  - rate
  - depth
  - res
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    displayUnits: 0
    description: "Amount of effect in the processed signal"
  - id: rate
    index: 2
    label: Rate
    min: 0
    max: 5000
    default: 0
    displayUnits: 23
    description: "Drum rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Left Mod pulse width"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Drum depth (tremolo)"
  - id: res
    index: 5
    label: Res
    min: -100
    max: 100
    default: 0
    displayUnits: 2
    description: Resonance
  - id: glide
    index: 6
    label: Glide
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
  - id: blend
    index: 7
    label: Blend
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
---
Flanger (S) ===== PAGE 115 ===== Rotary Cab This effect simulates a Leslie speaker with one pair of stereo mics on the rotating low-frequency drum, and another pair on the rotating high-frequency horn. Bal sets the relative mix of Drum and Horn mics. Width controls the stereo spread of both pairs of mics. Rate and Depth 1 control the speed and depth of the rotating low-frequency drum. Rate 2 and Depth 2 control the speed and depth of the rotating high-frequency horn. The preset, Rotary Cab, is set up so that A/B switches the speed from fast to 1:24-24:1 cycles/beat (Rate1 Units) Selects frequency or cycles/beat of drum slow. Different A and B rates are used to simulate the inertia of the Horn rate or period ratio 1:24-24:1 cycles/beat (Rate2 Units) Selects frequency or cycles/beat of horn Aerosol Aerosol is a true stereo chorus/ flanger with dual rate, depth and resonance controls. It can produce very deep resonant flange sweeps, subtle multi-vibrato, stereo image enhancement and a wide variety of other chorus and flanger-like effects. Apair of single-tap modulated delays is each modulated by a separate LFO. Pulse Width allows independentadjustment of left and right LFOs from full left to full right skew. (At 0, the sinewavebecomes a sawtooth with a fast rise and slow fall.) Depth controls provide 1:24-24:1 cycles/beat (Rate 1 Units) Selects frequency or cycles/beat adjustment of modulated depth from 0-100%. 1:24-24:1 cycles/beat (Rate 2 Units) Selects frequency or cycles/beat

![Flange24(M) signal flow](/effects/flange24-m.png)

This effect uses **76 of 190** processing steps.
