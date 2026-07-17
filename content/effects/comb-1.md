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
  - id: locut
    index: 2
    label: LoCut
    min: 100
    max: 10000
    default: 5050
    bytes: 2
    displayUnits: 9
    description: "Corner frequency of the low cut filter"
  - id: hicut
    index: 3
    label: HiCut
    min: 100
    max: 10000
    default: 5050
    bytes: 2
    displayUnits: 9
    description: "Corner frequency of the high cut filter"
  - id: comb
    index: 4
    label: Comb
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 1
    description: "and High pass filters are included"
  - id: notch
    index: 5
    label: Notch
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Increases the audibility of the notch"
---
The Comb effects work by combining the original input signal with a micro-delayed version. The tiny delay difference between the two signals causes certain frequencies to be cancelled or reinforced when the two are combined. The result is a highly colored version of the original source. The coloration can be “tuned” with the Comb (Comb 1) or Depth (Comb 2). Low and High pass filters are included so you can limit the frequency band in which the combing occurs. Comb 1 is a mono comb with single-pole low and high cut filters. There are two ways to get the comb effect. The first is to set mix to 100% (wet), then set Notch to 50 or -50. This essentially creates a band-limited signal (limited by LoCut and HiCut) which is then run through a comb. You can also set mix=50%, Lvl=0dB, and Notch=+100. In this case, the band-limiter is part of the comb. In this version, the effect produces shallower notch depths outside the band limit region.

![Comb 1 signal flow](/effects/comb-1.png)
