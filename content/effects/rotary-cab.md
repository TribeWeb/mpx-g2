---
name: "Rotary Cab"
modelName: "Rotary Cab"
summary: "This effect simulates a Leslie speaker with one pair of stereo mics on the rotating low-frequency drum, and another pair on the rotating high-frequency horn."
dspSteps: 76
availableIn:
  chorus: 6
softRow:
  - mix
  - level
  - rate1
  - dpth1
  - rate2
  - dpth2
  - res
  - width
  - bal
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
    description: "Amount of effect in the processed signal"
  - id: rate1
    index: 2
    label: Rate1
    min: 0
    max: 5000
    description: "Drum rate or period ratio"
  - id: dpth1
    index: 3
    label: Dpth1
    min: 0
    max: 100
    description: "Drum depth (tremolo)"
  - id: rate2
    index: 4
    label: Rate2
    min: 0
    max: 5000
    description: TODO
  - id: dpth2
    index: 5
    label: Dpth2
    min: 0
    max: 100
    description: "Horn depth (tremolo)"
  - id: res
    index: 6
    label: Res
    min: -100
    max: 100
    description: Resonance
  - id: width
    index: 7
    label: Width
    min: 0
    max: 100
    description: "Panning width for horn and drum"
  - id: bal
    index: 8
    label: Bal
    min: -50
    max: 50
    description: "Relative level of horn and drum"
---

This effect simulates a Leslie speaker with one pair of stereo mics on the rotating low-frequency drum, and another pair on the rotating high-frequency horn. Bal sets the relative mix of Drum and Horn mics. Width controls the stereo spread of both pairs of mics. Rate and Depth 1 control the speed and depth of the rotating low-frequency drum. Rate 2 and Depth 2 control the speed and depth of the rotating high-frequency horn. The preset, Rotary Cab, is set up so that A/B switches the speed from fast to 1:24-24:1 cycles/beat (Rate1 Units) Selects frequency or cycles/beat of drum slow. Different A and B rates are used to simulate the inertia of the Horn rate or period ratio 1:24-24:1 cycles/beat (Rate2 Units) Selects frequency or cycles/beat of horn

![Rotary Cab signal flow](/effects/rotary-cab.png)

This effect uses **76 of 190** processing steps.
