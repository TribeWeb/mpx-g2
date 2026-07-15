import type { PanelKnobState } from '../types/midi'
import { lcdByteToGlyph } from './lcd-charset'

/** Pad/truncate to exactly `width` characters. */
function fit(text: string, width: number): string {
  return text.slice(0, width).padEnd(width, ' ')
}

/** Format a Gain EQ value the way the G2 soft page tends to show it. */
export function formatGainEqValue(value: number, width = 4): string {
  const text = value > 0 ? `+${value}` : String(value)
  return text.length > width ? text.slice(0, width) : text.padStart(width, ' ')
}

/**
 * Build the 32-character LCD image for the Gain Lo/Mid/Hi page.
 * Matches the G2 soft-knob page layout (see MIDI glass-interface notes).
 */
export function formatGainEqDisplay(knobs: Pick<PanelKnobState, 'gainLow' | 'gainMid' | 'gainHigh'>): string {
  const top = fit('Lo  Mid Hi', 16)
  const bottom = fit(
    `${formatGainEqValue(knobs.gainLow)}${formatGainEqValue(knobs.gainMid)}${formatGainEqValue(knobs.gainHigh)}`,
    16
  )
  return top + bottom
}

/** Convert a 32-char (or shorter) display string to LCD dump bytes. */
export function displayStringToBytes(text: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i < 32; i++) {
    const code = text.charCodeAt(i)
    bytes.push(Number.isFinite(code) ? code & 0xff : 0x20)
  }
  return bytes
}

/**
 * Split a 32-byte display dump into LCD glyphs.
 * Bytes 0–7 are G2 custom characters (arrows, meters, edit dots) — not spaces.
 */
export function displayBytesToCharacters(data: number[]): string[] {
  const chars = Array.from({ length: 32 }, (_, i) => lcdByteToGlyph(data[i] ?? 0x20))
  if (import.meta.dev) {
    const raw = Array.from({ length: 32 }, (_, i) => data[i] ?? 0x20)
    const slots = raw
      .map((b, i) => (b < 32 || b > 126 ? `${i}:0x${b.toString(16)}` : null))
      .filter(Boolean)
    if (slots.length > 0) {
      console.debug('[mpx-g2] LCD non-ASCII', slots.join(' '), '|', chars.join(''))
    }
  }
  return chars
}

/** Space — treated as LCD blank (blink-off holes). Custom glyphs count as content. */
export function isLcdBlankChar(char: string | undefined): boolean {
  if (char == null || char === '') {
    return true
  }
  return char === ' ' || char === '\u00a0'
}

function padLcd32(chars: string[]): string[] {
  return Array.from({ length: 32 }, (_, i) => chars[i] ?? ' ')
}

/**
 * Absorb G2 active-parameter blink: a display dump often blanks the focused field.
 * Keep prior glyphs where the new dump is blank, unless the whole page reshaped.
 * @deprecated Prefer mergeLcdWithFlashHighlight in flash-detect.ts
 */
export function mergeLcdAgainstBlink(previous: string[], incoming: string[]): string[] {
  const prev = padLcd32(previous)
  const next = padLcd32(incoming).map(c => (isLcdBlankChar(c) ? ' ' : c))

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

  if (bothGlyphDiff >= 4 || occupancyDiff >= 10) {
    return next
  }

  return next.map((n, i) => (!isLcdBlankChar(n) ? n : (isLcdBlankChar(prev[i]) ? ' ' : prev[i]!)))
}
