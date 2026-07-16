---
name: "Auto Pan"
modelName: "Auto Pan"
summary: "Auto Pan is a version of Panner with the pans controlled by a local LFO."
dspSteps: 25
manualSection: 7-11
availableIn:
  fx1: 9
  fx2: 2
softRow:
  - mix
  - level
  - rate
  - pw
  - depth
  - phase
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
  - id: rate
    index: 2
    label: Rate
    min: 0
    max: 5000
    description: "Pan rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    description: "Pan pulse width"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    description: "Pan depth"
  - id: phase
    index: 5
    label: Phase
    min: 0
    max: 3
    description: "Phase difference between right and left pan"
---

Auto Pan effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.

![Auto Pan signal flow](/effects/auto-pan.png)

This effect uses **25 of 190** processing steps.
