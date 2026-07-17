import {
  OBJECT_TYPE_PROGRAM_DUMP,
  SYSTEM_BRANCH,
  SYSTEM_PROGRAMS_TYPE
} from './control-paths'
import { algorithmForBlockAlg } from '../constants/algorithms'
import type { AlgorithmDef, AlgorithmParamDef } from '../types/algorithm'
import type { EffectBlockId } from '../types/effect-blocks'

/** Observed wire size of an Active/Current program dump (MIDI doc table said 443). */
export const PROGRAM_DUMP_BYTE_COUNT = 454

/**
 * Field offsets measured from live Active Program dumps (smoke 001–003).
 * MIDI doc byte table is ~11 bytes short (likely omitted Toe Patches / padding).
 */
export const PROGRAM_DUMP_OFFSET = {
  /** PARAM_DATA: 7 × 32-byte effect param blobs (FX1…Gain). */
  paramData: 0,
  paramBlockBytes: 32,
  /** alg_nums[7]: FX1, FX2, Chorus, Delay, Reverb, EQ, Gain */
  algs: 279,
  /** 12-char space-padded ASCII name */
  name: 286,
  nameLength: 12
} as const

/** Factory presets are 1–250; user programs 251–300. */
export const FACTORY_PROGRAM_COUNT = 250
export const MAX_PROGRAM_NUMBER = 300

/** Dump `alg_nums[]` / param_data order (MIDI effect-type index order). */
export const PROGRAM_DUMP_ALG_BLOCKS = [
  'fx1',
  'fx2',
  'chorus',
  'delay',
  'reverb',
  'eq',
  'gain'
] as const satisfies readonly EffectBlockId[]

export type ProgramDumpAlgBlock = typeof PROGRAM_DUMP_ALG_BLOCKS[number]

export type DecodedProgramBlock = {
  id: ProgramDumpAlgBlock
  alg: number
  /** content/effects slug when known */
  effect: string | null
  params: Record<string, number>
}

/**
 * Control-tree path for stored program N (1-based).
 * Banks of 100: programs 1–100 → C:0, 101–200 → C:1, 201–300 → C:2.
 */
export function programDumpControlPath(programNumber: number): number[] {
  if (!Number.isInteger(programNumber) || programNumber < 1 || programNumber > MAX_PROGRAM_NUMBER) {
    throw new RangeError(`Program number must be 1–${MAX_PROGRAM_NUMBER}, got ${programNumber}`)
  }
  const zeroBased = programNumber - 1
  return [
    SYSTEM_BRANCH,
    SYSTEM_PROGRAMS_TYPE,
    Math.floor(zeroBased / 100),
    zeroBased % 100
  ]
}

/** Active (currently running) program dump path under bank 2. */
export const ACTIVE_PROGRAM_DUMP_PATH = [
  SYSTEM_BRANCH,
  SYSTEM_PROGRAMS_TYPE,
  0x0002,
  0x0064
] as const

export function isActiveProgramDumpPath(levels: number[]): boolean {
  return levels.length === 4
    && levels[0] === ACTIVE_PROGRAM_DUMP_PATH[0]
    && levels[1] === ACTIVE_PROGRAM_DUMP_PATH[1]
    && levels[2] === ACTIVE_PROGRAM_DUMP_PATH[2]
    && levels[3] === ACTIVE_PROGRAM_DUMP_PATH[3]
}

export function parseProgramDumpPath(levels: number[]): { programNumber: number } | null {
  if (
    levels.length !== 4
    || levels[0] !== SYSTEM_BRANCH
    || levels[1] !== SYSTEM_PROGRAMS_TYPE
  ) {
    return null
  }

  const bank = levels[2] ?? -1
  const index = levels[3] ?? -1
  if (bank === 2 && index === 0x64) {
    return null
  }
  if (bank < 0 || bank > 2 || index < 0 || index > 99) {
    return null
  }

  const programNumber = bank * 100 + index + 1
  if (programNumber < 1 || programNumber > MAX_PROGRAM_NUMBER) {
    return null
  }
  return { programNumber }
}

export function isProgramDumpPath(levels: number[]): boolean {
  return parseProgramDumpPath(levels) != null || isActiveProgramDumpPath(levels)
}

/** Space-padded 12-char program name (offset measured from live dumps). */
export function parseProgramDumpName(data: number[]): string {
  const { name, nameLength } = PROGRAM_DUMP_OFFSET
  const chars = data.slice(name, name + nameLength).map((byte) => {
    if (byte < 0x20 || byte > 0x7e) {
      return ' '
    }
    return String.fromCharCode(byte)
  })
  return chars.join('').trim()
}

/** Algorithm indexes (0 = unloaded). */
export function parseProgramDumpAlgs(data: number[]): Record<ProgramDumpAlgBlock, number> {
  const result = {} as Record<ProgramDumpAlgBlock, number>
  const base = PROGRAM_DUMP_OFFSET.algs
  for (let i = 0; i < PROGRAM_DUMP_ALG_BLOCKS.length; i++) {
    const block = PROGRAM_DUMP_ALG_BLOCKS[i]!
    result[block] = data[base + i] ?? 0
  }
  return result
}

/**
 * Prefer explicit `bytes`; otherwise infer from min/max.
 * Unsigned 0–255 fits in one byte (Size 0–144, P Dly 0–250, etc.).
 */
export function inferParamByteCount(param: AlgorithmParamDef): 1 | 2 {
  if (param.bytes === 1 || param.bytes === 2) {
    return param.bytes
  }
  if (param.min >= 0 && param.max <= 255) {
    return 1
  }
  if (param.min >= -128 && param.max <= 127) {
    return 1
  }
  return 2
}

/**
 * Extra bytes packed after the value in PARAM_DATA (Rate units, signed Tune, …).
 * Prefer explicit `optionBytes` stamped from Object Descriptions.
 */
export function inferOptionByteCount(param: AlgorithmParamDef): 0 | 1 {
  if (param.optionBytes === 0 || param.optionBytes === 1) {
    return param.optionBytes
  }
  // Fallback when content hasn't been stamped yet: signed 2-byte words carry an option.
  if (inferParamByteCount(param) === 2 && param.min < 0) {
    return 1
  }
  return 0
}

export function decodePackedParamValue(bytes: number[], signed: boolean): number {
  if (bytes.length >= 2) {
    const unsigned = (bytes[0]! & 0xff) | ((bytes[1]! & 0xff) << 8)
    if (signed && unsigned > 32767) {
      return unsigned - 65536
    }
    return unsigned
  }
  if (bytes.length === 1) {
    const unsigned = bytes[0]! & 0xff
    if (signed && unsigned > 127) {
      return unsigned - 256
    }
    return unsigned
  }
  return 0
}

/**
 * Unpack one effect's 32-byte param blob using the algorithm's param index order.
 * Multi-unit Rate params and signed Tune words include a trailing option byte;
 * Time/delay words keep the unit in the value MSB (no extra byte).
 */
export function decodeProgramParamBlob(
  blob: number[],
  def: AlgorithmDef
): Record<string, number> {
  const params: Record<string, number> = {}
  const ordered = [...def.params].sort((a, b) => a.index - b.index)
  let offset = 0

  for (const param of ordered) {
    const width = inferParamByteCount(param)
    const optionBytes = inferOptionByteCount(param)
    if (offset + width > blob.length) {
      break
    }
    const slice = blob.slice(offset, offset + width)
    const signed = param.min < 0
    params[param.id] = decodePackedParamValue(slice, signed)
    offset += width + optionBytes
  }

  return params
}

/** Decode all seven effect slots (alg + effect id + param values). */
export function decodeProgramDumpBlocks(data: number[]): DecodedProgramBlock[] {
  const algs = parseProgramDumpAlgs(data)
  const { paramData, paramBlockBytes } = PROGRAM_DUMP_OFFSET

  return PROGRAM_DUMP_ALG_BLOCKS.map((block, index) => {
    const alg = algs[block] ?? 0
    const def = algorithmForBlockAlg(block, alg)
    const start = paramData + index * paramBlockBytes
    const blob = data.slice(start, start + paramBlockBytes)
    return {
      id: block,
      alg,
      effect: def?.id ?? null,
      params: def ? decodeProgramParamBlob(blob, def) : {}
    }
  })
}

export function isLikelyProgramDumpData(data: number[]): boolean {
  return data.length === PROGRAM_DUMP_BYTE_COUNT
    || (data.length >= 400 && data.length <= 512)
}

export { OBJECT_TYPE_PROGRAM_DUMP }
