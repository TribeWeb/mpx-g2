---
name: "Pedal Vol"
modelName: "Pedal Vol"
color: "#7c3aed"
summary: "PedalVol is the same as Volume (S), except the Vol parameter is hardwired to the Foot Pedal input on the MPX G2."
dspSteps: 13
manualSection: 7-2
availableIn:
  fx1: 30
  fx2: 23
  chorus: 16
  eq: 14
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
    description: "Output level"
---
PedalVol is the same as Volume (S), except the Vol parameter is hardwired to the Foot Pedal input on the MPX G2. When using the MPX R1 MIDI Remote Controller, this parameter is automatically connected to the R1’s built-in pedal. This means that no patching is required to create a volume pedal effect.

![Pedal Vol signal flow](/effects/pedal-vol.png)
