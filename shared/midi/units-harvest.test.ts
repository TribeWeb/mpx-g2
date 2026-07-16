import { describe, expect, it } from 'vitest'
import { ObjectControlFlag } from './effect-harvest'
import type { ObjectDescription } from './object-description'
import { parseFormattedStringPayload } from './formatted-string'
import { nibblize } from './sysex'
import {
  buildUnitsCatalogProbes,
  foldUnitsHarvestSamples,
  harvestableStringTables,
  mergeUnitStringTables,
  planUnitsHarvestJobs
} from './units-harvest'
import { formatDisplayUnitRange, formatDisplayUnitValue } from './display-units-format'

function desc(
  objectTypeId: number,
  name: string,
  flags: number,
  min: number,
  max: number,
  displayUnits: number
): ObjectDescription {
  return {
    objectTypeId,
    name,
    byteCount: 1,
    controlFlags: flags,
    optionObjectTypeId: null,
    limits: [{ min, max, displayUnits, signed: min < 0 }]
  }
}

describe('units-harvest', () => {
  it('builds catalog probes from generated algorithms', () => {
    const probes = buildUnitsCatalogProbes()
    expect(probes.length).toBeGreaterThan(50)
    expect(probes.every(p => p.path.length === 4 && p.path[0] === 0)).toBe(true)
    expect(harvestableStringTables().length).toBeGreaterThan(10)
  })

  it('plans one job per string table from program param leaves', () => {
    const descriptions = new Map<number, ObjectDescription>([
      [1, desc(1, 'Wave', 0, 0, 3, 0x02)],
      [2, desc(2, 'Enable', 0, 0, 1, 0x04)],
      [3, desc(3, 'Mix', 0, 0, 100, 0x00)],
      [4, desc(4, 'Branch', ObjectControlFlag.ControlLevel, 0, 5, 0x04)]
    ])

    const jobs = planUnitsHarvestJobs(
      [
        { objectTypeId: 1, levels: [0, 2, 1, 2] },
        { objectTypeId: 2, levels: [0, 2, 1, 3] },
        { objectTypeId: 3, levels: [0, 2, 1, 0] },
        { objectTypeId: 4, levels: [0, 2, 1, 4] }
      ],
      descriptions
    )

    expect(jobs.map(j => j.stringTable).sort()).toEqual(['on_off_strings', 'waveform_strings'])
    expect(jobs.find(j => j.stringTable === 'on_off_strings')?.paramName).toBe('Enable')
    expect(jobs.find(j => j.stringTable === 'on_off_strings')?.block).toBe('chorus')
  })

  it('merges harvested samples into string tables', () => {
    const folded = foldUnitsHarvestSamples(
      [{
        displayUnits: 0x04,
        stringTable: 'on_off_strings',
        path: [0, 2, 1, 0],
        objectTypeId: 1,
        paramName: 'Enable',
        min: 0,
        max: 1,
        bytes: 1,
        signed: false,
        block: 'chorus',
        alg: 1
      }],
      new Map([['on_off_strings', [{ value: 0, text: 'Off' }, { value: 1, text: 'On' }]]])
    )
    const merged = mergeUnitStringTables({ on_off_strings: {} }, folded)
    expect(merged.on_off_strings).toEqual({ 0: 'Off', 1: 'On' })
  })
})

describe('formatted-string', () => {
  it('parses a short Formatted String payload', () => {
    const chars = [...'On'].map(c => c.charCodeAt(0))
    const bytes = [
      2, 0,
      ...chars,
      4, 0,
      0, 0, 2, 0, 1, 0, 0, 0
    ]
    const parsed = parseFormattedStringPayload(nibblize(bytes))
    expect(parsed).toEqual({
      text: 'On',
      charBytes: [0x4f, 0x6e],
      levels: [0, 2, 1, 0]
    })
  })
})

describe('display-units-format', () => {
  it('formats numeric units from the appendix rules', () => {
    expect(formatDisplayUnitValue(0x00, 50)).toBe('50%')
    expect(formatDisplayUnitValue(0x09, 12)).toBe('12 Hz')
    expect(formatDisplayUnitValue(0x80, -89, { min: -89 })).toBe('Off')
    expect(formatDisplayUnitRange(0x03, 0, 100)).toBe('0%…100%')
  })

  it('uses seeded control-source labels', () => {
    expect(formatDisplayUnitValue(0x28, 0x06)).toBe('Sine1')
  })
})
