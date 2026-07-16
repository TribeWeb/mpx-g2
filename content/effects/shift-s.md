---
name: "Shift (S)"
modelName: "Shift (S)"
color: "#7c3aed"
summary: "The pitch shift effects are designed to provide both fine (1 cent resolution) and coarse (semitone resolution) pitch shift effects."
dspSteps: 0
availableIn:
  fx1: 5
softRow:
  - tune
  - glide
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    displayUnits: 0
    description: TODO
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    displayUnits: 0
    description: TODO
  - id: tune
    index: 2
    label: Tune
    min: -4800
    max: 1900
    default: 0
    displayUnits: 1
    description: TODO
  - id: glide
    index: 3
    label: Glide
    min: 0
    max: 1
    default: 0
    displayUnits: 4
    description: TODO
---
The pitch shift effects are designed to provide both fine (1 cent resolution) and coarse (semitone resolution) pitch shift effects. Use them to create harmonizations, detuning, or special effects. The Tune parameters can be glided smoothly across their entire

![Shift (S) signal flow](/effects/shift-s.png)
