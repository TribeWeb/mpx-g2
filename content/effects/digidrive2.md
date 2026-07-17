---
name: DigiDrive2
modelName: DigiDrive2
color: "#7c3aed"
summary: "DigiDrive1 and DigiDrive2 combine digital distortion with 3-band tone controls."
dspSteps: 56
manualSection: 7-15
availableIn:
  fx1: 19
  fx2: 12
softRow:
  - drive
  - low
  - mid
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
  - id: drive
    index: 2
    label: Drive
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Amount of digital distortion"
  - id: low
    index: 3
    label: Low
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Drive low frequency cut/boost"
  - id: mid
    index: 4
    label: Mid
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Drive mid frequency cut/boost"
  - id: high
    index: 5
    label: High
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Drive high frequency cut/boost"
---
DigiDrive1 and DigiDrive2 combine digital distortion with 3-band tone controls. In DigiDrive2, the tone controls follow the distortion. The distortion produced by these effects is not meant to mimic analog distortion, but to provide an alternative sound. (Think “digital fuzz box.”) The next time you’re looking for an in-your-face fuzz effect, pump one of these into your amp. You might be surprised at what comes out.

![DigiDrive2 signal flow](/effects/digidrive2.png)
