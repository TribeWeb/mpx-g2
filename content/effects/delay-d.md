---
name: "Delay (D)"
modelName: "Delay (D)"
color: "#f59e0b"
summary: "1:24-24:1echo/beat, (in stereo and dual versions, 0-10,000ms, 0-11300ft, 0-22600 ft, 0-6880 M 0-3440 M) (Time Units) Selects ms, note, feet, meters, or Tap ms (Fbk insert) Effect1\u2026"
dspSteps: 17
availableIn:
  delay: 3
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
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    displayUnits: 0
    description: "Amount of effect in the processed signal"
  - id: time1
    index: 2
    label: Time1
    min: 0
    max: 3440
    default: 0
    displayUnits: 59
    description: "Delay time"
  - id: time2
    index: 3
    label: Time2
    min: 0
    max: 3440
    default: 0
    displayUnits: 59
    description: "Delay time"
  - id: lvl1
    index: 4
    label: "Lvl 1"
    min: -96
    max: 0
    default: 0
    displayUnits: 0
    description: "In Delay (D), controls left delay output level"
  - id: lvl2
    index: 5
    label: "Lvl 2"
    min: -96
    max: 0
    default: 0
    displayUnits: 0
    description: "In Delay (D), controls right delay output level"
  - id: pan1
    index: 6
    label: "Pan 1"
    min: -50
    max: 50
    default: 0
    displayUnits: 4
    description: "In Delay (D), controls left delay output panner"
  - id: pan2
    index: 7
    label: "Pan 2"
    min: -50
    max: 50
    default: 0
    displayUnits: 4
    description: "In Delay (D), controls right delay output panner"
  - id: fbk1
    index: 8
    label: "Fbk 1"
    min: -100
    max: 100
    default: 0
    displayUnits: 2
    description: "Left feedback level"
  - id: fbk2
    index: 9
    label: "Fbk 2"
    min: -100
    max: 100
    default: 0
    displayUnits: 2
    description: TODO
  - id: xfbk1
    index: 10
    label: XFbk1
    min: -100
    max: 100
    default: 0
    displayUnits: 2
    description: TODO
  - id: xfbk2
    index: 11
    label: XFbk2
    min: -100
    max: 100
    default: 0
    displayUnits: 2
    description: TODO
  - id: clear
    index: 12
    label: Clear
    min: 0
    max: 1
    default: 0
    displayUnits: 4
    description: TODO
---
Delay (D) effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.

![Delay (D) signal flow](/effects/delay-d.png)

This effect uses **17 of 190** processing steps.
