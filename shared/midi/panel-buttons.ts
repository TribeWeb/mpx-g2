import type { FrontPanelButtonName } from '../types/midi'
import { PanelButton } from '../types/midi'

/**
 * Outbound panel-button SysEx values (commands TO the G2, e.g. from MPX R1).
 *
 * Most codes follow the MPX 1 keyboard-driver map (press / release = press+0x2C),
 * remapped to G2 front-panel labels by position (Gain where Pitch was, etc.).
 * Edit → Gain → Right already works with that layout on hardware.
 *
 * G2/R1 docs override a few values: Bypass Hold/Release, A/B Toggle.
 *
 * Soft Row has no MPX 1 name — mapped to MPX 1 Value (0x0E), the closest analogue.
 */
export const FrontPanelButtonValues: Partial<Record<FrontPanelButtonName, number>> = {
  gain: 0x00,
  fx1: 0x01,
  fx2: 0x02,
  program: 0x03,
  chorus: 0x04,
  delay: 0x05,
  reverb: 0x06,
  edit: 0x07,
  eq: 0x08,
  insert: 0x09,
  bypass: PanelButton.BypassHold,
  system: 0x0b,
  tap: 0x0c,
  left: 0x0d,
  softRow: 0x0e,
  store: 0x0f,
  ab: PanelButton.AbToggle,
  right: 0x11,
  option: 0x12
}

/** Release codes. A/B is a toggle (press only). Bypass uses the G2 release value. */
export const FrontPanelButtonReleaseValues: Partial<Record<FrontPanelButtonName, number>> = {
  gain: 0x2c,
  fx1: 0x2d,
  fx2: 0x2e,
  program: 0x2f,
  chorus: 0x30,
  delay: 0x31,
  reverb: 0x32,
  edit: 0x33,
  eq: 0x34,
  insert: 0x35,
  bypass: PanelButton.BypassRelease,
  system: 0x37,
  tap: 0x38,
  left: 0x39,
  softRow: 0x3a,
  store: 0x3b,
  right: 0x3d,
  option: 0x3e
}

export function getPanelButtonSysExValue(
  button: FrontPanelButtonName,
  action: 'press' | 'release'
): number | null {
  if (action === 'release') {
    // Do not fall back to the press code (would double-fire A/B toggle, etc.).
    return FrontPanelButtonReleaseValues[button] ?? null
  }
  return FrontPanelButtonValues[button] ?? null
}

/** Control tree path for outbound panel-button SysEx (per MIDI impl doc). */
export const PANEL_BUTTON_CONTROL_PATH = {
  levels: 3,
  programSystem: 1,
  panel: 8,
  panelButton: 0
} as const
