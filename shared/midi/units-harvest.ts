import { displayUnitStringTable, DISPLAY_UNITS, type DisplayUnitMeta } from '../constants/units-map'
import { GENERATED_ALGORITHMS } from '../constants/algorithms.generated'
import { EFFECT_TYPE_BY_BLOCK } from './control-paths'
import {
  ObjectControlFlag,
  type HarvestTreeNode
} from './effect-harvest'
import {
  editorObjectLimit,
  type ObjectDescription
} from './object-description'
import type { EffectBlockId } from '../types/effect-blocks'
import type { AlgorithmDef } from '../types/algorithm'

/** One sweep job: write values at a path and capture Formatted String replies. */
export type UnitsHarvestJob = {
  displayUnits: number
  stringTable: string
  path: number[]
  objectTypeId: number
  paramName: string
  min: number
  max: number
  bytes: 1 | 2
  signed: boolean
  /** Block that owns this path (for loading the alg before sweep). */
  block: EffectBlockId
  /** 1-based algorithm index within the block. */
  alg: number
}

/** Captured label for one raw value. */
export type UnitsHarvestSample = {
  value: number
  text: string
}

export type UnitsHarvestTableResult = {
  stringTable: string
  displayUnits: number[]
  samples: UnitsHarvestSample[]
  sourcePath: number[]
  paramName: string
}

/** Catalog param to probe for Object Description / displayUnits. */
export type UnitsCatalogProbe = {
  algorithmId: string
  block: EffectBlockId
  alg: number
  paramId: string
  paramIndex: number
  path: number[]
  label: string
}

/** Skip huge enums (Control Sources, patch destinations) — seed or special-case those. */
export const UNITS_HARVEST_MAX_SPAN = 128

export const UNITS_HARVEST_SKIP_TABLES = new Set([
  'control_source_strings'
])

/** String tables we can discover from effect params (excludes PDF-seeded / huge tables). */
export function harvestableStringTables(): string[] {
  const names = new Set<string>()
  for (const unit of DISPLAY_UNITS) {
    if (unit.stringTable && !UNITS_HARVEST_SKIP_TABLES.has(unit.stringTable)) {
      names.add(unit.stringTable)
    }
  }
  return [...names].sort()
}

/**
 * Build Program-branch probe paths from content/algorithms.generated.ts.
 * Uses the first `availableIn` block per algorithm (one slot is enough for OD).
 * Non-mix/level params first so enum string tables are found sooner.
 */
export function buildUnitsCatalogProbes(): UnitsCatalogProbe[] {
  const probes: UnitsCatalogProbe[] = []
  const seenPath = new Set<string>()

  const algorithms = Object.values(GENERATED_ALGORITHMS) as AlgorithmDef[]
  for (const algorithm of algorithms) {
    const entry = Object.entries(algorithm.availableIn)[0] as
      | [EffectBlockId, number]
      | undefined
    if (!entry) {
      continue
    }
    const [block, alg] = entry
    if (alg < 1) {
      continue
    }
    const effectType = EFFECT_TYPE_BY_BLOCK[block]
    for (const param of algorithm.params) {
      const path = [0, effectType, alg, param.index]
      const key = path.join('.')
      if (seenPath.has(key)) {
        continue
      }
      seenPath.add(key)
      probes.push({
        algorithmId: algorithm.id,
        block,
        alg,
        paramId: param.id,
        paramIndex: param.index,
        path,
        label: param.label
      })
    }
  }

  // Group by block/alg so the probe phase can load each algorithm once.
  // Within an alg, non-mix/level params first (enum tables live there).
  probes.sort((a, b) => {
    if (a.block !== b.block) {
      return a.block.localeCompare(b.block)
    }
    if (a.alg !== b.alg) {
      return a.alg - b.alg
    }
    const aCommon = a.paramId === 'mix' || a.paramId === 'level' ? 1 : 0
    const bCommon = b.paramId === 'mix' || b.paramId === 'level' ? 1 : 0
    if (aCommon !== bCommon) {
      return aCommon - bCommon
    }
    return a.paramIndex - b.paramIndex
  })

  return probes
}

/**
 * Pick one representative param leaf per string-backed display unit.
 * Prefers smaller spans and Program-branch effect params.
 */
export function planUnitsHarvestJobs(
  nodes: HarvestTreeNode[],
  descriptions: Map<number, ObjectDescription>,
  options?: {
    maxSpan?: number
    skipTables?: ReadonlySet<string>
    /** path key "0.2.1.0" → catalog probe (adds block/alg to jobs). */
    probeByPathKey?: Map<string, UnitsCatalogProbe>
  }
): UnitsHarvestJob[] {
  const maxSpan = options?.maxSpan ?? UNITS_HARVEST_MAX_SPAN
  const skipTables = options?.skipTables ?? UNITS_HARVEST_SKIP_TABLES
  const probeByPathKey = options?.probeByPathKey

  const bestByTable = new Map<string, UnitsHarvestJob>()

  for (const node of nodes) {
    if (node.levels.length !== 4 || node.levels[0] !== 0) {
      continue
    }
    const description = descriptions.get(node.objectTypeId)
    if (!description) {
      continue
    }
    if ((description.controlFlags & ObjectControlFlag.ControlLevel) !== 0) {
      continue
    }
    if (description.byteCount > 2 || description.byteCount <= 0) {
      continue
    }

    const limit = editorObjectLimit(description)
    if (!limit) {
      continue
    }
    const stringTable = displayUnitStringTable(limit.displayUnits)
    if (!stringTable || skipTables.has(stringTable)) {
      continue
    }

    const span = limit.max - limit.min
    if (span < 0 || span > maxSpan) {
      continue
    }

    const pathKey = node.levels.join('.')
    const probe = probeByPathKey?.get(pathKey)
    const effectType = node.levels[1]!
    const block = (Object.entries(EFFECT_TYPE_BY_BLOCK)
      .find(([, type]) => type === effectType)?.[0] ?? 'chorus') as EffectBlockId
    const alg = node.levels[2]!

    const job: UnitsHarvestJob = {
      displayUnits: limit.displayUnits,
      stringTable,
      path: [...node.levels],
      objectTypeId: node.objectTypeId,
      paramName: description.name.trim() || probe?.label || `type ${node.objectTypeId}`,
      min: limit.min,
      max: limit.max,
      bytes: description.byteCount === 1 ? 1 : 2,
      signed: limit.signed,
      block: probe?.block ?? block,
      alg: probe?.alg ?? alg
    }

    const existing = bestByTable.get(stringTable)
    if (!existing || (job.max - job.min) < (existing.max - existing.min)) {
      bestByTable.set(stringTable, job)
    }
  }

  return [...bestByTable.values()].sort((a, b) => a.stringTable.localeCompare(b.stringTable))
}

/** Fold sweep samples into sparse table records. Drops stuck/garbage sweeps. */
export function foldUnitsHarvestSamples(
  jobs: UnitsHarvestJob[],
  samplesByTable: Map<string, UnitsHarvestSample[]>
): UnitsHarvestTableResult[] {
  const results: UnitsHarvestTableResult[] = []
  for (const job of jobs) {
    const raw = samplesByTable.get(job.stringTable) ?? []
    const samples = raw.filter((s) => {
      const t = s.text?.trim() ?? ''
      return t.length > 0 && t.length <= 24
    })
    const unique = new Set(samples.map(s => s.text))
    // A multi-value table that never changes label means writes didn't take effect.
    if (samples.length === 0 || (samples.length > 1 && unique.size < 2)) {
      continue
    }
    results.push({
      stringTable: job.stringTable,
      displayUnits: [job.displayUnits],
      samples,
      sourcePath: job.path,
      paramName: job.paramName
    })
  }
  return results
}

/** Merge harvested tables into a full tables object (sparse value→label). */
export function mergeUnitStringTables(
  base: Record<string, Record<number, string>>,
  harvested: UnitsHarvestTableResult[]
): Record<string, Record<number, string>> {
  const next: Record<string, Record<number, string>> = {}
  for (const [name, table] of Object.entries(base)) {
    next[name] = { ...table }
  }
  for (const result of harvested) {
    const table = { ...(next[result.stringTable] ?? {}) }
    for (const sample of result.samples) {
      if (sample.text) {
        table[sample.value] = sample.text
      }
    }
    next[result.stringTable] = table
  }
  return next
}

export type UnitsHarvestBundle = {
  generatedAt: string
  jobs: UnitsHarvestJob[]
  tables: UnitsHarvestTableResult[]
  stringTables: Record<string, Record<number, string>>
  unitMeta: Array<Pick<DisplayUnitMeta, 'id' | 'name' | 'stringTable'>>
}
