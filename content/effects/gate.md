---
name: Gate
modelName: Gate
color: "#6366f1"
summary: "Gate is a reverb effect with a fairly constant sound and no decay until the reverb is cut off abruptly."
dspSteps: 50
manualSection: 7-39
availableIn:
  reverb: 5
softRow:
  - time
  - shape
  - spred
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
  - id: time
    index: 2
    label: Time
    min: 0
    max: 112
    default: 0
    displayUnits: 64
    description: "Reverb time for mid and low frequency signals"
  - id: link
    index: 3
    label: Link
    min: 0
    max: 1
    default: 0
    displayUnits: 4
    description: "Scales Spred with Size"
  - id: diff
    index: 4
    label: Diff
    min: 0
    max: 50
    default: 0
    displayUnits: 58
    description: "Increase of initial echo density over time"
  - id: pdly
    index: 5
    label: "P Dly"
    min: 0
    max: 250
    default: 0
    displayUnits: 72
    description: "Delay inserted before the onset of reverberation"
  - id: loslp
    index: 6
    label: LoSlp
    min: 0
    max: 32
    default: 0
    displayUnits: 62
    description: "Determines low frequency envelope shape"
  - id: hislp
    index: 7
    label: HiSlp
    min: 0
    max: 32
    default: 0
    displayUnits: 62
    description: "Determines mid and high frequency envelope shape"
  - id: xovr
    index: 8
    label: Xovr
    min: 0
    max: 60
    default: 0
    displayUnits: 56
    description: TODO
  - id: rthc
    index: 9
    label: "Rt HC"
    min: 0
    max: 48
    default: 0
    displayUnits: 54
    description: "High frequency content of Slope"
  - id: shape
    index: 10
    label: Shape
    min: 0
    max: 255
    default: 0
    displayUnits: 61
    description: "Contour of the reverberation envelope"
  - id: spred
    index: 11
    label: Spred
    min: 0
    max: 255
    default: 0
    displayUnits: 60
    description: "Sustain of reverberation after initial build up"
---
Gate is a reverb effect with a fairly constant sound and no decay until the reverb is cut off abruptly. This effect works well on percussion —particularly on snare and toms, but be sure to experiment with other sound sources as well. The Mix, P Dly and Rt HC parameters are very important in this effect, allowing you to create anything from an enhancement or subtle thickening, to a solid wall of reverb. NO PROCESSING STEPS USED ===== PAGE 129 ===== EQ Effects Lexicon MPX G2 guide EQ Effects High Cut Low Cut Bandpass/Notch High Shelf Low Shelf At its simplest, equalization is the process of cutting and boosting certain frequencies to make portions of program material more or less audible. This is generally accomplished by combining filters which affect a specific “band” of frequencies together with gain controls.The three types of filters commonly used to perform basic EQ functions are: High Cut, Low Cut and Bandpass/Notch. High cut filters remove frequencies above a fixed level. As this allows frequencies below the threshold to pass through unchanged, high cut filters are also commonly referred to as “lowpass” filters. Low cut filters, which remove frequencies below a fixed level and allow higher frequencies to pass through are also known as “highpass” filters. Bandpass/Notch filters allow only a certain range of frequencies to pass through without attenuation. They are plotted as curves, with a peak (or dip in the case of notch filters) at the center frequency. Shelf filters When a specific frequency value is selected for cutting or boosting, and compensating gain controls are provided, a shelving filter is created, with gradual build up of the boost or cut to the selected frequency, followed by a leveling off beyond the selected frequency. When the effect of the filter is plotted, it resembles a shelf, with constant levels of boost or cut preceding and following the “knee” or “corner point” at the selected frequency. A typical application of these filters uses 2-band equalization with two shelf filters, one low and one high, to provide bass and treble tone control. These two filters affect only the high and low frequency signals, leaving the center frequencies unaltered. Adding a third or fourth band of equalization in the form of midrange bandpass filters provides more control over those frequencies where hearing is most sensitive, and where most of the energy in music exists. (500Hz-4kHz). These midrange bands peak, or dip, at a center frequency which can be varied to provide much greater control over different aspects of the sound, allowing for bass or treble rolloff to decrease boominess, thicken sounds, reduce noise, or increase brightness. Parametric EQ Parametric equalizers provide boost and cut controls, sweepable center frequencies, and adjustment of “Q”, or the broadness or sharpness of the EQ curve —all of the parameters of equalization. This ability to broaden or narrow the peak at certain frequencies allows specific sounds to be accented or diminished with minimal effect on adjacent frequencies. As all equalization has potentially adverse side effects on program material, this ability to precisely adjust only specific frequencies has the advantage of minimizing the amount of EQ applied to program material. It also allows the creation of specific effects such as sharply narrowed EQ curves (notches) which are useful for feedback control or removal of specific noise artifacts. ===== PAGE 130 ===== EQ Tips for tweakers only, About Q, QBandwidth Lexicon MPX G2 MPX G2 Parametric EQ: Gain Fc=1000Hz Q=1.0 Gain=+24dB, +18dB, +12dB, +6dB, 0dB, -6dB, -18dB, -24dB, -36dB, -72dB MPX G2 Parametric EQ: Q Fc=1000Hz Gain=±18dB Q=0.1, 0.3, 0.5, 1.0, 2.0, 4.0, 6.0, 8.0, 10.0 MPX G2 Parametric EQ: Shelf Fc=1000Hz Gain=+10dB Q=0.1, 0.2, 0.5, 1.0, 2.0, 4.0, 10.0 EQ Tips (for tweakers only) About “Q” Q is a measure of the sharpness of an EQ curve. The larger the Q value, the sharper the curve. In some situations it is convenient to think of Q in terms of bandwidth in octaves. Some examples: 0.7approximately 2 octaves 1.4approximately 1 octave 2.9approximately 1/2 octave 4.3approximately 1/3 octave 5.8approximately 1/4 octave 7.2approximately 1/5 octave 8.7approximately 1/6 octave 10.0approximately 1/7 octave There are mathematical limits to how small the Q value can be in MPX G2 EQ effects. For any given frequency, the Q must be greater or equal to the frequency divided by 10,000. For example if the frequency is 5kHz, the actual Q value won’t go below 0.5. (The MPX G2 will allow you to dial in lower values, but the actual Q will not go below the mathematical limit.) For most shelving applications, Q should be set very low (Around 0.2). As you increase the Q, the filter becomes peaky, but a dip also develops just outside the passband. For many applications, a bandpass or band cut filter with a moderate Q and a low (or high) center freq will prove sonically superior to the shelving filter. Making a Low Pass Filter To make a two-pole low-pass filter, start with a high shelf, and set Gain to -72 (effectively off). This creates a low pass filter with a corner frequency at Fc. A Q of 0.7 makes a flat passband. Higher Q settings produce a peak at Fc, and lower Q settings produce a droop. ===== PAGE 131 ===== Band M, 2-Band M, 3-Band M and 4-Band M Lexicon MPX G2 instruction 1-Band (M), 2-Band (M), 3-Band (M) and 4-Band (M) The 1-Band (M) effect provides asingle band of double-precision parametric EQ. 2-Band (M), 3-Band (M) and 4Band (M) have two, three and four bands, respectively, of double-precision parametric EQ. Each effect has adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).

![Gate signal flow](/effects/gate.png)

This effect uses **50 of 190** processing steps.
