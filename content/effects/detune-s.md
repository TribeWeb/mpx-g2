---
name: "Detune (S)"
modelName: "Detune (S)"
color: "#7c3aed"
summary: "Detune effects are useful for thickening up sounds by adding delayed/pitch-shifted versions of the original source."
dspSteps: 34
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
  - id: tune
    index: 2
    label: Tune
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Pitch shift"
  - id: pdly
    index: 3
    label: "P Dly"
    min: 0
    max: 25
    default: 0
    bytes: 1
    displayUnits: 72
    description: "Amount of delay in the tuner"
---
Detune effects are useful for thickening up sounds by adding delayed/pitch-shifted versions of the original source. They can be particularly effective when used to simulate double-tracking, and are great alternatives to chorus effects without the audible sweep caused by chorus rate. Detune (S) creates a pair of signals, pitch-shifted up and down from the inputs. The left and right channels are separate. As the detune effects use relatively few processing resources, they can be combined with reverb and many other effects.

![Detune (S) signal flow](/effects/detune-s.png)
