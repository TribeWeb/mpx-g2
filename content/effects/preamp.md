---
name: Preamp
modelName: "Amp model"
color: "#009739"
summary: "Unlike the other MPX G2 Gain effects, Preamp was not designed to function as a stomp box to use in front of your amplifier."
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
    bytes: 1
    displayUnits: 3
    description: "Low frequency boost/cut"
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 50
    default: 0
    bytes: 1
    displayUnits: 1
    description: "High frequency boost"
  - id: inlvl
    index: 3
    label: InLvl
    min: -64
    max: 0
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Input level (Drive sensitivity)"
  - id: locut
    index: 4
    label: LoCut
    min: 0
    max: 20
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Pre-Drive low frequency roll off"
  - id: feel
    index: 5
    label: Feel
    min: 0
    max: 64
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Overdrive dynamics"
  - id: drive
    index: 6
    label: Drive
    min: 0
    max: 60
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Amount of overdrive"
  - id: tone
    index: 7
    label: Tone
    min: 0
    max: 35
    default: 0
    bytes: 1
    displayUnits: 1
    description: "High frequency roll-off"
  - id: bass
    index: 8
    label: Bass
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Drive bass control"
  - id: trebl
    index: 9
    label: Trebl
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Post-Drive treble control"
  - id: level
    index: 10
    label: Level
    min: 0
    max: 64
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Output level"
---
Unlike the other MPX G2 Gain effects, Preamp was not designed to function as a stomp box to use in front of your amplifier. It is a fully featured, programmable analog guitar preamp. Use Preamp for stand-alone applications (direct recording without an amp, or to drive a power amp and cabs). When using Preamp for direct recording, be sure to turn on the Speaker Simulator (Edit Select, Speaker Sim, Simulator: On). InLvl (Input Level) determines the amount of clean headroom the preamp has. The setting of this single control will have a great impact on the overall behavior and sound of the preamp. At higher values, the preamp will distort very easily — for example, with a Mid tone control boost of only 5dB. At lower levels, the tone controls behave more like EQ controls — making low, mid and high guitar frequencies louder (or softer) without adding distortion. As a general guideline, set InLvl to approximately -15dB when working on clean or crunch sounds. Use higher values when you’re going for more over-the-top distortion. Be aware that this preamp can produce well over 120dB of analog gain.

![Preamp signal flow](/effects/preamp.png)
