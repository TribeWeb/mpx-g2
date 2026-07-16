---
name: "Wah  2"
modelName: "Wah  2"
summary: pedals.
dspSteps: 71
manualSection: 7-18
availableIn:
  fx1: 24
  fx2: 17
softRow:
  - mix
  - level
  - sweep
  - bass
  - resp
  - gain
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
    description: "Amount of effect in processsed signal"
  - id: sweep
    index: 2
    label: Sweep
    min: 0
    max: 100
    description: "Wah center frequency (available only in Wah 1 & Wah 2)"
  - id: bass
    index: 3
    label: Bass
    min: 0
    max: 100
    description: "Adds low frequency boost to the wah"
  - id: resp
    index: 4
    label: Resp
    min: 0
    max: 100
    description: "Responsiveness to changes in sweep"
  - id: gain
    index: 5
    label: Gain
    min: -72
    max: 24
    description: "Post-Wah cut/boost"
---

pedals. With Sweep selected, press Options to select Model C (CryBaby) or Model V (Vox). These models capture both the characteristic signature and nonlinear pedal response of the original pedals. Bass allows you to change the wah from a band-pass type to a low-pass type effect by progressively adding more end. (Try it with bass and keyboards.) Resp controls fast, 0 is very, very slow). To make a Mutron-like envelope filter, patch sweep to Env. Use Resp to control the effect’s responsiveness to changing dynamics. To make an Auto Wah effect, try patching Sweep to an LFO sine or triangle wave. Wah 2 uses the same vintage wahs as Wah 1 with a built-in com- (Type) C, V C= Crybaby, V = Vox pressor following the wah. (All of the compression parameters are fixed and, therefore, invisible.) The compressor smooths out some of the peakiness that can occur in different portions of the sweep, while at the same time adding some sustain and punch to the overall effect. The end result is a wah that cuts through when you kick it on. The Pedal Wah effects are identical to Wah 1 and Wah 2 except theSweep parameteris hard-wired to the Foot Pedal input on the MPX G2 rear panel. If you are using the MPX R1 MIDI Remote Controller, these effects will be automatically connected to the control pedal — you don’t have to make any patches — just load the effect and start playing. Wah 1 or PedalWah1 Wah 2 or PedalWah2 ===== PAGE 110 ===== Volume (M), Volume (S) and Volume (D) The Volume effects can be

![Wah  2 signal flow](/effects/wah-2.png)

This effect uses **71 of 190** processing steps.
