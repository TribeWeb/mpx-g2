import { describe, expect, it } from 'vitest'
import { getPanelButtonSysExValue } from './panel-buttons'
import { encodeParamValue, decodeParamValue } from './param-value'
import { parseLedDumpBytes } from './led-dump'

describe('param-value', () => {
  it('round-trips 1-byte signed values', () => {
    expect(decodeParamValue(encodeParamValue(-5))).toBe(-5)
    expect(decodeParamValue(encodeParamValue(12))).toBe(12)
  })

  it('round-trips 2-byte signed values', () => {
    expect(decodeParamValue(encodeParamValue(-25, 2))).toBe(-25)
    expect(decodeParamValue(encodeParamValue(50, 2))).toBe(50)
  })
})

describe('panel-buttons', () => {
  it('maps press and release pairs for effect buttons', () => {
    expect(getPanelButtonSysExValue('gain', 'press')).toBe(0x00)
    expect(getPanelButtonSysExValue('gain', 'release')).toBe(0x2c)
  })

  it('returns null for A/B release (toggle only)', () => {
    expect(getPanelButtonSysExValue('ab', 'press')).toBe(0x45)
    expect(getPanelButtonSysExValue('ab', 'release')).toBeNull()
  })

  it('has no outbound mapping for tempo or midi LEDs', () => {
    expect(getPanelButtonSysExValue('tempo', 'press')).toBeNull()
    expect(getPanelButtonSysExValue('midi', 'press')).toBeNull()
  })
})

describe('parseLedDumpBytes', () => {
  it('parses segment digits and inverted button bits', () => {
    const bytes = Array.from({ length: 10 }, () => 0xff)
    bytes[4] = 0x3f // digit 0
    bytes[6] = 0x30 // digit 1
    bytes[8] = 0x5b // digit 2
    bytes[1] = 0xf7 // gain LED on (bit 3 = 0)

    const state = parseLedDumpBytes(bytes)
    expect(state.segments).toEqual([0, 1, 2])
    expect(state.buttons.gain).toBe(true)
  })
})
