/**
 * Fill TODO (and clearly wrong) param descriptions in content/effects/*.md
 * from the MPX G2 searchable user guide / sibling effects.
 *
 * Also fixes OCR typo "processsed" → "processed".
 *
 * Usage: node scripts/fix-param-descriptions.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const effectsDir = join(root, 'content', 'effects')

/** Default descriptions by param id (manual wording, cleaned). */
const BY_ID = {
  mix: 'Dry/Wet ratio',
  mix2: 'Dry/Wet ratio',
  level: 'Amount of effect in the processed signal',
  vol: 'Volume level',
  voll: 'Left volume level',
  volr: 'Right volume level',

  // Gain / drive family
  lo: 'Low frequency boost/cut',
  mid: 'Mid frequency boost/cut',
  hi: 'High frequency boost',
  inlvl: 'Input level (Drive sensitivity)',
  locut: 'Pre-Drive low frequency roll off',
  hicut: 'High frequency roll-off',
  feel: 'Overdrive dynamics',
  drive: 'Amount of overdrive',
  tone: 'High frequency roll-off',
  bass: 'Post-Drive bass control',
  trebl: 'Post-Drive treble control',

  // DigiDrive
  low: 'Pre-Drive low frequency cut/boost',
  high: 'Pre-Drive high frequency cut/boost',

  // Wah
  sweep: 'Wah center frequency',
  resp: 'Responsiveness to changes in sweep',

  // Pitch
  tune: 'Pitch shift',
  tune1: 'Pitch shift',
  tune2: 'Pitch shift',
  glide: 'Coarse, fine resolution of pitch shift',
  pdly: 'Amount of delay before the onset of the effect',
  scale: 'Type of scale',
  key: 'Pitch root of scale',
  interval: 'Harmony interval',
  src: 'Selects the audio input used for pitch analysis',

  // Modulation common
  rate: 'Rate or period ratio',
  rate1: 'Rate or period ratio',
  rate2: 'Rate or period ratio',
  pw: 'Pulse width',
  pw1: 'Pulse width',
  pw2: 'Pulse width',
  depth: 'Depth',
  dpth1: 'Depth',
  dpth2: 'Depth',
  phase: 'Phase difference',
  res: 'Resonance',
  res1: 'Resonance',
  res2: 'Resonance',
  sync1: 'Phase difference between left LFO Mod and Pan',
  sync2: 'Phase difference between right LFO Mod and Pan',
  blend: 'Amount of fixed tape mixed with moving tape',
  width: 'Panning width',
  bal: 'Relative level of left and right outputs',
  pan: 'Output panner',
  pan1: 'Left input panner',
  pan2: 'Right input panner',

  // Comb
  comb: 'A microdelay which positions the notch',
  notch: 'Increases the audibility of the notch',

  // Delay / echo
  time: 'Delay time',
  time1: 'Left delay time',
  time2: 'Right delay time',
  fbk: 'Feedback level',
  fbk1: 'Left feedback level',
  fbk2: 'Right feedback level',
  xfbk1: 'Level from left feedback source to right delay',
  xfbk2: 'Level from right feedback source to left delay',
  clear: 'When On, mutes and resets the delay',
  damp: 'Cutoff frequency of low-pass filter in feedback path',
  inmix: 'Ratio of input to feedback going into the delay',
  sense: 'Sensitivity',
  atk: 'Envelope attack time constant',
  rls: 'Envelope release time constant',
  lvl1: 'Left delay output level',
  lvl2: 'Right delay output level',

  // Reverb
  size: 'Length of room',
  link: 'Scales Decay and Spred with Size',
  diff: 'Increase of initial echo density over time',
  decay: 'Length of the reverb tail',
  xovr: 'Frequency of transition from Decay to Bass',
  xover: 'Frequency of transition from Decay to Bass',
  rthc: 'High frequency content of Decay',
  shape: 'Contour of the reverberation envelope',
  spred: 'Sustain of reverberation after initial build up',
  dtime: 'Length of the ambience tail',
  dlvl: 'Level of the ambience tail',

  // EQ shared
  gain: 'Boost/cut gain of filter',
  fc: 'Center or corner frequency of filter',
  q: 'Q of filter',
  mode: 'Determines EQ type',
  gain1: 'Boost/cut gain of filter(s)',
  gain2: 'Boost/cut gain of filter(s)',
  gain3: 'Boost/cut gain of filter(s)',
  gain4: 'Boost/cut gain of filter(s)',
  fc1: 'Center or corner frequency of filter(s)',
  fc2: 'Center or corner frequency of filter(s)',
  fc3: 'Center or corner frequency of filter(s)',
  fc4: 'Center or corner frequency of filter(s)',
  q1: 'Q of filter(s)',
  q2: 'Q of filter(s)',
  q3: 'Q of filter(s)',
  q4: 'Q of filter(s)',
  mode1: 'Determines EQ type(s)',
  mode2: 'Determines EQ type(s)',
  mode3: 'Determines EQ type(s)',
  mode4: 'Determines EQ type(s)',

  // Dual EQ L/R
  gl: 'Boost/cut gain of left filter(s)',
  gl1: 'Boost/cut gain of left filter(s)',
  gl2: 'Boost/cut gain of left filter(s)',
  fcl: 'Center or corner frequency of left filter(s)',
  fcl1: 'Center or corner frequency of left filter(s)',
  fcl2: 'Center or corner frequency of left filter(s)',
  ql: 'Q of left filter(s)',
  ql1: 'Q of left filter(s)',
  ql2: 'Q of left filter(s)',
  ml: 'Determines EQ type(s)',
  ml1: 'Determines EQ type(s)',
  ml2: 'Determines EQ type(s)',
  gr: 'Boost/cut gain of right filter(s)',
  gr1: 'Boost/cut gain of right filter(s)',
  gr2: 'Boost/cut gain of right filter(s)',
  fcr: 'Center or corner frequency of right filter(s)',
  fcr1: 'Center or corner frequency of right filter(s)',
  fcr2: 'Center or corner frequency of right filter(s)',
  qr: 'Q of right filter(s)',
  qr1: 'Q of right filter(s)',
  qr2: 'Q of right filter(s)',
  mr: 'Determines EQ type(s)',
  mr1: 'Determines EQ type(s)',
  mr2: 'Determines EQ type(s)',

  // SweepFilter
  fres: 'Filter resonance: 7=a maximally flat filter',
  mod: 'Added to corner frequency offset to produce corner frequency',

  // Misc
  note: 'Sine wave pitch, expressed as MIDI notes',
  thrsh: 'Gain reduction threshold',
  atime: 'Attack time',
  rtime: 'Release time',

  // All Params utility (not fully documented in printed effect sheets)
  cvol: 'Clean path volume / input trim',
  gtone: 'Guitar tone path enable',
  ctone: 'Clean tone path enable',
  cbyp: 'Compressor bypass',
  send: 'Effects send enable',
  itype: 'Input type'
}

/**
 * Effect-specific overrides (slug → id → description).
 * Used when the same id means different things across effects.
 */
const BY_EFFECT = {
  tone: {
    lo: 'Clean low frequency boost/cut',
    mid: 'Clean mid frequency boost/cut',
    hi: 'Clean high frequency boost/cut',
    level: 'Output level',
    mix: 'Dry/Wet ratio'
  },
  crunch: {
    lo: 'Low frequency Drive',
    mid: 'Mid frequency Drive',
    hi: 'High frequency Drive',
    level: 'Output level'
  },
  'tube-screamer': {
    level: 'Output level',
    drive: 'Amount of overdrive',
    tone: 'High frequency roll-off'
  },
  overdrive: {
    lo: 'Low frequency Drive',
    mid: 'Mid frequency Drive',
    hi: 'High frequency Drive',
    level: 'Output level',
    drive: 'Amount of overdrive',
    tone: 'High frequency roll-off (Post-Overdrive)',
    locut: 'Pre-Drive low frequency roll off'
  },
  distortion: {
    lo: 'Low frequency Drive',
    mid: 'Mid frequency Drive',
    hi: 'High frequency Drive',
    drive: 'Amount of distortion',
    tone: 'High frequency roll-off',
    level: 'Output level'
  },
  preamp: {
    level: 'Output level',
    drive: 'Amount of overdrive',
    tone: 'High frequency roll-off',
    locut: 'Pre-Drive low frequency roll off'
  },
  splitpreamp: {
    level: 'Output level',
    drive: 'Amount of overdrive',
    tone: 'High frequency roll-off',
    locut: 'Pre-Drive low frequency roll off'
  },
  'all-params': {
    lo: 'Low frequency boost/cut',
    mid: 'Mid frequency boost/cut',
    hi: 'High frequency boost',
    locut: 'Pre-Drive low frequency roll off',
    feel: 'Overdrive dynamics',
    drive: 'Amount of overdrive',
    hicut: 'High frequency roll-off',
    bass: 'Post-Drive bass control',
    trebl: 'Post-Drive treble control',
    level: 'Output level',
    gain: 'Gain enable'
  },
  digidrive1: {
    drive: 'Amount of digital distortion',
    low: 'Pre-Drive low frequency cut/boost',
    mid: 'Pre-Drive mid frequency cut/boost',
    high: 'Pre-Drive high frequency cut/boost'
  },
  digidrive2: {
    drive: 'Amount of digital distortion',
    low: 'Post-Drive low frequency cut/boost',
    mid: 'Post-Drive mid frequency cut/boost',
    high: 'Post-Drive high frequency cut/boost'
  },
  'wah-1': {
    bass: 'Adds low frequency boost to the wah',
    gain: 'Post-Wah cut/boost',
    sweep: 'Wah center frequency'
  },
  'wah-1-2': {
    bass: 'Adds low frequency boost to the wah',
    gain: 'Post-Wah cut/boost',
    sweep: 'Wah center frequency'
  },
  'wah-2': {
    bass: 'Adds low frequency boost to the wah',
    gain: 'Post-Wah cut/boost',
    sweep: 'Wah center frequency'
  },
  'pedal-wah-1': {
    bass: 'Adds low frequency boost to the wah',
    gain: 'Post-Wah cut/boost'
  },
  'pedal-wah-2': {
    bass: 'Adds low frequency boost to the wah',
    gain: 'Post-Wah cut/boost'
  },
  'blue-comp': {
    sense: 'Sensitivity (Pre-Compressor level)',
    gain: 'Post-Compressor level'
  },
  'red-comp': {
    sense: 'Sensitivity (Pre-Compressor level)'
  },
  'volume-m': {
    vol: 'Volume level',
    level: 'Amount of effect in the processed signal'
  },
  'volume-s': {
    vol: 'Volume level'
  },
  'volume-d': {
    voll: 'Left volume level',
    volr: 'Right volume level'
  },
  'pedal-vol': {
    mix: 'Dry/Wet ratio',
    vol: 'Volume level (hardwired to Foot Pedal)'
  },
  extpedalvol: {
    mix: 'Dry/Wet ratio',
    level: 'Amount of effect in the processed signal',
    vol: 'Volume level (hardwired to External Pedal)'
  },
  click: {
    mix: 'Dry/Click ratio',
    level: 'Amount of Click in the processed signal'
  },
  '1-band-m': {
    gain: 'Boost/cut gain of filter',
    fc: 'Center or corner frequency of filter',
    q: 'Q of filter',
    mode: 'Determines EQ type'
  },
  '1-band-s': {
    gain: 'Boost/cut gain of filter(s)',
    fc: 'Center or corner frequency of filter(s)',
    mix2: 'Dry/Wet ratio',
    mode: 'Determines EQ type(s)',
    q: 'Q of filter(s)'
  },
  '2-band-s': {
    gain1: 'Boost/cut gain of filter(s)',
    gain2: 'Boost/cut gain of filter(s)'
  },
  sweepfilter: {
    fc: 'Corner frequency offset of filter',
    scale: 'Scales Mod',
    pan: 'Left/right pan control'
  },
  diatonichmy: {
    scale: 'Type of scale'
  },
  'flanger-m': {
    rate: 'Flange rate or period ratio',
    pw: 'Flange pulse width',
    depth: 'Flange depth',
    res: 'Resonance',
    blend: 'Amount of fixed tape mixed with moving tape'
  },
  'flange24-m': {
    rate: 'Flange rate or period ratio',
    pw: 'Flange pulse width',
    depth: 'Flange depth',
    res: 'Resonance',
    blend: 'Amount of fixed tape mixed with moving tape',
    // Not listed separately in the printed sheet; same family as Shift Glide wording is wrong here.
    // Unit harvest exposes a 0–100 Glide — treat as flange sweep glide amount.
    glide: 'Flange glide amount'
  },
  'flanger-s': {
    rate: 'Flange rate or period ratio',
    pw: 'Flange pulse width',
    depth: 'Flange depth',
    phase: 'Phase difference between the right and left flangers',
    res: 'Resonance',
    blend: 'Amount of fixed tape mixed with moving tape'
  },
  'rotary-cab': {
    rate1: 'Drum rate or period ratio',
    rate2: 'Horn rate or period ratio',
    dpth1: 'Drum depth (tremolo)',
    dpth2: 'Horn depth (tremolo)',
    width: 'Panning width for horn and drum',
    bal: 'Relative level of horn and drum'
  },
  'tremolo-m': {
    rate: 'Tremolo rate or period ratio',
    pw: 'Tremolo pulse width',
    depth: 'Tremolo depth'
  },
  'tremolo-s': {
    rate: 'Tremolo rate or period ratio',
    pw: 'Tremolo pulse width',
    depth: 'Tremolo depth',
    phase: 'Phase difference between the right and left tremolo'
  },
  phaser: {
    rate: 'Phaser rate or period ratio',
    pw: 'Phaser pulse width',
    depth: 'Phaser depth',
    res: 'Amount of feedback from output of filters to inputs'
  },
  orangephase: {
    rate: 'OrangePhase rate'
  },
  univybe: {
    rate: 'Univybe rate'
  },
  'custom-vybe': {
    rate: 'Custom Vybe rate or period ratio',
    pw: 'Custom Vybe pulse width',
    depth: 'Custom Vybe depth'
  },
  'auto-pan': {
    rate: 'Pan rate or period ratio',
    pw: 'Pan pulse width',
    depth: 'Pan depth',
    phase: 'Phase difference between right and left pan'
  },
  panner: {
    pan1: 'Left input panner',
    pan2: 'Right input panner'
  },
  aerosol: {
    rate1: 'Left Mod rate or period ratio',
    rate2: 'Right Mod rate or period ratio',
    pw1: 'Left Mod pulse width',
    pw2: 'Right Mod pulse width',
    dpth1: 'Left Mod depth',
    dpth2: 'Right Mod depth',
    res1: 'Cross resonance',
    res2: 'Resonance'
  },
  orbits: {
    rate1: 'Left Mod and Pan rate or period ratio',
    rate2: 'Right Mod and Pan rate or period ratio',
    pw1: 'Left Mod and Pan pulse width',
    pw2: 'Right Mod and Pan pulse width',
    dpth1: 'Left Mod and Pan depth',
    dpth2: 'Right Mod and Pan depth',
    sync2: 'Phase difference between right LFO Mod and Pan',
    width: 'Panning width'
  },
  centrifuge1: {
    rate1: 'Left Mod and Pan rate or period ratio',
    rate2: 'Secondary rate or period ratio',
    pw1: 'Left Mod and Pan pulse width',
    pw2: 'Right Mod and Pan pulse width',
    dpth1: 'Left Mod and Pan depth',
    dpth2: 'Secondary depth',
    sync1: 'Phase difference between left LFO Mod and Pan',
    sync2: 'Phase difference between right LFO Mod and Pan'
  },
  centrifuge2: {
    rate1: 'Mod/pan rate or period ratio',
    rate2: 'Secondary rate or period ratio',
    pw1: 'Left Mod and Pan pulse width',
    pw2: 'Right Mod and Pan pulse width',
    dpth1: 'Mod/pan depth',
    dpth2: 'Secondary depth',
    sync1: 'Phase difference between left LFO Mod and Pan',
    sync2: 'Phase difference between right LFO Mod and Pan',
    res: 'Resonance'
  },
  'comb-1': {
    locut: 'Corner frequency of the low cut filter',
    hicut: 'Corner frequency of the high cut filter',
    comb: 'A microdelay which positions the notch',
    notch: 'Increases the audibility of the notch'
  },
  'comb-2': {
    mix2: 'Dry/Wet ratio',
    locut: 'Corner frequency of the low cut filter',
    hicut: 'Corner frequency of the high cut filter',
    notch: 'Increases the audibility of the notch',
    rate: 'Mod rate or period ratio',
    pw: 'Mod pulse width',
    depth: 'Mod depth',
    res: 'Resonance',
    phase: 'Phase difference between the right and left Mod'
  },
  'delay-m': {
    time: 'Delay time',
    fbk: 'Feedback level'
  },
  'delay-s': {
    time: 'Delay time',
    fbk: 'Feedback level'
  },
  'delay-d': {
    time: 'Delay time',
    fbk1: 'Left feedback level',
    fbk2: 'Right feedback level',
    xfbk1: 'Level from left feedback source to right delay',
    xfbk2: 'Level from right feedback source to left delay',
    clear: 'When On, mutes and resets the delay',
    lvl1: 'Left delay output level',
    lvl2: 'Right delay output level',
    pan1: 'Left delay output panner',
    pan2: 'Right delay output panner'
  },
  'echo-m': {
    time: 'Delay time in mono version',
    fbk: 'Left feedback level',
    damp: 'Cutoff frequency of low-pass filter in left feedback path'
  },
  'echo-s': {
    time: 'Delay time',
    fbk: 'Feedback level',
    damp: 'Cutoff frequency of low-pass filter in feedback path',
    clear: 'When On, mutes and resets the delay'
  },
  'echo-d': {
    damp: 'Cutoff frequency of low-pass filter in feedback path'
  },
  looper: {
    sense: 'Sensitivity of InMix to input amplitude'
  },
  ducker: {
    sense: 'Amount of ducking'
  },
  jamman: {
    clear: 'Mutes and resets the loop when On',
    size: 'Loop size in ms (display only, this is set by pressing Tap)',
    fbk: 'Feedback level (defaults to 100% while looping)'
  },
  chamber: {
    bass: 'Reverb time for low frequency signals',
    xovr: 'Frequency of transition from Decay to Bass'
  },
  hall: {
    bass: 'Reverb time for low frequency signals',
    xovr: 'Frequency of transition from Decay to Bass'
  },
  plate: {
    bass: 'Reverb time for low frequency signals',
    xovr: 'Frequency of transition from Decay to Bass'
  },
  gate: {
    time: 'Reverb time for mid and low frequency signals',
    xovr: 'Frequency of transition from LoSlp to Slope',
    link: 'Scales Spred with Size'
  },
  ambience: {
    link: 'Scales DTime with Size',
    dtime: 'Length of the ambience tail',
    dlvl: 'Level of the ambience tail',
    rthc: 'High frequency content of DTime'
  },
  'fc-splitter': {
    locut: 'Corner frequency for the low cut (highpass) band',
    hicut: 'Corner frequency for the high cut (lowpass) band',
    bal: 'Relative level of the low and high band'
  },
  crossover: {
    fc: 'Crossover frequency',
    bal: 'Relative level of the low and high band'
  },
  'detune-m': {
    tune: 'Pitch shift',
    pdly: 'Amount of delay in the tuner'
  },
  'detune-s': {
    tune: 'Pitch shift',
    pdly: 'Amount of delay in the tuner'
  },
  'detune-d': {
    tune1: 'Pitch shift',
    tune2: 'Pitch shift'
  },
  'shift-m': {
    tune: 'Pitch shift',
    glide: 'Coarse, fine resolution of pitch shift'
  },
  'shift-s': {
    tune: 'Pitch shift',
    glide: 'Coarse, fine resolution of pitch shift'
  },
  'shift-d': {
    tune1: 'Pitch shift',
    tune2: 'Pitch shift',
    glide: 'Coarse, fine resolution of pitch shift'
  },
  'stereo-chorus': {
    rate1: 'Left and right A rate',
    rate2: 'Left and right B rate',
    pw1: 'Left and right A pulse width',
    pw2: 'Left and right B pulse width',
    dpth1: 'Left and right A depth',
    dpth2: 'Left and right B depth',
    res1: 'Left to right resonance',
    res2: 'Right to left resonance'
  },
  'test-tone': {
    note: 'Sine wave pitch, expressed as MIDI notes',
    bal: 'Relative level of left and right output attenuation'
  }
}

/** Descriptions that are clearly wrong scrapes — always replace when we have a better value. */
const BAD_DESC = new Set([
  'TODO',
  'Tone is a set of analog Tone',
  'Drum rate or period ratio', // wrong on flangers
  'Left Mod pulse width', // wrong on flangers when paired with drum depth
  'Drum depth (tremolo)'
])

function yamlQuote(s) {
  const escaped = s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

function resolveDesc(slug, id, label, current) {
  const lid = id.toLowerCase()
  const effectMap = BY_EFFECT[slug] || {}
  if (effectMap[lid]) return effectMap[lid]

  // Label-based fallbacks for dual EQ etc.
  const lab = (label || '').toLowerCase()
  if (lab.startsWith('g-l')) return 'Boost/cut gain of left filter(s)'
  if (lab.startsWith('g-r')) return 'Boost/cut gain of right filter(s)'
  if (lab.startsWith('fc-l')) return 'Center or corner frequency of left filter(s)'
  if (lab.startsWith('fc-r')) return 'Center or corner frequency of right filter(s)'
  if (lab.startsWith('q-l')) return 'Q of left filter(s)'
  if (lab.startsWith('q-r')) return 'Q of right filter(s)'
  if (lab.startsWith('m-l') || lab.startsWith('m-r')) return 'Determines EQ type(s)'

  if (BY_ID[lid]) return BY_ID[lid]
  return null
}

function shouldReplace(current, next, slug, id) {
  if (!next) return false
  const c = (current || '').trim()
  if (!c || c === 'TODO') return true
  if (BAD_DESC.has(c)) return true
  // Fix flanger family wrong rotary-cab scrapes even if not TODO
  if (
    (slug === 'flanger-m' || slug === 'flange24-m' || slug === 'flanger-s') &&
    /Drum |Left Mod pulse width/.test(c) &&
    ['rate', 'pw', 'depth'].includes(id)
  ) {
    return true
  }
  // Fix 1-band-s garbled gain
  if (slug === '1-band-s' && id === 'gain' && c.includes('Tone is a set')) return true
  // OCR typo cleanup when we have the same meaning
  if (c.includes('processsed') && next.includes('processed')) return true
  return false
}

function updateFile(raw, slug) {
  let changed = 0
  let filled = 0
  let fixed = 0

  // Walk param blocks
  const parts = raw.split(/(\n  - id: )/)
  // parts[0] = preamble, then alternating delimiter + block
  if (parts.length < 2) {
    // still fix processsed globally
    const next = raw.replace(/processsed/g, 'processed')
    return { next, changed: next !== raw ? 1 : 0, filled: 0, fixed: next !== raw ? 1 : 0 }
  }

  let out = parts[0]
  for (let i = 1; i < parts.length; i += 2) {
    const delim = parts[i]
    let block = parts[i + 1] || ''
    const idLine = block.split('\n', 1)[0]
    const id = idLine.trim().replace(/^"|"$/g, '')
    const lm = block.match(/^    label:\s*"?(.*?)"?\s*$/m)
    const label = lm ? lm[1] : id
    const dm = block.match(/^    description:\s*(.*)$/m)
    const currentRaw = dm ? dm[1].trim() : ''
    const current = currentRaw.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"')

    const nextDesc = resolveDesc(slug, id, label, current)
    let newBlock = block

    if (nextDesc && shouldReplace(current, nextDesc, slug, id)) {
      const wasTodo = !current || current === 'TODO'
      if (/^    description:\s*/m.test(block)) {
        newBlock = block.replace(/^    description:\s*.*$/m, `    description: ${yamlQuote(nextDesc)}`)
      } else {
        // insert before end of block — after last param field
        newBlock = block.replace(
          /(\n(?=  - id: |\n---|\n[^\s]|$))/,
          `\n    description: ${yamlQuote(nextDesc)}$1`
        )
      }
      changed++
      if (wasTodo) filled++
      else fixed++
    } else if (/processsed/.test(newBlock)) {
      newBlock = newBlock.replace(/processsed/g, 'processed')
      changed++
      fixed++
    }

    out += delim + newBlock
  }

  // Catch any remaining processsed outside params
  if (/processsed/.test(out)) {
    out = out.replace(/processsed/g, 'processed')
    fixed++
    changed++
  }

  return { next: out, changed, filled, fixed }
}

const files = (await readdir(effectsDir)).filter(f => f.endsWith('.md'))
let totalFilled = 0
let totalFixed = 0
let filesTouched = 0

for (const file of files.sort()) {
  const slug = file.replace(/\.md$/, '')
  const path = join(effectsDir, file)
  const raw = await readFile(path, 'utf8')
  const { next, changed, filled, fixed } = updateFile(raw, slug)
  if (!changed) continue
  await writeFile(path, next, 'utf8')
  filesTouched++
  totalFilled += filled
  totalFixed += fixed
  console.log(`${file}: filled ${filled}, fixed ${fixed}`)
}

// Verify remaining TODOs
let remaining = 0
for (const file of files) {
  const text = await readFile(join(effectsDir, file), 'utf8')
  const n = (text.match(/description: TODO/g) || []).length
  if (n) {
    remaining += n
    console.log(`REMAINING TODO ${file}: ${n}`)
  }
}

console.log(
  `\nDone. Touched ${filesTouched} files; filled ${totalFilled} TODOs; fixed ${totalFixed} other; remaining TODOs: ${remaining}`
)
