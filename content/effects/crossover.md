---
name: Crossover
modelName: Crossover
summary: "The Crossover effect is similar to Fc Splitter, but with only one crossover frequency, shared by low and high."
dspSteps: 29
availableIn:
  eq: 10
softRow:
  - mix
  - level
  - fc
  - bal
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
  - id: fc
    index: 2
    label: Fc
    min: 100
    max: 10000
    description: "Crossover frequency"
  - id: bal
    index: 3
    label: Bal
    min: -50
    max: 50
    description: "Relative level of the low and high band"
---

Crossover effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.

![Crossover signal flow](/effects/crossover.png)

This effect uses **29 of 190** processing steps.
