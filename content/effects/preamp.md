---
name: Preamp
modelName: "Amp model"
color: "#009739"
summary: "Unlike the other MPX G2 Gain effects, Preamp was not designed to function as a stomp box to use in front of your amp."
dspSteps: 0
manualSection: 7-6
availableIn:
  gain: 6
softRow:
  - drive
  - feel
  - tone
params:
  - id: lo
    index: 0
    label: Lo
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: "Low frequency boost/cut"
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: "Mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 50
    default: 0
    displayUnits: 1
    description: "High frequency boost"
  - id: inlvl
    index: 3
    label: InLvl
    min: -64
    max: 0
    default: 0
    displayUnits: 3
    description: "Input level (Drive sensitivity)"
  - id: locut
    index: 4
    label: LoCut
    min: 0
    max: 20
    default: 0
    displayUnits: 1
    description: "Pre-Drive low frequency roll off"
  - id: feel
    index: 5
    label: Feel
    min: 0
    max: 64
    default: 0
    displayUnits: 1
    description: "Overdrive dynamics"
  - id: drive
    index: 6
    label: Drive
    min: 0
    max: 60
    default: 0
    displayUnits: 1
    description: "Amount of overdrive"
  - id: tone
    index: 7
    label: Tone
    min: 0
    max: 35
    default: 0
    displayUnits: 1
    description: "High frequency roll-off"
  - id: bass
    index: 8
    label: Bass
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: "Post-Drive bass control"
  - id: trebl
    index: 9
    label: Trebl
    min: -25
    max: 25
    default: 0
    displayUnits: 3
    description: "Post-Drive treble control"
  - id: level
    index: 10
    label: Level
    min: 0
    max: 64
    default: 0
    displayUnits: 1
    description: "Output level"
---
Unlike the other MPX G2 Gain effects, Preamp was not designed to function as a stomp box to use in front of your amp. It is a highly editable preamp for DI recording or amp simulation. InLvl determines clean headroom — as a guideline, set it near -15dB for clean or crunch sounds. This preamp can produce well over 120dB of analog gain. LoCut rolls off low end before the drive section; Feel mimics power-supply dynamics; Drive sets overall gain; Tone is a post-distortion high-frequency rolloff; Level is the master volume.

![Preamp signal flow](/effects/preamp.png)

Gain/analog effects like this use dedicated processing and do not consume the shared DSP step budget (shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).
