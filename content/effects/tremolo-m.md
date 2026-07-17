---
name: "Tremolo (M)"
modelName: "Tremolo (M)"
color: "#7c3aed"
summary: "In Tremolo (M), the left and right inputs are mixed together, then a local sinewave generator modulates the volume."
dspSteps: 13
manualSection: 7-1
availableIn:
  fx1: 10
  fx2: 3
softRow:
  - rate
  - pw
  - depth
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
---
In Tremolo (M), the left and right inputs are mixed together, then a local sinewave generator modulates the volume. These are the smallest mono and stereo effects with interpolated output level controls. You can use them (with the tremolo turned off) to add smooth output level control to a stereo effect that doesn’t have output level interpolation.

![Tremolo (M) signal flow](/effects/tremolo-m.png)
