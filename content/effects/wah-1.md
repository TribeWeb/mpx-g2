---
name: "Wah  1"
modelName: "Wah  1"
color: "#7c3aed"
summary: "Wah is a mono wah filter modeled after two classic wah-wah pedals."
dspSteps: 41
manualSection: 7-1
availableIn:
  fx1: 23
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
    description: "Wah center frequency"
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
Wah is a mono wah filter modeled after two classic wah-wah pedals. With Sweep selected, press Options to select Model C (CryBaby) or Model V (Vox). These models capture both the characteristic signature and nonlinear pedal response of the original pedals. Bass allows you to change the wah from a band-pass type to a low-pass type effect by progressively adding more low end. (Try it with bass and keyboards.) Resp controls how quickly the wah responds to changes of Sweep. (100 is very fast, 0 is very, very slow). To make a Mutron-like envelope filter, patch Sweep to Env. Use Resp to control the effect’s responsiveness to changing dynamics. To make an Auto Wah effect, try patching Sweep to an LFO sine or triangle wave.

![Wah  1 signal flow](/effects/wah-1.png)
