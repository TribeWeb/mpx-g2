/**
 * Apply a units-harvest JSON download into shared/constants/units-strings.generated.ts
 *
 * Usage:
 *   pnpm run generate:units-strings -- ~/Downloads/mpx-g2-units-harvest.json
 *
 * Without a JSON path, rewrites the seeded file (Control Sources from the MIDI PDF).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'shared', 'constants', 'units-strings.generated.ts')
const unitsMapFile = join(root, 'shared', 'constants', 'units-map.ts')

function serializeRecord(table, indent = 1) {
  const pad = '  '.repeat(indent)
  const keys = Object.keys(table)
    .map(Number)
    .filter(n => Number.isFinite(n))
    .sort((a, b) => a - b)
  if (keys.length === 0) {
    return '{} as Record<number, string>'
  }
  const lines = keys.map((key) => {
    const label = JSON.stringify(table[key] ?? table[String(key)])
    return `${pad}  ${key}: ${label}, // 0x${key.toString(16)}`
  })
  return `{\n${lines.join('\n')}\n${pad}}`
}

/** Build Control Source seed (MIDI SysEx PDF appendix). */
function seedControlSources() {
  const table = {
    0x00: 'Unassigned',
    0x01: 'Off',
    0x02: 'On',
    0x03: 'Knob',
    0x04: 'Puls1',
    0x05: 'Tri1',
    0x06: 'Sine1',
    0x07: 'Cos1',
    0x08: 'Puls2',
    0x09: 'Tri2',
    0x0A: 'Sine2',
    0x0B: 'Cos2',
    0x0C: 'Rand',
    0x0D: 'Env',
    0x0E: 'InLvl',
    0x0F: 'ALvl',
    0x10: 'A/B',
    0x11: 'ATrg',
    0x12: 'BTrg',
    0x13: 'ABTrg',
    0x14: 'Pedal',
    0x15: 'Tog1',
    0x16: 'Tog2',
    0x17: 'Tog3',
    0x18: 'Sw1',
    0x19: 'Sw2',
    0x1A: 'Sw3'
  }
  let n = 0x1c
  for (const cc of [...Array.from({ length: 31 }, (_, i) => i + 1), ...Array.from({ length: 87 }, (_, i) => i + 33)]) {
    if (n > 0x90) {
      break
    }
    table[n] = `CC${cc}`
    n += 1
  }
  table[0x90] = 'CC119'
  Object.assign(table, {
    0x91: 'Bend',
    0x92: 'Touch',
    0x93: 'Vel',
    0x94: 'Last•',
    0x95: 'Low•',
    0x96: 'High•',
    0x97: 'Tempo',
    0x98: 'Cmnds',
    0x99: 'Gate',
    0x9A: 'Trig',
    0x9B: 'LGate',
    0x9C: 'TSw',
    0x9D: 'Toe'
  })
  return table
}

async function listKnownTables() {
  const raw = await readFile(unitsMapFile, 'utf8')
  const tables = new Set()
  for (const match of raw.matchAll(/stringTable: '([a-zA-Z0-9_]+)'/g)) {
    tables.add(match[1])
  }
  tables.add('control_source_strings')
  return [...tables].sort()
}

async function main() {
  const harvestPath = process.argv.slice(2).find(arg => arg !== '--')
  const knownTables = await listKnownTables()
  const stringTables = Object.fromEntries(knownTables.map(name => [name, {}]))
  stringTables.control_source_strings = seedControlSources()
  // Obvious small tables from the MIDI appendix (safe without hardware).
  stringTables.on_off_strings = { 0: 'Off', 1: 'On' }

  let generatedAt = null
  let harvestedTableCount = 0
  let source = 'pdf-control-sources'

  if (harvestPath) {
    const bundle = JSON.parse(await readFile(harvestPath, 'utf8'))
    generatedAt = bundle.generatedAt ?? new Date().toISOString()
    source = 'hardware-harvest'
    const incoming = bundle.stringTables ?? {}
    for (const [name, table] of Object.entries(incoming)) {
      stringTables[name] = { ...(stringTables[name] ?? {}), ...table }
      if (Object.keys(table).length > 0) {
        harvestedTableCount += 1
      }
    }
    // Always keep PDF control-source seed unless harvest overwrote entries.
    if (!incoming.control_source_strings || Object.keys(incoming.control_source_strings).length === 0) {
      stringTables.control_source_strings = seedControlSources()
    }
  }

  const tableLines = knownTables.map((name) => {
    const body = serializeRecord(stringTables[name] ?? {}, 1)
    return `  ${name}: ${body},`
  })

  const body = `/* eslint-disable */
/**
 * AUTO-GENERATED display-unit string tables.
 * Seed: Control Sources from MIDI SysEx PDF.
 * Refresh via /tools/harvest-units → apply with:
 *   pnpm run generate:units-strings -- path/to/mpx-g2-units-harvest.json
 */
export const GENERATED_UNIT_STRING_TABLES = {
${tableLines.join('\n')}
} as const

export type GeneratedUnitStringTable = keyof typeof GENERATED_UNIT_STRING_TABLES

/** Optional provenance from the last hardware harvest. */
export const GENERATED_UNIT_STRINGS_META = {
  source: ${JSON.stringify(source)} as const,
  generatedAt: ${generatedAt ? JSON.stringify(generatedAt) : 'null'} as string | null,
  tableCount: ${knownTables.length},
  harvestedTableCount: ${harvestedTableCount}
}
`

  await writeFile(outFile, `${body.trimEnd()}\n`, 'utf8')
  console.log(
    `Wrote ${knownTables.length} table(s) (${harvestedTableCount} harvested) → ${outFile}`
  )
}

await main()
