---
name: "Blue Comp"
modelName: "Blue Comp"
summary: "Blue Comp is a recreation of another popular Threshold (Thrsh), Gain, Attack (ATime) and Release (RTime) parameters."
dspSteps: 56
availableIn:
  fx1: 17
softRow:
  - mix
  - level
  - sense
  - thrsh
  - gain
  - atime
  - rtime
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
    description: "Amount of effect in processsed signal"
  - id: sense
    index: 2
    label: Sense
    min: -72
    max: 24
    description: "Sensitivity (Pre-Compressor level)"
  - id: thrsh
    index: 3
    label: Thrsh
    min: -83
    max: 0
    description: "Gain reduction threshold"
  - id: gain
    index: 4
    label: Gain
    min: -72
    max: 24
    description: "Post-Compressor level"
  - id: atime
    index: 5
    label: ATime
    min: 0
    max: 2000
    description: "Attack time"
  - id: rtime
    index: 6
    label: RTime
    min: 0
    max: 2000
    description: "Release time"
---

Blue Comp is a recreation of another popular Threshold (Thrsh), Gain, Attack (ATime) and Release (RTime) parameters. These versatile controls make it flexible enough to be used with many different styles and any type of guitar (including acoustic and bass). Blue Comp is useful in front of an amp or in the effects loop. Follow a Chorus or Detune effect with Blue Comp to produce a “chime-like” effecta la Andy Summers with Police. In fact, you can use two at once. For example, connect two in series in front of an overdrive for super smooth sustain that's perfect for slide playing. DigiDrive1 and DigiDrive2 combine digital distortion with 3band tone controls. In DigiDrive1, the tone controls are in front of the distortion. In DigiDrive 2, the tone controls follow the distortion. The distortion produced by these effects is not meant to mimic analog distortion, but to provide an alternative sound. (Think “digital fuzz box.”). The next time you’re looking for an in-your-face fuzz effect, pump one of these into your amp. You might be surprised at what comes out.

![Blue Comp signal flow](/effects/blue-comp.png)

This effect uses **56 of 190** processing steps.
