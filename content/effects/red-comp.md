---
name: "Red Comp"
modelName: "Red Comp"
color: "#7c3aed"
summary: "Red Comp is our take on the classic Dyna Comp stomp box."
dspSteps: 61
manualSection: 7-14
availableIn:
  fx1: 16
  fx2: 9
softRow:
  - sense
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
    description: "Amount of effect in processsed signal"
  - id: sense
    index: 2
    label: Sense
    min: 0
    max: 100
    default: 0
    displayUnits: 10
    description: "Sensitivity (Pre-Compressor level)"
---
Red Comp is our take on the classic Dyna Comp stomp box. It is a simple compressor with fixed ratio, threshold and time constants (each matched to the original). The amount of compression is set with the Sense control. The higher the value of Sense, the more the signal is “squashed.” Red Comp has lots of uses. It is generally used in front of the amp. With clean sounds, it can add extra attack and sustain. Use it in front of an overdriven preamp to keep notes in the sweet spot without spilling over into too much distortion when you play hard. ===== PAGE 106 ===== Blue Comp, DigiDrive1 and DigiDrive2 Lexicon MPX G2 instruction

![Red Comp signal flow](/effects/red-comp.png)

This effect uses **61 of 190** processing steps.
