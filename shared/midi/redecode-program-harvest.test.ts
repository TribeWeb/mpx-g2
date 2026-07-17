/**
 * One-shot: re-decode harvest hex → blocks, write JSON.
 *   pnpm run redecode:program-harvest
 *
 * Skips when the harvest fixture is absent (CI without tmp/).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeProgramDumpBlocks } from './program-dump'

const ROOT = resolve(import.meta.dirname, '../..')
const harvestPath = resolve(
  ROOT,
  process.env.PROGRAM_HARVEST_JSON ?? 'tmp/mpx-g2-program-harvest (2).json'
)

describe('redecode program harvest', () => {
  it('rewrites blocks[].params from dataHex', () => {
    if (!existsSync(harvestPath)) {
      return
    }

    const harvest = JSON.parse(readFileSync(harvestPath, 'utf8')) as {
      programs: {
        programNumber: number
        dataHex?: string
        blocks?: unknown
        algs?: Record<string, number>
      }[]
    }
    expect(Array.isArray(harvest.programs)).toBe(true)

    let updated = 0
    for (const program of harvest.programs) {
      if (!program.dataHex) {
        continue
      }
      const data = Array.from(Buffer.from(program.dataHex, 'hex'))
      program.blocks = decodeProgramDumpBlocks(data)
      program.algs = Object.fromEntries(
        program.blocks.map(b => [b.id, b.alg])
      )
      updated += 1
    }

    writeFileSync(harvestPath, `${JSON.stringify(harvest, null, 2)}\n`, 'utf8')
    expect(updated).toBeGreaterThan(0)

    // Spot-check G2 Blue ambience size (was 297 with bad 2-byte inference)
    const p1 = harvest.programs.find(p => p.programNumber === 1)!
    const reverb = (p1.blocks as { id: string, params: Record<string, number> }[])
      .find(b => b.id === 'reverb')!
    expect(reverb.params.size).toBe(41)
    expect(reverb.params.link).toBe(1)
  })
})
