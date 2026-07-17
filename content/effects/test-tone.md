---
name: "Test Tone"
modelName: "Test Tone"
color: "#7c3aed"
summary: "Test Tone is an audio sine wave generator with its output quantized to correspond with the pitches of a chromatic scale (A = 440 Hz) over a nine-and-one-half…"
dspSteps: 33
availableIn:
  fx1: 32
  fx2: 25
softRow:
  - note
  - bal
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
  - id: note
    index: 2
    label: Note
    min: 0
    max: 127
    default: 0
    bytes: 1
    displayUnits: 65
    description: "Sine wave pitch, expressed as MIDI notes"
  - id: bal
    index: 3
    label: Bal
    min: -50
    max: 50
    default: 0
    bytes: 1
    displayUnits: 8
    description: "Relative level of left and right output attenuation"
---
Test Tone is an audio sine wave generator with its output quantized to correspond with the pitches of a chromatic scale (A = 440 Hz) over a nine-and-one-half octave range. It is provided primarily as a convenient way of generating test tones and tuning references. Bal controls the relative level of left and right output attenuation. When Bal=-50, the left output has no attenuation, and the right output is fully attenuated. When Bal=0, neither output is attenuated. When Bal=+50, the left output is fully attenuated and the right output has no attenuation. Level and Bal can be patched to a global LFO to get tone bursts, etc. Pitch accuracy is better than 1/4 cent.

![Test Tone signal flow](/effects/test-tone.png)
