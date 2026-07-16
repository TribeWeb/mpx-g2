---
name: "2-Band (S)"
modelName: "2-Band (S)"
summary: "===== PAGE 132 ===== Band D and 2-Band D, Fc Splitter Lexicon MPX G2 specification 1-Band (D) and 2-Band (D) 1-Band (D) has two bands of double-precision parametric EQ, one on eac\u2026"
dspSteps: 109
manualSection: 7-40
availableIn:
  eq: 6
softRow:
  - mix
  - level
  - gain1
  - fc1
  - q1
  - mode1
  - gain2
  - fc2
  - q2
  - mode2
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    description: "Amount of effect in the processed signal"
  - id: gain1
    index: 2
    label: Gain1
    min: -72
    max: 24
    description: TODO
  - id: fc1
    index: 3
    label: "Fc 1"
    min: 20
    max: 20000
    description: TODO
  - id: q1
    index: 4
    label: "Q 1"
    min: 1
    max: 100
    description: TODO
  - id: mode1
    index: 5
    label: Mode1
    min: 0
    max: 2
    description: TODO
  - id: gain2
    index: 6
    label: Gain2
    min: -72
    max: 24
    description: TODO
  - id: fc2
    index: 7
    label: "Fc 2"
    min: 20
    max: 20000
    description: TODO
  - id: q2
    index: 8
    label: "Q 2"
    min: 1
    max: 100
    description: TODO
  - id: mode2
    index: 9
    label: Mode2
    min: 0
    max: 2
    description: TODO
---

===== PAGE 132 ===== Band D and 2-Band D, Fc Splitter Lexicon MPX G2 specification 1-Band (D) and 2-Band (D) 1-Band (D) has two bands of double-precision parametric EQ, one on each channel. 2-Band (D) has four bands of double-precision parametric EQ, two on each channel. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable. G-L, G-L1, G-L2 -72 to +24dB Boost/cut gain of left filter(s) Fc-L, Fc-L1, Fc-L2 20-20000Hz Center or corner frequency of left filter(s) Q-L, Q-L1, Q-L2 0.1-10.0 Q of left filter(s) M-L, M-L1, M-L2 LShlf, Band, HShlf Determines EQ type(s) G-R, G-R1, G-R2 -72 to +24dB Boost/cut gain of right filter(s) 1-Band (D) Fc-R, Fc-R1, Fc-R2 20-20000Hz Center or corner frequency of right filter(s) Q-R, Q-R1, Q-R2 0.1-10.0 Q of right filter(s) M-R, M-R1, M-R2 LShlf, Band, HShlf Determines EQ type(s)

![2-Band (S) signal flow](/effects/2-band-s.png)

This effect uses **109 of 190** processing steps.
