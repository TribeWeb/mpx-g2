---
name: Crunch
modelName: Crunch
summary: "Crunch is an overdrive effect with separate drive controls for low, mid and high frequencies."
dspSteps: 0
manualSection: 7-3
availableIn:
  gain: 2
softRow:
  - lo
  - mid
  - hi
  - inlvl
  - level
params:
  - id: lo
    index: 0
    label: Lo
    min: -25
    max: 25
    description: "Low frequency Drive"
  - id: mid
    index: 1
    label: Mid
    min: -25
    max: 25
    description: "Mid frequency Drive"
  - id: hi
    index: 2
    label: Hi
    min: 0
    max: 50
    description: "High frequency Drive"
  - id: inlvl
    index: 3
    label: InLvl
    min: -64
    max: 0
    description: "Input level (Drive sensitivity)"
  - id: level
    index: 4
    label: Level
    min: 0
    max: 64
    description: "Output level"
---

Crunch effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.

![Crunch signal flow](/effects/crunch.png)

Gain/analog effects like this use dedicated processing and do not consume the shared DSP step budget (shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).
