---
name: "Comb 2"
modelName: "Comb 2"
color: "#0ea5e9"
summary: "The Comb effects work by combining the original input signal with a micro-delayed version."
dspSteps: 35
manualSection: 7-2
availableIn:
  chorus: 12
softRow:
  - notch
  - rate
  - depth
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
    description: "Output level"
  - id: locut
    index: 2
    label: LoCut
    min: 100
    max: 10000
    default: 5050
    bytes: 2
    displayUnits: 9
    description: "Clean low frequency boost/cut"
  - id: mix2
    index: 3
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: notch
    index: 4
    label: Notch
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Increases the audibility of the notch"
  - id: rate
    index: 5
    label: Rate
    min: 0
    max: 5000
    default: 0
    bytes: 2
    optionBytes: 1
    displayUnits: 23
    description: "Mod rate or period ratio"
  - id: pw
    index: 6
    label: PW
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Mod pulse width"
  - id: depth
    index: 7
    label: Depth
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Mod depth"
  - id: res
    index: 8
    label: Res
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 2
    description: "Resonance"
  - id: phase
    index: 9
    label: Phase
    min: 0
    max: 3
    default: 0
    bytes: 1
    displayUnits: 71
    description: "Phase difference between the right and left Mod"
---
The Comb effects work by combining the original input signal with a micro-delayed version. The tiny delay difference between the two signals causes certain frequencies to be cancelled or reinforced when the two are combined. The result is a highly colored version of the original source. Comb 2 is a dual mono comb with a second tap, controlled by a single LFO with adjustable phase. The phase relation between the two waves can be adjusted between 0-270°. Low and High pass filters are included so you can limit the frequency band in which the combing occurs.

![Comb 2 signal flow](/effects/comb-2.png)
