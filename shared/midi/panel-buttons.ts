import type { FrontPanelButtonName } from '../types/midi'
import { PanelButton } from '../types/midi'

/**
 * Outbound panel-button SysEx values (commands TO the G2, e.g. from MPX R1).
 *
 * The G2 does **not** echo these when you press front-panel buttons locally.
 * Automation mode transmits **parameter** changes (encoder, effect bypass, etc.)
 * using control-tree paths — not panel-button messages.
 *
 * Inbound sync strategies by button type:
 * - Effect bypass buttons → CC #40–50 (Ctl Send) or bypass-parameter SysEx
 * - Gain Low/Mid/High, encoder edits → automation SysEx (control-tree path)
 * - Tap tempo → tempo-parameter SysEx or CC #119
 * - Program → MIDI program change
 * - Panel row (System, Edit, Store, …) → no automation; use LED dump requests or Auto Display
 */
export const FrontPanelButtonValues: Partial<Record<FrontPanelButtonName, number>> = {
  bypass: PanelButton.BypassHold,
  a: PanelButton.AbToggle,
  b: PanelButton.AbToggle
}

export const FrontPanelButtonReleaseValues: Partial<Record<FrontPanelButtonName, number>> = {
  bypass: PanelButton.BypassRelease
}

export function getPanelButtonSysExValue(
  button: FrontPanelButtonName,
  action: 'press' | 'release'
): number | null {
  if (action === 'release') {
    return FrontPanelButtonReleaseValues[button] ?? FrontPanelButtonValues[button] ?? null
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
