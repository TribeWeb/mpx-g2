---
name: Ducker
modelName: Ducker
color: "#f59e0b"
summary: "Similar to Looper, with the wet output getting quieter as the input gets louder."
dspSteps: 28
manualSection: 7-34
availableIn:
  delay: 9
softRow:
  - time
  - fbk
  - sense
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
  - id: time
    index: 2
    label: Time
    min: 257
    max: 6168
    default: 3213
    bytes: 2
    displayUnits: 59
    description: "Delay time"
  - id: fbk
    index: 3
    label: Fbk
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 2
    description: "Feedback level"
  - id: sense
    index: 4
    label: Sense
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Amount of ducking"
  - id: rls
    index: 5
    label: Rls
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Envelope release time constant"
  - id: clear
    index: 6
    label: Clear
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "When On, mutes and resets the delay"
---
Similar to Looper, with the wet output getting quieter as the input gets louder. When Sense is at 0, no ducking will occur. At 100 the input will be ducked by even the lowest input levels.

![Ducker signal flow](/effects/ducker.png)
