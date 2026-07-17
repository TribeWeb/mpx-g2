#!/usr/bin/env node
/**
 * Merge MPX-G2 program harvest JSON into content/programs/*.md frontmatter.
 *
 * Usage:
 *   node scripts/apply-program-harvest.mjs
 *   node scripts/apply-program-harvest.mjs tmp/mpx-g2-program-harvest\ \(2\).json
 *
 * Preserves group/subGroup and the Markdown body; replaces dumpName + parameters.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

const ROOT = resolve(import.meta.dirname, '..')
const PROGRAMS_DIR = resolve(ROOT, 'content/programs')
const BLOCK_ORDER = ['gain', 'fx1', 'fx2', 'chorus', 'delay', 'reverb', 'eq']

const harvestPath = resolve(
  ROOT,
  process.argv[2] ?? 'tmp/mpx-g2-program-harvest (2).json'
)

const harvest = JSON.parse(readFileSync(harvestPath, 'utf8'))
const programs = harvest.programs
if (!Array.isArray(programs) || programs.length === 0) {
  console.error('No programs[] in harvest file:', harvestPath)
  process.exit(1)
}

const byNumber = new Map(programs.map(p => [p.programNumber, p]))

function splitFrontmatter(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    throw new Error('Missing YAML frontmatter')
  }
  const end = text.indexOf('\n---', 4)
  if (end < 0) {
    throw new Error('Unclosed YAML frontmatter')
  }
  const fm = text.slice(4, end).replace(/\r$/, '')
  const body = text.slice(end + 4).replace(/^\r?\n/, '')
  return { fm, body }
}

function normalizeBlocks(dump) {
  const fromHarvest = Array.isArray(dump.blocks) ? dump.blocks : []
  const byId = new Map(fromHarvest.map(b => [b.id, b]))

  // Prefer pedalboard order; keep unloaded slots so the schema is complete.
  return BLOCK_ORDER.map((id) => {
    const block = byId.get(id)
    if (!block) {
      return { id, alg: dump.algs?.[id] ?? 0, effect: null, params: {} }
    }
    return {
      id,
      alg: Number(block.alg) || 0,
      effect: block.effect ?? null,
      params: block.params && typeof block.params === 'object' ? block.params : {}
    }
  })
}

function formatFrontmatter(data) {
  // Keep a readable, stable YAML shape for diffs.
  return stringifyYaml(data, {
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'PLAIN'
  }).trimEnd()
}

let updated = 0
let skipped = 0
const missingFiles = []
const missingDumps = []

const files = readdirSync(PROGRAMS_DIR)
  .filter(name => /^\d{3}\.md$/.test(name))
  .sort()

for (const file of files) {
  const num = Number.parseInt(basename(file, '.md'), 10)
  if (num < 1 || num > 250) {
    // Leave user programs alone unless present in harvest.
    if (!byNumber.has(num)) {
      skipped += 1
      continue
    }
  }

  const dump = byNumber.get(num)
  if (!dump) {
    missingDumps.push(num)
    skipped += 1
    continue
  }

  const path = resolve(PROGRAMS_DIR, file)
  const text = readFileSync(path, 'utf8')
  let fm
  let body
  try {
    ;({ fm, body } = splitFrontmatter(text))
  } catch (error) {
    console.error(`Skip ${file}:`, error.message)
    skipped += 1
    continue
  }

  const meta = parseYaml(fm) ?? {}
  const next = {
    group: meta.group,
    subGroup: meta.subGroup,
    dumpName: dump.name || undefined,
    parameters: normalizeBlocks(dump)
  }

  const out = `---\n${formatFrontmatter(next)}\n---\n\n${body.replace(/^\n+/, '')}`
  writeFileSync(path, out.endsWith('\n') ? out : `${out}\n`)
  updated += 1
}

for (const num of byNumber.keys()) {
  const file = `${String(num).padStart(3, '0')}.md`
  if (!files.includes(file)) {
    missingFiles.push(num)
  }
}

console.log(`Harvest: ${harvestPath}`)
console.log(`Updated ${updated} program file(s); skipped ${skipped}`)
if (missingDumps.length) {
  console.log(`No dump for: ${missingDumps.slice(0, 20).join(', ')}${missingDumps.length > 20 ? '…' : ''}`)
}
if (missingFiles.length) {
  console.log(`Dump without content file: ${missingFiles.join(', ')}`)
}

// Spot-check 001
const sample = readFileSync(resolve(PROGRAMS_DIR, '001.md'), 'utf8')
const { fm } = splitFrontmatter(sample)
const meta = parseYaml(fm)
console.log('001 dumpName:', meta.dumpName)
console.log(
  '001 loaded blocks:',
  meta.parameters.filter(b => b.alg > 0).map(b => `${b.id}:${b.effect}`).join(', ')
)
