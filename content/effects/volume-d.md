---
name: "Volume (D)"
modelName: "Volume (D)"
color: "#7c3aed"
summary: "The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range."
dspSteps: 18
manualSection: 7-29
availableIn:
  fx1: 29
  fx2: 22
  chorus: 15
  eq: 13
softRow:
  - voll
  - volr
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
  - id: voll
    index: 2
    label: Vol-L
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Amount of effect in the processed signal"
  - id: volr
    index: 3
    label: Vol-R
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Amount of effect in the processed signal"
---
The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range. You can use them for dynamic input or output control, EQ input trim, stereo to mono mixer, cross fade controls, volume pedal, etc. In Volume (D) the left and right inputs are sent through independent volume controls.

![Volume (D) signal flow](/effects/volume-d.png)
