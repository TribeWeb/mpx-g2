---
name: Aerosol
modelName: Aerosol
color: "#0ea5e9"
summary: "Aerosol is a true stereo chorus/ flanger with dual rate, depth and resonance controls."
dspSteps: 59
manualSection: 7-24
availableIn:
  chorus: 7
softRow:
  - rate1
  - dpth1
  - rate2
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
  - id: rate1
    index: 2
    label: Rate1
    min: 0
    max: 5000
    default: 0
    displayUnits: 23
    description: "Left Mod rate or period ratio."
  - id: pw1
    index: 3
    label: "PW 1"
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Left Mod pulse width"
  - id: dpth1
    index: 4
    label: Dpth1
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Left Mod depth (tremolo)"
  - id: rate2
    index: 5
    label: Rate2
    min: 0
    max: 5000
    default: 0
    displayUnits: 23
    description: "Right Mod rate or period ratio."
  - id: pw2
    index: 6
    label: "PW 2"
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Right Mod pulse width"
  - id: dpth2
    index: 7
    label: Dpth2
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Right Mod depth (tremolo)"
  - id: res1
    index: 8
    label: "Res 1"
    min: -100
    max: 100
    default: 0
    displayUnits: 3
    description: "Cross resonance"
  - id: res2
    index: 9
    label: "Res 2"
    min: -100
    max: 100
    default: 0
    displayUnits: 3
    description: Resonance
---
Aerosol is a true stereo chorus/flanger with dual rate, depth and resonance controls. It can produce very deep resonant flange sweeps, subtle multi-vibrato, stereo image enhancement and a wide variety of other chorus and flanger-like effects.

A pair of single-tap modulated delays is each modulated by a separate LFO. Pulse Width allows independentadjustment of left and right LOs from full left to full right skew. (At O, the sinewave becomes a sawtooth with a fast rise and slow fall.) Depth controls provide adjustment of modulated depth from 0-100%.

![Aerosol signal flow](/effects/aerosol.png)

This effect uses **59 of 190** processing steps.
