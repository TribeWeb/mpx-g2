---
name: ExtPedalVol
modelName: ExtPedalVol
color: "#7c3aed"
summary: "ExtPedalVol is hardwired to the External Pedal input of the MPX R1, allowing you to easily create programs with both a Volume and Wah pedal available…"
dspSteps: 13
manualSection: 7-2
availableIn:
  fx1: 31
  fx2: 24
  chorus: 17
  eq: 15
softRow: []
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
---
ExtPedalVol is hardwired to the External Pedal input of the MPX R1, allowing you to easily create programs with both a Volume and Wah pedal available simultaneously. It is otherwise the same as Volume (S).

![ExtPedalVol signal flow](/effects/extpedalvol.png)
