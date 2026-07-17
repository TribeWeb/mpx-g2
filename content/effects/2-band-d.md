---
name: "2-Band (D)"
modelName: "2-Band (D)"
color: "#14b8a6"
summary: "2-Band (D) has four bands of double-precision parametric EQ, two on each channel."
dspSteps: 109
manualSection: 7-2
availableIn:
  eq: 8
softRow:
  - gl1
  - fcl1
  - gl2
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
    description: "Output level"
  - id: gl1
    index: 2
    label: G-L1
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of left filter(s)"
  - id: fcl1
    index: 3
    label: Fc-L1
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of left filter(s)"
  - id: ql1
    index: 4
    label: Q-L1
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of left filter(s)"
  - id: ml1
    index: 5
    label: M-L1
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
  - id: gl2
    index: 6
    label: G-L2
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of left filter(s)"
  - id: fcl2
    index: 7
    label: Fc-L2
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of left filter(s)"
  - id: ql2
    index: 8
    label: Q-L2
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of left filter(s)"
  - id: ml2
    index: 9
    label: M-L2
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
  - id: gr1
    index: 10
    label: G-R1
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of right filter(s)"
  - id: fcr1
    index: 11
    label: Fc-R1
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of right filter(s)"
  - id: qr1
    index: 12
    label: Q-R1
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of right filter(s)"
  - id: mr1
    index: 13
    label: M-R1
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
  - id: gr2
    index: 14
    label: G-R2
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of right filter(s)"
  - id: fcr2
    index: 15
    label: Fc-R2
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of right filter(s)"
  - id: qr2
    index: 16
    label: Q-R2
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of right filter(s)"
  - id: mr2
    index: 17
    label: M-R2
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
---
2-Band (D) has four bands of double-precision parametric EQ, two on each channel. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable independently per channel.

![2-Band (D) signal flow](/effects/2-band-d.png)
