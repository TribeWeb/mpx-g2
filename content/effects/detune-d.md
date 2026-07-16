---
name: "Detune (D)"
modelName: "Detune (D)"
color: "#7c3aed"
summary: "by the chorus rate."
dspSteps: 29
availableIn:
  fx1: 3
softRow:
  - tune1
  - tune2
  - pdly
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
    description: "Amount of effect in the processed signal"
  - id: tune1
    index: 2
    label: Tune1
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
  - id: tune2
    index: 3
    label: Tune2
    min: 0
    max: 100
    default: 0
    displayUnits: 1
    description: TODO
  - id: pdly
    index: 4
    label: "P Dly"
    min: 0
    max: 70
    default: 0
    displayUnits: 72
    description: "Amount of delay before the onset of the effect"
---
by the chorus rate. Detuners are also traditionally used to turn a sixstring guitar into a twelve-string, or an in-tune piano into a honky-tonk. The MPX G2 detuners are optimized to provide very fine amounts of pitch shift. Detune (M) is a single-channel detuner that creates a pair of signals, pitch-shifted up and down Tune, Tune1, 2 0-100 Pitch shift from the input. The pair is always (Optimize) 10-60ms (M), (D) An option of Tune 1 — Adjusts the amount of delay in mixed together, and presented equally to the outputs. 10-40ms (S) the tuner Detune (S) creates a pair of sig0-25ms (S) nals, pitch-shifted up and down As the detune effects use up relatively few processing resources, they can be combined with from the inputs. The left and right channels are separate. reverb and many other effects. When creating effects that don’t require pitch shifting by large Detune (D) sums left and right intervals (semitones) the detuners are the most efficient choice. inputs to mono,then creates two pairs of signals, pitch-shifted up and down from the inputs by Tune1 and Tune 2. The first pair goes out the left, the second pair out the right.

![Detune (D) signal flow](/effects/detune-d.png)

This effect uses **29 of 190** processing steps.
