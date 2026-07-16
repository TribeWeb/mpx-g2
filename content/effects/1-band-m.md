---
name: "1-Band (M)"
modelName: "1-Band (M)"
color: "#7c3aed"
summary: "Crunch Detune (S) Detune (M) Delay (S) Detune (D) OctaBuzz Tremolo (M) Wah 1 Flanger (M) Delay (D) Shift (M) SweepFilter Tremolo (S) Shift (S) 1-Band (M) Echo (S) Gate 1-Band (S)\u2026"
dspSteps: 70
availableIn:
  fx1: 22
  fx2: 15
  eq: 1
softRow:
  - gain
  - fc
  - q
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    displayUnits: 0
    description: TODO
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    displayUnits: 0
    description: TODO
  - id: gain
    index: 2
    label: Gain
    min: -72
    max: 24
    default: 0
    displayUnits: 3
    description: TODO
  - id: fc
    index: 3
    label: Fc
    min: 20
    max: 20000
    default: 10010
    displayUnits: 9
    description: TODO
  - id: q
    index: 4
    label: Q
    min: 1
    max: 100
    default: 51
    displayUnits: 10
    description: TODO
  - id: mode
    index: 5
    label: Mode
    min: 0
    max: 2
    default: 0
    displayUnits: 47
    description: TODO
---
Crunch Detune (S) Detune (M) Delay (S) Detune (D) OctaBuzz Tremolo (M) Wah 1 Flanger (M) Delay (D) Shift (M) SweepFilter Tremolo (S) Shift (S) 1-Band (M) Echo (S) Gate 1-Band (S) Preamp Shift (D) Rotary Cab Echo (D) 2-Band (S) SplitPreamp DiatonicHmy Wah 2 Phaser Volume (M) Aerosol Looper 1-Band (D) Volume (S) Orbits Pedal Wah2 RedComp Volume (D) Centrifuge1 Ducker Fc Splitter Tremolo (M) Volume (M) BlueComp Tremolo (S) Volume (S) DigiDrive1 UniVybe Volume (D) DigiDrive2 CustomVybe PedalVol OctaBuzz Click Volume (M) Volume (D) Phaser ExtPedalVol Volume (S) PedalVol ExtPedalVol RedComp

![1-Band (M) signal flow](/effects/1-band-m.png)

This effect uses **70 of 190** processing steps.
