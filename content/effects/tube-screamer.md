---
name: Screamer
modelName: "Tube Screamer"
color: "#009739"
summary: "Screamer is an analog model of a vintage Tube Screamer overdrive (powered by a fresh carbon-zinc battery)."
dspSteps: 0
manualSection: 7-4
availableIn:
  gain: 3
softRow:
  - drive
  - tone
  - mid
params:
  - id: lo
    index: 0
    label: Lo
    min: -5
    max: 5
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Low frequency boost/cut"
  - id: mid
    index: 1
    label: Mid
    min: -5
    max: 5
    default: 0
    bytes: 1
    displayUnits: 3
    description: "Mid frequency boost/cut"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 5
    default: 0
    bytes: 1
    displayUnits: 1
    description: "High frequency boost"
  - id: drive
    index: 3
    label: Drive
    min: 0
    max: 40
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Amount of overdrive"
  - id: tone
    index: 4
    label: Tone
    min: 0
    max: 25
    default: 0
    bytes: 1
    displayUnits: 1
    description: "High frequency roll-off"
  - id: level
    index: 5
    label: Level
    min: 0
    max: 64
    default: 0
    bytes: 1
    displayUnits: 1
    description: "Output level"
---
Screamer is an analog model of a vintage Tube Screamer overdrive (powered by a fresh carbon-zinc battery). Care has been taken to make the behavior of this effect accurate both sonically and electronically. The ranges of Drive and Tone match those of the vintage effect and it will push your amp into high gear just like the original. We’ve also added Lo, Mid and Hi tone controls. For truly authentic sounds, leave them set flat (zero), but feel free to dial in some additional colors unobtainable with the original.

![Screamer signal flow](/effects/tube-screamer.png)
