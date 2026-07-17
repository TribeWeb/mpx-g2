---
name: "1-Band (D)"
modelName: "1-Band (D)"
color: "#14b8a6"
summary: "1-Band (D) has two bands of double-precision parametric EQ, one on each channel."
dspSteps: 68
manualSection: 7-2
availableIn:
  eq: 7
softRow:
  - gl
  - fcl
  - ql
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
  - id: gl
    index: 2
    label: G-L
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of left filter(s)"
  - id: fcl
    index: 3
    label: Fc-L
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of left filter(s)"
  - id: ql
    index: 4
    label: Q-L
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of left filter(s)"
  - id: ml
    index: 5
    label: M-L
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
  - id: gr
    index: 6
    label: G-R
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Boost/cut gain of right filter(s)"
  - id: fcr
    index: 7
    label: Fc-R
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Center or corner frequency of right filter(s)"
  - id: qr
    index: 8
    label: Q-R
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 10
    description: "Q of right filter(s)"
  - id: mr
    index: 9
    label: M-R
    min: 0
    max: 2
    default: 0
    bytes: 1
    displayUnits: 47
    description: "Determines EQ type(s)"
---
1-Band (D) has two bands of double-precision parametric EQ, one on each channel. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable independently per channel.

![1-Band (D) signal flow](/effects/1-band-d.png)
