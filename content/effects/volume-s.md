---
name: "Volume (S)"
modelName: "Volume (S)"
color: "#7c3aed"
summary: "Voume (D) PedalVol and ExtPedalVol PedalVol is the same as Volume (S), except the Vol parameter is hardwired to the Foot Pedal input on the MPX G2."
dspSteps: 13
manualSection: 7-29
availableIn:
  fx1: 28
  fx2: 21
  chorus: 14
  eq: 12
softRow:
  - vol
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
  - id: vol
    index: 2
    label: Vol
    min: 0
    max: 100
    default: 0
    displayUnits: 3
    description: TODO
---
Voume (D) PedalVol and ExtPedalVol PedalVol is the same as Volume (S), except the Vol parameter is hardwired to the Foot Pedal input on the MPX G2. When using the MPX R1 MIDI Remote Controller, this parameter is automatically connected to the R1’s built-in pedal. This means that no patching is required to create a volume pedal effect. ExtPedalVol is hardwired to the External Pedal input of the MPX R1, allowing you to easily create programs with both a Volume and Wah pedal available simultaneously. PedalVol and ExtPedalVol ===== PAGE 120 ===== The Delay effects include delay, echo, looping and ducking effects. Delays are high Delay Effects quality digital delays. Echoes are similar to delays, but low-pass filters have been added to simulate the high-frequency rolloff that occurs naturally in acoustic echoes and in echoes created with analog tape. All MPX G2 Delay effects allow you to choose how delay times will be displayed. Select any Time parameter and press Options. The following choices are available for each Time parameter: ms: time is displayed as milliseconds (delay time is fixed) feet: time is displayed as feet – the equivalent distance from a sound source required to produce the delay (delay time is fixed) meters: time is displayed as meters – the equivalent distance from a sound source required to produce the delay (delay time is fixed) echoes/beat: time is displayed as a rhythmic ratio of echoes per beat (delay time varies with Tempo and can be changed at any time by pressing TAP twice.) TAP ms: time is displayed as milliseconds (new delay value can be “tapped in” when this Time value is displayed for editing). Another feature shared by all MPX G2 Delay effects is Fbk Insert. This option of the feedback parameter allows you to route the outputs of another effect block to the delay’s feedback input. If the other block is after the delay block, Fbk Insert will place it inside the delay/echo feedback loop. This powerful feature is the key to obtaining many classic effects. ===== PAGE 121 ===== Delay M, Delay S and Delay D Lexicon MPX G2 instruction Delay (M), Delay (S) and Delay (D) Delay (M) is a simple mono de-

![Volume (S) signal flow](/effects/volume-s.png)

This effect uses **13 of 190** processing steps.
