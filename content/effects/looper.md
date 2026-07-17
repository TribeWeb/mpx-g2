---
name: Looper
modelName: Looper
color: "#f59e0b"
summary: "In the Looper effect InMix controls the ratio of input to feedback into the delay."
dspSteps: 29
manualSection: 7-32
availableIn:
  delay: 7
softRow:
  - time
  - sense
  - pan
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
  - id: time
    index: 2
    label: Time
    min: 257
    max: 6168
    default: 3213
    bytes: 2
    displayUnits: 59
    description: "Delay time"
  - id: inmix
    index: 3
    label: InMix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Ratio of input to feedback going into the delay"
  - id: sense
    index: 4
    label: Sense
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Sensitivity of InMix to input amplitude"
  - id: pan
    index: 5
    label: Pan
    min: -50
    max: 50
    default: 0
    bytes: 1
    displayUnits: 4
    description: "Output panner"
  - id: rls
    index: 6
    label: Rls
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Envelope release time constant"
  - id: atk
    index: 7
    label: Atk
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Envelope attack time constant"
  - id: clear
    index: 8
    label: Clear
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "When On, mutes and resets the delay"
---
In the Looper effect InMix controls the ratio of input to feedback into the delay. This parameter is ducked by the input level, so that louder signals route the input signal into the delay, and softer signals route the feedback signal into the delay. When Sense is at 0, no ducking will occur. At 100 the input will be ducked by even the lowest input levels.

![Looper signal flow](/effects/looper.png)
