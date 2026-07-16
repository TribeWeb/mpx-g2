/**
 * Stamp displayUnits onto content/effects/*.md params from an effect-harvest JSON.
 *
 * Joins effects[].params[].objectTypeId → descriptions[].limits[0].displayUnits.
 * Optionally merge a second OD dump (e.g. units-focused harvest) for richer limits.
 *
 * Usage:
 *   node scripts/stamp-display-units.mjs \
 *     "tmp/mpx-g2-effect-harvest (1).json" \
 *     "tmp/mpx-g2-effect-harvest (units).json"
 *
 * Then: pnpm run generate:algorithms
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const effectsDir = join(root, 'content', 'effects')

/** Content slug → harvest slug when names diverge. */
const SLUG_ALIASES = {
  'stereo-chorus': 'chorus',
  'tube-screamer': 'screamer',
  // Harvest labels SplitPreamp's gain slot as "Mix"
  splitpreamp: 'mix'
}

const ControlLevel = 0x04

function parseArgs(argv) {
  return argv.slice(2).filter(a => a !== '--')
}

function displayUnitsFromDescription(desc) {
  if (!desc) {
    return null
  }
  if ((desc.controlFlags & ControlLevel) !== 0) {
    return null
  }
  const bc = desc.byteCount ?? 0
  if (bc <= 0 || bc > 2) {
    return null
  }
  const limit = desc.limits?.[0]
  if (!limit || typeof limit.displayUnits !== 'number') {
    return null
  }
  return limit.displayUnits & 0x7fff
}

function indexDescriptions(bundles) {
  /** @type {Map<number, object>} */
  const byId = new Map()
  for (const bundle of bundles) {
    for (const desc of bundle.descriptions ?? []) {
      const id = desc.objectTypeId
      if (typeof id !== 'number') {
        continue
      }
      const prev = byId.get(id)
      // Prefer the description that actually carries limits.
      if (!prev || (!(prev.limits?.length) && desc.limits?.length)) {
        byId.set(id, desc)
      }
    }
  }
  return byId
}

/**
 * Build harvestSlug → Map<paramIndex, displayUnits>
 */
function buildStampMaps(effects, descriptions) {
  /** @type {Map<string, Map<number, number>>} */
  const bySlug = new Map()
  /** @type {Map<string, Map<number, number>>} */
  const byBlockAlg = new Map()

  let stamped = 0
  let skipped = 0

  for (const effect of effects) {
    const slug = effect.slug
    if (!slug) {
      continue
    }
    const paramMap = new Map()
    for (const param of effect.params ?? []) {
      const du = displayUnitsFromDescription(descriptions.get(param.objectTypeId))
      if (du == null) {
        skipped += 1
        continue
      }
      paramMap.set(param.index, du)
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

  return { bySlug, byBlockAlg, stamped, skipped }
}

/**
 * Insert or replace displayUnits on each matched param in YAML frontmatter.
 * Keeps prose/body intact; only touches the params list.
 */
function stampFrontmatter(markdown, paramUnits) {
  const parts = markdown.split(/^---\s*$/m)
  if (parts.length < 3) {
    return { text: markdown, updated: 0, unchanged: 0, missing: 0 }
  }

  const fm = parts[1]
  const body = parts.slice(2).join('---')
  const lines = fm.replace(/^\n/, '').replace(/\n$/, '').split('\n')

  let inParams = false
  let currentIndex = null
  let updated = 0
  let unchanged = 0
  const seen = new Set()
  const out = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
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
      if (currentIndex != null && paramUnits.has(currentIndex) && !seen.has(currentIndex)) {
        out.push(`    displayUnits: ${paramUnits.get(currentIndex)}`)
        seen.add(currentIndex)
        updated += 1
      }
      inParams = false
      out.push(line)
      continue
    }

    const idMatch = trimmed.match(/^\s*-\s+id:\s*(.+)\s*$/)
    if (idMatch) {
      if (currentIndex != null && paramUnits.has(currentIndex) && !seen.has(currentIndex)) {
        out.push(`    displayUnits: ${paramUnits.get(currentIndex)}`)
        seen.add(currentIndex)
        updated += 1
      }
      currentIndex = null
      out.push(line)
      continue
    }

    const indexMatch = trimmed.match(/^\s+index:\s*(\d+)\s*$/)
    if (indexMatch) {
      currentIndex = Number(indexMatch[1])
      out.push(line)
      continue
    }

    const duMatch = trimmed.match(/^\s+displayUnits:\s*(\d+)\s*$/)
    if (duMatch && currentIndex != null) {
      if (paramUnits.has(currentIndex)) {
        const du = paramUnits.get(currentIndex)
        const prev = Number(duMatch[1])
        if (prev === du) {
          unchanged += 1
          out.push(line)
        } else {
          out.push(`    displayUnits: ${du}`)
          updated += 1
        }
        seen.add(currentIndex)
      } else {
        out.push(line)
      }
      continue
    }

    if (
      /^\s+description:\s*/.test(trimmed)
      && currentIndex != null
      && paramUnits.has(currentIndex)
      && !seen.has(currentIndex)
    ) {
      out.push(`    displayUnits: ${paramUnits.get(currentIndex)}`)
      seen.add(currentIndex)
      updated += 1
    }

    out.push(line)
  }

  if (currentIndex != null && paramUnits.has(currentIndex) && !seen.has(currentIndex)) {
    out.push(`    displayUnits: ${paramUnits.get(currentIndex)}`)
    seen.add(currentIndex)
    updated += 1
  }

  let missing = 0
  for (const idx of paramUnits.keys()) {
    if (!seen.has(idx)) {
      missing += 1
    }
  }

  const nextFm = `\n${out.join('\n')}\n`
  return {
    text: `---${nextFm}---${body}`,
    updated,
    unchanged,
    missing
  }
}

async function main() {
  const paths = parseArgs(process.argv)
  if (paths.length === 0) {
    console.error(
      'Usage: node scripts/stamp-display-units.mjs <effect-harvest.json> [units-od.json…]'
    )
    process.exit(1)
  }

  const bundles = []
  for (const p of paths) {
    const abs = p.startsWith('/') ? p : join(root, p)
    bundles.push(JSON.parse(await readFile(abs, 'utf8')))
  }

  const effects = bundles[0].effects ?? []
  if (!effects.length) {
    console.error('First JSON has no effects[] — need the full effect harvest (with drafts).')
    process.exit(1)
  }

  const descriptions = indexDescriptions(bundles)
  const { bySlug, byBlockAlg, stamped, skipped } = buildStampMaps(effects, descriptions)
  console.log(
    `Harvest: ${effects.length} effects, ${stamped} params with displayUnits `
    + `(${skipped} leaf params without limits)`
  )

  const files = (await readdir(effectsDir)).filter(f => f.endsWith('.md'))
  let filesTouched = 0
  let totalUpdated = 0
  let totalUnchanged = 0
  let unmatchedFiles = []

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const harvestSlug = SLUG_ALIASES[slug] ?? slug
    let paramUnits = bySlug.get(harvestSlug)

    if (!paramUnits) {
      // Fallback: match availableIn from content frontmatter roughly via harvest block:alg keys
      // after a quick peek — parse availableIn lines only.
      const raw = await readFile(join(effectsDir, file), 'utf8')
      const avail = [...raw.matchAll(/^\s+(gain|fx1|fx2|chorus|delay|reverb|eq):\s*(\d+)\s*$/gm)]
      for (const m of avail) {
        paramUnits = byBlockAlg.get(`${m[1]}:${m[2]}`)
        if (paramUnits) {
          break
        }
      }
    }

    if (!paramUnits) {
      unmatchedFiles.push(slug)
      continue
    }

    const path = join(effectsDir, file)
    const before = await readFile(path, 'utf8')
    const { text, updated, unchanged, missing } = stampFrontmatter(before, paramUnits)
    if (text !== before) {
      await writeFile(path, text, 'utf8')
      filesTouched += 1
    }
    totalUpdated += updated
    totalUnchanged += unchanged
    if (missing > 0) {
      console.warn(`  ${slug}: ${missing} harvest param index(es) not found in content`)
    }
  }

  console.log(
    `Stamped ${totalUpdated} displayUnits `
    + `(${totalUnchanged} already matched) across ${filesTouched} file(s)`
  )
  if (unmatchedFiles.length) {
    console.warn(`No harvest match for: ${unmatchedFiles.join(', ')}`)
  }
}

await main()
