---
name: "Shift (D)"
modelName: "Shift (D)"
color: "#7c3aed"
summary: range.
dspSteps: 67
availableIn:
  fx1: 6
softRow:
  - tune1
  - tune2
  - glide
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
  - id: tune1
    index: 2
    label: Tune1
    min: -4800
    max: 1900
    default: 0
    displayUnits: 1
    description: "Pitch shift"
  - id: tune2
    index: 3
    label: Tune2
    min: -4800
    max: 1900
    default: 0
    displayUnits: 1
    description: "Pitch shift"
  - id: glide
    index: 4
    label: Glide
    min: 0
    max: 1
    default: 0
    displayUnits: 4
    description: "Coarse, fine resolution of pitch shift"
---
range. Try controlling Tune with a foot pedal or MIDI controller for “whammy-bar” and pedal steel effects. Shift (M) is a single-channel pitch shifter. Shift (S) is a stereo version of Shift (M) with synchronized controlled by Tune1 and Tune 2. The first shifter goes to the left output, the second to the right output. (Optimize) 0-100 Adjusts the amount of delay in the pitch shifter These effects use more processing resources than the detuners. Shift (S) and Shift (D) are among the largest effects in the MPX G2.

![Shift (D) signal flow](/effects/shift-d.png)

This effect uses **67 of 190** processing steps.
