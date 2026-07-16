/**
 * Reads content/effects/*.md frontmatter and writes
 * shared/constants/algorithms.generated.ts for MIDI / pedal sync.
 *
 * Source of truth remains the Content "effects" collection; this is the
 * machine subset (MIDI still talks in algorithm indexes).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'
import { z } from 'zod'

const algorithmParam = z.object({
  id: z.string().min(1),
  index: z.number().int().nonnegative(),
  label: z.string().min(1),
  min: z.number(),
  max: z.number(),
  default: z.number(),
  description: z.string().min(1),
  bytes: z.union([z.literal(1), z.literal(2)]).optional(),
  displayUnits: z.number().int().nonnegative().optional()
}).refine(param => param.default >= param.min && param.default <= param.max, {
  message: 'default must be within min…max',
  path: ['default']
})

const availableIn = z
  .object({
    gain: z.number().int().positive().optional(),
    fx1: z.number().int().positive().optional(),
    fx2: z.number().int().positive().optional(),
    chorus: z.number().int().positive().optional(),
    delay: z.number().int().positive().optional(),
    reverb: z.number().int().positive().optional(),
    eq: z.number().int().positive().optional()
  })
  .refine(
    value => Object.values(value).some(index => typeof index === 'number'),
    { message: 'availableIn must list at least one block' }
  )

const algorithmFrontmatter = z.object({
  name: z.string().min(1),
  modelName: z.string().min(1),
  summary: z.string().min(1),
  dspSteps: z.number().int().nonnegative(),
  manualSection: z.string().optional(),
  availableIn,
  softRow: z.array(z.string().min(1)).max(3),
  params: z.array(algorithmParam).min(1),
  color: z.string().min(1)
})

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'content', 'effects')
const outFile = join(root, 'shared', 'constants', 'algorithms.generated.ts')

function extractFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    throw new Error('Missing YAML frontmatter')
  }
  return parseYaml(match[1])
}

function serialize(value, indent = 0) {
  const pad = '  '.repeat(indent)
  if (value === null || value === undefined) {
    return 'undefined'
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]'
    }
    const items = value.map(item => `${pad}  ${serialize(item, indent + 1)}`).join(',\n')
    return `[\n${items}\n${pad}]`
  }
  const entries = Object.entries(value)
  if (entries.length === 0) {
    return '{}'
  }
  const lines = entries.map(([key, val]) => {
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
    return `${pad}  ${safeKey}: ${serialize(val, indent + 1)}`
  })
  return `{\n${lines.join(',\n')}\n${pad}}`
}

const files = (await readdir(contentDir))
  .filter(name => name.endsWith('.md'))
  .sort()

if (files.length === 0) {
  throw new Error(`No algorithm markdown files in ${contentDir}`)
}

const algorithms = []
for (const file of files) {
  // Machine id = filename stem (same identity Content exposes via `path`).
  const id = file.replace(/\.md$/i, '')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`${file}: filename must be kebab-case (got "${id}")`)
  }

  const raw = await readFile(join(contentDir, file), 'utf8')
  let parsed
  try {
    parsed = algorithmFrontmatter.parse(extractFrontmatter(raw))
  } catch (error) {
    throw new Error(`Invalid algorithm frontmatter in ${file}: ${error.message}`)
  }

  const paramIds = new Set(parsed.params.map(param => param.id))
  for (const softId of parsed.softRow) {
    if (!paramIds.has(softId)) {
      throw new Error(`${file}: softRow id "${softId}" is not in params`)
    }
  }

  algorithms.push({
    id,
    name: parsed.name,
    modelName: parsed.modelName,
    summary: parsed.summary,
    dspSteps: parsed.dspSteps,
    ...(parsed.manualSection ? { manualSection: parsed.manualSection } : {}),
    availableIn: Object.fromEntries(
      Object.entries(parsed.availableIn).filter(([, index]) => typeof index === 'number')
    ),
    softRow: parsed.softRow,
    params: parsed.params.map(param => ({
      id: param.id,
      index: param.index,
      label: param.label,
      min: param.min,
      max: param.max,
      default: param.default,
      description: param.description,
      ...(param.bytes ? { bytes: param.bytes } : {}),
      ...(param.displayUnits != null ? { displayUnits: param.displayUnits } : {})
    })),
    color: parsed.color
  })
}

const byId = Object.fromEntries(algorithms.map(alg => [alg.id, alg]))
const byBlockAlg = {}
for (const alg of algorithms) {
  for (const [block, index] of Object.entries(alg.availableIn)) {
    byBlockAlg[block] ??= {}
    if (byBlockAlg[block][index]) {
      throw new Error(
        `Duplicate ${block} alg ${index}: ${byBlockAlg[block][index]} and ${alg.id}`
      )
    }
    byBlockAlg[block][index] = alg.id
  }
}

const banner = `/* eslint-disable */
/**
 * AUTO-GENERATED by scripts/generate-algorithms.mjs — do not edit.
 * Source: content/effects/*.md
 */
import type { AlgorithmDef } from '../types/algorithm'
import type { EffectBlockId } from '../types/effect-blocks'
`

const body = `${banner}
export const GENERATED_ALGORITHMS = ${serialize(byId)} as const satisfies Record<string, AlgorithmDef>

export type GeneratedAlgorithmId = keyof typeof GENERATED_ALGORITHMS

export const GENERATED_ALGORITHM_IDS = ${serialize(algorithms.map(a => a.id))} as const satisfies readonly GeneratedAlgorithmId[]

/** block → alg index → algorithm id */
export const GENERATED_ALGORITHM_BY_BLOCK_ALG = ${serialize(byBlockAlg)} as const satisfies Partial<
  Record<EffectBlockId, Record<number, GeneratedAlgorithmId>>
>
`

await writeFile(outFile, `${body.trimEnd()}\n`, 'utf8')
console.log(`Wrote ${algorithms.length} algorithm(s) → ${outFile}`)
