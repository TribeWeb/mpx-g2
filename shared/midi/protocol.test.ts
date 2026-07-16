import { describe, expect, it } from 'vitest'
import { CHORUS_EFFECT_TYPE, GAIN_EFFECT_TYPE, parseEffectAlgPath } from './control-paths'
import { getPanelButtonSysExValue } from './panel-buttons'
import {
  editorObjectRange,
  objectDescriptionMatchesGainBand,
  parseObjectDescriptionPayload
} from './object-description'
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

describe('object-description gain eq', () => {
  it('matches band names to descriptions', () => {
    expect(objectDescriptionMatchesGainBand('low', 'Lo')).toBe(true)
    expect(objectDescriptionMatchesGainBand('mid', 'Mid')).toBe(true)
    expect(objectDescriptionMatchesGainBand('high', 'Hi')).toBe(true)
    expect(objectDescriptionMatchesGainBand('mid', 'Lo')).toBe(false)
  })

  it('prefers the tightest limit pair for editors', () => {
    const range = editorObjectRange({
      objectTypeId: 77,
      name: 'Lo',
      byteCount: 1,
      controlFlags: 0,
      optionObjectTypeId: null,
      limits: [
        { min: -15, max: 15, displayUnits: 0, signed: true },
        { min: -5, max: 5, displayUnits: 0, signed: true }
      ]
    })
    expect(range).toEqual({ min: -5, max: 5 })
  })

  it('parses Screamer Lo from hardware capture', () => {
    const payload = [
      0x0d, 0x04, 0x00, 0x00, 0x05, 0x00, 0x0c, 0x04, 0x0f, 0x06, 0x00, 0x02, 0x00, 0x02, 0x00, 0x02,
      0x01, 0x00, 0x00, 0x00, 0x03, 0x04, 0x0f, 0x0f, 0x0f, 0x0f, 0x01, 0x00, 0x0b, 0x0f, 0x0f, 0x0f,
      0x05, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x08, 0x04
    ]
    const description = parseObjectDescriptionPayload(payload)
    expect(description?.name).toBe('Lo')
    expect(editorObjectRange(description!)).toEqual({ min: -5, max: 5 })
  })
})

describe('control-paths effect alg', () => {
  it('parses algorithm-select paths for program effect blocks', () => {
    expect(parseEffectAlgPath([0x0000, GAIN_EFFECT_TYPE])).toEqual({
      effectType: GAIN_EFFECT_TYPE,
      block: 'gain'
    })
    expect(parseEffectAlgPath([0x0000, CHORUS_EFFECT_TYPE])).toEqual({
      effectType: CHORUS_EFFECT_TYPE,
      block: 'chorus'
    })
    expect(parseEffectAlgPath([0x0000, 0x0099])).toBeNull()
  })
})

describe('gain eq control paths for generic param sync', () => {
  it('builds L:0004 program/gain/alg/param paths', async () => {
    const { gainEqControlPath } = await import('./control-paths')
    expect(gainEqControlPath(3, 'low')).toEqual([0x0000, 0x0006, 3, 0])
    expect(gainEqControlPath(3, 'mid')).toEqual([0x0000, 0x0006, 3, 1])
    expect(gainEqControlPath(3, 'high')).toEqual([0x0000, 0x0006, 3, 2])
  })
})

describe('chorus param control paths', () => {
  it('builds and parses Mix/Level and Stereo Chorus modulator paths', async () => {
    const { chorusParamControlPath, parseChorusParamPath } = await import('./control-paths')
    expect(chorusParamControlPath(1, 0)).toEqual([0x0000, 0x0002, 1, 0])
    expect(chorusParamControlPath(1, 4)).toEqual([0x0000, 0x0002, 1, 4])
    expect(parseChorusParamPath([0x0000, 0x0002, 1, 0])).toEqual({ alg: 1, paramIndex: 0 })
    expect(parseChorusParamPath([0x0000, 0x0002, 1, 8])).toEqual({ alg: 1, paramIndex: 8 })
  })
})
