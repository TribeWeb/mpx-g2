---
name: "Flanger (S)"
modelName: "Flanger (S)"
color: "#0ea5e9"
summary: "Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to\u2026"
dspSteps: 29
availableIn:
  chorus: 5
softRow:
  - rate
  - depth
  - res
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
  - id: rate
    index: 2
    label: Rate
    min: 0
    max: 5000
    default: 0
    displayUnits: 23
    description: "Flange rate or period ratio"
  - id: mix2
    index: 3
    label: Mix
    min: 0
    max: 100
    default: 0
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: depth
    index: 4
    label: Depth
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: "Flange depth"
  - id: phase
    index: 5
    label: Phase
    min: 0
    max: 3
    default: 0
    displayUnits: 71
    description: "In Flanger (S) sets the phase difference between the right"
  - id: res
    index: 6
    label: Res
    min: -100
    max: 100
    default: 0
    displayUnits: 2
    description: Resonance
  - id: blend
    index: 7
    label: Blend
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: "Amount of fixed tape mixed with moving tape"
---
Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to slow down first one machine, then the other. The result was a series of changing phase cancellations and reinforcements, providing a comb filter and a characteristic swishing, tunneling and fading sound. In the MPX G2, the Flanger effects are two-tap delays. The first tap is fixed,and the second sweeps 1:24-24:1 cycles/beat (Rate Units) Selects frequency or cycles/beat past it. Mixing the two taps together creates a flanging effect. In Flanger (M), the moving tap is swept with an internal LFO. In the stereo version, Flanger and left flangers (S), the delays are modulated by two sine waves from the same LFO. The phase relation between the two waves is set by the Phase parameters to Flanger (M).

![Flanger (S) signal flow](/effects/flanger-s.png)

This effect uses **29 of 190** processing steps.
