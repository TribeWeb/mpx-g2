---
name: "Wah  2"
modelName: "Wah  2"
color: "#7c3aed"
summary: "Wah 2 uses the same vintage wahs as Wah 1 with a built-in compressor following the wah."
dspSteps: 71
manualSection: 7-18
availableIn:
  fx1: 24
  fx2: 17
softRow:
  - sweep
  - bass
  - resp
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
  - id: sweep
    index: 2
    label: Sweep
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Wah center frequency (available only in Wah 1 & Wah 2)"
  - id: bass
    index: 3
    label: Bass
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Adds low frequency boost to the wah"
  - id: resp
    index: 4
    label: Resp
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Responsiveness to changes in sweep"
  - id: gain
    index: 5
    label: Gain
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Wah cut/boost"
---
Wah 2 uses the same vintage wahs as Wah 1 with a built-in compressor following the wah. (All of the compression parameters are fixed and, therefore, invisible.) The compressor smooths out some of the peakiness that can occur in different portions of the sweep, while at the same time adding some sustain and punch to the overall effect. The end result is a wah that cuts through when you kick it on.

![Wah  2 signal flow](/effects/wah-2.png)
