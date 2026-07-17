---
name: "Volume (M)"
modelName: "Volume (M)"
color: "#7c3aed"
summary: "The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range."
dspSteps: 17
manualSection: 7-2
availableIn:
  fx1: 27
  fx2: 20
  chorus: 13
  eq: 11
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
The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range. You can use them for dynamic input or output control, EQ input trim (helpful when adding large amounts of gain with an EQ effect), stereo to mono mixer, cross fade controls, volume pedal, etc. In Volume (M) the left and right inputs are mixed together, then sent to both outputs through a volume control.

![Volume (M) signal flow](/effects/volume-m.png)
