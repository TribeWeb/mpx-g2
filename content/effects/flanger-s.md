---
name: "Flanger (S)"
modelName: "Flanger (S)"
color: "#0ea5e9"
summary: "Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange…"
dspSteps: 29
availableIn:
  chorus: 5
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
  - id: mix2
    index: 3
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Flange depth"
  - id: phase
    index: 5
    label: Phase
    min: 0
    max: 3
    default: 0
    bytes: 1
    displayUnits: 71
    description: "In Flanger (S) sets the phase difference between the right"
  - id: res
    index: 6
    label: Res
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 2
    description: Resonance
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
Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to slow down first one machine, then the other. In the stereo version, Flanger (S), the delays are modulated by two sine waves from the same LFO. The phase relation between the two waves is set by the Phase parameter.

![Flanger (S) signal flow](/effects/flanger-s.png)
