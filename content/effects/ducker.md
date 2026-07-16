---
name: Ducker
modelName: Ducker
color: "#f59e0b"
summary: "Similar to Looper, with the wet output getting quieter as the input gets louder."
dspSteps: 28
manualSection: 7-34
availableIn:
  delay: 9
softRow:
  - time
  - fbk
  - sense
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
  - id: time
    index: 2
    label: Time
    min: 257
    max: 6168
    default: 3213
    displayUnits: 59
    description: "Delay time"
  - id: fbk
    index: 3
    label: Fbk
    min: -100
    max: 100
    default: 0
    displayUnits: 2
    description: "Feedback level"
  - id: sense
    index: 4
    label: Sense
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: "Amount of ducking"
  - id: rls
    index: 5
    label: Rls
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: "Envelope release time constant"
  - id: clear
    index: 6
    label: Clear
    min: 0
    max: 1
    default: 0
    displayUnits: 4
    description: "When On, mutes and resets the delay"
---
Similar to Looper, with the wet output getting quieter as the input gets louder. When Sense is at 0, no ducking will occur. At 100 the input will be ducked by even the lowest input levels. 1:24-24:1echo/beat 0-22,600 ft, 0-6880 M (Time Units) Selects ms, note, feet, meters, or Tap ms (Fbk insert) Effect1,Effect2,Chorus, The left output of the selected source is scaled by Fbk Delay,Reverb,EQ ===== PAGE 126 ===== Chamber, Hall, Reverb Effects Lexicon MPX G2 instruction Reverb Effects The MPX G2 Reverb effects provide a full suite of reverberation and ambience algorithms. All of the reverbs are true stereo in that differerent processing is applied to the left and right input signals. Dedicated processing resources are allocated to the reverb effects so that you can always load any reverb into any program, regardless of what other effects are loaded. The MPX G2'sGlobal Reverb function allows reverb tails to ring out through program changes. (See Global Effects in Chapter 5: System Controls.)

![Ducker signal flow](/effects/ducker.png)

This effect uses **28 of 190** processing steps.
