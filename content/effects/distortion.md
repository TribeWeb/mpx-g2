---
name: Distortion
modelName: Distortion
color: "#009739"
summary: "Need more than just Overdrive?"
dspSteps: 0
manualSection: 7-7
availableIn:
  gain: 5
softRow:
  - drive
  - tone
  - bass
params:
  - id: lo
    index: 0
    label: Lo
    min: -25
    max: 18
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Low frequency Drive"
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 18
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Mid frequency Drive"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 18
    default: 0
    bytes: 1
    displayUnits: 1
    description: "High frequency Drive"
  - id: drive
    index: 3
    label: Drive
    min: 0
    max: 50
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Amount of distortion"
  - id: tone
    index: 4
    label: Tone
    min: 0
    max: 25
    default: 0
    bytes: 1
    displayUnits: 1
    description: "High frequency roll-off"
  - id: bass
    index: 5
    label: Bass
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Drive bass control"
  - id: trebl
    index: 6
    label: Trebl
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Drive treble control"
  - id: level
    index: 7
    label: Level
    min: 0
    max: 64
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Output level"
---
Need more than just Overdrive? Distortion provides more than 100dB of analog gain — and it has an additional set of Bass and Treble controls following the distortion stage. Although not based on any particular pedal, this effect has a sonic kinship with several classic distortion pedals and fuzz boxes.

![Distortion signal flow](/effects/distortion.png)
