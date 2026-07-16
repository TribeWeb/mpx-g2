---
name: Hall
modelName: Hall
summary: "The Hall effect emulates a real concert hall."
dspSteps: 0
manualSection: 7-35
availableIn:
  reverb: 2
softRow:
  - mix
  - level
  - size
  - link
  - diff
  - pdly
  - bass
  - decay
  - xovr
  - rthc
  - shape
  - spred
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
  - id: size
    index: 2
    label: Size
    min: 32
    max: 144
    description: "Length of Hall"
  - id: link
    index: 3
    label: Link
    min: 0
    max: 1
    description: "Scales Decay and Spred with Size"
  - id: diff
    index: 4
    label: Diff
    min: 0
    max: 50
    description: "Increase of initial echo density over time"
  - id: pdly
    index: 5
    label: "P Dly"
    min: 0
    max: 250
    description: "Delay inserted before the onset of reverberation"
  - id: bass
    index: 6
    label: Bass
    min: 0
    max: 9
    description: "Reverb time for low frequency signals"
  - id: decay
    index: 7
    label: Decay
    min: 0
    max: 63
    description: "Length of the reverb tail"
  - id: xovr
    index: 8
    label: Xovr
    min: 0
    max: 60
    description: TODO
  - id: rthc
    index: 9
    label: "Rt HC"
    min: 0
    max: 48
    description: "High frequency content of Decay"
  - id: shape
    index: 10
    label: Shape
    min: 0
    max: 255
    description: "Contour of the reverberation envelope"
  - id: spred
    index: 11
    label: Spred
    min: 0
    max: 255
    description: "Sustain of reverberation after initial build up"
---

Hall effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.

![Hall signal flow](/effects/hall.png)
