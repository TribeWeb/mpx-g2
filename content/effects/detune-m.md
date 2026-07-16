---
name: "Detune (M)"
modelName: "Detune (M)"
summary: "Detune effects are useful for thickening up sounds by adding delayed/pitch shifted versions of the original source."
dspSteps: 29
manualSection: 7-22
availableIn:
  fx1: 1
  chorus: 2
softRow:
  - mix
  - level
  - tune
  - pdly
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
  - id: tune
    index: 2
    label: Tune
    min: 0
    max: 100
    description: "Pitch shift"
  - id: pdly
    index: 3
    label: "P Dly"
    min: 0
    max: 70
    description: "Amount of delay before the onset of the effect"
---

Detune effects are useful for thickening up sounds by adding delayed/pitch shifted versions of the original source. They can be particularly effective when used to simulate double-tracking. They are also great alternatives to chorus effects as a detuner can add the richness of a chorus effect without the audible sweep caused by the chorus rate. Detuners are also traditionally used to turn a sixstring guitar into a twelve-string, or an in-tune piano into a honky-tonk. The MPX G2 detuner is optimized to provide very fine amounts of pitch shift. Detune (M) is a single-channel detuner that creates a pair of signals, pitch-shifted up and down from the input. The pair is always mixed together, and presented equally to the outputs. (Optimize) 10-35ms An option of Tune — Adjusts the amount of delay in the tuner As the detune effects use up relatively few processing resources, they can be combined with reverb and many other effects. When creating effects that don’t require pitch shifting by large intervals (semitones) the detuners are the most efficient choice. ===== PAGE 114 ===== Flanger M, Flanger24 M and Flanger S Lexicon MPX G2 guide Flanger (M), Flanger24 (M) and Flanger (S) Flanger (M) and Flanger24 (M)

![Detune (M) signal flow](/effects/detune-m.png)

This effect uses **29 of 190** processing steps.
