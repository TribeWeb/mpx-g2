---
name: "Fc Splitter"
modelName: "Fc Splitter"
color: "#14b8a6"
summary: "The Fc Splitter effect splits a mono input into a low-passed output on the left channel and a high-passed output on the right, with independent control of the…"
dspSteps: 55
manualSection: 7-41
availableIn:
  eq: 9
softRow:
  - locut
  - hicut
  - bal
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
    description: "Corner frequency for the low cut (highpass)band"
  - id: hicut
    index: 3
    label: HiCut
    min: 100
    max: 10000
    default: 5050
    bytes: 2
    displayUnits: 9
    description: "Corner frequency for the high cut (lowpass) band"
  - id: bal
    index: 4
    label: Bal
    min: -50
    max: 50
    default: 0
    bytes: 1
    displayUnits: 8
    description: "Relative level of the low and high band"
---
The Fc Splitter effect splits a mono input into a low-passed output on the left channel and a high-passed output on the right, with independent control of the corner frequencies of both filters. If the corner frequencies are the same, and the balance is set to 0, the frequency response will be flat when the two outputs are summed. Bal controls the relative level of left and right outputs.

![Fc Splitter signal flow](/effects/fc-splitter.png)
