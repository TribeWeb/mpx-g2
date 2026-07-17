/**
 * Stamp `bytes` + `optionBytes` onto content/effects/*.md params from an
 * effect-harvest JSON (Object Description byteCount + multi-unit heuristic).
 *
 * optionBytes rule (measured against factory program dumps):
 *   - 1 when the OD has exactly 2 unit/limits (Rate Hz vs cycles/beat), OR
 *   - 1 when the value is a signed 2-byte word (e.g. pitch Tune),
 *   - otherwise 0 (Time/delay words use a 0-byte option in the value MSB).
 *
 * Usage:
 *   node scripts/stamp-param-bytes.mjs "tmp/mpx-g2-effect-harvest (1).json"
 *   pnpm run generate:algorithms
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const effectsDir = join(root, 'content', 'effects')

const SLUG_ALIASES = {
  'stereo-chorus': 'chorus',
  'tube-screamer': 'screamer',
  splitpreamp: 'mix'
}

/**
 * @param {object} desc
 * @param {number} byteCount
 * @returns {0 | 1}
 */
export function optionBytesFromDescription(desc, byteCount) {
  const limits = desc?.limits ?? []
  const nlim = limits.length
  const signed = limits.some(l => l?.signed === true)
    || (typeof limits[0]?.min === 'number' && limits[0].min < 0)

  if (nlim === 2) {
    return 1
  }
  if (byteCount === 2 && signed) {
    return 1
  }
  return 0
}

function indexDescriptions(bundle) {
  /** @type {Map<number, object>} */
  const byId = new Map()
  for (const desc of bundle.descriptions ?? []) {
    const id = desc.objectTypeId
    if (typeof id === 'number') {
      byId.set(id, desc)
    }
  }
  return byId
}

/**
 * @returns {Map<string, Map<number, { bytes: 1|2, optionBytes: 0|1 }>>}
 */
function buildStampMaps(effects, descriptions) {
  /** @type {Map<string, Map<number, { bytes: 1|2, optionBytes: 0|1 }>>} */
  const bySlug = new Map()
  /** @type {Map<string, Map<number, { bytes: 1|2, optionBytes: 0|1 }>>} */
  const byBlockAlg = new Map()

  let stamped = 0
  for (const effect of effects) {
    const slug = effect.slug
    if (!slug) {
      continue
    }
    const paramMap = new Map()
    for (const param of effect.params ?? []) {
      const desc = descriptions.get(param.objectTypeId)
      const byteCount = param.bytes === 1 || param.bytes === 2
        ? param.bytes
        : (desc?.byteCount === 1 || desc?.byteCount === 2 ? desc.byteCount : null)
      if (byteCount == null) {
        continue
      }
      const optionBytes = optionBytesFromDescription(desc, byteCount)
      paramMap.set(param.index, { bytes: byteCount, optionBytes })
      stamped += 1
    }
    if (paramMap.size === 0) {
      continue
    }
    bySlug.set(slug, paramMap)
    for (const [block, alg] of Object.entries(effect.availableIn ?? {})) {
      byBlockAlg.set(`${block}:${alg}`, paramMap)
    }
  }

  return { bySlug, byBlockAlg, stamped }
}

/**
 * Insert/replace bytes + optionBytes on each matched param in YAML frontmatter.
 */
function stampFrontmatter(markdown, paramMeta) {
  const parts = markdown.split(/^---\s*$/m)
  if (parts.length < 3) {
    return { text: markdown, updated: 0 }
  }

  const fm = parts[1]
  const body = parts.slice(2).join('---')
  const lines = fm.replace(/^\n/, '').replace(/\n$/, '').split('\n')

  let inParams = false
  let currentIndex = null
  /** @type {Set<string>} */
  let written = new Set()
  let updated = 0
  const out = []

  function flushMeta() {
    if (currentIndex == null || !paramMeta.has(currentIndex)) {
      return
    }
    const meta = paramMeta.get(currentIndex)
    if (!written.has('bytes')) {
      out.push(`    bytes: ${meta.bytes}`)
      written.add('bytes')
      updated += 1
    }
    if (meta.optionBytes > 0 && !written.has('optionBytes')) {
      out.push(`    optionBytes: ${meta.optionBytes}`)
      written.add('optionBytes')
      updated += 1
    }
  }

  for (const line of lines) {
    const trimmed = line.trimEnd()

    if (/^params:\s*$/.test(trimmed)) {
      inParams = true
      out.push(line)
      continue
    }

    if (!inParams) {
      out.push(line)
      continue
    }

    if (/^[a-zA-Z]/.test(trimmed) && !trimmed.startsWith(' ') && !trimmed.startsWith('-')) {
      flushMeta()
      inParams = false
      currentIndex = null
      written = new Set()
      out.push(line)
      continue
    }

    const idMatch = trimmed.match(/^\s*-\s+id:\s*(.+)\s*$/)
    if (idMatch) {
      flushMeta()
      currentIndex = null
      written = new Set()
      out.push(line)
      continue
    }

    const indexMatch = trimmed.match(/^\s+index:\s*(\d+)\s*$/)
    if (indexMatch) {
      currentIndex = Number(indexMatch[1])
      written = new Set()
      out.push(line)
      continue
    }

    const bytesMatch = trimmed.match(/^\s+bytes:\s*(\d+)\s*$/)
    if (bytesMatch && currentIndex != null && paramMeta.has(currentIndex)) {
      const next = paramMeta.get(currentIndex).bytes
      out.push(`    bytes: ${next}`)
      written.add('bytes')
      if (Number(bytesMatch[1]) !== next) {
        updated += 1
      }
      continue
    }

    const optMatch = trimmed.match(/^\s+optionBytes:\s*(\d+)\s*$/)
    if (optMatch && currentIndex != null && paramMeta.has(currentIndex)) {
      const next = paramMeta.get(currentIndex).optionBytes
      if (next > 0) {
        out.push(`    optionBytes: ${next}`)
        written.add('optionBytes')
        if (Number(optMatch[1]) !== next) {
          updated += 1
        }
      } else {
        // Drop stale optionBytes: 0 / incorrect entries.
        updated += 1
      }
      continue
    }

    // Insert before description (or displayUnits) once index is known.
    if (
      currentIndex != null
      && paramMeta.has(currentIndex)
      && (/^\s+description:\s*/.test(trimmed) || /^\s+displayUnits:\s*/.test(trimmed))
      && !written.has('bytes')
    ) {
      flushMeta()
    }

    out.push(line)
  }

  flushMeta()

  const nextFm = `\n${out.join('\n')}\n`
  return {
    text: `---${nextFm}---${body}`,
    updated
  }
}

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Usage: node scripts/stamp-param-bytes.mjs <effect-harvest.json>')
    process.exit(1)
  }

  const abs = arg.startsWith('/') ? arg : join(root, arg)
  const bundle = JSON.parse(await readFile(abs, 'utf8'))
  const effects = bundle.effects ?? []
  if (!effects.length) {
    console.error('JSON has no effects[]')
    process.exit(1)
  }

  const descriptions = indexDescriptions(bundle)
  const { bySlug, byBlockAlg, stamped } = buildStampMaps(effects, descriptions)
  console.log(`Harvest: ${effects.length} effects, ${stamped} params with byte metadata`)

  const files = (await readdir(effectsDir)).filter(f => f.endsWith('.md') && f !== 'all-params.md')
  let filesTouched = 0
  let totalUpdated = 0
  const unmatched = []

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const harvestSlug = SLUG_ALIASES[slug] ?? slug
    let paramMeta = bySlug.get(harvestSlug)

    const path = join(effectsDir, file)
    const before = await readFile(path, 'utf8')

    if (!paramMeta) {
      const avail = [...before.matchAll(/^\s+(gain|fx1|fx2|chorus|delay|reverb|eq):\s*(\d+)\s*$/gm)]
      for (const m of avail) {
        paramMeta = byBlockAlg.get(`${m[1]}:${m[2]}`)
        if (paramMeta) {
          break
        }
      }
    }

    if (!paramMeta) {
      unmatched.push(slug)
      continue
    }

    const { text, updated } = stampFrontmatter(before, paramMeta)
    if (text !== before) {
      await writeFile(path, text, 'utf8')
      filesTouched += 1
    }
    totalUpdated += updated
  }

  console.log(`Stamped byte fields (${totalUpdated} writes) across ${filesTouched} file(s)`)
  if (unmatched.length) {
    console.warn(`No harvest match for: ${unmatched.join(', ')}`)
  }
}

await main()
