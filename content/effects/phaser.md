---
name: Phaser
modelName: Phaser
summary: "The Phaser effect is a simulated Mutron phaser."
dspSteps: 77
manualSection: 7-13
availableIn:
  fx1: 14
  fx2: 7
softRow:
  - mix
  - level
  - rate
  - pw
  - mix2
  - res
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
    description: "Phaser rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    description: "Phaser pulse width"
  - id: mix2
    index: 4
    label: Mix
    min: 0
    max: 100
    description: "Dry/Wet ratio"
  - id: res
    index: 5
    label: Res
    min: -100
    max: 100
    description: "Amount of feedback from output of filters to inputs"
---

The Phaser effect is a simulated Mutron phaser. 1:24-24:1 cycles/beat (Rate Units) Selects frequency or cycles/beat ===== PAGE 105 =====

![Phaser signal flow](/effects/phaser.png)

This effect uses **77 of 190** processing steps.
