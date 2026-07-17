import { describe, expect, it } from 'vitest'
import { programBankAndPc, buildProgramSelectMessages } from './program-select'
import {
  ACTIVE_PROGRAM_DUMP_PATH,
  isActiveProgramDumpPath,
  parseProgramDumpPath,
  programDumpControlPath
} from './program-dump'
import { buildActiveProgramDumpRequest } from './requests'

describe('programBankAndPc', () => {
  it('maps program numbers to bank + PC', () => {
    expect(programBankAndPc(1)).toEqual({ bank: 0, pc: 0 })
    expect(programBankAndPc(100)).toEqual({ bank: 0, pc: 99 })
    expect(programBankAndPc(107)).toEqual({ bank: 1, pc: 6 })
    expect(programBankAndPc(250)).toEqual({ bank: 2, pc: 49 })
  })
})

describe('buildProgramSelectMessages', () => {
  it('emits CC0, CC32, then Program Change on channel 1', () => {
    const msgs = buildProgramSelectMessages(107)
    expect(msgs).toHaveLength(3)
    expect([...msgs[0]!.bytes]).toEqual([0xb0, 0x00, 0x00])
    expect([...msgs[1]!.bytes]).toEqual([0xb0, 0x20, 0x01])
    expect([...msgs[2]!.bytes]).toEqual([0xc0, 0x06])
  })
})

describe('active program dump path', () => {
  it('identifies the active slot separately from stored programs', () => {
    expect(isActiveProgramDumpPath([...ACTIVE_PROGRAM_DUMP_PATH])).toBe(true)
    expect(parseProgramDumpPath([...ACTIVE_PROGRAM_DUMP_PATH])).toBeNull()
    expect(parseProgramDumpPath(programDumpControlPath(1))).toEqual({ programNumber: 1 })
  })

  it('builds an active dump Data request', () => {
    const req = buildActiveProgramDumpRequest()
    expect(req[0]).toBe(0xf0)
    expect(req[4]).toBe(0x06)
  })
})
