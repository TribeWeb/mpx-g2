---
name: JamMan
modelName: JamMan
summary: "incorporates many of the features of the original Lexicon JamMan."
dspSteps: 25
manualSection: 7-33
availableIn:
  delay: 8
softRow:
  - mix
  - level
  - size
  - fbk
  - clear
  - layer
  - replc
  - delay
  - mutes
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
  - id: size
    index: 2
    label: Size
    min: 0
    max: 20000
    description: "Loop size in ms (display only, this is set by pressing Tap)"
  - id: fbk
    index: 3
    label: Fbk
    min: -100
    max: 100
    description: "Feedback level (defaults to 100% while looping)"
  - id: clear
    index: 4
    label: Clear
    min: 0
    max: 1
    description: "Mutes and resets the loop when On"
  - id: layer
    index: 5
    label: Layer
    min: 0
    max: 1
    description: "Adds new material on top of loop while On"
  - id: replc
    index: 6
    label: Replc
    min: 0
    max: 1
    description: "Replaces existing loop with new material while On"
  - id: delay
    index: 7
    label: Delay
    min: 0
    max: 1
    description: "Turns looper into mono delay while On"
  - id: mutes
    index: 8
    label: MuteS
    min: 0
    max: 1
    description: "Mutes loop while On, restarts from beginning when Off"
---

incorporates many of the features of the original Lexicon JamMan. To create a simple loop, press Tap once when you want to start recording. (You can record up to 20 seconds — while recording, a meter showing stop recording and begin playback of the loop. The JamMan effect can synchronize to an external MIDI Clock as well as to the MPX G2 internal clock. This makes it possible to synchronize your loops with any MIDI drum machine or sequencer. To synchronize the JamMan loop with effects that use rates set for cycles/beat, set the Tempo Beat Value (in the Edit menu) to the number of beats you want to loop. The JamMan effect has several JamMan parameters can also be controlled with MIDI Program Change special parameters that allow you messages when MPX G2 Program mode: Option is set to Show members of to stop, restart and modify the loop MIDI Maps. (See MIDI Pgm Maps in Chapter 5: System Controls.) in real time: Clear, Layer, Replc, Delay, and Mute. Each of these has only two values, On or Off - so they can easily be controlled via external footswitches or MIDI. We’ve created some example presets to demonstrate how these features work. See Amp Input & FX Loop programs 95-99, Amp Input Only programs 145-149 and Stand Alone programs 245-248. ===== PAGE 125 =====

![JamMan signal flow](/effects/jamman.png)

This effect uses **25 of 190** processing steps.
