---
name: "Echo (M)"
modelName: "Echo (M)"
summary: "The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1pole low-pass filters."
dspSteps: 21
availableIn:
  delay: 4
softRow:
  - mix
  - level
  - time
  - fbk
  - damp
  - clear
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    description: "Amount of effect in the processed signal"
  - id: time
    index: 2
    label: Time
    min: 257
    max: 6168
    description: "Delay time in mono version"
  - id: fbk
    index: 3
    label: Fbk
    min: -100
    max: 100
    description: "Left feedback level"
  - id: damp
    index: 4
    label: Damp
    min: 0
    max: 100
    description: "Cutoff frequency of low-pass filter in left feedback path"
  - id: clear
    index: 5
    label: Clear
    min: 0
    max: 1
    description: "When On, mutes and resets the delay"
---

The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1pole low-pass filters. Damp provides control over the cutoff frequency of the filter. (Increasing Damp lowers cutoff frequency.)

![Echo (M) signal flow](/effects/echo-m.png)

This effect uses **21 of 190** processing steps.
