---
name: "Delay (M)"
modelName: "Delay (M)"
color: "#f59e0b"
summary: "Delay (M) is a simple mono delay with feedback."
dspSteps: 23
availableIn:
  delay: 1
softRow:
  - time
  - fbk
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
    description: "Right feedback level"
  - id: clear
    index: 4
    label: Clear
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "When On, mutes and resets the delay"
---
Delay (M) is a simple mono delay with feedback. All MPX G2 Delay effects allow you to choose how delay times will be displayed (ms, feet, meters, echoes/beat, or Tap ms). Another shared feature is Fbk Insert, which allows you to route the outputs of another effect block into the delay’s feedback loop.

![Delay (M) signal flow](/effects/delay-m.png)
