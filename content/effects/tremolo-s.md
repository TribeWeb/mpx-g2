---
name: "Tremolo (S)"
modelName: "Tremolo (S)"
color: "#7c3aed"
summary: "inputs are mixed together, then a local sinewave generator modulates the volume."
dspSteps: 13
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
    description: "Tremolo rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Tremolo pulse width"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Tremolo depth"
  - id: phase
    index: 5
    label: Phase
    min: 0
    max: 3
    default: 0
    displayUnits: 71
    description: "In Tremolo (S), controls the phase difference between the"
---
inputs are mixed together, then a local sinewave generator modulates the volume. In Tremolo (S) the left input is modulatedby a local sinewave generator before going to the left output. The right input is modulated by sin, cos, -sin, or -cos, depending on the Phase parameter. These are the smallest mono and stereo effects with interpolated output level controls. You can use them (with the tremolo turned off) 1:24-24:1 cycles/beat to add smooth output level control (Rate Units) Selects frequency or cycles/beat to a stereo effect that doesn’t have output level interpolation. right and left tremolo Tremolo (M) NOTE: Mix is interpolated in Tremolo (S) only.

![Tremolo (S) signal flow](/effects/tremolo-s.png)

This effect uses **13 of 190** processing steps.
