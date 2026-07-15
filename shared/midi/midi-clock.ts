/** MIDI Clock: 24 pulses per quarter note. */
export const MIDI_CLOCK = 0xf8
export const MIDI_START = 0xfa
export const MIDI_CONTINUE = 0xfb
export const MIDI_STOP = 0xfc

export const MIDI_CLOCKS_PER_QUARTER = 24

/** True for system realtime status bytes (0xF8–0xFF). */
export function isMidiRealtimeByte(byte: number): boolean {
  return (byte & 0xff) >= 0xf8
}

/**
 * Split realtime bytes out of a MIDI packet.
 * Realtime may be interleaved inside SysEx; it must not enter the SysEx buffer.
 */
export function splitMidiRealtime(data: Uint8Array): {
  realtime: number[]
  rest: Uint8Array
} {
  const realtime: number[] = []
  const rest: number[] = []
  for (const byte of data) {
    if (isMidiRealtimeByte(byte)) {
      realtime.push(byte)
    } else {
      rest.push(byte)
    }
  }
  return { realtime, rest: new Uint8Array(rest) }
}

/** How long after the last clock we still treat tempo as clock-driven. */
export const MIDI_CLOCK_ACTIVE_MS = 2000

/** Tempo LED on-time per beat (ms). */
export const TEMPO_LED_FLASH_MS = 90
