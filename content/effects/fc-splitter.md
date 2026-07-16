---
name: "Fc Splitter"
modelName: "Fc Splitter"
summary: "The Fc Splitter effect splits a mono input into a low-passed output on the left channel and a highpassed output on the right, with independent control of the corner frequencies of\u2026"
dspSteps: 55
manualSection: 7-41
availableIn:
  eq: 9
softRow:
  - mix
  - level
  - locut
  - hicut
  - bal
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
  - id: locut
    index: 2
    label: LoCut
    min: 100
    max: 10000
    description: "Corner frequency for the low cut (highpass)band"
  - id: hicut
    index: 3
    label: HiCut
    min: 100
    max: 10000
    description: "Corner frequency for the high cut (lowpass) band"
  - id: bal
    index: 4
    label: Bal
    min: -50
    max: 50
    description: "Relative level of the low and high band"
---

The Fc Splitter effect splits a mono input into a low-passed output on the left channel and a highpassed output on the right, with independent control of the corner frequencies of both filters. If the corner frequencies are the same, and the balance is set to 0, the frequency response will be flat when the two outputs are summed. Bal controls the relative level of left and right outputs. When Bal=0, the left and right outputs are not attenuated. Negative values attenuate the right output (highs). Positive values attenuate the left (lows). ===== PAGE 133 ===== Crossover, Volume M, Volume S and Volume D Lexicon MPX G2 specs

![Fc Splitter signal flow](/effects/fc-splitter.png)

This effect uses **55 of 190** processing steps.
