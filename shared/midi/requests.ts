import { nibblize, buildSysExHeader } from './sysex'
import { SysExMessageType } from '../types/midi'
import {
  DISPLAY_DUMP_PATH,
  LED_DUMP_PATH,
  LED_DUMP_PATH_ALT
} from './control-paths'

const SYSEX_END = 0xf7

function nibblize16(value: number): number[] {
  return nibblize([value & 0xff, (value >> 8) & 0xff])
}

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
  const args = [
    ...nibblize16(controlLevels.length),
    ...controlLevels.flatMap(level => nibblize16(level))
  ]
  return buildRequestMessage(SysExMessageType.Data, args, deviceId, productId)
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
