---
name: Tone
modelName: Tone
summary: "Tone is a set of analog Tone controls which can be used as a clean-boost stomp box in front of your amp, or as a simple clean preamp when the MPX G2 is used without an external gu\u2026"
dspSteps: 0
availableIn:
  gain: 1
softRow:
  - lo
  - mid
  - hi
  - inlvl
  - mix
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
    max: 12
    description: "Clean mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: -25
    max: 25
    description: "Clean high frequency boost/cut"
  - id: inlvl
    index: 3
    label: InLvl
    min: -64
    max: 0
    description: "Input level (headroom)"
  - id: mix
    index: 4
    label: Mix
    min: 0
    max: 100
    description: TODO
---

Tone is a set of analog Tone controls which can be used as a clean-boost stomp box in front of your amp, or as a simple clean preamp when the MPX G2 is used without an external guitar amp. When used as a stomp box, Tone can radically alter the sonic character of you guitar amp, providing an alternative channel. When used without an external amp, Tone can sculpt some dramatic cleansounds. Try boosting Lo and Hi while cutting Mid to produce acoustic-like timbres from a single coil neck pickup. NO PROCESSING STEPS USED

![Tone signal flow](/effects/tone.png)

Gain/analog effects like this use dedicated processing and do not consume the shared DSP step budget (shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).
