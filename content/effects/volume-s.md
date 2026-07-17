---
name: "Volume (S)"
modelName: "Volume (S)"
color: "#7c3aed"
summary: "The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range."
dspSteps: 13
manualSection: 7-29
availableIn:
  fx1: 28
  fx2: 21
  chorus: 14
  eq: 12
softRow:
  - vol
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
  - id: vol
    index: 2
    label: Vol
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Volume level"
---
The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range. You can use them for dynamic input or output control, EQ input trim, stereo to mono mixer, cross fade controls, volume pedal, etc. In Volume (S) the left and right inputs are sent through a ganged pair of volume controls.

![Volume (S) signal flow](/effects/volume-s.png)
