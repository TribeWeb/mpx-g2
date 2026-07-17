---
name: Gate
modelName: Gate
color: "#6366f1"
summary: "Gate is a reverb effect with a fairly constant sound and no decay until the reverb is cut off abruptly."
dspSteps: 0
manualSection: 7-39
availableIn:
  reverb: 5
softRow:
  - time
  - shape
  - spred
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
  - id: time
    index: 2
    label: Time
    min: 0
    max: 112
    default: 0
    bytes: 1
    displayUnits: 64
    description: "Reverb time for mid and low frequency signals"
  - id: link
    index: 3
    label: Link
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "Scales Spred with Size"
  - id: diff
    index: 4
    label: Diff
    min: 0
    max: 50
    default: 0
    bytes: 1
    displayUnits: 58
    description: "Increase of initial echo density over time"
  - id: pdly
    index: 5
    label: "P Dly"
    min: 0
    max: 250
    default: 0
    bytes: 1
    displayUnits: 72
    description: "Delay inserted before the onset of reverberation"
  - id: loslp
    index: 6
    label: LoSlp
    min: 0
    max: 32
    default: 0
    bytes: 1
    displayUnits: 62
    description: "Determines low frequency envelope shape"
  - id: hislp
    index: 7
    label: HiSlp
    min: 0
    max: 32
    default: 0
    bytes: 1
    displayUnits: 62
    description: "Determines mid and high frequency envelope shape"
  - id: xovr
    index: 8
    label: Xovr
    min: 0
    max: 60
    default: 0
    bytes: 1
    displayUnits: 56
    description: "Frequency of transition from LoSlp to Slope"
  - id: rthc
    index: 9
    label: "Rt HC"
    min: 0
    max: 48
    default: 0
    bytes: 1
    displayUnits: 54
    description: "High frequency content of Slope"
  - id: shape
    index: 10
    label: Shape
    min: 0
    max: 255
    default: 0
    bytes: 1
    displayUnits: 61
    description: "Contour of the reverberation envelope"
  - id: spred
    index: 11
    label: Spred
    min: 0
    max: 255
    default: 0
    bytes: 1
    displayUnits: 60
    description: "Sustain of reverberation after initial build up"
---
Gate is a reverb effect with a fairly constant sound and no decay until the reverb is cut off abruptly. This effect works well on percussion — particularly on snare and toms, but be sure to experiment with other sound sources as well. The Mix, P Dly and Rt HC parameters are very important in this effect, allowing you to create anything from an enhancement or subtle thickening, to a solid wall of reverb.

![Gate signal flow](/effects/gate.png)
