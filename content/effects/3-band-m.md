---
name: "3-Band (M)"
modelName: "3-Band (M)"
color: "#14b8a6"
summary: "3-Band (M) provides three bands of double-precision parametric EQ."
dspSteps: 90
availableIn:
  eq: 3
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
---
3-Band (M) provides three bands of double-precision parametric EQ. Each band has adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).

![3-Band (M) signal flow](/effects/3-band-m.png)
