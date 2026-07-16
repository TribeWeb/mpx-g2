---
name: "Custom Vybe"
modelName: "Custom Vybe"
color: "#7c3aed"
summary: "This custom version of Univybe has additional parameters with extended ranges."
dspSteps: 70
availableIn:
  fx1: 13
  fx2: 6
softRow:
  - rate
  - pw
  - depth
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
    description: "Amount of effect in processsed signal"
  - id: rate
    index: 2
    label: Rate
    min: 0
    max: 5000
    default: 0
    displayUnits: 23
    description: "Custom Vybe rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Custom Vybe pulse width"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Custom Vybe depth"
---
Custom Vybe effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.

![Custom Vybe signal flow](/effects/custom-vybe.png)

This effect uses **70 of 190** processing steps.
