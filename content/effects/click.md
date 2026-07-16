---
name: Click
modelName: Click
color: "#7c3aed"
summary: "This effect is a simple metronome which is automatically connected to Tap."
dspSteps: 14
manualSection: 7-20
availableIn:
  fx1: 33
  fx2: 26
softRow: []
params:
  - id: mix
    index: 0
    label: Mix
    min: 0
    max: 100
    default: 0
    displayUnits: 0
    description: "Dry/Click ratio"
  - id: level
    index: 1
    label: Level
    min: -90
    max: 6
    default: 0
    displayUnits: 0
    description: "Amount of Click in processsed signal"
---
This effect is a simple metronome which is automatically connected to Tap. Press Tap twice to set the tempo. This effect can be used as an inputsource forauditioning reverbs and delays. It is also a convenient timing reference for the JamMan effect, where the click is automatically muted until the loop is tapped. ===== PAGE 112 ===== Chorus Effects Lexicon MPX G2 specification The chorus effects are generally used to enhance a sound by modulating delay times and/ or frequency content in various ways. Of course, the classic effects of this type : Chorus, Flanger and Phaser are all here – along with several other variations such as: Rotary Cab, Aerosol, Orbits, Centrifuge, Comb 1 and Comb 2. All of the Chorus effects have one or two resonance parameters. These parameters control the level and phase of the effect output signal that is recirculated into the effect inputs. Use care when adjusting these parameters, as they can cause overload (or feedback-like howls) if they are set too high — even with little or no input signal present. As a general rule, the combined value of any resonance parameters should always be less than 100 — but pay close attention to levels whenever the total resonance is above 50.If you use high resonance values (to produce a deep flange effect, for example) and the clip LEDs light, try turning down the level of the effect that precedes the Chorus block. Chorus Effects

![Click signal flow](/effects/click.png)

This effect uses **14 of 190** processing steps.
