---
name: "Custom Vybe"
modelName: "Custom Vybe"
color: "#7c3aed"
summary: "This custom version of Univybe has additional parameters with extended ranges."
dspSteps: 70
availableIn:
  fx1: 13
  fx2: 6
softRow:
  - rate
  - pw
  - depth
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
  - id: rate
    index: 2
    label: Rate
    min: 0
    max: 5000
    default: 0
    bytes: 2
    optionBytes: 1
    displayUnits: 23
    description: "Custom Vybe rate or period ratio"
  - id: pw
    index: 3
    label: PW
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Custom Vybe pulse width"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Custom Vybe depth"
---
This custom version of Univybe has additional parameters with extended ranges. The Rate can be set to any speed from 0-50Hz. It can also be set in cycles/beat, allowing you to tap in the sweep rate. When Depth is set to 100%, the effect is about twice as pronounced as the original. PW allows adjustment of the sweep waveshape between sine (50%), sawtooth (0%) and ramp (100%).

![Custom Vybe signal flow](/effects/custom-vybe.png)
