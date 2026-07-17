---
name: "Blue Comp"
modelName: "Blue Comp"
color: "#7c3aed"
summary: "Blue Comp is a recreation of another popular compression pedal, the CS-3."
dspSteps: 49
availableIn:
  fx1: 17
softRow:
  - sense
  - thrsh
  - gain
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
  - id: sense
    index: 2
    label: Sense
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 10
    description: "Sensitivity (Pre-Compressor level)"
  - id: thrsh
    index: 3
    label: Thrsh
    min: -83
    max: 0
    default: 0
    bytes: 1
    displayUnits: 9
    description: "Gain reduction threshold"
  - id: gain
    index: 4
    label: Gain
    min: -72
    max: 24
    default: 0
    bytes: 1
    displayUnits: 10
    description: "Post-Compressor level"
  - id: atime
    index: 5
    label: ATime
    min: 0
    max: 2000
    default: 0
    bytes: 2
    displayUnits: 59
    description: "Attack time"
  - id: rtime
    index: 6
    label: RTime
    min: 0
    max: 2000
    default: 0
    bytes: 2
    displayUnits: 59
    description: "Release time"
---
Blue Comp is a recreation of another popular compression pedal, the CS-3. Like the CS-3 it has variable Sustain (Sense), Threshold (Thrsh), Gain, Attack (ATime) and Release (RTime) parameters. These versatile controls make it flexible enough to be used with many different styles and any type of guitar (including acoustic and bass). Blue Comp is useful in front of an amp or in the effects loop. Follow a Chorus or Detune effect with Blue Comp to produce a “chime-like” effect a la Andy Summers with Police. In fact, you can use two at once. For example, connect two in series in front of an overdrive for super smooth sustain that’s perfect for slide playing.

![Blue Comp signal flow](/effects/blue-comp.png)
