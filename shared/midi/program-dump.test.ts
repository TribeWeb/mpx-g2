import { describe, expect, it } from 'vitest'
import {
  ACTIVE_PROGRAM_DUMP_PATH,
  FACTORY_PROGRAM_COUNT,
  PROGRAM_DUMP_BYTE_COUNT,
  decodeProgramDumpBlocks,
  decodeProgramParamBlob,
  parseProgramDumpAlgs,
  parseProgramDumpName,
  parseProgramDumpPath,
  programDumpControlPath
} from './program-dump'
import { buildProgramDumpRequest } from './requests'
import { parseDataMessagePayload } from './data-message'
import { parseMpxG2SysEx, buildDataMessage } from './sysex'

describe('programDumpControlPath', () => {
  it('maps 1-based program numbers into bank/index slots', () => {
    expect(programDumpControlPath(1)).toEqual([0x0001, 0x000a, 0, 0])
    expect(programDumpControlPath(100)).toEqual([0x0001, 0x000a, 0, 99])
    expect(programDumpControlPath(101)).toEqual([0x0001, 0x000a, 1, 0])
    expect(programDumpControlPath(250)).toEqual([0x0001, 0x000a, 2, 49])
    expect(programDumpControlPath(300)).toEqual([0x0001, 0x000a, 2, 99])
  })

  it('rejects out-of-range program numbers', () => {
    expect(() => programDumpControlPath(0)).toThrow(RangeError)
    expect(() => programDumpControlPath(301)).toThrow(RangeError)
  })
})

describe('parseProgramDumpPath', () => {
  it('round-trips control paths for factory presets', () => {
    for (const n of [1, 19, 100, 101, 200, FACTORY_PROGRAM_COUNT]) {
      expect(parseProgramDumpPath(programDumpControlPath(n))).toEqual({ programNumber: n })
    }
  })

  it('ignores the active-program slot', () => {
    expect(parseProgramDumpPath([...ACTIVE_PROGRAM_DUMP_PATH])).toBeNull()
  })
})

describe('parseProgramDumpName / algs', () => {
  it('reads name and alg_nums at offsets measured from live dumps', () => {
    const data = Array.from({ length: PROGRAM_DUMP_BYTE_COUNT }, () => 0)
    // alg_nums @ 279–285
    data[279] = 12 // fx1 univybe
    data[280] = 18 // fx2 pedal-wah-1
    data[281] = 16 // chorus pedal-vol
    data[282] = 6 // delay echo-d
    data[283] = 4 // reverb ambience
    data[284] = 0
    data[285] = 3 // gain tube-screamer
    // name @ 286–297
    const name = 'G2 Blue     '
    for (let i = 0; i < 12; i++) {
      data[286 + i] = name.charCodeAt(i)
    }

    expect(parseProgramDumpName(data)).toBe('G2 Blue')
    expect(parseProgramDumpAlgs(data)).toEqual({
      fx1: 12,
      fx2: 18,
      chorus: 16,
      delay: 6,
      reverb: 4,
      eq: 0,
      gain: 3
    })
  })

  it('parses names/algs/params from the smoke-test harvest fixture', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const fixturePath = resolve(process.cwd(), 'tmp/mpx-g2-program-harvest.json')
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as {
      programs: { programNumber: number, dataHex: string }[]
    }
    const byNum = Object.fromEntries(
      fixture.programs.map(p => [p.programNumber, p])
    )

    const p1 = Array.from(Buffer.from(byNum[1]!.dataHex, 'hex'))
    expect(parseProgramDumpName(p1)).toBe('G2 Blue')
    expect(parseProgramDumpAlgs(p1)).toMatchObject({ gain: 3, fx1: 12, delay: 6 })

    const blocks = decodeProgramDumpBlocks(p1)
    const gain = blocks.find(b => b.id === 'gain')
    expect(gain).toMatchObject({
      effect: 'tube-screamer',
      alg: 3,
      params: {
        lo: 2,
        mid: 1,
        hi: 3,
        drive: 22,
        tone: 25,
        level: 57
      }
    })

    const p2 = Array.from(Buffer.from(byNum[2]!.dataHex, 'hex'))
    expect(parseProgramDumpName(p2)).toBe('Guitar Solo')
    expect(parseProgramDumpAlgs(p2)).toMatchObject({ gain: 3, reverb: 3 })

    const p3 = Array.from(Buffer.from(byNum[3]!.dataHex, 'hex'))
    expect(parseProgramDumpName(p3)).toBe('Cordovox')
    expect(parseProgramDumpAlgs(p3)).toMatchObject({ gain: 1 })
  })
})

describe('decodeProgramParamBlob', () => {
  it('packs 1-byte Screamer params in index order', async () => {
    const { algorithmById } = await import('../constants/algorithms')
    const def = algorithmById('tube-screamer')!
    const blob = Array.from({ length: 32 }, () => 0)
    blob[0] = 2
    blob[1] = 1
    blob[2] = 3
    blob[3] = 22
    blob[4] = 25
    blob[5] = 57
    expect(decodeProgramParamBlob(blob, def)).toEqual({
      lo: 2,
      mid: 1,
      hi: 3,
      drive: 22,
      tone: 25,
      level: 57
    })
  })
})

describe('buildProgramDumpRequest', () => {
  it('builds a Data request whose reply path matches program 1', () => {
    const req = buildProgramDumpRequest(1)
    expect(req[0]).toBe(0xf0)
    expect(req[1]).toBe(0x06)
    expect(req[4]).toBe(0x06) // Request message type
  })

  it('round-trips a synthetic program dump data message', () => {
    const data = Array.from({ length: PROGRAM_DUMP_BYTE_COUNT }, (_, i) => i & 0xff)
    const levels = programDumpControlPath(42)
    const message = buildDataMessage(data, levels)
    const parsed = parseMpxG2SysEx(message)
    expect(parsed?.messageType).toBe(0x01)
    const payload = parseDataMessagePayload(parsed!.payload)
    expect(payload?.data.length).toBe(PROGRAM_DUMP_BYTE_COUNT)
    expect(parseProgramDumpPath(payload!.levels)).toEqual({ programNumber: 42 })
  })
})
