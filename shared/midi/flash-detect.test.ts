import { describe, expect, it } from 'vitest'
import { mergeLcdWithFlashHighlight, updateLedFlashing } from './flash-detect'
import { FrontPanelButtons } from '../types/midi'

describe('updateLedFlashing', () => {
  const base = Object.fromEntries(FrontPanelButtons.map(b => [b, false])) as Record<
    typeof FrontPanelButtons[number],
    boolean
  >

  it('marks a single toggling LED as flashing', () => {
    const previous = { ...base, option: false }
    const next = { ...base, option: true }
    const result = updateLedFlashing(previous, next, { ...base })
    expect(result.flashing.option).toBe(true)
  })

  it('clears highlight flashes when many LEDs change at once', () => {
    const previous = { ...base }
    const next = { ...base, gain: true, fx1: true, chorus: true, delay: true }
    const flashing = { ...base, option: true }
    const result = updateLedFlashing(previous, next, flashing)
    expect(result.flashing.option).toBe(false)
  })

  it('excludes tempo from highlight flash detection', () => {
    const previous = { ...base, tempo: false }
    const next = { ...base, tempo: true }
    const result = updateLedFlashing(previous, next, { ...base })
    expect(result.flashing.tempo).toBe(false)
  })
})

describe('mergeLcdWithFlashHighlight', () => {
  const blankFlash = Array.from({ length: 32 }, () => false)

  it('preserves glyph across blink-off dump', () => {
    const previous = 'Hello           '.padEnd(32, ' ').split('')
    const incoming = '     '.padEnd(32, ' ').split('')
    incoming[0] = '\u00a0'
    const result = mergeLcdWithFlashHighlight(previous, blankFlash, incoming)
    expect(result.characters[0]).toBe('H')
    expect(result.flashing[0]).toBe(true)
  })

  it('treats large layout changes as page changes', () => {
    const previous = 'ABCDEFGHIJKLMNOP'.padEnd(32, ' ').split('')
    const incoming = 'QRSTUVWXYZ012345'.padEnd(32, ' ').split('')
    const result = mergeLcdWithFlashHighlight(previous, blankFlash, incoming)
    expect(result.pageChanged).toBe(true)
    expect(result.flashing.every(f => !f)).toBe(true)
  })
})
