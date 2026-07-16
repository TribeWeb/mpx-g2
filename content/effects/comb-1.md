---
name: "Comb 1"
modelName: "Comb 1"
color: "#0ea5e9"
summary: "The Comb effects work by combining the original input signal with a micro-delayed version."
dspSteps: 51
manualSection: 7-27
availableIn:
  chorus: 11
softRow:
  - comb
  - notch
  - locut
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
  - id: locut
    index: 2
    label: LoCut
    min: 100
    max: 10000
    default: 5050
    displayUnits: 9
    description: "Corner frequency of the low cut filter"
  - id: hicut
    index: 3
    label: HiCut
    min: 100
    max: 10000
    default: 5050
    displayUnits: 9
    description: "Corner frequency of the high cut filter"
  - id: comb
    index: 4
    label: Comb
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: "and High pass filters are included"
  - id: notch
    index: 5
    label: Notch
    min: -100
    max: 100
    default: 0
    displayUnits: 3
    description: "Increases the audibility of the notch"
---
The Comb effects work by combining the original input signal with a micro-delayed version. The tiny delay difference between the two signals causes certain frequencies to be cancelled or reinforced when the two are combined. The result is a highly colored version of the original source. The coloration can be “tuned” with the Comb so you can limit the frequency band in which the combing occurs. Comb 1 is a mono comb with single-pole low and high cut filters. There are two ways to get the comb effect. The first is to set mix to 100% (wet), then set Notch to 50 or -50. This essentially creates a band-limited signal (limited by LoCut and HiCut) which is then run through a comb. You can also set mix= 50%, Lvl = 0dB, and Notch= +100. In this case, the band-limiter is part of the comb. In this version, the effect produces shallower notch depths outside the bandRatio of filter and delay output levels: limit region. Notch Filter Output -100 -100% with a second tap, controlled by a -50 100% -100% single LFO with adjustable phase. 100% 100% 100% The phase relation between the 100% two waves can be adjusted between 0-270°. 1:24-24:1 cycles/beat (Rate Units) Selects frequency or cycles/beat (Comb 2 only) Comb1 (Comb 2 only) Comb2 ===== PAGE 119 ===== Volume M, Volume S and Volume D Lexicon MPX G2 guide Volume (M), Volume (S) and Volume (D) The Volume effects can be

![Comb 1 signal flow](/effects/comb-1.png)

This effect uses **51 of 190** processing steps.
