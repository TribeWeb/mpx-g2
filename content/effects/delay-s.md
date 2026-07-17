---
name: "Delay (S)"
modelName: "Delay (S)"
color: "#f59e0b"
summary: "Delay (S) is a simple stereo delay with feedback."
dspSteps: 40
availableIn:
  delay: 2
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
    min: 0
    max: 3440
    default: 0
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
Delay (S) is a simple stereo delay with feedback. All MPX G2 Delay effects allow you to choose how delay times will be displayed (ms, feet, meters, echoes/beat, or Tap ms). Another shared feature is Fbk Insert, which allows you to route the outputs of another effect block into the delay’s feedback loop.

![Delay (S) signal flow](/effects/delay-s.png)
