---
name: "Volume (D)"
modelName: "Volume (D)"
summary: "effect), stereo to mono mixer, cross fade controls, volume pedal, etc."
dspSteps: 13
manualSection: 7-29
availableIn:
  fx1: 29
  fx2: 22
  chorus: 15
  eq: 13
softRow:
  - mix
  - level
  - voll
  - volr
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
  - id: voll
    index: 2
    label: Vol-L
    min: 0
    max: 100
    description: "Amount of effect in the processed signal"
  - id: volr
    index: 3
    label: Vol-R
    min: 0
    max: 100
    description: "Amount of effect in the processed signal"
---

effect), stereo to mono mixer, cross fade controls, volume pedal, etc. In Volume(M) the left and right inputs are mixed together, then sent to both outputs through a volume control. In Volume (S) the left and right inputs are sent through a ganged pair of volume controls. In Volume (D) the left and right inputs are sent through independent volume controls. Voume (M)

![Volume (D) signal flow](/effects/volume-d.png)

This effect uses **13 of 190** processing steps.
