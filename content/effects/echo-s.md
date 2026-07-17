---
name: "Echo (S)"
modelName: "Echo (S)"
color: "#f59e0b"
summary: "The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1-pole low-pass filters."
dspSteps: 31
manualSection: 7-2
availableIn:
  delay: 5
softRow:
  - time
  - fbk
  - damp
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
  - id: damp
    index: 4
    label: Damp
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Cutoff frequency of low-pass filter in feedback path"
  - id: clear
    index: 5
    label: Clear
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "When On, mutes and resets the delay"
---
The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1-pole low-pass filters. Damp provides control over the cutoff frequency of the filter. (Increasing Damp lowers cutoff frequency.) Echo (S) is the stereo version.

![Echo (S) signal flow](/effects/echo-s.png)
