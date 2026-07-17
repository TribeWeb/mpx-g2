---
name: OctaBuzz
modelName: OctaBuzz
color: "#7c3aed"
summary: "OctaBuzz is a very simple effect that mimics the “full wave rectifier” circuit used in many octave fuzz pedals, like the Octavia."
dspSteps: 15
manualSection: 7-16
availableIn:
  fx1: 20
  fx2: 13
softRow: []
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
---
OctaBuzz is a very simple effect that mimics the “full wave rectifier” circuit used in many octave fuzz pedals, like the Octavia. Another signature Hendrix effect, (Purple Haze, Who Knows, etc.) it is not a pretty sound, and requires a little effort to make it sing. Play single notes above the 12th fret to get a screaming tone an octave higher. Single bass notes can produce ring modulator-like sounds. Double-stops and chords produce weird electronic hash. Like the original, the effect is quite dynamic — you can get a wide variety of sounds just by changing your pick attack. In general, the effect is more prominent with lighter playing. OctaBuzz is most effective in front of other distortion effects and the guitar amp. In many of the recorded classic octave fuzz performances, the distortion controls of the stomp box were turned down. (Distortion was added by the guitar amp, or by an additional distortion pedal after the octave fuzz pedal.) Try inserting the Screamer or Distortion gain effects between OctaBuzz and your amp to get the full bore sound. Hendrix sometimes put a wah between the octave fuzz and the distortion — you can too.

![OctaBuzz signal flow](/effects/octabuzz.png)
