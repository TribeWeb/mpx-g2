---
name: Ambience
modelName: Ambience
color: "#6366f1"
summary: "The Ambience effect gives warmth, spaciousness and depth to a performance without coloring the direct sound, and is commonly used to add a room sound to…"
dspSteps: 0
manualSection: 7-36
availableIn:
  reverb: 4
softRow:
  - size
  - pdly
  - dlvl
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
  - id: size
    index: 2
    label: Size
    min: 0
    max: 144
    default: 0
    bytes: 1
    displayUnits: 53
    description: "Length of room"
  - id: link
    index: 3
    label: Link
    min: 0
    max: 1
    default: 0
    bytes: 1
    displayUnits: 4
    description: "Scales DTime with Size"
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
  - id: mix2
    index: 6
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: dlvl
    index: 7
    label: "D Lvl"
    min: 0
    max: 25
    default: 0
    bytes: 1
    displayUnits: 63
    description: "Level of the ambience tail"
  - id: rthc
    index: 8
    label: "Rt HC"
    min: 0
    max: 14
    default: 0
    bytes: 1
    displayUnits: 66
    description: "High frequency content of DTime"
---
The Ambience effect gives warmth, spaciousness and depth to a performance without coloring the direct sound, and is commonly used to add a room sound to recorded music or speech. The effect simulates reflections from room surfaces, with random reflections, a gradual decay of overall level, and a gradual narrowing of the bandwidth. DTime settings can be varied to create larger or smaller spaces while variations of D Lvl and Rt HC correspond to the hardness of the imaginary reflecting surfaces and the effects of air absorption on the high end of the sonic spectrum.

![Ambience signal flow](/effects/ambience.png)
