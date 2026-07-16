---
name: Plate
modelName: Plate
summary: "Plate effects were originally generatedby large,thin sheets of metal suspended upright under tension on springs."
dspSteps: 0
availableIn:
  reverb: 3
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
    min: 0
    max: 144
    description: "Length of room"
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

Plate effects were originally generatedby large,thin sheets of metal suspended upright under tension on springs. Transducers attached to the plate would transmit a signal which would, in turn, vibrate the plate. Because the plate provided a denser medium than air, sounds broadcast through it would seem to be ocurring in a large open space. The Plate effect synthesizes the sound of metal plates, with high initial diffusion and a relatively bright, colored sound. This effect is designed to be heard as part of the music, mellowing and thickening the initial sound. It is a popular choice for enhancing popular music, particularly percussion. NO PROCESSING STEPS USED

![Plate signal flow](/effects/plate.png)
