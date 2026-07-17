/**
 * MIDI Program Change + bank select for loading an MPX-G2 program (1–300).
 * Banks of 100: CC32 = bank, then Program Change = index within bank
 * (PC 0 loads program 1 when Pgm# Offset is 0 — MIDI doc).
 */
export function programBankAndPc(programNumber: number): { bank: number, pc: number } {
  if (!Number.isInteger(programNumber) || programNumber < 1 || programNumber > 300) {
    throw new RangeError(`Program number must be 1–300, got ${programNumber}`)
  }
  const zeroBased = programNumber - 1
  return {
    bank: Math.floor(zeroBased / 100),
    pc: zeroBased % 100
  }
}

/**
 * Raw MIDI messages to load a program on channel 1–16 (default 1).
 * Sends CC0=0, CC32=bank, then Program Change.
 */
export function buildProgramSelectMessages(
  programNumber: number,
  midiChannel = 1
): { bytes: Uint8Array, note: string }[] {
  const channel = Math.min(16, Math.max(1, Math.trunc(midiChannel))) - 1
  const { bank, pc } = programBankAndPc(programNumber)
  const statusCc = 0xb0 | channel
  const statusPc = 0xc0 | channel
  return [
    {
      bytes: new Uint8Array([statusCc, 0x00, 0x00]),
      note: `Bank MSB CC0=0 (ch${channel + 1})`
    },
    {
      bytes: new Uint8Array([statusCc, 0x20, bank]),
      note: `Bank LSB CC32=${bank} (ch${channel + 1})`
    },
    {
      bytes: new Uint8Array([statusPc, pc]),
      note: `Program Change ${pc} → G2 #${programNumber} (ch${channel + 1})`
    }
  ]
}
