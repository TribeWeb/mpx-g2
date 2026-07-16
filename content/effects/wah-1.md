---
name: "Wah  1"
modelName: "Wah  1"
color: "#7c3aed"
summary: "Flanger (M) Delay (D) Shift (M) SweepFilter Tremolo (S) Shift (S) 1-Band (M) Echo (S) Gate 1-Band (S) Preamp Shift (D) Rotary Cab Echo (D) 2-Band (S) SplitPreamp DiatonicHmy Wah 2\u2026"
dspSteps: 0
manualSection: 7-1
availableIn:
  fx1: 23
softRow:
  - sweep
  - bass
  - resp
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
  - id: sweep
    index: 2
    label: Sweep
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
  - id: bass
    index: 3
    label: Bass
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
  - id: resp
    index: 4
    label: Resp
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
  - id: gain
    index: 5
    label: Gain
    min: -72
    max: 24
    default: 0
    displayUnits: 3
    description: TODO
---
Flanger (M) Delay (D) Shift (M) SweepFilter Tremolo (S) Shift (S) 1-Band (M) Echo (S) Gate 1-Band (S) Preamp Shift (D) Rotary Cab Echo (D) 2-Band (S) SplitPreamp DiatonicHmy Wah 2 Phaser Volume (M) Aerosol Looper 1-Band (D) Volume (S) Orbits Pedal Wah2 RedComp Volume (D) Centrifuge1 Ducker Fc Splitter Tremolo (M) Volume (M) BlueComp Tremolo (S) Volume (S) DigiDrive1 UniVybe Volume (D) DigiDrive2 CustomVybe PedalVol OctaBuzz Click Volume (M) Volume (D) Phaser ExtPedalVol Volume (S) PedalVol ExtPedalVol RedComp Click PedalVol BlueComp ExtPedalVol Lighted effect buttons indicate which effect blocks are active and turned on in the currently loaded program. (Effects can be active, i.e. available for use in a program, but bypassed and, therefore, "off".) To identify the particular effect which is running, press and hold any of the effect buttons. A message informs you if the effect block is active, or not. The name of the particular effect in use in an active block is identified by name. To access the edit parameters of any active effect, press Edit, then select the effect by pressing the appropriate button. Use the knob and the < and > buttons to select and modify the effect parameters. Press Edit again to return to the Edit menu. See Chapter 3: Editing for more information. ===== PAGE 93 ===== Lexicon specs Notes on Combining Effects Notes on Controlling Effect Parameters Different effects require different amounts of MPX G2 processing. The following notes should be kept in mind when creating new combinations of effects in a program. All Reverb and Gain effects have dedicated processing and can be used in combination with any other effect. (You can always add these to any MPX G2 program.) In addition, the Noise Gate and Speaker Simulator don’t share resources with the effects and are, therefore, always available. The other effects (Effect1, Effect2, Chorus, Delay and EQ) share processing "steps". The total number of available steps is 190. This means that some combinations of these effects may not be possible –depending on which effects are already loaded.

![Wah  1 signal flow](/effects/wah-1.png)
