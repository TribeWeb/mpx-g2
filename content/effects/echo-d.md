---
name: "Echo (D)"
modelName: "Echo (D)"
color: "#f59e0b"
summary: "The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1-pole low-pass filters."
dspSteps: 40
manualSection: 7-31
availableIn:
  delay: 6
softRow:
  - time1
  - time2
  - fbk1
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
  - id: time1
    index: 2
    label: Time1
    min: 0
    max: 3440
    default: 0
    bytes: 2
    displayUnits: 59
    description: "Delay time in mono version"
  - id: time2
    index: 3
    label: Time2
    min: 0
    max: 3440
    default: 0
    bytes: 2
    displayUnits: 59
    description: "Delay time in mono version"
  - id: lvl1
    index: 4
    label: "Lvl 1"
    min: -96
    max: 0
    default: 0
    bytes: 1
    displayUnits: 0
    description: "In Echo (D) controls left delay output level"
  - id: lvl2
    index: 5
    label: "Lvl 2"
    min: -96
    max: 0
    default: 0
    bytes: 1
    displayUnits: 0
    description: "In Echo (D) controls right delay output level"
  - id: fbk1
    index: 6
    label: "Fbk 1"
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 2
    description: "Left feedback level"
  - id: fbk2
    index: 7
    label: "Fbk 2"
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 2
    description: "Right feedback level"
  - id: damp1
    index: 8
    label: Damp1
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Cutoff frequency of low-pass filter in left feedback path"
  - id: damp2
    index: 9
    label: Damp2
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Cutoff frequency of low-pass filter in right feedback path"
  - id: clear
    index: 10
    label: Clear
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "When On, mutes and resets the delay"
---
The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1-pole low-pass filters. Damp provides control over the cutoff frequency of the filter. (Increasing Damp lowers cutoff frequency.) Echo (D) is the dual version with independent left/right paths.

![Echo (D) signal flow](/effects/echo-d.png)
