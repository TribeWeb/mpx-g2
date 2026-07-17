---
name: Orbits
modelName: Orbits
color: "#0ea5e9"
summary: "Orbits processes the left and right inputs independently with a pair of modulated delay/auto panners."
dspSteps: 57
manualSection: 7-25
availableIn:
  chorus: 8
softRow:
  - rate1
  - dpth1
  - width
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Amount of effect in the processed signal"
  - id: rate1
    index: 2
    label: Rate1
    min: 0
    max: 5000
    default: 0
    bytes: 2
    optionBytes: 1
    displayUnits: 23
    description: "Left Mod and Pan rate or period ratio"
  - id: pw1
    index: 3
    label: "PW 1"
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Left Mod and Pan pulse width"
  - id: sync1
    index: 4
    label: Sync1
    min: -120
    max: 120
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Phase difference between left LFO Mod and Pan"
  - id: dpth1
    index: 5
    label: Dpth1
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Left Mod and Pan depth"
  - id: rate2
    index: 6
    label: Rate2
    min: 0
    max: 5000
    default: 0
    bytes: 2
    optionBytes: 1
    displayUnits: 23
    description: "Right Mod and Pan rate or period ratio"
  - id: pw2
    index: 7
    label: "PW 2"
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Right Mod and Pan pulse width"
  - id: sync2
    index: 8
    label: Sync2
    min: -120
    max: 120
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Phase difference between right LFO Mod and Pan"
  - id: dpth2
    index: 9
    label: Dpth2
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Right Mod and Pan depth"
  - id: res
    index: 10
    label: Res
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 2
    description: Resonance
  - id: width
    index: 11
    label: Width
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Panning width"
---
Orbits processes the left and right inputs independently with a pair of modulated delay/auto panners. This effect can be used to create spatial effects via a combination of Doppler and level panning. Pulse Width controls allow independent adjustment of left and right LFOs from full left to full right skew. (At 0, the sinewave becomes a sawtooth with a fast rise and slow fall.) Depth controls provide adjustment of Mod depth.

![Orbits signal flow](/effects/orbits.png)
