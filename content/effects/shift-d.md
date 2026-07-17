---
name: "Shift (D)"
modelName: "Shift (D)"
color: "#7c3aed"
summary: "The pitch shift effects are designed to provide both fine (1 cent resolution) and coarse (semitone resolution) pitch shift effects."
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
    min: -4800
    max: 1900
    default: 0
    bytes: 2
    optionBytes: 1
    displayUnits: 1
    description: "Pitch shift"
  - id: tune2
    index: 3
    label: Tune2
    min: -4800
    max: 1900
    default: 0
    bytes: 2
    optionBytes: 1
    displayUnits: 1
    description: "Pitch shift"
  - id: glide
    index: 4
    label: Glide
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "Coarse, fine resolution of pitch shift"
---
The pitch shift effects are designed to provide both fine (1 cent resolution) and coarse (semitone resolution) pitch shift effects. Use them to create harmonizations, detuning, or special effects. The Tune parameters can be glided smoothly across their entire range. Try controlling Tune with a foot pedal or MIDI controller for “whammy-bar” and pedal steel effects. Shift (D) provides mono input to two independent pitch shifters controlled by Tune1 and Tune 2. The first shifter goes to the left output, the second to the right output. These effects use more processing resources than the detuners. Shift (S) and Shift (D) are among the largest effects in the MPX G2.

![Shift (D) signal flow](/effects/shift-d.png)
