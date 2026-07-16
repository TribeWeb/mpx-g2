---
name: Orbits
modelName: Orbits
summary: "1:24-24:1 cycles/beat (Rate 1 Units) Selects frequency or cycles/beat 1:24-24:1 cycles/beat (Rate 2 Units) Selects frequency or cycles/beat Orbits processes the left and right inp\u2026"
dspSteps: 57
manualSection: 7-25
availableIn:
  chorus: 8
softRow:
  - mix
  - level
  - rate1
  - pw1
  - sync1
  - dpth1
  - rate2
  - pw2
  - sync2
  - dpth2
  - res
  - width
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
  - id: rate1
    index: 2
    label: Rate1
    min: 0
    max: 5000
    description: "Left Mod and Pan rate or period ratio"
  - id: pw1
    index: 3
    label: "PW 1"
    min: 0
    max: 100
    description: "Left Mod and Pan pulse width"
  - id: sync1
    index: 4
    label: Sync1
    min: -120
    max: 120
    description: "Phase difference between left LFO Mod and Pan"
  - id: dpth1
    index: 5
    label: Dpth1
    min: 0
    max: 100
    description: "Left Mod and Pan depth"
  - id: rate2
    index: 6
    label: Rate2
    min: 0
    max: 5000
    description: "Right Mod and Pan rate or period ratio"
  - id: pw2
    index: 7
    label: "PW 2"
    min: 0
    max: 100
    description: "Right Mod and Pan pulse width"
  - id: sync2
    index: 8
    label: Sync2
    min: -120
    max: 120
    description: "Phase difference between right LFO Mod and Pan"
  - id: dpth2
    index: 9
    label: Dpth2
    min: 0
    max: 100
    description: "Right Mod and Pan depth"
  - id: res
    index: 10
    label: Res
    min: -100
    max: 100
    description: Resonance
  - id: width
    index: 11
    label: Width
    min: 0
    max: 100
    description: "Panning width"
---

1:24-24:1 cycles/beat (Rate 1 Units) Selects frequency or cycles/beat 1:24-24:1 cycles/beat (Rate 2 Units) Selects frequency or cycles/beat Orbits processes the left and right inputs independently with a pair of modulated delay/auto panners. This effect can be used to create spatial effects via a combination of Doppler and level panning. In the Orbits effect, Pulse Width controls allowindependent adjustment of left and right LFOs from full left to full right skew. (At 0, the sinewave becomes a sawtooth with a fast rise and slow fall.) Depth controls provide adjustment ofMod and Pan depth from 0-100%. Width allows adjustment of the panning depth from 0 (mono) to 100 (maximum stereo spread). ===== PAGE 117 ===== Centrifuge1 and Centrifuge2, Rhythms Lexicon MPX G2 specification Centrifuge1 and Centrifuge2 The Centrifuge effects have a

![Orbits signal flow](/effects/orbits.png)

This effect uses **57 of 190** processing steps.
