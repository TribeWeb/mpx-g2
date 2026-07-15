/**
 * Archived Soft-UI / Panel Button probe constants.
 * Not imported by the live app — see README.md in this folder.
 */

export interface PanelButtonCode {
  code: number
  label: string
  source: 'mpx1' | 'g2' | 'probe'
}

/** Documented MPX 1 press codes (release = press + 0x2C, hold = press + 0x16). */
export const MPX1_PANEL_BUTTON_PRESS: PanelButtonCode[] = [
  { code: 0x00, label: 'Pitch', source: 'mpx1' },
  { code: 0x01, label: 'Chorus', source: 'mpx1' },
  { code: 0x02, label: 'EQ', source: 'mpx1' },
  { code: 0x03, label: 'Program', source: 'mpx1' },
  { code: 0x04, label: 'Mod', source: 'mpx1' },
  { code: 0x05, label: 'Delay', source: 'mpx1' },
  { code: 0x06, label: 'Reverb', source: 'mpx1' },
  { code: 0x07, label: 'Edit', source: 'mpx1' },
  { code: 0x08, label: 'Mix', source: 'mpx1' },
  { code: 0x09, label: 'Patch', source: 'mpx1' },
  { code: 0x0a, label: 'Bypass', source: 'mpx1' },
  { code: 0x0b, label: 'System', source: 'mpx1' },
  { code: 0x0c, label: 'Tap', source: 'mpx1' },
  { code: 0x0d, label: 'Left <', source: 'mpx1' },
  { code: 0x0e, label: 'Value', source: 'mpx1' },
  { code: 0x0f, label: 'Store', source: 'mpx1' },
  { code: 0x10, label: 'A/B', source: 'mpx1' },
  { code: 0x11, label: 'Right >', source: 'mpx1' },
  { code: 0x12, label: 'Options', source: 'mpx1' },
  { code: 0x13, label: 'Foot Tip', source: 'mpx1' },
  { code: 0x14, label: 'Foot Ring', source: 'mpx1' },
  { code: 0x15, label: 'Left+Right', source: 'mpx1' }
]

export const MPX1_ENCODER_CODES: PanelButtonCode[] = [
  { code: 0x42, label: 'Encoder CW', source: 'mpx1' },
  { code: 0x43, label: 'Encoder CCW', source: 'mpx1' }
]

/** Confirmed on MPX G2 / R1 docs. */
export const G2_PANEL_BUTTON_CODES: PanelButtonCode[] = [
  { code: 0x20, label: 'Bypass Hold', source: 'g2' },
  { code: 0x36, label: 'Bypass Release', source: 'g2' },
  { code: 0x45, label: 'A/B Toggle', source: 'g2' },
  { code: 0x46, label: 'Toe Off', source: 'g2' },
  { code: 0x47, label: 'Toe On', source: 'g2' }
]

/** Return to Program mode before each Soft-UI probe attempt. */
export const PROGRAM_MODE_RESET_CODES = {
  press: 0x03,
  release: 0x2f
} as const

/** High-priority candidates before a full 0–127 sweep. */
export const PANEL_BUTTON_PROBE_PRIORITY: PanelButtonCode[] = [
  ...MPX1_ENCODER_CODES,
  ...G2_PANEL_BUTTON_CODES,
  ...MPX1_PANEL_BUTTON_PRESS,
  { code: 0x2f, label: 'Program Release', source: 'mpx1' },
  { code: 0x33, label: 'Edit Release', source: 'mpx1' },
  { code: 0x37, label: 'System Release', source: 'mpx1' },
  { code: 0x3b, label: 'Store Release', source: 'mpx1' },
  { code: 0x3e, label: 'Options Release', source: 'mpx1' },
  { code: 0x38, label: 'Tap Release', source: 'mpx1' }
]

export function mpx1ReleaseCode(press: number): number {
  return (press + 0x2c) & 0xff
}

export function mpx1HoldCode(press: number): number {
  return (press + 0x16) & 0xff
}
