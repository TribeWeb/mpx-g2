---
name: "Echo (D)"
modelName: "Echo (D)"
summary: "1:24-24:1echo/beat, 0-22600 ft, 0-6880 M (Time Units) Selects ms, note, feet, meters, or Tap ms 1:24-24:1echo/beat, 0-11,300 ft, 0-3440 M (Time1 Units) Selects ms, note, feet, met\u2026"
dspSteps: 31
manualSection: 7-31
availableIn:
  delay: 6
softRow:
  - mix
  - level
  - time1
  - time2
  - lvl1
  - lvl2
  - fbk1
  - fbk2
  - damp1
  - damp2
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
  - id: time1
    index: 2
    label: Time1
    min: 0
    max: 3440
    description: "Delay time in mono version"
  - id: time2
    index: 3
    label: Time2
    min: 0
    max: 3440
    description: "Delay time in mono version"
  - id: lvl1
    index: 4
    label: "Lvl 1"
    min: -96
    max: 0
    description: "In Echo (D) controls left delay output level"
  - id: lvl2
    index: 5
    label: "Lvl 2"
    min: -96
    max: 0
    description: "In Echo (D) controls right delay output level"
  - id: fbk1
    index: 6
    label: "Fbk 1"
    min: -100
    max: 100
    description: "Left feedback level"
  - id: fbk2
    index: 7
    label: "Fbk 2"
    min: -100
    max: 100
    description: "Right feedback level"
  - id: damp1
    index: 8
    label: Damp1
    min: 0
    max: 100
    description: "Cutoff frequency of low-pass filter in left feedback path"
  - id: damp2
    index: 9
    label: Damp2
    min: 0
    max: 100
    description: "Cutoff frequency of low-pass filter in right feedback path"
  - id: clear
    index: 10
    label: Clear
    min: 0
    max: 1
    description: "When On, mutes and resets the delay"
---

Echo (D) effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.

![Echo (D) signal flow](/effects/echo-d.png)

This effect uses **31 of 190** processing steps.
