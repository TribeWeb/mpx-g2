---
name: OrangePhase
modelName: OrangePhase
summary: "The sound and rate of this phase shifter are modeled on a vintage MXR Phase 90 stomp box \u2014 a signature component of the early Van Halen sound."
dspSteps: 77
availableIn:
  fx1: 15
  fx2: 8
softRow:
  - mix
  - level
  - rate
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
    description: "Amount of effect in processsed signal"
  - id: rate
    index: 2
    label: Rate
    min: 0
    max: 100
    description: "OrangePhase rate"
---

The sound and rate of this phase shifter are modeled on a vintage MXR Phase 90 stomp box — a signature component of the early Van Halen sound.

![OrangePhase signal flow](/effects/orangephase.png)

This effect uses **77 of 190** processing steps.
