---
name: DiatonicHmy
modelName: DiatonicHmy
color: "#7c3aed"
summary: "DiatonicHmy is an \u201cintelligent\u201d pitch shifter."
dspSteps: 96
manualSection: 7-10
availableIn:
  fx1: 7
softRow:
  - key
  - scale
  - int
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    displayUnits: 0
    description: "Amount of effect in processed signal"
  - id: key
    index: 2
    label: Key
    min: 0
    max: 11
    default: 0
    displayUnits: 96
    description: "Pitch root of scale"
  - id: scale
    index: 3
    label: Scale
    min: 0
    max: 6
    default: 0
    displayUnits: 97
    description: TODO
  - id: int
    index: 4
    label: Int
    min: 0
    max: 25
    default: 0
    displayUnits: 98
    description: "Harmony Interval"
  - id: thrsh
    index: 5
    label: Thrsh
    min: -83
    max: 0
    default: 0
    displayUnits: 9
    description: "Sets the level above which the pitch detector tracks"
---
DiatonicHmy is an “intelligent” pitch shifter. The effect will automatically shift the pitch of an incoming monophonic notes to the correct harmony note in the selected key and scale. You select the key and scale — (E major, A minor, etc.) and harmony interval (up a 3rd, down a 6th, etc.). When an out of key note is detected, it will be shifted by the same interval amount as the last in-key note. Note the pitch detector can use either the Guitar Input or Return Inputs as the source for pitch detection. The default is Guitar Input, which allows the detector to analyze a clean, unprocessed guitar signal — even if you want to shift the guitar audio after it has been processed by one or more effects. Scale Major, Dorian, Phyrgian, Type of scale Lydian, Mixolydian, Minor, Locrian (Optimize) 0-100 Sets the amount of delay in the pitch shifter (Src) Guitar In, Returns Input Selects the audio input used for pitch analysis. ===== PAGE 102 ===== Panner, Auto Pan Lexicon MPX G2 specification

![DiatonicHmy signal flow](/effects/diatonichmy.png)

This effect uses **96 of 190** processing steps.
