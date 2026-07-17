---
name: SweepFilter
modelName: SweepFilter
color: "#7c3aed"
summary: "SweepFilter simulates a Moog-type resonant low-pass filter."
dspSteps: 92
manualSection: 7-17
availableIn:
  fx1: 21
  fx2: 14
softRow:
  - fc
  - fres
  - mod
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Dry/Wet ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    bytes: 1
    displayUnits: 0
    description: "Amount of effect in the processed signal"
  - id: fc
    index: 2
    label: Fc
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "Corner frequency offset of filter"
  - id: fres
    index: 3
    label: FRes
    min: 1
    max: 100
    default: 51
    bytes: 1
    displayUnits: 1
    description: "Filter resonance: 7=a maximally flat filter"
  - id: mod
    index: 4
    label: Mod
    min: 20
    max: 20000
    default: 10010
    bytes: 2
    displayUnits: 9
    description: "added to corner frequency offset to produce corner frequency"
  - id: scale
    index: 5
    label: Scale
    min: -100
    max: 100
    default: 0
    bytes: 1
    displayUnits: 3
    description: "scales Mod"
  - id: pan
    index: 6
    label: Pan
    min: -50
    max: 50
    default: 0
    bytes: 1
    displayUnits: 4
    description: "Left/right pan control"
---
SweepFilter simulates a Moog-type resonant low-pass filter. Cutoff frequency and output level are interpolated, and can be swept. The performance of this filter is high enough that it can be used as a lowpass filter for hiss reduction. The parameters were designed to allow synthesizer-like control of the filter. For example: Use FC like the manual “cutoff” knob of an analog synth – set it to the filter frequency desired when all modulation sources are at minimum. Use Mod as the patch destination for as many as five modulation sources (LFO, Rand, Env, LastNote, etc.). Use Scale as a master depth control for all modulation sources.

![SweepFilter signal flow](/effects/sweepfilter.png)
