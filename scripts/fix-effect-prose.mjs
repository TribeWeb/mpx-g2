/**
 * Replace garbled OCR scrapes in content/effects/*.md summary + body prose
 * with cleaned text from the searchable MPX G2 user guide.
 *
 * Preserves frontmatter (except summary), signal-flow images, and trailing
 * DSP-step notes.
 *
 * Usage: node scripts/fix-effect-prose.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const effectsDir = join(root, 'content', 'effects')

/** Cleaned manual prose keyed by content slug (filename without .md). */
const DESCRIPTIONS = {
  tone:
    'Tone is a set of analog Tone controls which can be used as a clean-boost stomp box in front of your amp, or as a simple clean preamp when the MPX G2 is used without an external guitar amp. When used as a stomp box, Tone can radically alter the sonic character of your guitar amp, providing an alternative channel. When used without an external amp, Tone can sculpt some dramatic clean sounds. Try boosting Lo and Hi while cutting Mid to produce acoustic-like timbres from a single coil neck pickup.',

  crunch:
    'Crunch is an overdrive effect with separate drive controls for low, mid and high frequencies. Designed to be used like a stomp box (in front of your amp), Crunch works well in combination with other pre-gain effects like wah, phase shift, compression, and octave fuzz.',

  'tube-screamer':
    'Screamer is an analog model of a vintage Tube Screamer overdrive (powered by a fresh carbon-zinc battery). Care has been taken to make the behavior of this effect accurate both sonically and electronically. The ranges of Drive and Tone match those of the vintage effect and it will push your amp into high gear just like the original. We’ve also added Lo, Mid and Hi tone controls. For truly authentic sounds, leave them set flat (zero), but feel free to dial in some additional colors unobtainable with the original.',

  overdrive:
    'A more aggressive overdrive effect than Screamer, Overdrive is designed to be used as a stomp box — to push a clean amp channel into bluesy overdrive, or to take a high-gain amp channel over the top. Lo, Mid and Hi controls provide a considerable amount of gain. InLvl determines overall Drive sensitivity. When cranked up, Lo, Mid and Hi behave like individual distortion controls. When throttled back to -15dB or so, Lo, Mid and Hi behave more like traditional EQ controls. LoCut rolls off low frequencies before they hit the overdrive circuit (and your amp). This can be very useful if your stage sound is muddy and you need to cut through the band. The Feel parameter is a unique feature of Lexicon’s Dynamic Gain analog algorithms. In this effect, it mimics the subtle changes in distortion dynamics caused by different power supplies. When set to 0, the amount of compression/distortion produced during the attack of notes is relatively constant. As this value is increased, you’ll notice a difference in the feel of the attack when using overdrive and moderate amounts of distortion. The first attack of a phrase of rapid picking is a bit cleaner and has more bite than those that follow. This mimics the different “power sag” envelopes characteristic of different stomp box power sources. 0 corresponds to the uniform response of an AC adapter (9V). Values 1-32 approximate the increasingly dynamic responses produced by various batteries — from a fresh alkaline battery (9.3V), to a fresh carbon-zinc battery (9.8V). Values above 32 mimic tube-rectified power supplies. Tone provides high frequency roll-off after the overdrive stage. Level should be used to compensate for gain added by InLvl, the Tone controls and Drive.',

  distortion:
    'Need more than just Overdrive? Distortion provides more than 100dB of analog gain — and it has an additional set of Bass and Treble controls following the distortion stage. Although not based on any particular pedal, this effect has a sonic kinship with several classic distortion pedals and fuzz boxes.',

  preamp:
    'Unlike the other MPX G2 Gain effects, Preamp was not designed to function as a stomp box to use in front of your amplifier. It is a fully featured, programmable analog guitar preamp. Use Preamp for stand-alone applications (direct recording without an amp, or to drive a power amp and cabs). When using Preamp for direct recording, be sure to turn on the Speaker Simulator (Edit Select, Speaker Sim, Simulator: On). InLvl (Input Level) determines the amount of clean headroom the preamp has. The setting of this single control will have a great impact on the overall behavior and sound of the preamp. At higher values, the preamp will distort very easily — for example, with a Mid tone control boost of only 5dB. At lower levels, the tone controls behave more like EQ controls — making low, mid and high guitar frequencies louder (or softer) without adding distortion. As a general guideline, set InLvl to approximately -15dB when working on clean or crunch sounds. Use higher values when you’re going for more over-the-top distortion. Be aware that this preamp can produce well over 120dB of analog gain.',

  splitpreamp:
    'SplitPreamp is the same analog effect as Preamp, except that it has a built-in parallel path that feeds the direct, clean guitar to the MPX G2’s post-gain section. This allows you to create programs that have preamp and right channel direct guitar sounds simultaneously. Unlike the other MPX G2 Gain effects, Preamp was not designed to function as a stomp box to use in front of your amplifier — it is a fully featured, programmable analog guitar preamp for stand-alone / DI applications.',

  'detune-m':
    'Detune effects are useful for thickening up sounds by adding delayed/pitch-shifted versions of the original source. They can be particularly effective when used to simulate double-tracking. They are also great alternatives to chorus effects as a detuner can add the richness of a chorus effect without the audible sweep caused by the chorus rate. Detuners are also traditionally used to turn a six-string guitar into a twelve-string, or an in-tune piano into a honky-tonk. The MPX G2 detuners are optimized to provide very fine amounts of pitch shift. Detune (M) is a single-channel detuner that creates a pair of signals, pitch-shifted up and down from the input. The pair is always mixed together, and presented equally to the outputs. As the detune effects use up relatively few processing resources, they can be combined with reverb and many other effects. When creating effects that don’t require pitch shifting by large intervals (semitones) the detuners are the most efficient choice.',

  'detune-s':
    'Detune effects are useful for thickening up sounds by adding delayed/pitch-shifted versions of the original source. They can be particularly effective when used to simulate double-tracking, and are great alternatives to chorus effects without the audible sweep caused by chorus rate. Detune (S) creates a pair of signals, pitch-shifted up and down from the inputs. The left and right channels are separate. As the detune effects use relatively few processing resources, they can be combined with reverb and many other effects.',

  'detune-d':
    'Detune effects are useful for thickening up sounds by adding delayed/pitch-shifted versions of the original source. Detune (D) sums left and right inputs to mono, then creates two pairs of signals, pitch-shifted up and down from the inputs by Tune1 and Tune 2. The first pair goes out the left, the second pair out the right. As the detune effects use relatively few processing resources, they can be combined with reverb and many other effects. When creating effects that don’t require pitch shifting by large intervals (semitones) the detuners are the most efficient choice.',

  'shift-m':
    'The pitch shift effects are designed to provide both fine (1 cent resolution) and coarse (semitone resolution) pitch shift effects. Use them to create harmonizations, detuning, or special effects. The Tune parameters can be glided smoothly across their entire range. Try controlling Tune with a foot pedal or MIDI controller for “whammy-bar” and pedal steel effects. Shift (M) is a single-channel pitch shifter.',

  'shift-s':
    'The pitch shift effects are designed to provide both fine (1 cent resolution) and coarse (semitone resolution) pitch shift effects. Use them to create harmonizations, detuning, or special effects. The Tune parameters can be glided smoothly across their entire range. Shift (S) is a stereo version of Shift (M) with synchronized crossfades.',

  'shift-d':
    'The pitch shift effects are designed to provide both fine (1 cent resolution) and coarse (semitone resolution) pitch shift effects. Use them to create harmonizations, detuning, or special effects. The Tune parameters can be glided smoothly across their entire range. Try controlling Tune with a foot pedal or MIDI controller for “whammy-bar” and pedal steel effects. Shift (D) provides mono input to two independent pitch shifters controlled by Tune1 and Tune 2. The first shifter goes to the left output, the second to the right output. These effects use more processing resources than the detuners. Shift (S) and Shift (D) are among the largest effects in the MPX G2.',

  diatonichmy:
    'DiatonicHmy is an “intelligent” pitch shifter. The effect will automatically shift the pitch of incoming monophonic notes to the correct harmony note in the selected key and scale. You select the key and scale — (E major, A minor, etc.) and harmony interval (up a 3rd, down a 6th, etc.). When an out-of-key note is detected, it will be shifted by the same interval amount as the last in-key note. Note the pitch detector can use either the Guitar Input or Return Inputs as the source for pitch detection. The default is Guitar Input, which allows the detector to analyze a clean, unprocessed guitar signal — even if you want to shift the guitar audio after it has been processed by one or more effects.',

  panner:
    'The Panner effect has the left input panned to outputs with Pan 1, right input with Pan 2. Because all the parameters of this effect are interpolated, this can be used to add interpolated outputs to effects which have non-interpolated output levels.',

  'auto-pan':
    'Auto Pan is a version of Panner with the pans controlled by a local LFO. The left input is panned by the LFO’s sine output. The right input is panned by the cosine output, which is offset by 0°, 90°, 180° or 270° by the Phase parameter.',

  'tremolo-m':
    'In Tremolo (M), the left and right inputs are mixed together, then a local sinewave generator modulates the volume. These are the smallest mono and stereo effects with interpolated output level controls. You can use them (with the tremolo turned off) to add smooth output level control to a stereo effect that doesn’t have output level interpolation.',

  'tremolo-s':
    'In Tremolo (S) the left input is modulated by a local sinewave generator before going to the left output. The right input is modulated by sin, cos, -sin, or -cos, depending on the Phase parameter. These are the smallest mono and stereo effects with interpolated output level controls. You can use them (with the tremolo turned off) to add smooth output level control to a stereo effect that doesn’t have output level interpolation. NOTE: Mix is interpolated in Tremolo (S) only.',

  univybe:
    'Univybe is a recreation of a vintage Uni-Vibe. The Uni-Vibe, originally intended for use with electronic organs (as a replacement for rotating speakers), became an essential effect for many guitarists. Its dreamy swirling sound has become a defining element of many Hendrix live and studio recordings (also used by Robin Trower, David Gilmour, Audley Freed and many others). Our version is modeled on a vintage Uni-Vibe set to “chorus” with depth turned up all the way. The Rate control matches the range, and slightly wobbly shape of the original speed control. To get the classic effect, put a slow UniVybe in front of your guitar amp, set the amp for a moderate amount of gain and play the opening chords to “Little Wing”. You’ll find that the effect is more pronounced when you play clean and that it fades into the background as your tone gets more distorted.',

  'custom-vybe':
    'This custom version of Univybe has additional parameters with extended ranges. The Rate can be set to any speed from 0-50Hz. It can also be set in cycles/beat, allowing you to tap in the sweep rate. When Depth is set to 100%, the effect is about twice as pronounced as the original. PW allows adjustment of the sweep waveshape between sine (50%), sawtooth (0%) and ramp (100%).',

  phaser:
    'The Phaser effect is a simulated Mutron phaser.',

  orangephase:
    'The sound and rate of this phase shifter are modeled on a vintage MXR Phase 90 stomp box — a signature component of the early Van Halen sound.',

  'red-comp':
    'Red Comp is our take on the classic Dyna Comp stomp box. It is a simple compressor with fixed ratio, threshold and time constants (each matched to the original). The amount of compression is set with the Sense control. The higher the value of Sense, the more the signal is “squashed.” Red Comp has lots of uses. It is generally used in front of the amp. With clean sounds, it can add extra attack and sustain. Use it in front of an overdriven preamp to keep notes in the sweet spot without spilling over into too much distortion when you play hard.',

  'blue-comp':
    'Blue Comp is a recreation of another popular compression pedal, the CS-3. Like the CS-3 it has variable Sustain (Sense), Threshold (Thrsh), Gain, Attack (ATime) and Release (RTime) parameters. These versatile controls make it flexible enough to be used with many different styles and any type of guitar (including acoustic and bass). Blue Comp is useful in front of an amp or in the effects loop. Follow a Chorus or Detune effect with Blue Comp to produce a “chime-like” effect a la Andy Summers with Police. In fact, you can use two at once. For example, connect two in series in front of an overdrive for super smooth sustain that’s perfect for slide playing.',

  digidrive1:
    'DigiDrive1 and DigiDrive2 combine digital distortion with 3-band tone controls. In DigiDrive1, the tone controls are in front of the distortion. The distortion produced by these effects is not meant to mimic analog distortion, but to provide an alternative sound. (Think “digital fuzz box.”) The next time you’re looking for an in-your-face fuzz effect, pump one of these into your amp. You might be surprised at what comes out.',

  digidrive2:
    'DigiDrive1 and DigiDrive2 combine digital distortion with 3-band tone controls. In DigiDrive2, the tone controls follow the distortion. The distortion produced by these effects is not meant to mimic analog distortion, but to provide an alternative sound. (Think “digital fuzz box.”) The next time you’re looking for an in-your-face fuzz effect, pump one of these into your amp. You might be surprised at what comes out.',

  octabuzz:
    'OctaBuzz is a very simple effect that mimics the “full wave rectifier” circuit used in many octave fuzz pedals, like the Octavia. Another signature Hendrix effect, (Purple Haze, Who Knows, etc.) it is not a pretty sound, and requires a little effort to make it sing. Play single notes above the 12th fret to get a screaming tone an octave higher. Single bass notes can produce ring modulator-like sounds. Double-stops and chords produce weird electronic hash. Like the original, the effect is quite dynamic — you can get a wide variety of sounds just by changing your pick attack. In general, the effect is more prominent with lighter playing. OctaBuzz is most effective in front of other distortion effects and the guitar amp. In many of the recorded classic octave fuzz performances, the distortion controls of the stomp box were turned down. (Distortion was added by the guitar amp, or by an additional distortion pedal after the octave fuzz pedal.) Try inserting the Screamer or Distortion gain effects between OctaBuzz and your amp to get the full bore sound. Hendrix sometimes put a wah between the octave fuzz and the distortion — you can too.',

  sweepfilter:
    'SweepFilter simulates a Moog-type resonant low-pass filter. Cutoff frequency and output level are interpolated, and can be swept. The performance of this filter is high enough that it can be used as a lowpass filter for hiss reduction. The parameters were designed to allow synthesizer-like control of the filter. For example: Use FC like the manual “cutoff” knob of an analog synth – set it to the filter frequency desired when all modulation sources are at minimum. Use Mod as the patch destination for as many as five modulation sources (LFO, Rand, Env, LastNote, etc.). Use Scale as a master depth control for all modulation sources.',

  '1-band-m':
    'The 1-Band (M) effect provides a single band of double-precision parametric EQ with adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).',

  '2-band-m':
    '2-Band (M) provides two bands of double-precision parametric EQ. Each band has adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).',

  '3-band-m':
    '3-Band (M) provides three bands of double-precision parametric EQ. Each band has adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).',

  '4-band-m':
    '4-Band (M) provides four bands of double-precision parametric EQ. Each band has adjustable center frequency, Q, boost/cut and filter type (low shelf, band, high shelf).',

  '1-band-s':
    '1-Band (S) has two bands of double-precision parametric EQ, one on each channel. The two channels share the filter controls. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable.',

  '2-band-s':
    '2-Band (S) has four bands of double-precision parametric EQ, two on each channel. The two channels share the filter controls. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable.',

  '1-band-d':
    '1-Band (D) has two bands of double-precision parametric EQ, one on each channel. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable independently per channel.',

  '2-band-d':
    '2-Band (D) has four bands of double-precision parametric EQ, two on each channel. Center frequency, Q, boost/cut and filter type (low shelf, band, high shelf) are adjustable independently per channel.',

  'wah-1':
    'Wah is a mono wah filter modeled after two classic wah-wah pedals. With Sweep selected, press Options to select Model C (CryBaby) or Model V (Vox). These models capture both the characteristic signature and nonlinear pedal response of the original pedals. Bass allows you to change the wah from a band-pass type to a low-pass type effect by progressively adding more low end. (Try it with bass and keyboards.) Resp controls how quickly the wah responds to changes of Sweep. (100 is very fast, 0 is very, very slow). To make a Mutron-like envelope filter, patch Sweep to Env. Use Resp to control the effect’s responsiveness to changing dynamics. To make an Auto Wah effect, try patching Sweep to an LFO sine or triangle wave.',

  'wah-1-2':
    'Wah is a mono wah filter modeled after two classic wah-wah pedals. With Sweep selected, press Options to select Model C (CryBaby) or Model V (Vox). These models capture both the characteristic signature and nonlinear pedal response of the original pedals. Bass allows you to change the wah from a band-pass type to a low-pass type effect by progressively adding more low end. Resp controls how quickly the wah responds to changes of Sweep.',

  'wah-2':
    'Wah 2 uses the same vintage wahs as Wah 1 with a built-in compressor following the wah. (All of the compression parameters are fixed and, therefore, invisible.) The compressor smooths out some of the peakiness that can occur in different portions of the sweep, while at the same time adding some sustain and punch to the overall effect. The end result is a wah that cuts through when you kick it on.',

  'pedal-wah-1':
    'PedalWah1 is identical to Wah 1 except the Sweep parameter is hard-wired to the Foot Pedal input on the MPX G2 rear panel. If you are using the MPX R1 MIDI Remote Controller, this effect will be automatically connected to the control pedal — you don’t have to make any patches — just load the effect and start playing. Wah is modeled after two classic wah-wah pedals (CryBaby and Vox).',

  'pedal-wah-2':
    'PedalWah2 is identical to Wah 2 except the Sweep parameter is hard-wired to the Foot Pedal input on the MPX G2 rear panel. If you are using the MPX R1 MIDI Remote Controller, this effect will be automatically connected to the control pedal — you don’t have to make any patches — just load the effect and start playing. Wah 2 includes a built-in compressor after the wah for a punchier, more consistent sweep.',

  'volume-m':
    'The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range. You can use them for dynamic input or output control, EQ input trim (helpful when adding large amounts of gain with an EQ effect), stereo to mono mixer, cross fade controls, volume pedal, etc. In Volume (M) the left and right inputs are mixed together, then sent to both outputs through a volume control.',

  'volume-s':
    'The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range. You can use them for dynamic input or output control, EQ input trim, stereo to mono mixer, cross fade controls, volume pedal, etc. In Volume (S) the left and right inputs are sent through a ganged pair of volume controls.',

  'volume-d':
    'The Volume effects can be placed in front of, or behind, other effect blocks to provide smooth level control through a 95dB range. You can use them for dynamic input or output control, EQ input trim, stereo to mono mixer, cross fade controls, volume pedal, etc. In Volume (D) the left and right inputs are sent through independent volume controls.',

  'pedal-vol':
    'PedalVol is the same as Volume (S), except the Vol parameter is hardwired to the Foot Pedal input on the MPX G2. When using the MPX R1 MIDI Remote Controller, this parameter is automatically connected to the R1’s built-in pedal. This means that no patching is required to create a volume pedal effect.',

  extpedalvol:
    'ExtPedalVol is hardwired to the External Pedal input of the MPX R1, allowing you to easily create programs with both a Volume and Wah pedal available simultaneously. It is otherwise the same as Volume (S).',

  'test-tone':
    'Test Tone is an audio sine wave generator with its output quantized to correspond with the pitches of a chromatic scale (A = 440 Hz) over a nine-and-one-half octave range. It is provided primarily as a convenient way of generating test tones and tuning references. Bal controls the relative level of left and right output attenuation. When Bal=-50, the left output has no attenuation, and the right output is fully attenuated. When Bal=0, neither output is attenuated. When Bal=+50, the left output is fully attenuated and the right output has no attenuation. Level and Bal can be patched to a global LFO to get tone bursts, etc. Pitch accuracy is better than 1/4 cent.',

  click:
    'This effect is a simple metronome which is automatically connected to Tap. Press Tap twice to set the tempo. This effect can be used as an input source for auditioning reverbs and delays. It is also a convenient timing reference for the JamMan effect, where the click is automatically muted until the loop is tapped.',

  'stereo-chorus':
    'This is a true stereo, multi-voice chorus. Use it to enrich guitars, keyboards, etc. It has Dual 2-tap modulators with cross resonance. The Pulse Width controls allow independent adjustment of the waveshape. (At 0, the sinewave becomes a sawtooth with a fast rise and slow fall.) The Depth controls provide adjustment of the chorus from 0-100%.',

  'flanger-m':
    'Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to slow down first one machine, then the other. The result was a series of changing phase cancellations and reinforcements, providing a comb filter and a characteristic swishing, tunneling and fading sound. In the MPX G2, the Flanger effects are two-tap delays. The first tap is fixed, and the second sweeps past it. Mixing the two taps together creates a flanging effect. In Flanger (M), the moving tap is swept with an internal LFO.',

  'flange24-m':
    'Flanger24 (M) is a higher precision (32-bit) flanger with identical parameters to Flanger (M). Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to slow down first one machine, then the other. In the MPX G2, the Flanger effects are two-tap delays. The first tap is fixed, and the second sweeps past it. Mixing the two taps together creates a flanging effect.',

  'flanger-s':
    'Originally, flanging effects were created by simultaneously playing two identical programs on two tape recorders, then using hand pressure against the flange of the tape reels to slow down first one machine, then the other. In the stereo version, Flanger (S), the delays are modulated by two sine waves from the same LFO. The phase relation between the two waves is set by the Phase parameter.',

  'rotary-cab':
    'This effect simulates a Leslie speaker with one pair of stereo mics on the rotating low-frequency drum, and another pair on the rotating high-frequency horn. Bal sets the relative mix of Drum and Horn mics. Width controls the stereo spread of both pairs of mics. Rate and Depth 1 control the speed and depth of the rotating low-frequency drum. Rate 2 and Depth 2 control the speed and depth of the rotating high-frequency horn. The preset, Rotary Cab, is set up so that A/B switches the speed from fast to slow. Different A and B rates are used to simulate the inertia of the mechanical system.',

  aerosol:
    'Aerosol is a true stereo chorus/flanger with dual rate, depth and resonance controls. It can produce very deep resonant flange sweeps, subtle multi-vibrato, stereo image enhancement and a wide variety of other chorus and flanger-like effects. A pair of single-tap modulated delays is each modulated by a separate LFO. Pulse Width allows independent adjustment of left and right LFOs from full left to full right skew. (At 0, the sinewave becomes a sawtooth with a fast rise and slow fall.) Depth controls provide adjustment of modulated depth from 0-100%.',

  orbits:
    'Orbits processes the left and right inputs independently with a pair of modulated delay/auto panners. This effect can be used to create spatial effects via a combination of Doppler and level panning. Pulse Width controls allow independent adjustment of left and right LFOs from full left to full right skew. (At 0, the sinewave becomes a sawtooth with a fast rise and slow fall.) Depth controls provide adjustment of Mod depth.',

  centrifuge1:
    'The Centrifuge effects have a pair of modulated left and right delays routed into a single auto panner. In these effects, mod and pan rate and depth (Rate1, Depth1) are modulated by an additional set of rate and depth controls (Rate2, Depth2). These can create unique chorus and flanger effects with complex, undulating modulation rhythms.',

  centrifuge2:
    'The Centrifuge effects have a pair of modulated left and right delays routed into a single auto panner. In these effects, mod and pan rate and depth (Rate1, Depth1) are modulated by an additional set of rate and depth controls (Rate2, Depth2). These can create unique chorus and flanger effects with complex, undulating modulation rhythms.',

  'comb-1':
    'The Comb effects work by combining the original input signal with a micro-delayed version. The tiny delay difference between the two signals causes certain frequencies to be cancelled or reinforced when the two are combined. The result is a highly colored version of the original source. The coloration can be “tuned” with the Comb (Comb 1) or Depth (Comb 2). Low and High pass filters are included so you can limit the frequency band in which the combing occurs. Comb 1 is a mono comb with single-pole low and high cut filters. There are two ways to get the comb effect. The first is to set mix to 100% (wet), then set Notch to 50 or -50. This essentially creates a band-limited signal (limited by LoCut and HiCut) which is then run through a comb. You can also set mix=50%, Lvl=0dB, and Notch=+100. In this case, the band-limiter is part of the comb. In this version, the effect produces shallower notch depths outside the band limit region.',

  'comb-2':
    'The Comb effects work by combining the original input signal with a micro-delayed version. The tiny delay difference between the two signals causes certain frequencies to be cancelled or reinforced when the two are combined. The result is a highly colored version of the original source. Comb 2 is a dual mono comb with a second tap, controlled by a single LFO with adjustable phase. The phase relation between the two waves can be adjusted between 0-270°. Low and High pass filters are included so you can limit the frequency band in which the combing occurs.',

  'delay-m':
    'Delay (M) is a simple mono delay with feedback. All MPX G2 Delay effects allow you to choose how delay times will be displayed (ms, feet, meters, echoes/beat, or Tap ms). Another shared feature is Fbk Insert, which allows you to route the outputs of another effect block into the delay’s feedback loop.',

  'delay-s':
    'Delay (S) is a simple stereo delay with feedback. All MPX G2 Delay effects allow you to choose how delay times will be displayed (ms, feet, meters, echoes/beat, or Tap ms). Another shared feature is Fbk Insert, which allows you to route the outputs of another effect block into the delay’s feedback loop.',

  'delay-d':
    'Delay (D) is a dual delay with feedback, crossfeedback, independent output level adjusts, and panners. All MPX G2 Delay effects allow you to choose how delay times will be displayed (ms, feet, meters, echoes/beat, or Tap ms). Another shared feature is Fbk Insert, which allows you to route the outputs of another effect block into the delay’s feedback loop.',

  'echo-m':
    'The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1-pole low-pass filters. Damp provides control over the cutoff frequency of the filter. (Increasing Damp lowers cutoff frequency.) Echo (M) is the mono version.',

  'echo-s':
    'The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1-pole low-pass filters. Damp provides control over the cutoff frequency of the filter. (Increasing Damp lowers cutoff frequency.) Echo (S) is the stereo version.',

  'echo-d':
    'The Echo effects are similar to the Delay effects, except the feedback inputs are sent through 1-pole low-pass filters. Damp provides control over the cutoff frequency of the filter. (Increasing Damp lowers cutoff frequency.) Echo (D) is the dual version with independent left/right paths.',

  looper:
    'In the Looper effect InMix controls the ratio of input to feedback into the delay. This parameter is ducked by the input level, so that louder signals route the input signal into the delay, and softer signals route the feedback signal into the delay. When Sense is at 0, no ducking will occur. At 100 the input will be ducked by even the lowest input levels.',

  jamman:
    'JamMan is an automatic phrase sampler that incorporates many of the features of the original Lexicon JamMan. To create a simple loop, press Tap once when you want to start recording. (You can record up to 20 seconds — while recording, a meter showing the remaining memory is displayed automatically.) Press Tap a second time to stop recording and begin playback of the loop. The JamMan effect can synchronize to an external MIDI Clock as well as to the MPX G2 internal clock. This makes it possible to synchronize your loops with any MIDI drum machine or sequencer. To synchronize the JamMan loop with effects that use rates set for cycles/beat, set the Tempo Beat Value (in the Edit menu) to the number of beats you want to loop. The JamMan effect has several special parameters that allow you to stop, restart and modify the loop in real time: Clear, Layer, Replc, Delay, and Mute. Each of these has only two values, On or Off — so they can easily be controlled via external footswitches or MIDI. We’ve created some example presets to demonstrate how these features work. See Amp Input & FX Loop programs 95-99, Amp Input Only programs 145-149 and Stand Alone programs 245-248.',

  ducker:
    'Similar to Looper, with the wet output getting quieter as the input gets louder. When Sense is at 0, no ducking will occur. At 100 the input will be ducked by even the lowest input levels.',

  chamber:
    'The Chamber effect produces an even, relatively dimensionless reverberation, with little change in color as the sound decays. The initial diffusion is similar to the Hall effect, but the sense of space and size is much less obvious. This characteristic, along with the low color of the decay tail makes Chamber useful on a wide range of material. It is especially useful on spoken voice, giving a noticeable increase in loudness with very low color.',

  hall:
    'The Hall effect emulates a real concert hall. The reverberation is very clean, and designed to remain behind the direct sound — adding ambience, but leaving the source unchanged. This effect has a relatively low initial density which builds up gradually over time.',

  plate:
    'Plate effects were originally generated by large, thin sheets of metal suspended upright under tension on springs. Transducers attached to the plate would transmit a signal which would, in turn, vibrate the plate. Because the plate provided a denser medium than air, sounds broadcast through it would seem to be occurring in a large open space. The Plate effect synthesizes the sound of metal plates, with high initial diffusion and a relatively bright, colored sound. This effect is designed to be heard as part of the music, mellowing and thickening the initial sound. It is a popular choice for enhancing popular music, particularly percussion.',

  ambience:
    'The Ambience effect gives warmth, spaciousness and depth to a performance without coloring the direct sound, and is commonly used to add a room sound to recorded music or speech. The effect simulates reflections from room surfaces, with random reflections, a gradual decay of overall level, and a gradual narrowing of the bandwidth. DTime settings can be varied to create larger or smaller spaces while variations of D Lvl and Rt HC correspond to the hardness of the imaginary reflecting surfaces and the effects of air absorption on the high end of the sonic spectrum.',

  gate:
    'Gate is a reverb effect with a fairly constant sound and no decay until the reverb is cut off abruptly. This effect works well on percussion — particularly on snare and toms, but be sure to experiment with other sound sources as well. The Mix, P Dly and Rt HC parameters are very important in this effect, allowing you to create anything from an enhancement or subtle thickening, to a solid wall of reverb.',

  'fc-splitter':
    'The Fc Splitter effect splits a mono input into a low-passed output on the left channel and a high-passed output on the right, with independent control of the corner frequencies of both filters. If the corner frequencies are the same, and the balance is set to 0, the frequency response will be flat when the two outputs are summed. Bal controls the relative level of left and right outputs.',

  crossover:
    'The Crossover effect is similar to Fc Splitter, but with only one crossover frequency, shared by low and high. In this effect, Level and Bal are not interpolated.'
}

function yamlQuote(s) {
  // Prefer double-quoted YAML with escapes for control / quotes
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
  return `"${escaped}"`
}

function firstSentenceSummary(prose, maxLen = 160) {
  const m = prose.match(/^(.+?[.!?])(?:\s|$)/)
  let s = m ? m[1] : prose
  if (s.length > maxLen) {
    const cut = s.slice(0, maxLen - 1)
    const sp = cut.lastIndexOf(' ')
    s = (sp > 80 ? cut.slice(0, sp) : cut).trimEnd() + '…'
  }
  return s
}

function rebuildBody(existingBody, prose) {
  const imgMatch = existingBody.match(/!\[[^\]]*\]\([^)]+\)/)
  const img = imgMatch ? imgMatch[0] : null

  // Keep trailing DSP / resource notes if present
  const notePatterns = [
    /Gain\/analog effects like this[\s\S]*$/,
    /Gain effects use dedicated[\s\S]*$/,
    /This effect uses \*\*\d+ of 190\*\*[\s\S]*$/,
    /NO PROCESSING STEPS USED[\s\S]*$/
  ]
  let trailing = ''
  for (const pat of notePatterns) {
    const m = existingBody.match(pat)
    if (m && existingBody.indexOf(m[0]) > (imgMatch?.index ?? 0)) {
      // Prefer short dedicated notes after the image
      const afterImg = imgMatch
        ? existingBody.slice(imgMatch.index + imgMatch[0].length)
        : existingBody
      const nm = afterImg.match(pat)
      if (nm) {
        trailing = nm[0].trim()
        break
      }
    }
  }
  // Also catch "This effect uses **N of 190**..." that may be the only trailing content
  if (!trailing) {
    const m = existingBody.match(/This effect uses \*\*\d+ of 190\*\*[^\n]*/)
    if (m) trailing = m[0].trim()
    else {
      const m2 = existingBody.match(/Gain\/analog effects like this[^\n]*(?:\n[^\n]+)*/)
      if (m2) trailing = m2[0].trim()
      else {
        const m3 = existingBody.match(/Gain effects use dedicated[^\n]*(?:\n[^\n]+)*/)
        if (m3) trailing = m3[0].trim()
      }
    }
  }

  const parts = [prose]
  if (img) parts.push('', img)
  if (trailing) parts.push('', trailing)
  return parts.join('\n') + '\n'
}

function updateFile(raw, slug) {
  const prose = DESCRIPTIONS[slug]
  if (!prose) return { changed: false, reason: 'no-desc' }

  if (!raw.startsWith('---')) return { changed: false, reason: 'no-fm' }
  const end = raw.indexOf('\n---', 3)
  if (end < 0) return { changed: false, reason: 'bad-fm' }
  const fm = raw.slice(0, end + 4) // includes closing ---
  const body = raw.slice(end + 4).replace(/^\n/, '')

  const summary = firstSentenceSummary(prose)
  let newFm = fm
  if (/^summary:\s*/m.test(fm)) {
    newFm = fm.replace(/^summary:\s*.*$/m, `summary: ${yamlQuote(summary)}`)
  } else {
    // insert after modelName / color block — after first line of name
    newFm = fm.replace(
      /^(modelName:.*\n)/m,
      `$1summary: ${yamlQuote(summary)}\n`
    )
  }

  const newBody = rebuildBody(body, prose)
  const next = `${newFm}\n${newBody}`
  return { changed: next !== raw, next, reason: 'updated' }
}

const files = (await readdir(effectsDir)).filter(f => f.endsWith('.md') && f !== 'all-params.md')
let updated = 0
let skipped = 0
for (const file of files.sort()) {
  const slug = file.replace(/\.md$/, '')
  const path = join(effectsDir, file)
  const raw = await readFile(path, 'utf8')
  const result = updateFile(raw, slug)
  if (!result.changed) {
    if (result.reason === 'no-desc') {
      console.log(`skip (no desc): ${file}`)
      skipped++
    } else {
      console.log(`unchanged: ${file} (${result.reason})`)
    }
    continue
  }
  await writeFile(path, result.next, 'utf8')
  updated++
  console.log(`updated: ${file}`)
}
console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`)
