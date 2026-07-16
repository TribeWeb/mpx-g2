---
name: Centrifuge1
modelName: Centrifuge1
summary: "The Centrifuge effects have a pair of modulated left and right delays routed into a single auto panner."
dspSteps: 43
manualSection: 7-25
availableIn:
  chorus: 9
softRow:
  - mix
  - level
  - rate1
  - pw1
  - sync1
  - dpth1
  - rate2
  - pw2
  - sync2
  - dpth2
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
  - id: rate1
    index: 2
    label: Rate1
    min: 0
    max: 5000
    description: "Left Mod and Pan rate or period ratio"
  - id: pw1
    index: 3
    label: "PW 1"
    min: 0
    max: 100
    description: "Left Mod and Pan pulse width"
  - id: sync1
    index: 4
    label: Sync1
    min: -120
    max: 120
    description: "Phase difference between left LFO Mod and Pan"
  - id: dpth1
    index: 5
    label: Dpth1
    min: 0
    max: 100
    description: "Left Mod and Pan depth"
  - id: rate2
    index: 6
    label: Rate2
    min: 0
    max: 5000
    description: "Right Mod and Pan rate or period ratio"
  - id: pw2
    index: 7
    label: "PW 2"
    min: 0
    max: 100
    description: "Right Mod and Pan pulse width"
  - id: sync2
    index: 8
    label: Sync2
    min: -120
    max: 120
    description: TODO
  - id: dpth2
    index: 9
    label: Dpth2
    min: 0
    max: 100
    description: "Right Mod and Pan depth"
  - id: res
    index: 10
    label: Res
    min: -100
    max: 100
    description: Resonance
---

The Centrifuge effects have a pair of modulated left and right delays routed into a single auto panner. Mod and pan rate and depth (Rate1, Depth1) are modulated by an additional set of rate and depth controls (Rate2, Depth2). These can create unique chorus and flanger effects with complex, undulating modulation rhythms.

![Centrifuge1 signal flow](/effects/centrifuge1.png)

This effect uses **43 of 190** processing steps.
