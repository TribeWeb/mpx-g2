---
name: "Detune (S)"
modelName: "Detune (S)"
color: "#7c3aed"
summary: "thickening up sounds by adding delayed/pitch shifted versions of the original source."
dspSteps: 0
availableIn:
  fx1: 2
softRow:
  - tune
  - pdly
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
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
  - id: pdly
    index: 3
    label: "P Dly"
    min: 0
    max: 25
    default: 0
    displayUnits: 72
    description: TODO
---
thickening up sounds by adding delayed/pitch shifted versions of the original source. They can be particularly effective when used to simulate double-tracking. They are also great alternatives to chorus effects as a detuner can add the richness of a chorus effect without the audible sweep caused

![Detune (S) signal flow](/effects/detune-s.png)
