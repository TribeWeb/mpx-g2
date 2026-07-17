/**
 * Correct content/effects/*.md dspSteps from the MPX G2 manual (manual-web
 * chapter 7 bars), and remove body copy that repeats that information
 * (the effect page already shows “N of 190 processing steps” from frontmatter).
 *
 * Usage: node scripts/fix-dsp-steps.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const effectsDir = join(root, 'content', 'effects')

/**
 * Authoritative step counts from tmp/manual-web page OCR
 * (N / 190 bars beside each effect name). Gain + Reverb = 0
 * (“NO PROCESSING STEPS USED”).
 */
const DSP_STEPS = {
  tone: 0,
  crunch: 0,
  'tube-screamer': 0,
  overdrive: 0,
  distortion: 0,
  preamp: 0,
  splitpreamp: 0,
  'all-params': 0,

  'detune-m': 29,
  'detune-s': 34,
  'detune-d': 43,
  'shift-m': 73,
  'shift-s': 96,
  'shift-d': 67,
  diatonichmy: 96,

  panner: 25,
  'auto-pan': 25,
  'tremolo-m': 13,
  'tremolo-s': 17,
  univybe: 70,
  'custom-vybe': 70,
  phaser: 77,
  orangephase: 77,
  'red-comp': 61,
  'blue-comp': 49,
  digidrive1: 53,
  digidrive2: 56,
  octabuzz: 15,
  sweepfilter: 92,

  // Effect2 1-Band (M) and EQ 1-Band (M) both list 50
  '1-band-m': 50,
  'wah-1': 41,
  'wah-1-2': 41,
  'wah-2': 71,
  'pedal-wah-1': 41,
  'pedal-wah-2': 71,
  'volume-m': 17,
  'volume-s': 13,
  'volume-d': 18,
  'pedal-vol': 13,
  extpedalvol: 13,
  'test-tone': 33,
  click: 14,

  'stereo-chorus': 60,
  'flanger-m': 42,
  'flange24-m': 47,
  // Only remaining bar on the flanger page after M=42 / 24=47
  'flanger-s': 29,
  'rotary-cab': 76,
  aerosol: 59,
  orbits: 57,
  centrifuge1: 43,
  centrifuge2: 35,
  'comb-1': 51,
  'comb-2': 35,

  'delay-m': 23,
  'delay-s': 40,
  'delay-d': 17,
  'echo-m': 21,
  'echo-s': 31,
  'echo-d': 40,
  looper: 29,
  jamman: 25,
  ducker: 28,

  chamber: 0,
  hall: 0,
  plate: 0,
  ambience: 0,
  gate: 0,

  '2-band-m': 70,
  '3-band-m': 90,
  '4-band-m': 110,
  '1-band-s': 68,
  '2-band-s': 109,
  '1-band-d': 68,
  '2-band-d': 109,
  'fc-splitter': 55,
  crossover: 29
}

const BODY_DSP_RE = new RegExp(
  [
    // “This effect uses **N of 190** processing steps.”
    String.raw`\n*This effect uses \*\*\d+ of 190\*\* processing steps\.\n*`,
    // Gain dedicated-processing notes
    String.raw`\n*Gain/analog effects like this use dedicated processing[\s\S]*?(?:\n|$)`,
    String.raw`\n*Gain effects use dedicated analog processing[\s\S]*?(?:\n|$)`,
    // Raw manual leftover
    String.raw`\n*NO PROCESSING STEPS USED\n*`
  ].join('|'),
  'g'
)

let updatedSteps = 0
let clearedBody = 0
let unchanged = 0

const files = (await readdir(effectsDir)).filter(f => f.endsWith('.md'))
for (const file of files.sort()) {
  const slug = file.replace(/\.md$/, '')
  const path = join(effectsDir, file)
  let raw = await readFile(path, 'utf8')
  let changed = false

  if (slug in DSP_STEPS) {
    const next = DSP_STEPS[slug]
    const m = raw.match(/^dspSteps:\s*(\d+)\s*$/m)
    if (!m) {
      console.log(`WARN ${file}: no dspSteps field`)
    } else if (Number(m[1]) !== next) {
      raw = raw.replace(/^dspSteps:\s*\d+\s*$/m, `dspSteps: ${next}`)
      console.log(`${file}: dspSteps ${m[1]} → ${next}`)
      updatedSteps++
      changed = true
    }
  } else {
    console.log(`WARN ${file}: no authoritative dspSteps`)
  }

  const cleaned = raw.replace(BODY_DSP_RE, '\n').replace(/\n{3,}/g, '\n\n')
  // Trim trailing whitespace on body end
  const final = cleaned.replace(/\n+$/, '\n')
  if (final !== raw) {
    const before = (raw.match(BODY_DSP_RE) || []).length
    // recount by comparing
    if (final.length < raw.length || final !== raw) {
      clearedBody++
      changed = true
      raw = final
    }
  }

  if (changed) {
    await writeFile(path, raw.endsWith('\n') ? raw : raw + '\n', 'utf8')
  } else {
    unchanged++
  }
}

console.log(
  `\nDone. Updated dspSteps on ${updatedSteps} files; cleared body DSP notes on ${clearedBody}; unchanged ${unchanged}.`
)
