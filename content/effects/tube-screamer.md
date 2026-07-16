---
name: Screamer
modelName: "Tube Screamer"
summary: "Analog model of a vintage Tube Screamer overdrive with extended Lo / Mid / Hi tone controls."
dspSteps: 0
manualSection: 7-4
availableIn:
  gain: 3
softRow:
  - lo
  - mid
  - hi
params:
  - id: lo
    index: 0
    label: Lo
    min: -5
    max: 5
    description: "Low frequency boost/cut"
  - id: mid
    index: 1
    label: Mid
    min: -5
    max: 5
    description: "Mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 5
    description: "High frequency boost"
  - id: drive
    index: 3
    label: Drive
    min: 0
    max: 40
    description: "Amount of overdrive"
  - id: tone
    index: 4
    label: Tone
    min: 0
    max: 25
    description: "High frequency roll-off"
  - id: level
    index: 5
    label: Level
    min: 0
    max: 64
    description: "Output level"
---

Screamer is an analog model of a vintage Tube Screamer overdrive (powered by a fresh carbon-zinc battery). Care has been taken to make the behavior of this effect accurate both sonically and electronically. The ranges of Drive and Tone match those of the vintage effect and it will push your amp into high gear just like the original. We've also added Lo, Mid and Hi tone controls. For truly authentic sounds, leave them set flat (zero), but feel free to dial in some additional colors unobtainable with the original.

![Screamer signal flow](/effects/tube-screamer.png)

Gain effects use dedicated analog processing and do not consume the shared DSP step budget (shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).
