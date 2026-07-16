import { describe, expect, it } from 'vitest'
import { nibblize } from './sysex'
import { parseSystemConfigPayload } from './system-config'

describe('system-config', () => {
  it('parses object type count from a synthetic config payload', () => {
    const bytes = [
      1,
      0,
      ...'17:51:03'.split('').map(c => c.charCodeAt(0)),
      ...'May 10 1996'.split('').map(c => c.charCodeAt(0)),
      0x2a,
      0x01, // object types = 298
      0,
      0,
      4,
      0
    ]
    const parsed = parseSystemConfigPayload(nibblize(bytes))
    expect(parsed?.objectTypeCount).toBe(298)
    expect(parsed?.majorVersion).toBe(1)
    expect(parsed?.buildTime).toBe('17:51:03')
    expect(parsed?.buildDate).toBe('May 10 1996')
  })
})
