---
name: DigiDrive1
modelName: DigiDrive1
color: "#7c3aed"
summary: "DigiDrive1 and DigiDrive2 combine digital distortion with 3-band tone controls."
dspSteps: 53
availableIn:
  fx1: 18
  fx2: 11
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
    description: "Pre-Drive low frequency cut/boost"
  - id: mid
    index: 4
    label: Mid
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Pre-Drive mid frequency cut/boost"
  - id: high
    index: 5
    label: High
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Pre-Drive high frequency cut/boost"
---
DigiDrive1 and DigiDrive2 combine digital distortion with 3-band tone controls. In DigiDrive1, the tone controls are in front of the distortion. The distortion produced by these effects is not meant to mimic analog distortion, but to provide an alternative sound. (Think “digital fuzz box.”) The next time you’re looking for an in-your-face fuzz effect, pump one of these into your amp. You might be surprised at what comes out.

![DigiDrive1 signal flow](/effects/digidrive1.png)
