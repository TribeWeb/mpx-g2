---
name: Crunch
modelName: Crunch
color: "#009739"
summary: "Crunch is an overdrive effect with separate drive controls for low, mid and high frequencies."
dspSteps: 0
manualSection: 7-3
availableIn:
  gain: 2
softRow:
  - lo
  - mid
  - hi
params:
  - id: lo
    index: 0
    label: Lo
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Low frequency Drive"
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Mid frequency Drive"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 50
    default: 0
    bytes: 1
    displayUnits: 1
    description: "High frequency Drive"
  - id: inlvl
    index: 3
    label: InLvl
    min: -64
    max: 0
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Input level (Drive sensitivity)"
  - id: level
    index: 4
    label: Level
    min: 0
    max: 64
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Output level"
---
Crunch is an overdrive effect with separate drive controls for low, mid and high frequencies. Designed to be used like a stomp box (in front of your amp), Crunch works well in combination with other pre-gain effects like wah, phase shift, compression, and octave fuzz.

![Crunch signal flow](/effects/crunch.png)
