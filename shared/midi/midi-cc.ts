import type { FrontPanelButtonName, MpxG2PanelState } from '../types/midi'

/**
 * Default MPX R1 bypass CC assignments (SYSTEM → MIDI → Ctl Send can override).
 * Effect buttons on the G2 front panel typically emit these — not panel-button SysEx.
 */
export const DEFAULT_BYPASS_CC: Partial<Record<number, FrontPanelButtonName>> = {
  40: 'gain',
  41: 'chorus',
  42: 'delay',
  43: 'fx1',
  44: 'reverb',
  45: 'eq',
  46: 'insert',
  47: 'fx2',
  50: 'bypass'
}

export function describeCcMessage(status: number, data: Uint8Array): string {
  const channel = (status & 0x0f) + 1
  const controller = data[1] ?? 0
  const value = data[2] ?? 0
  const button = DEFAULT_BYPASS_CC[controller]
  const target = button ? ` (${button} bypass)` : ''
  return `CC ch${channel} #${controller} = ${value}${target}`
}

/**
 * Effect bypass CC: non-zero usually means bypassed (LED off on unit).
 * Updates virtual panel LED state when a known bypass CC is received.
 */
export function applyCcToPanelState(
  data: Uint8Array,
  panelState: MpxG2PanelState
): string | undefined {
  const status = data[0] ?? 0
  if ((status & 0xf0) !== 0xb0 || data.length < 3) {
    return undefined
  }

  const controller = data[1] ?? 0
  const value = data[2] ?? 0
  const button = DEFAULT_BYPASS_CC[controller]
  if (!button) {
    return undefined
  }

  // G2 column LEDs: 0 = lit (active), bypass CC high = effect bypassed = LED off
  panelState.leds.buttons[button] = value < 64
  panelState.lastUpdated = Date.now()
  return describeCcMessage(status, data)
}
