---
name: SplitPreamp
modelName: "Dual preamp"
summary: "SplitPreamp is the same analog effect as Preamp, with a built-in parallel path that feeds dry signal around the drive section for parallel distortion textures."
dspSteps: 0
manualSection: 7-7
availableIn:
  gain: 7
softRow:
  - lo
  - mid
  - hi
  - inlvl
  - locut
  - feel
  - drive
  - tone
  - bass
  - trebl
  - level
params:
  - id: lo
    index: 0
    label: Lo
    min: -25
    max: 25
    description: "Clean low frequency boost/cut"
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 25
    description: "Clean mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 50
    description: "Clean high frequency boost/cut"
  - id: inlvl
    index: 3
    label: InLvl
    min: -64
    max: 0
    description: "Input level (Drive sensitivity)"
  - id: locut
    index: 4
    label: LoCut
    min: 0
    max: 20
    description: "Clean low frequency boost/cut"
  - id: feel
    index: 5
    label: Feel
    min: 0
    max: 64
    description: "Overdrive dynamics"
  - id: drive
    index: 6
    label: Drive
    min: 0
    max: 60
    description: "Amount of overdrive"
  - id: tone
    index: 7
    label: Tone
    min: 0
    max: 25
    description: "High frequency roll-off"
  - id: bass
    index: 8
    label: Bass
    min: -25
    max: 25
    description: "Post-Drive bass control"
  - id: trebl
    index: 9
    label: Trebl
    min: -25
    max: 25
    description: "Post-Drive treble control"
  - id: level
    index: 10
    label: Level
    min: 0
    max: 64
    description: "Output level"
---

SplitPreamp is the same analog effect as Preamp, with a built-in parallel path that feeds dry signal around the drive section for parallel distortion textures. Unlike the other MPX G2 Gain effects, Preamp was not designed to function as a stomp box to use in front of your amp. It is a highly editable preamp for DI recording or amp simulation. InLvl determines clean headroom — as a guideline, set it near -15dB for clean or crunch sounds. This preamp can produce well over 120dB of analog gain. LoCut rolls off low end before the drive section; Feel mimics power-supply dynamics; Drive sets overall gain; Tone is a post-distortion high-frequency rolloff; Level is the master volume.

![SplitPreamp signal flow](/effects/splitpreamp.png)

Gain/analog effects like this use dedicated processing and do not consume the shared DSP step budget (shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).
