---
name: SweepFilter
modelName: SweepFilter
summary: "SweepFilter simulates a Moogtype resonant low-pass filter."
dspSteps: 50
manualSection: 7-17
availableIn:
  fx1: 21
  fx2: 14
softRow:
  - mix
  - level
  - fc
  - fres
  - mod
  - scale
  - pan
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
  - id: fc
    index: 2
    label: Fc
    min: 20
    max: 20000
    description: "Corner frequency offset of filter"
  - id: fres
    index: 3
    label: FRes
    min: 1
    max: 100
    description: "Filter resonance: 7=a maximally flat filter"
  - id: mod
    index: 4
    label: Mod
    min: 20
    max: 20000
    description: "added to corner frequency offset to produce corner frequency"
  - id: scale
    index: 5
    label: Scale
    min: -100
    max: 100
    description: "scales Mod"
  - id: pan
    index: 6
    label: Pan
    min: -50
    max: 50
    description: "Left/right pan control"
---

SweepFilter simulates a Moogtype resonant low-pass filter. Cutoff frequency and output level are interpolated, and can be swept. The performance of this filter is high enough that it can be used as a lowpass filter for hiss reduction. The parameters were designed to allow synthesizer-like control of the filter. For example: Use FC like the manual “cutoff” knob of an analog synth – set it to the filter frequency desired when all modulation sources are at minimum. Use Mod as the patch destination for as many as five modulation sources (LFO, Rand, Env, LastNote, etc.). Use Scale as a master depth control for all modulation sources. 1-Band (M) The 1-Band (M) effect provides a single band of double-precision parametric EQ with adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf). 0.1-10.0 Q of filter Mode LShlf, Band, HShlf Determines EQ type ===== PAGE 109 ===== Wah 1, Wah 2 and PedalWah1, PedalWah2 Lexicon MPX G2 guide Wah 1, Wah 2 and PedalWah1, PedalWah2 Wah is a mono wah filter modeled after two classic wah-wah Wah 1

![SweepFilter signal flow](/effects/sweepfilter.png)

This effect uses **50 of 190** processing steps.
