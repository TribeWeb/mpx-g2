---
name: Click
modelName: Click
color: "#7c3aed"
summary: "This effect is a simple metronome which is automatically connected to Tap."
dspSteps: 14
manualSection: 7-20
availableIn:
  fx1: 33
  fx2: 26
softRow: []
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Click ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Amount of Click in the processed signal"
---
This effect is a simple metronome which is automatically connected to Tap. Press Tap twice to set the tempo. This effect can be used as an input source for auditioning reverbs and delays. It is also a convenient timing reference for the JamMan effect, where the click is automatically muted until the loop is tapped.

![Click signal flow](/effects/click.png)
