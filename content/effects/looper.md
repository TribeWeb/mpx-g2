---
name: Looper
modelName: Looper
summary: "In the Looper effect InMix controls the ratio of input to feedback into the delay."
dspSteps: 29
manualSection: 7-32
availableIn:
  delay: 7
softRow:
  - mix
  - level
  - time
  - inmix
  - sense
  - pan
  - rls
  - atk
  - clear
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
  - id: time
    index: 2
    label: Time
    min: 257
    max: 6168
    description: "Delay time"
  - id: inmix
    index: 3
    label: InMix
    min: 0
    max: 100
    description: "Ratio of input to feedback going into the delay"
  - id: sense
    index: 4
    label: Sense
    min: 0
    max: 100
    description: "Sensitivity of InMix to input amplitude"
  - id: pan
    index: 5
    label: Pan
    min: -50
    max: 50
    description: "Output panner"
  - id: rls
    index: 6
    label: Rls
    min: 0
    max: 100
    description: "Envelope release time constant"
  - id: atk
    index: 7
    label: Atk
    min: 0
    max: 100
    description: "Envelope attack time constant"
  - id: clear
    index: 8
    label: Clear
    min: 0
    max: 1
    description: "When On, mutes and resets the delay"
---

In the Looper effect InMix controls the ratio of input to feedback into the delay. This parameter is ducked by the input level, so that louder signals route the input signal into the delay, and softer signals route the feedback signal into the delay. When Sense is at 0, no ducking will occur. At 100 the input will be ducked by even the lowest input levels. 1:24-24:1echo/beat 0-22600 ft, 0-6880 M (Time Units) Selects ms, note, feet, meters, or Tap ms (Fbk insert) Effect1, Effect2,Chorus, The left output of the selected source is scaled by Fbk Delay, Reverb,EQ ===== PAGE 124 ===== JamMan Lexicon MPX G2 guide

![Looper signal flow](/effects/looper.png)

This effect uses **29 of 190** processing steps.
