import { denibblize } from './sysex'
import { PANEL_BUTTON_CONTROL_PATH } from './panel-buttons'
import { parseGainEqPath } from './control-paths'
import { decodeParamValue } from './param-value'

export interface ParsedDataMessage {
  data: number[]
  levelCount: number
  levels: number[]
}

/** Parse the payload of an MPX-G2 SysEx data message (type 0x01). */
export function parseDataMessagePayload(payload: number[]): ParsedDataMessage | null {
  if (payload.length < 4) {
    return null
  }

  const sizeBytes = denibblize(payload.slice(0, 4))
  const dataByteCount = sizeBytes[0]! | ((sizeBytes[1] ?? 0) << 8)
  const dataEnd = 4 + dataByteCount * 2

  if (payload.length < dataEnd + 4) {
    return null
  }

  const data = denibblize(payload.slice(4, dataEnd))

  const levelCountBytes = denibblize(payload.slice(dataEnd, dataEnd + 4))
  const levelCount = levelCountBytes[0]! | ((levelCountBytes[1] ?? 0) << 8)
  let offset = dataEnd + 4

  const levels: number[] = []
  for (let i = 0; i < levelCount; i++) {
    if (payload.length < offset + 4) {
      return null
    }
    const levelBytes = denibblize(payload.slice(offset, offset + 4))
    levels.push(levelBytes[0]! | ((levelBytes[1] ?? 0) << 8))
    offset += 4
  }

  return { data, levelCount, levels }
}

export function formatControlPath(levels: number[]): string {
  const letters = ['A', 'B', 'C', 'D', 'E']
  const parts = levels.map((value, index) => `${letters[index] ?? '?'}:${value.toString(16).padStart(4, '0')}`)
  return `L:${levels.length.toString(16).padStart(4, '0')} ${parts.join(' ')}`
}

/** True when path matches outbound R1 panel-button SysEx (system 1 → panel 8 → button 0). */
export function isPanelButtonPath(levels: number[]): boolean {
  return levels.length === PANEL_BUTTON_CONTROL_PATH.levels
    && levels[0] === PANEL_BUTTON_CONTROL_PATH.programSystem
    && levels[1] === PANEL_BUTTON_CONTROL_PATH.panel
    && levels[2] === PANEL_BUTTON_CONTROL_PATH.panelButton
}

/** Describe a data message for the MIDI log. */
export function describeDataMessage(parsed: ParsedDataMessage): string {
  const path = formatControlPath(parsed.levels)
  const valueHex = parsed.data.map(b => `0x${b.toString(16)}`).join(', ')

  if (isPanelButtonPath(parsed.levels) && parsed.data.length === 1) {
    return `Panel button cmd ${valueHex} @ ${path}`
  }

  const gainEq = parseGainEqPath(parsed.levels)
  if (gainEq && parsed.data.length > 0 && parsed.data.length <= 2) {
    const value = decodeParamValue(parsed.data)
    const label = gainEq.band === 'low' ? 'Gain Low' : gainEq.band === 'mid' ? 'Gain Mid' : 'Gain High'
    return `${label} = ${value} (alg ${gainEq.alg}) @ ${path}`
  }

  if (parsed.data.length === 1) {
    return `Param ${valueHex} @ ${path}`
  }

  if (parsed.data.length === 32) {
    return `Display dump (32 bytes) @ ${path}`
  }

  if (parsed.data.length >= 10) {
    return `LED/block dump (${parsed.data.length} bytes) @ ${path}`
  }

  return `Data (${parsed.data.length} bytes) @ ${path}`
}
