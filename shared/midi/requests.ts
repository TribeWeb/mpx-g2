import { nibblize, buildSysExHeader } from './sysex'
import { SysExMessageType } from '../types/midi'
import type { EffectBlockId } from '../types/effect-blocks'
import { chorusParamDefById } from '../constants/chorus-params'
import {
  DISPLAY_DUMP_PATH,
  effectAlgControlPath,
  GAIN_ALG_PATH,
  LED_DUMP_PATH,
  LED_DUMP_PATH_ALT,
  chorusParamControlPath,
  gainEqControlPath
} from './control-paths'
import { programDumpControlPath, ACTIVE_PROGRAM_DUMP_PATH } from './program-dump'

const SYSEX_END = 0xf7

/** Build a generic MPX-G2 request message (type 06). */
export function buildRequestMessage(
  requestType: number,
  args: number[] = [],
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return new Uint8Array([
    ...buildSysExHeader({ deviceId, productId, messageType: SysExMessageType.Request }),
    ...nibblize([requestType]),
    ...nibblize(args),
    SYSEX_END
  ])
}

/** Request system configuration (no arguments). */
export function buildSystemConfigRequest(
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return new Uint8Array([
    ...buildSysExHeader({ deviceId, productId, messageType: SysExMessageType.Request }),
    ...nibblize([0x00, 0x00, 0x00, 0x00]),
    SYSEX_END
  ])
}

/** Request a data message at a control-tree address (request type 01). */
export function buildDataRequest(
  controlLevels: number[],
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  // Raw bytes — buildRequestMessage nibblizes once.
  return buildRequestMessage(SysExMessageType.Data, controlPathArgs(controlLevels), deviceId, productId)
}

/** Request the active Gain algorithm index. */
export function buildGainAlgRequest(deviceId = 0x00, productId?: number): Uint8Array {
  return buildDataRequest([...GAIN_ALG_PATH], deviceId, productId)
}

/** Request the active algorithm for any program effect block. */
export function buildEffectAlgRequest(
  block: EffectBlockId,
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildDataRequest(effectAlgControlPath(block), deviceId, productId)
}

/** Request Gain Lo / Mid / Hi for a loaded algorithm. */
export function buildGainEqRequest(
  alg: number,
  band: 'low' | 'mid' | 'high',
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildDataRequest(gainEqControlPath(alg, band), deviceId, productId)
}

/** Request a Chorus parameter for a loaded algorithm. */
export function buildChorusParamRequest(
  alg: number,
  paramId: string,
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  const def = chorusParamDefById(alg, paramId)
  const paramIndex = def?.index ?? (paramId === 'level' ? 1 : 0)
  return buildDataRequest(chorusParamControlPath(alg, paramIndex), deviceId, productId)
}

/** Control-path args shared by Data / FormattedString / Object Type ID requests. */
function controlPathArgs(controlLevels: number[]): number[] {
  return [
    controlLevels.length & 0xff,
    (controlLevels.length >> 8) & 0xff,
    ...controlLevels.flatMap(level => [level & 0xff, (level >> 8) & 0xff])
  ]
}

/** Request Formatted String (02 hex) — G2-rendered display text for a path. */
export function buildFormattedStringRequest(
  controlLevels: number[],
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildRequestMessage(
    SysExMessageType.FormattedString,
    controlPathArgs(controlLevels),
    deviceId,
    productId
  )
}

/** Request Object Type ID (03 hex) at a control-tree path. */
export function buildObjectTypeIdRequest(
  controlLevels: number[],
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildRequestMessage(
    SysExMessageType.ObjectTypeId,
    controlPathArgs(controlLevels),
    deviceId,
    productId
  )
}

/** Request Object Description (04 hex) for an Object Type ID. */
export function buildObjectDescriptionRequest(
  objectTypeId: number,
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildRequestMessage(
    SysExMessageType.ObjectDescription,
    [objectTypeId & 0xff, (objectTypeId >> 8) & 0xff],
    deviceId,
    productId
  )
}

/** Request Object Type IDs for Gain Lo / Mid / Hi (used to fetch min/max ranges). */
export function buildGainEqObjectTypeIdRequest(
  alg: number,
  band: 'low' | 'mid' | 'high',
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildObjectTypeIdRequest(gainEqControlPath(alg, band), deviceId, productId)
}

/** Request a stored program dump (1–300) via System → Programs path. */
export function buildProgramDumpRequest(
  programNumber: number,
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildDataRequest(programDumpControlPath(programNumber), deviceId, productId)
}

/** Request the currently running program dump (Active Program slot). */
export function buildActiveProgramDumpRequest(
  deviceId = 0x00,
  productId?: number
): Uint8Array {
  return buildDataRequest([...ACTIVE_PROGRAM_DUMP_PATH], deviceId, productId)
}

/** Request the 32-character front-panel LCD contents. */
export function buildDisplayDumpRequest(deviceId = 0x00, productId?: number): Uint8Array {
  return buildDataRequest([...DISPLAY_DUMP_PATH], deviceId, productId)
}

/** Request the 10-byte front-panel LED buffer. */
export function buildLedDumpRequest(deviceId = 0x00, productId?: number): Uint8Array {
  return buildDataRequest([...LED_DUMP_PATH], deviceId, productId)
}

/** Alternate LED dump path (2-level). */
export function buildLedDumpRequestAlt(deviceId = 0x00, productId?: number): Uint8Array {
  return buildDataRequest([...LED_DUMP_PATH_ALT], deviceId, productId)
}
