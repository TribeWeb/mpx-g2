---
name: "Tremolo (S)"
modelName: "Tremolo (S)"
color: "#7c3aed"
summary: "In Tremolo (S) the left input is modulated by a local sinewave generator before going to the left output."
dspSteps: 17
availableIn:
  fx1: 11
  fx2: 4
softRow:
  - rate
  - depth
  - phase
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
    description: "Tremolo rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Tremolo pulse width"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Tremolo depth"
  - id: phase
    index: 5
    label: Phase
    min: 0
    max: 3
    default: 0
    bytes: 1
    displayUnits: 71
    description: "In Tremolo (S), controls the phase difference between the"
---
In Tremolo (S) the left input is modulated by a local sinewave generator before going to the left output. The right input is modulated by sin, cos, -sin, or -cos, depending on the Phase parameter. These are the smallest mono and stereo effects with interpolated output level controls. You can use them (with the tremolo turned off) to add smooth output level control to a stereo effect that doesn’t have output level interpolation. NOTE: Mix is interpolated in Tremolo (S) only.

![Tremolo (S) signal flow](/effects/tremolo-s.png)
