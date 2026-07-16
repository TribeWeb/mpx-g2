---
name: "Delay (S)"
modelName: "Delay (S)"
summary: "left delay in"
dspSteps: 0
availableIn:
  delay: 2
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
    min: 0
    max: 3440
    description: TODO
  - id: fbk
    index: 3
    label: Fbk
    min: -100
    max: 100
    description: TODO
  - id: clear
    index: 4
    label: Clear
    min: 0
    max: 1
    description: "When On, mutes and resets the delay"
---

left delay in

![Delay (S) signal flow](/effects/delay-s.png)
