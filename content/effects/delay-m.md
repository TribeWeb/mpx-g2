---
name: "Delay (M)"
modelName: "Delay (M)"
summary: "Delay (S) lay with feedback."
dspSteps: 23
availableIn:
  delay: 1
softRow:
  - mix
  - level
  - time
  - fbk
  - clear
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    description: TODO
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    description: TODO
  - id: time
    index: 2
    label: Time
    min: 257
    max: 6168
    description: TODO
  - id: fbk
    index: 3
    label: Fbk
    min: -100
    max: 100
    description: "Right feedback level"
  - id: clear
    index: 4
    label: Clear
    min: 0
    max: 1
    description: "When On, mutes and resets the delay"
---

Delay (S) lay with feedback. Delay (S) is a simple stereo delay with feedback. Delay (D) is a dual delay with feedback, crossfeedback, independent output level adjusts, and panners.

![Delay (M) signal flow](/effects/delay-m.png)

This effect uses **23 of 190** processing steps.
