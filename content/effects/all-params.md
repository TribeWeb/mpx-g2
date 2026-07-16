---
name: "All Params"
modelName: "All Params"
color: "#009739"
summary: "Utility Gain algorithm that exposes the full set of preamp-style parameters for editing."
dspSteps: 0
manualSection: 7-6
availableIn:
  gain: 8
softRow:
  - drive
  - feel
  - gtone
params:
  - id: lo
    index: 0
    label: Lo
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: TODO
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: TODO
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 50
    default: 0
    displayUnits: 1
    description: TODO
  - id: locut
    index: 3
    label: LoCut
    min: 0
    max: 50
    default: 0
    displayUnits: 1
    description: TODO
  - id: feel
    index: 4
    label: Feel
    min: 0
    max: 64
    default: 0
    displayUnits: 1
    description: TODO
  - id: drive
    index: 5
    label: Drive
    min: 0
    max: 64
    default: 0
    displayUnits: 1
    description: TODO
  - id: hicut
    index: 6
    label: HiCut
    min: 0
    max: 35
    default: 0
    displayUnits: 1
    description: TODO
  - id: bass
    index: 7
    label: Bass
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: TODO
  - id: trebl
    index: 8
    label: Trebl
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: TODO
  - id: level
    index: 9
    label: Level
    min: 0
    max: 64
    default: 0
    displayUnits: 1
    description: TODO
  - id: cvol
    index: 10
    label: C-Vol
    min: -64
    max: 0
    default: 0
    displayUnits: 3
    description: TODO
  - id: gtone
    index: 11
    label: GTone
    min: 0
    max: 1
    default: 0
    displayUnits: 78
    description: TODO
  - id: ctone
    index: 12
    label: CTone
    min: 0
    max: 1
    default: 0
    displayUnits: 78
    description: TODO
  - id: gain
    index: 13
    label: Gain
    min: 0
    max: 1
    default: 0
    displayUnits: 79
    description: TODO
  - id: cbyp
    index: 14
    label: "C Byp"
    min: 0
    max: 1
    default: 0
    displayUnits: 80
    description: TODO
  - id: send
    index: 15
    label: Send
    min: 0
    max: 1
    default: 0
    displayUnits: 82
    description: TODO
  - id: itype
    index: 16
    label: IType
    min: 0
    max: 3
    default: 0
    displayUnits: 100
    description: TODO
---
All Params is a Gain-block utility layout that exposes the full editable parameter set used across the analog preamp-style algorithms. Prefer Tone, Crunch, Screamer, Overdrive, Distortion, Preamp, or SplitPreamp as musical starting points.

![All Params signal flow](/effects/all-params.png)

Gain/analog effects like this use dedicated processing and do not consume the shared DSP step budget (shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).
