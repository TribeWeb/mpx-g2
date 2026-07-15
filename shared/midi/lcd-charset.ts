/**
 * G2 LCD glyph map for display-dump bytes.
 *
 * Soft Row / Edit scroll arrows arrive as 0x1E / 0x1D (not CGRAM 0–7).
 * Bytes 0–7 remain CGRAM slots (meters, edit marks, etc.).
 *
 * ASCII is rendered with the Doto web font. Scroll markers use private
 * sentinels so the UI can draw exact 5×3 arrow bitmaps.
 */

export const LCD_CUSTOM_GLYPHS: readonly string[] = [
  '\u00B7', // 0 · edit / changed marker
  '\u25BC', // 1 ▼ down
  '\u25B2', // 2 ▲
  '\u25BC', // 3 ▼
  '\u2588', // 4 █ meter full
  '\u259D', // 5 ▝ small upper-right quadrant
  '\u2582', // 6 ▂ meter low
  '\u25B6' // 7 ▶ (CGRAM; Soft Row arrows use 0x1D instead)
]

/** Soft Row / parameter-page scroll arrows (observed in live display dumps). */
export const LCD_SCROLL_LEFT = 0x1e
export const LCD_SCROLL_RIGHT = 0x1d

/** Sentinels embedded in display strings for UI pixel-arrow rendering. */
export const LCD_SCROLL_LEFT_GLYPH = '\uE000'
export const LCD_SCROLL_RIGHT_GLYPH = '\uE001'

/** Custom-glyph / CGRAM matrix size (not used for Doto letter metrics). */
export const LCD_CELL_WIDTH = 5
export const LCD_CELL_HEIGHT = 7

export function isLcdCustomCharByte(byte: number): boolean {
  return byte >= 0 && byte <= 7
}

export function isLcdScrollLeftGlyph(char: string): boolean {
  return char === LCD_SCROLL_LEFT_GLYPH
}

export function isLcdScrollRightGlyph(char: string): boolean {
  return char === LCD_SCROLL_RIGHT_GLYPH
}

export function lcdByteToGlyph(byte: number): string {
  const value = byte & 0xff
  if (value === LCD_SCROLL_LEFT) {
    return LCD_SCROLL_LEFT_GLYPH
  }
  if (value === LCD_SCROLL_RIGHT) {
    return LCD_SCROLL_RIGHT_GLYPH
  }
  if (isLcdCustomCharByte(value)) {
    return LCD_CUSTOM_GLYPHS[value]!
  }
  if (value >= 32 && value < 127) {
    return String.fromCharCode(value)
  }
  return '?'
}

/**
 * Soft Row scroll arrows — 5 wide × 3 tall solid wedges
 * (vertically centered in the 5×7 character cell when drawn).
 */
export const LCD_ARROW_LEFT_5X3: readonly (readonly number[])[] = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0]
]

export const LCD_ARROW_RIGHT_5X3: readonly (readonly number[])[] = [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0]
]

/** Empty 5×7 cell. */
function emptyCell(): number[][] {
  return Array.from({ length: LCD_CELL_HEIGHT }, () =>
    Array.from({ length: LCD_CELL_WIDTH }, () => 0)
  )
}

/** Place a bitmap into a 5×7 cell (default: vertically + horizontally centered). */
function placeInCell(
  bitmap: readonly (readonly number[])[],
  offR?: number,
  offC?: number
): readonly (readonly number[])[] {
  const cell = emptyCell()
  const bh = bitmap.length
  const bw = bitmap[0]?.length ?? 0
  const row0 = offR ?? Math.floor((LCD_CELL_HEIGHT - bh) / 2)
  const col0 = offC ?? Math.floor((LCD_CELL_WIDTH - bw) / 2)
  for (let r = 0; r < bh; r++) {
    for (let c = 0; c < bw; c++) {
      if (bitmap[r]![c]) {
        cell[row0 + r]![col0 + c] = 1
      }
    }
  }
  return cell
}

/** · edit / changed marker — single center pixel. */
const CGRAM_DOT = placeInCell([[1]], 6, 3)

/** ▼ down arrow block. */
const CGRAM_DOWN = placeInCell([
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0]
])

/** ▲ up arrow block. */
const CGRAM_UP = placeInCell([
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1]
])

/** █ full meter block. */
const CGRAM_FULL: readonly (readonly number[])[] = Array.from(
  { length: LCD_CELL_HEIGHT },
  () => [1, 1, 1, 1, 1] as const
)

/** ▝ small 2×2 mark in the top-right of the cell. */
const CGRAM_TOP_RIGHT = placeInCell(
  [
    [1, 1],
    [1, 1]
  ],
  0,
  2
)

/** ▂ low meter — bottom two rows. */
const CGRAM_LOW = placeInCell(
  [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1]
  ],
  5,
  0
)

function asBool(bitmap: readonly (readonly number[])[]): boolean[][] {
  return bitmap.map(row => row.map(v => v === 1))
}

export type LcdCellContent
  = | { kind: 'text', char: string }
    | { kind: 'dots', dots: boolean[], cols: number, rows: number }

function dotsContent(bitmap: readonly (readonly number[])[]): LcdCellContent {
  const matrix = asBool(bitmap)
  return {
    kind: 'dots',
    dots: matrix.flat(),
    cols: LCD_CELL_WIDTH,
    rows: LCD_CELL_HEIGHT
  }
}

/**
 * How to render one LCD cell: Doto text for ASCII, pixel matrix for
 * scroll arrows (5×3 in a 5×7 cell) and CGRAM stand-ins (5×7).
 */
export function lcdCellContent(char: string): LcdCellContent {
  if (isLcdScrollLeftGlyph(char)) {
    return dotsContent(placeInCell(LCD_ARROW_LEFT_5X3))
  }
  if (isLcdScrollRightGlyph(char)) {
    return dotsContent(placeInCell(LCD_ARROW_RIGHT_5X3))
  }

  switch (char) {
    case '\u00B7':
      return dotsContent(CGRAM_DOT)
    case '\u25BC':
      return dotsContent(CGRAM_DOWN)
    case '\u25B2':
      return dotsContent(CGRAM_UP)
    case '\u2588':
      return dotsContent(CGRAM_FULL)
    case '\u259D':
      return dotsContent(CGRAM_TOP_RIGHT)
    case '\u2582':
      return dotsContent(CGRAM_LOW)
    case '\u25B6':
      return dotsContent(placeInCell(LCD_ARROW_RIGHT_5X3))
  }

  // Slashed zero reads clearer on the LCD than Doto’s plain 0.
  const text = char === '0' ? 'Ø' : char === '\u00a0' ? ' ' : char
  return { kind: 'text', char: text }
}
