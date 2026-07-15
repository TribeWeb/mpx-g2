/**
 * Panel Button SysEx helpers used by the live app.
 *
 * Full MPX1 / G2 button tables and Soft-UI probe lists live in
 * `shared/midi/archive/soft-ui-panel-button-probe.ts`.
 */

/**
 * Navigate to Edit → Gain → Right (>) — kept for experiments / Soft-UI probes.
 * Not used on Gain knob TX: that path opens the effect editor and can show
 * "Effect not loaded". Soft Lo/Mid/Hi writes go by control-tree path only.
 */
export const GAIN_EDIT_PAGE_NAV = [
  { press: 0x07, release: 0x33, label: 'Edit' },
  { press: 0x00, release: 0x2c, label: 'Gain' },
  { press: 0x11, release: 0x3d, label: 'Right >' }
] as const

/** True when LCD text looks like the Gain Lo/Mid/Hi soft page or Edit Gain EQ page. */
export function looksLikeGainSoftPage(characters: string[]): boolean {
  const text = characters.join('')
  return (
    /Lo\s+Mid\s+Hi/i.test(text)
    || /^Lo\s{2}Mid/i.test(text.slice(0, 16))
    || /Gain.*(?:Lo|Low|Mid|Hi)/i.test(text)
  )
}
