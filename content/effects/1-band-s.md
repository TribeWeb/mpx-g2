---
name: "1-Band (S)"
modelName: "1-Band (S)"
color: "#14b8a6"
summary: "1-Band (S) has two bands of double-precision parametric EQ, one on each channel."
dspSteps: 68
manualSection: 7-2
availableIn:
  eq: 5
softRow:
  - gain
  - fc
  - mode
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
    description: "Boost/cut gain of filter(s)"
  - id: fc
    index: 3
    label: Fc
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of filter(s)"
  - id: mix2
    index: 4
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: mode
    index: 5
    label: Mode
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
---
1-Band (S) has two bands of double-precision parametric EQ, one on each channel. The two channels share the filter controls. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable.

![1-Band (S) signal flow](/effects/1-band-s.png)
