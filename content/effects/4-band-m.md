---
name: "4-Band (M)"
modelName: "4-Band (M)"
color: "#14b8a6"
summary: "4-Band (M) provides four bands of double-precision parametric EQ."
dspSteps: 110
manualSection: 7-2
availableIn:
  eq: 4
softRow:
  - gain1
  - gain2
  - gain3
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
  - id: gain1
    index: 2
    label: Gain1
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of filter(s)"
  - id: fc1
    index: 3
    label: "Fc 1"
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of filter(s)"
  - id: q1
    index: 4
    label: "Q 1"
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of filter(s)"
  - id: mode1
    index: 5
    label: Mode1
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
  - id: gain2
    index: 6
    label: Gain2
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of filter(s)"
  - id: fc2
    index: 7
    label: "Fc 2"
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of filter(s)"
  - id: q2
    index: 8
    label: "Q 2"
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of filter(s)"
  - id: mode2
    index: 9
    label: Mode2
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
  - id: gain3
    index: 10
    label: Gain3
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of filter(s)"
  - id: fc3
    index: 11
    label: "Fc 3"
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of filter(s)"
  - id: q3
    index: 12
    label: "Q 3"
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of filter(s)"
  - id: mode3
    index: 13
    label: Mode3
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
  - id: gain4
    index: 14
    label: Gain4
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of filter(s)"
  - id: fc4
    index: 15
    label: "Fc 4"
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of filter(s)"
  - id: q4
    index: 16
    label: "Q 4"
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of filter(s)"
  - id: mode4
    index: 17
    label: Mode4
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
---
4-Band (M) provides four bands of double-precision parametric EQ. Each band has adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).

![4-Band (M) signal flow](/effects/4-band-m.png)
