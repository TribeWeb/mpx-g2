import type { FrontPanelButtonName } from '../types/midi'
import { FrontPanelButtons } from '../types/midi'
import { isLcdBlankChar } from './display-format'

/** Buttons that flash for reasons other than G2 highlight (e.g. MIDI Clock). */
const LED_FLASH_EXCLUDE = new Set<FrontPanelButtonName>(['tempo'])

/** Consecutive identical LED samples before we drop a highlight flash. */
const LED_FLASH_CLEAR_AFTER = 3

export function emptyLedFlashing(): Record<FrontPanelButtonName, boolean> {
  return Object.fromEntries(FrontPanelButtons.map(b => [b, false])) as Record<
    FrontPanelButtonName,
    boolean
  >
}

export function emptyLedFlashStable(): Record<FrontPanelButtonName, number> {
  return Object.fromEntries(FrontPanelButtons.map(b => [b, 0])) as Record<
    FrontPanelButtonName,
    number
  >
}

export function emptyDisplayFlashing(): boolean[] {
  return Array.from({ length: 32 }, () => false)
}

export interface LedFlashUpdate {
  flashing: Record<FrontPanelButtonName, boolean>
  flashStable: Record<FrontPanelButtonName, number>
}

/**
 * Detect LEDs that toggle between dumps while the rest of the panel is stable.
 * Those are highlight blinks (Options, Soft Row, …) — the app animates them locally.
 */
export function updateLedFlashing(
  previous: Record<FrontPanelButtonName, boolean>,
  next: Record<FrontPanelButtonName, boolean>,
  previousFlashing: Record<FrontPanelButtonName, boolean>,
  previousStable: Record<FrontPanelButtonName, number> = emptyLedFlashStable()
): LedFlashUpdate {
  let changes = 0
  for (const name of FrontPanelButtons) {
    if (LED_FLASH_EXCLUDE.has(name)) {
      continue
    }
    if (previous[name] !== next[name]) {
      changes++
    }
  }

  // Many LEDs changed at once → real mode change; clear highlight flashes.
  if (changes >= 4) {
    return {
      flashing: emptyLedFlashing(),
      flashStable: emptyLedFlashStable()
    }
  }

  const flashing = { ...previousFlashing }
  const flashStable = { ...previousStable }

  for (const name of FrontPanelButtons) {
    if (LED_FLASH_EXCLUDE.has(name)) {
      flashing[name] = false
      flashStable[name] = 0
      continue
    }

    if (previous[name] !== next[name]) {
      flashStable[name] = 0
      // One or two LEDs toggling on an otherwise stable panel → highlight.
      if (changes <= 2) {
        flashing[name] = true
      }
    } else {
      flashStable[name] = (flashStable[name] ?? 0) + 1
      if (flashing[name] && flashStable[name]! >= LED_FLASH_CLEAR_AFTER) {
        flashing[name] = false
        flashStable[name] = 0
      }
    }
  }

  return { flashing, flashStable }
}

export interface LcdMergeResult {
  characters: string[]
  flashing: boolean[]
  /** True when the page layout changed enough to drop prior flash highlights. */
  pageChanged: boolean
}

/**
 * Keep steady glyphs across blink-off dumps, and mark positions that blink
 * blank↔glyph as highlighted (flashing) for the virtual UI.
 */
export function mergeLcdWithFlashHighlight(
  previous: string[],
  previousFlashing: boolean[],
  incoming: string[]
): LcdMergeResult {
  const prev = Array.from({ length: 32 }, (_, i) => previous[i] ?? ' ')
  const next = Array.from({ length: 32 }, (_, i) => {
    const c = incoming[i] ?? ' '
    return isLcdBlankChar(c) ? ' ' : c
  })
  const prevFlash = Array.from({ length: 32 }, (_, i) => Boolean(previousFlashing[i]))

  let bothGlyphDiff = 0
  let occupancyDiff = 0
  for (let i = 0; i < 32; i++) {
    const pBlank = isLcdBlankChar(prev[i])
    const nBlank = isLcdBlankChar(next[i])
    if (pBlank !== nBlank) {
      occupancyDiff++
    }
    if (!pBlank && !nBlank && prev[i] !== next[i]) {
      bothGlyphDiff++
    }
  }

  const pageChanged = bothGlyphDiff >= 4 || occupancyDiff >= 10
  if (pageChanged) {
    return {
      characters: next,
      flashing: emptyDisplayFlashing(),
      pageChanged: true
    }
  }

  const characters: string[] = []
  const flashing: boolean[] = []
  for (let i = 0; i < 32; i++) {
    const pBlank = isLcdBlankChar(prev[i])
    const nBlank = isLcdBlankChar(next[i])
    const glyph = !nBlank ? next[i]! : (!pBlank ? prev[i]! : ' ')
    characters.push(glyph)

    if (pBlank !== nBlank && glyph !== ' ') {
      flashing.push(true)
    } else {
      flashing.push(Boolean(prevFlash[i]) && glyph !== ' ')
    }
  }

  return { characters, flashing, pageChanged: false }
}
