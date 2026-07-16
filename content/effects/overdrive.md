---
name: Overdrive
modelName: Overdrive
summary: "A more aggressive overdrive effect than Screamer, Overdrive is designed to be used as a stomp box \u2014 to push a clean amp channel into bluesy overdrive, or to take a high-gain amp c\u2026"
dspSteps: 0
manualSection: 7-5
availableIn:
  gain: 4
softRow:
  - lo
  - mid
  - hi
  - inlvl
  - locut
  - feel
  - drive
  - tone
  - level
params:
  - id: lo
    index: 0
    label: Lo
    min: -15
    max: 15
    description: "Low frequency boost/cut"
  - id: mid
    index: 1
    label: Mid
    min: -15
    max: 15
    description: "Mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 15
    description: "High frequency boost"
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
    description: "Low frequency boost/cut"
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
    max: 40
    description: "Amount of overdrive"
  - id: tone
    index: 7
    label: Tone
    min: 0
    max: 25
    description: "High frequency roll-off (Post-Overdrive)"
  - id: level
    index: 8
    label: Level
    min: 0
    max: 64
    description: "Output level"
---

A more aggressive overdrive effect than Screamer, Overdrive is designed to be used as a stomp box — to push a clean amp channel into bluesy overdrive, or to take a high-gain amp channel over the top. Lo, Mid and Hi controls provide a considerable amountof gain. InLvl determines overall Drive sensitivity. When cranked up, Lo, Mid and Hi behave like individual distortion controls. When throttled back to -15dB or so, Lo, Mid and Hi behave more like traditional EQ controls. LoCut rolls off low frequencies before they hit the overdrive circuit (and your amp). This can be very useful if your stage sound is muddy and you need to cut through the band. The Feel parameter is a unique feature of Lexicon’s Dynamic Gain analog alogrithms. In this effect, it mimics the subtle changes in distortion dynamics caused by different power supplies. When set to 0, the amount of compression/distortion produced during the attack of notes is relatively constant. As this value is increased, you’ll notice a difference in the feel of the attack when using overdrive and moderate amounts of distortion. The first attack of a phrase of rapid picking is a bit cleaner and has more bite than those that follow. This mimics the different “power sag” envelopes characteristic of different stomp box power sources. 0 corresponds to the uniform response of an AC adapter (9V). Values 1-32 approximate the increasinglly dynamic responses produced by various batteries — from a fresh alkaline battery (9.3V), to a fresh carbon-zinc battery (9.8V). Values above 32 mimic tube-rectified Level should be used to compensate for gain added by InLvl, the Tone controls and Drive. NO PROCESSING STEPS USED ===== PAGE 97 ===== Distortion, Preamp and SplitPreamp Lexicon MPX G2 specification

![Overdrive signal flow](/effects/overdrive.png)

Gain/analog effects like this use dedicated processing and do not consume the shared DSP step budget (shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).
