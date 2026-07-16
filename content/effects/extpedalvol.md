---
name: ExtPedalVol
modelName: ExtPedalVol
summary: "Lighted effect buttons indicate which effect blocks are active and turned on in the currently loaded program."
dspSteps: 0
manualSection: 7-2
availableIn:
  fx1: 31
  fx2: 24
  chorus: 17
  eq: 15
softRow:
  - mix
  - level
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    description: TODO
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    description: TODO
---

Lighted effect buttons indicate which effect blocks are active and turned on in the currently loaded program. (Effects can be active, i.e. available for use in a program, but bypassed and, therefore, "off".) To identify the particular effect which is running, press and hold any of the effect buttons. A message informs you if the effect block is active, or not. The name of the particular effect in use in an active block is identified by name. To access the edit parameters of any active effect, press Edit, then select the effect by pressing the appropriate button. Use the knob and the < and > buttons to select and modify the effect parameters. Press Edit again to return to the Edit menu. See Chapter 3: Editing for more information. ===== PAGE 93 ===== Lexicon specs Notes on Combining Effects Notes on Controlling Effect Parameters Different effects require different amounts of MPX G2 processing. The following notes should be kept in mind when creating new combinations of effects in a program. All Reverb and Gain effects have dedicated processing and can be used in combination with any other effect. (You can always add these to any MPX G2 program.) In addition, the Noise Gate and Speaker Simulator don’t share resources with the effects and are, therefore, always available. The other effects (Effect1, Effect2, Chorus, Delay and EQ) share processing "steps". The total number of available steps is 190. This means that some combinations of these effects may not be possible –depending on which effects are already loaded. When you scroll through the effects for a given block, the size (in steps) of each effect is shown in the upper right hand corner of the display. If the effect will fit in the current progam, an asterisk (*) is displayed next to its name and the Effect button will flash rapidly. If the effect will not fit, an “x” is displayed, and the Effect button light will turn off. When you stop scrolling, a resource usage message is displayed briefly showing how many steps are available and how many steps have been used. Any effect parameter in the MPX G2 can be patched for real time control. In some cases, audible artifacts may be produced, depending on the particular parameter and the rate and range of control. In many effects, we’ve added additional processing power to parameters that are obvious candidates for drastic dynamic control. These parameters are “interpolated” to produce extremely smooth, noise free control. It is often possible to compensate for a non-interpolated parameter, such as Effect 1 Detune Level, by combining the effect block with one with an interpolated Level parameter, such as Effect 2 Volume. Notes on the Effect Descriptions In the following effect descriptions, a bar showing the processing requirements, in steps, of each effect in relation to the total possible number of steps (190) is shown at the end of each description. ===== PAGE 94 ===== Gain Effects, Tone, Crunch Lexicon MPX G2 guide Gain Effects

![ExtPedalVol signal flow](/effects/extpedalvol.png)
