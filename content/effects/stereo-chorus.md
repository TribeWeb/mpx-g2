---
name: Chorus
modelName: "Stereo chorus"
color: "#0ea5e9"
summary: "True stereo multi-voice chorus with dual 2-tap modulators and cross resonance."
dspSteps: 60
manualSection: 7-21
availableIn:
  chorus: 1
softRow:
  - rate1
  - dpth1
  - rate2
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
  - id: rate1
    index: 2
    label: Rate1
    min: 0
    max: 5000
    default: 0
    displayUnits: 23
    description: "Left and right A rate"
  - id: pw1
    index: 3
    label: "PW 1"
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Left and right A pulse width"
  - id: dpth1
    index: 4
    label: Dpth1
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Left and right A depth"
  - id: rate2
    index: 5
    label: Rate2
    min: 0
    max: 5000
    default: 0
    displayUnits: 23
    description: "Left and right B rate"
  - id: pw2
    index: 6
    label: "PW 2"
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Left and right B pulse width"
  - id: dpth2
    index: 7
    label: Dpth2
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Left and right B depth"
  - id: res1
    index: 8
    label: "Res 1"
    min: -100
    max: 100
    default: 0
    displayUnits: 3
    description: "Left to right resonance"
  - id: res2
    index: 9
    label: "Res 2"
    min: -100
    max: 100
    default: 0
    displayUnits: 3
    description: "Right to left resonance"
---
This is a true stereo, multi-voice chorus. Use it to enrich guitars, keyboards, etc. It has Dual 2-tap modulators with cross resonance. The Pulse Width controls allow independent adjustment of the waveshape. (At 0, the sinewave becomes a sawtooth with a fast rise and slow fall.) The Depth controls provide adjustment of the chorus from 0-100%.

![Chorus signal flow](/effects/stereo-chorus.png)

Rate parameters can be set in Hz (0–50) or as cycles/beat (1:24–24:1) via the Rate Units options. Depth parameters are interpolated for smooth dynamic control.
