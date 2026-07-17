---
name: Panner
modelName: Panner
color: "#7c3aed"
summary: "The Panner effect has the left input panned to outputs with Pan 1, right input with Pan 2."
dspSteps: 25
availableIn:
  fx1: 8
  fx2: 1
softRow:
  - pan1
  - pan2
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
  - id: pan1
    index: 2
    label: "Pan 1"
    min: -50
    max: 50
    default: 0
    bytes: 1
    displayUnits: 4
    description: "Left input panner"
  - id: pan2
    index: 3
    label: "Pan 2"
    min: -50
    max: 50
    default: 0
    bytes: 1
    displayUnits: 4
    description: "Right input panner"
---
The Panner effect has the left input panned to outputs with Pan 1, right input with Pan 2. Because all the parameters of this effect are interpolated, this can be used to add interpolated outputs to effects which have non-interpolated output levels.

![Panner signal flow](/effects/panner.png)
