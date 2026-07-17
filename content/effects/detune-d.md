---
name: "Detune (D)"
modelName: "Detune (D)"
color: "#7c3aed"
summary: "Detune effects are useful for thickening up sounds by adding delayed/pitch-shifted versions of the original source."
dspSteps: 43
availableIn:
  fx1: 3
softRow:
  - tune1
  - tune2
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
  - id: tune1
    index: 2
    label: Tune1
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Pitch shift"
  - id: tune2
    index: 3
    label: Tune2
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Pitch shift"
  - id: pdly
    index: 4
    label: "P Dly"
    min: 0
    max: 70
    default: 0
    bytes: 1
    displayUnits: 72
    description: "Amount of delay before the onset of the effect"
---
Detune effects are useful for thickening up sounds by adding delayed/pitch-shifted versions of the original source. Detune (D) sums left and right inputs to mono, then creates two pairs of signals, pitch-shifted up and down from the inputs by Tune1 and Tune 2. The first pair goes out the left, the second pair out the right. As the detune effects use relatively few processing resources, they can be combined with reverb and many other effects. When creating effects that don’t require pitch shifting by large intervals (semitones) the detuners are the most efficient choice.

![Detune (D) signal flow](/effects/detune-d.png)
