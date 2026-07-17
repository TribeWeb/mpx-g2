---
name: "Flanger (M)"
modelName: "Flanger (M)"
color: "#0ea5e9"
summary: "Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange…"
dspSteps: 42
manualSection: 7-23
availableIn:
  chorus: 3
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
  - id: blend
    index: 6
    label: Blend
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Amount of fixed tape mixed with moving tape"
---
Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to slow down first one machine, then the other. The result was a series of changing phase cancellations and reinforcements, providing a comb filter and a characteristic swishing, tunneling and fading sound. In the MPX G2, the Flanger effects are two-tap delays. The first tap is fixed, and the second sweeps past it. Mixing the two taps together creates a flanging effect. In Flanger (M), the moving tap is swept with an internal LFO.

![Flanger (M) signal flow](/effects/flanger-m.png)
