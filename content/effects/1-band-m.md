---
name: "1-Band (M)"
modelName: "1-Band (M)"
color: "#7c3aed"
summary: "The 1-Band (M) effect provides a single band of double-precision parametric EQ with adjustable center frequency, Q, boost/cut and filter type (low shelf,…"
dspSteps: 50
availableIn:
  fx1: 22
  fx2: 15
  eq: 1
softRow:
  - gain
  - fc
  - q
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
  - id: gain
    index: 2
    label: Gain
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of filter"
  - id: fc
    index: 3
    label: Fc
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of filter"
  - id: q
    index: 4
    label: Q
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of filter"
  - id: mode
    index: 5
    label: Mode
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type"
---
The 1-Band (M) effect provides a single band of double-precision parametric EQ with adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).

![1-Band (M) signal flow](/effects/1-band-m.png)
