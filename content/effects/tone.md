---
name: Tone
modelName: Tone
color: "#009739"
summary: "Tone is a set of analog Tone controls which can be used as a clean-boost stomp box in front of your amp, or as a simple clean preamp when the MPX G2 is used…"
dspSteps: 0
availableIn:
  gain: 1
softRow:
  - lo
  - mid
  - hi
params:
  - id: lo
    index: 0
    label: Lo
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Clean low frequency boost/cut"
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 12
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Clean mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: -25
    max: 25
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Clean high frequency boost/cut"
  - id: inlvl
    index: 3
    label: InLvl
    min: -64
    max: 0
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Input level (headroom)"
  - id: mix
    index: 4
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Wet ratio"
---
Tone is a set of analog Tone controls which can be used as a clean-boost stomp box in front of your amp, or as a simple clean preamp when the MPX G2 is used without an external guitar amp. When used as a stomp box, Tone can radically alter the sonic character of your guitar amp, providing an alternative channel. When used without an external amp, Tone can sculpt some dramatic clean sounds. Try boosting Lo and Hi while cutting Mid to produce acoustic-like timbres from a single coil neck pickup.

![Tone signal flow](/effects/tone.png)
