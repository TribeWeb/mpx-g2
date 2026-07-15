import { describe, expect, it } from 'vitest'
import { parseMpxG2SysEx, buildHandshakeMessage, formatSysExHex } from './sysex'
import { HandshakeCommand } from '../types/midi'

describe('sysex', () => {
  it('parses a handshake message', () => {
    const message = buildHandshakeMessage(HandshakeCommand.ImAlive, { deviceId: 0, productId: 0x0f })
    const parsed = parseMpxG2SysEx(message)
    expect(parsed).not.toBeNull()
    expect(parsed?.messageType).toBe(0x12)
    expect(parsed?.payload[0]).toBe(HandshakeCommand.ImAlive)
  })

  it('formats hex for debugging', () => {
    const message = buildHandshakeMessage(HandshakeCommand.ImAlive)
    expect(formatSysExHex(message)).toMatch(/^f0 06/)
  })

  it('rejects non-Lexicon SysEx', () => {
    expect(parseMpxG2SysEx(new Uint8Array([0xf0, 0x7d, 0x00, 0xf7]))).toBeNull()
  })
})
