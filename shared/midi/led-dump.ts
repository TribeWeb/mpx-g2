import type { FrontPanelButtonName, PanelLedState } from '../types/midi'
import { FrontPanelButtons } from '../types/midi'
import { emptyLedFlashStable, emptyLedFlashing } from './flash-detect'

/** Seven-segment digit images from MPX-G2 firmware (pgfe dcba bit order). */
const SEGMENT_IMAGES: Record<number, number> = {
  0: 0x3f,
  1: 0x30,
  2: 0x5b,
  3: 0x79,
  4: 0x74,
  5: 0x6d,
  6: 0x6f,
  7: 0x38,
  8: 0x7f,
  9: 0x7c
}

const COLUMN_BUTTON_BITS: Array<{ column: number, bit: number, button: FrontPanelButtonName }> = [
  { column: 1, bit: 3, button: 'gain' },
  { column: 1, bit: 4, button: 'fx1' },
  { column: 1, bit: 5, button: 'fx2' },
  { column: 1, bit: 6, button: 'program' },
  { column: 3, bit: 3, button: 'chorus' },
  { column: 3, bit: 4, button: 'delay' },
  { column: 3, bit: 5, button: 'reverb' },
  { column: 3, bit: 6, button: 'edit' },
  { column: 5, bit: 3, button: 'eq' },
  { column: 5, bit: 4, button: 'insert' },
  { column: 5, bit: 5, button: 'bypass' },
  { column: 5, bit: 6, button: 'system' },
  { column: 7, bit: 3, button: 'tempo' },
  { column: 7, bit: 4, button: 'ab' },
  { column: 7, bit: 5, button: 'softRow' },
  { column: 7, bit: 6, button: 'store' },
  { column: 9, bit: 3, button: 'midi' },
  { column: 9, bit: 5, button: 'option' }
]

function emptyButtonLeds(): Record<FrontPanelButtonName, boolean> {
  return Object.fromEntries(FrontPanelButtons.map(button => [button, false])) as Record<
    FrontPanelButtonName,
    boolean
  >
}

function segmentByteToDigit(byte: number): number | null {
  for (const [digit, image] of Object.entries(SEGMENT_IMAGES)) {
    if ((byte & 0x7f) === image) {
      return Number(digit)
    }
  }
  return null
}

/** Parse the first 10 bytes of an MPX-G2 All LEDs dump into panel LED state. */
export function parseLedDumpBytes(bytes: number[]): PanelLedState {
  const state: PanelLedState = {
    buttons: emptyButtonLeds(),
    flashing: emptyLedFlashing(),
    flashStable: emptyLedFlashStable(),
    segments: [-1, -1, -1],
    scanBits: [0, 0, 0]
  }

  for (const { column, bit, button } of COLUMN_BUTTON_BITS) {
    const columnByte = bytes[column] ?? 0
    // Column LEDs: 0 = on, 1 = off (inverted)
    state.buttons[button] = ((columnByte >> bit) & 1) === 0
  }

  state.segments = [
    segmentByteToDigit(bytes[4] ?? 0) ?? -1,
    segmentByteToDigit(bytes[6] ?? 0) ?? -1,
    segmentByteToDigit(bytes[8] ?? 0) ?? -1
  ]

  state.scanBits = [
    (bytes[1] ?? 0) & 0x07,
    (bytes[3] ?? 0) & 0x07,
    (bytes[5] ?? 0) & 0x07
  ]

  return state
}

export function segmentDigitToByte(digit: number): number {
  if (digit < 0 || digit > 9) {
    return 0
  }
  return SEGMENT_IMAGES[digit] ?? 0
}
