---
name: "Pedal Wah 1"
modelName: "Pedal Wah 1"
color: "#7c3aed"
summary: "PedalWah1 is identical to Wah 1 except the Sweep parameter is hard-wired to the Foot Pedal input on the MPX G2 rear panel."
dspSteps: 41
manualSection: 7-2
availableIn:
  fx1: 25
  fx2: 18
softRow:
  - bass
  - resp
  - gain
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
  - id: bass
    index: 2
    label: Bass
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Adds low frequency boost to the wah"
  - id: resp
    index: 3
    label: Resp
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Responsiveness to changes in sweep"
  - id: gain
    index: 4
    label: Gain
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Wah cut/boost"
---
PedalWah1 is identical to Wah 1 except the Sweep parameter is hard-wired to the Foot Pedal input on the MPX G2 rear panel. If you are using the MPX R1 MIDI Remote Controller, this effect will be automatically connected to the control pedal — you don’t have to make any patches — just load the effect and start playing. Wah is modeled after two classic wah-wah pedals (CryBaby and Vox).

![Pedal Wah 1 signal flow](/effects/pedal-wah-1.png)
