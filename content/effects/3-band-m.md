---
name: "3-Band (M)"
modelName: "3-Band (M)"
color: "#14b8a6"
summary: "Gain (1-4) -72 to +24dB Boost/cut gain of filter(s) Fc (1-4) 20-20000Hz Center or corner frequency of filter(s) Q (1-4) 0.1-10.0 Q of filter(s) Mode (1-4) LShlf, Band, HShlf Deter\u2026"
dspSteps: 110
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
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    displayUnits: 0
    description: "Amount of effect in the processed signal"
  - id: gain1
    index: 2
    label: Gain1
    min: -72
    max: 24
    default: 0
    displayUnits: 3
    description: TODO
  - id: fc1
    index: 3
    label: "Fc 1"
    min: 20
    max: 20000
    default: 10010
    displayUnits: 9
    description: TODO
  - id: q1
    index: 4
    label: "Q 1"
    min: 1
    max: 100
    default: 51
    displayUnits: 10
    description: TODO
  - id: mode1
    index: 5
    label: Mode1
    min: 0
    max: 2
    default: 0
    displayUnits: 47
    description: TODO
  - id: gain2
    index: 6
    label: Gain2
    min: -72
    max: 24
    default: 0
    displayUnits: 3
    description: TODO
  - id: fc2
    index: 7
    label: "Fc 2"
    min: 20
    max: 20000
    default: 10010
    displayUnits: 9
    description: TODO
  - id: q2
    index: 8
    label: "Q 2"
    min: 1
    max: 100
    default: 51
    displayUnits: 10
    description: TODO
  - id: mode2
    index: 9
    label: Mode2
    min: 0
    max: 2
    default: 0
    displayUnits: 47
    description: TODO
  - id: gain3
    index: 10
    label: Gain3
    min: -72
    max: 24
    default: 0
    displayUnits: 3
    description: TODO
  - id: fc3
    index: 11
    label: "Fc 3"
    min: 20
    max: 20000
    default: 10010
    displayUnits: 9
    description: TODO
  - id: q3
    index: 12
    label: "Q 3"
    min: 1
    max: 100
    default: 51
    displayUnits: 10
    description: TODO
  - id: mode3
    index: 13
    label: Mode3
    min: 0
    max: 2
    default: 0
    displayUnits: 47
    description: TODO
---
Gain (1-4) -72 to +24dB Boost/cut gain of filter(s) Fc (1-4) 20-20000Hz Center or corner frequency of filter(s) Q (1-4) 0.1-10.0 Q of filter(s) Mode (1-4) LShlf, Band, HShlf Determines EQ type(s) 4-Band (M) 1-Band (S), and 2-Band (S) 1-Band (S) has two bands of double-precision parametric EQ, one on each channel. 2-Band (S) has four bands of double-precision parametric EQ, two on each channel. The two channels share the filter controls. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable. Gain (1-2) -72 to +24dB Boost/cut gain of filter(s) Fc (1-2) 20-20000Hz Center or corner frequency of filter(s) Q (1-2) 0.1-10.0 Q of filter(s) Mode (1-2) LShlf, Band, HShlf Determines EQ type(s)

![3-Band (M) signal flow](/effects/3-band-m.png)

This effect uses **110 of 190** processing steps.
