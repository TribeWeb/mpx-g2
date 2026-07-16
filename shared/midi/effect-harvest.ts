import { EFFECT_TYPE_BY_BLOCK } from './control-paths'
import { editorObjectRange, type ObjectDescription } from './object-description'
import type { EffectBlockId } from '../types/effect-blocks'
import { EFFECT_BLOCK_IDS } from '../types/effect-blocks'

/** Object Description control-flag bits (MIDI impl doc). */
export const ObjectControlFlag = {
  Patchable: 0x01,
  Automation: 0x02,
  ControlLevel: 0x04,
  BottomControlLevel: 0x08,
  UsesTempo: 0x10,
  Wrapping: 0x20,
  SoftRowAssignable: 0x40
} as const

export type HarvestTreeNode = {
  objectTypeId: number
  levels: number[]
}

export type HarvestParamDraft = {
  id: string
  index: number
  label: string
  min: number
  max: number
  description: string
  softRow: boolean
  bytes: 1 | 2
  objectTypeId: number
}

export type HarvestEffectDraft = {
  /** Filename stem suggestion (kebab-case). */
  slug: string
  name: string
  modelName: string
  summary: string
  /** Unknown until manual pass — omit from YAML or leave 0 with a TODO. */
  dspSteps: number | null
  manualSection: string
  availableIn: Partial<Record<EffectBlockId, number>>
  softRow: string[]
  params: HarvestParamDraft[]
  /** Primary block used when writing a single draft file. */
  primaryBlock: EffectBlockId
  primaryAlg: number
}

const BLOCK_BY_EFFECT_TYPE = Object.fromEntries(
  Object.entries(EFFECT_TYPE_BY_BLOCK).map(([block, type]) => [type, block])
) as Record<number, EffectBlockId>

export function effectBlockForType(effectType: number): EffectBlockId | null {
  return BLOCK_BY_EFFECT_TYPE[effectType] ?? null
}

/** Normalize an LCD / Object Description name into a param id. */
export function slugifyParamId(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
  return cleaned || 'param'
}

/** Normalize an effect name into a content filename stem. */
export function slugifyEffectName(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'effect'
}

export function isProgramEffectPath(levels: number[]): boolean {
  return levels.length >= 2
    && levels[0] === 0
    && effectBlockForType(levels[1]!) != null
}

export function isProgramEffectParamPath(levels: number[]): boolean {
  return levels.length === 4 && isProgramEffectPath(levels)
}

export function isProgramEffectAlgPath(levels: number[]): boolean {
  return levels.length === 3 && isProgramEffectPath(levels)
}

/**
 * Fold control-tree nodes + Object Descriptions into per-algorithm drafts.
 * Expects Program-branch paths: [0, effectType, alg, paramIndex].
 */
export function buildEffectDraftsFromHarvest(
  nodes: HarvestTreeNode[],
  descriptions: Map<number, ObjectDescription>
): HarvestEffectDraft[] {
  type AlgKey = string
  const byAlg = new Map<AlgKey, {
    block: EffectBlockId
    alg: number
    name: string
    params: HarvestParamDraft[]
  }>()

  function algKey(block: EffectBlockId, alg: number): AlgKey {
    return `${block}:${alg}`
  }

  function ensureAlg(block: EffectBlockId, alg: number, nameHint?: string) {
    const key = algKey(block, alg)
    let entry = byAlg.get(key)
    if (!entry) {
      entry = {
        block,
        alg,
        name: nameHint?.trim() || `Algorithm ${alg}`,
        params: []
      }
      byAlg.set(key, entry)
    } else if (nameHint?.trim() && entry.name.startsWith('Algorithm ')) {
      entry.name = nameHint.trim()
    }
    return entry
  }

  for (const node of nodes) {
    if (!isProgramEffectPath(node.levels)) {
      continue
    }
    const block = effectBlockForType(node.levels[1]!)
    if (!block) {
      continue
    }
    const description = descriptions.get(node.objectTypeId)
    if (!description) {
      continue
    }

    if (isProgramEffectAlgPath(node.levels)) {
      const alg = node.levels[2]!
      if (alg <= 0) {
        continue
      }
      // Prefer non-branch names as algorithm titles when present.
      const isBranch = (description.controlFlags & ObjectControlFlag.ControlLevel) !== 0
      if (!isBranch || description.name.trim()) {
        ensureAlg(block, alg, description.name)
      }
      continue
    }

    if (!isProgramEffectParamPath(node.levels)) {
      continue
    }

    const alg = node.levels[2]!
    const paramIndex = node.levels[3]!
    if (alg <= 0) {
      continue
    }

    const isBranch = (description.controlFlags & ObjectControlFlag.ControlLevel) !== 0
    if (isBranch) {
      continue
    }

    const range = editorObjectRange(description) ?? { min: 0, max: 127 }
    const label = description.name.trim() || `Param ${paramIndex}`
    const entry = ensureAlg(block, alg)
    const softRow = (description.controlFlags & ObjectControlFlag.SoftRowAssignable) !== 0
    entry.params.push({
      id: slugifyParamId(label),
      index: paramIndex,
      label,
      min: range.min,
      max: range.max,
      description: '', // fill from manual
      softRow,
      bytes: description.byteCount === 1 ? 1 : 2,
      objectTypeId: node.objectTypeId
    })
  }

  // Merge identical effect names across blocks into one draft with multi availableIn.
  const byName = new Map<string, HarvestEffectDraft>()

  for (const entry of byAlg.values()) {
    entry.params.sort((a, b) => a.index - b.index)
    // Disambiguate duplicate param ids within one alg.
    const seen = new Map<string, number>()
    for (const param of entry.params) {
      const count = seen.get(param.id) ?? 0
      seen.set(param.id, count + 1)
      if (count > 0) {
        param.id = `${param.id}${count + 1}`
      }
    }

    const nameKey = entry.name.toLowerCase()
    const existing = byName.get(nameKey)
    if (existing) {
      existing.availableIn[entry.block] = entry.alg
      // Prefer the richer param list if lengths differ.
      if (entry.params.length > existing.params.length) {
        existing.params = entry.params
        existing.softRow = entry.params.filter(p => p.softRow).map(p => p.id)
        existing.primaryBlock = entry.block
        existing.primaryAlg = entry.alg
      }
      continue
    }

    byName.set(nameKey, {
      slug: slugifyEffectName(entry.name),
      name: entry.name,
      modelName: entry.name,
      summary: `TODO: copy prose from the MPX G2 manual for ${entry.name}.`,
      dspSteps: null,
      manualSection: '',
      availableIn: { [entry.block]: entry.alg },
      softRow: entry.params.filter(p => p.softRow).map(p => p.id),
      params: entry.params,
      primaryBlock: entry.block,
      primaryAlg: entry.alg
    })
  }

  // Ensure unique slugs.
  const usedSlugs = new Map<string, number>()
  const drafts = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
  for (const draft of drafts) {
    const base = draft.slug
    const n = usedSlugs.get(base) ?? 0
    usedSlugs.set(base, n + 1)
    if (n > 0) {
      draft.slug = `${base}-${n + 1}`
    }
  }

  return drafts
}

/** Serialize one draft as Content-ready Markdown frontmatter (+ TODO body). */
export function harvestDraftToMarkdown(draft: HarvestEffectDraft): string {
  const lines: string[] = ['---']
  lines.push(`name: ${yamlString(draft.name)}`)
  lines.push(`modelName: ${yamlString(draft.modelName)}`)
  lines.push(`summary: ${yamlString(draft.summary)}`)
  lines.push(`dspSteps: ${draft.dspSteps ?? 0}  # TODO: confirm from manual bar (of 190)`)
  if (draft.manualSection) {
    lines.push(`manualSection: ${yamlString(draft.manualSection)}`)
  }
  lines.push('availableIn:')
  for (const block of EFFECT_BLOCK_IDS) {
    const alg = draft.availableIn[block]
    if (alg != null) {
      lines.push(`  ${block}: ${alg}`)
    }
  }
  lines.push('softRow:')
  if (draft.softRow.length === 0) {
    // Keep as empty YAML list for the generate script.
    lines[lines.length - 1] = 'softRow: []'
  } else {
    for (const id of draft.softRow) {
      lines.push(`  - ${id}`)
    }
  }
  lines.push('params:')
  for (const param of draft.params) {
    lines.push(`  - id: ${param.id}`)
    lines.push(`    index: ${param.index}`)
    lines.push(`    label: ${yamlString(param.label)}`)
    lines.push(`    min: ${param.min}`)
    lines.push(`    max: ${param.max}`)
    lines.push(`    description: ${yamlString(param.description || 'TODO')}`)
  }
  lines.push('---')
  lines.push('')
  lines.push(`# ${draft.name}`)
  lines.push('')
  lines.push(draft.summary)
  lines.push('')
  lines.push(`![${draft.name} signal flow](/effects/${draft.slug}.png)`)
  lines.push('')
  lines.push('<!-- Harvested from G2 control tree + Object Descriptions. Fill prose, dspSteps, diagram, and param descriptions from the manual. -->')
  lines.push('')
  return lines.join('\n')
}

function yamlString(value: string): string {
  if (/^[\w .+/-]+$/.test(value) && !value.includes(':')) {
    return value.includes(' ') ? JSON.stringify(value) : value
  }
  return JSON.stringify(value)
}

export function harvestDraftsToBundle(drafts: HarvestEffectDraft[]) {
  return {
    generatedAt: new Date().toISOString(),
    effectCount: drafts.length,
    effects: drafts
  }
}
