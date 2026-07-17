---
name: Flange24(M)
modelName: Flange24(M)
color: "#0ea5e9"
summary: "Flanger24 (M) is a higher precision (32-bit) flanger with identical parameters to Flanger (M)."
dspSteps: 47
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
  - id: rate
    index: 2
    label: Rate
    min: 0
    max: 5000
    default: 0
    bytes: 2
    optionBytes: 1
    displayUnits: 23
    description: "Flange rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Flange pulse width"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Flange depth"
  - id: res
    index: 5
    label: Res
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 2
    description: Resonance
  - id: glide
    index: 6
    label: Glide
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Flange glide amount"
  - id: blend
    index: 7
    label: Blend
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Amount of fixed tape mixed with moving tape"
---
Flanger24 (M) is a higher precision (32-bit) flanger with identical parameters to Flanger (M). Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to slow down first one machine, then the other. In the MPX G2, the Flanger effects are two-tap delays. The first tap is fixed, and the second sweeps past it. Mixing the two taps together creates a flanging effect.

![Flange24(M) signal flow](/effects/flange24-m.png)
