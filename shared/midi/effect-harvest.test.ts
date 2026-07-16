import { describe, expect, it } from 'vitest'
import {
  buildEffectDraftsFromHarvest,
  harvestDraftToMarkdown,
  ObjectControlFlag,
  slugifyEffectName,
  slugifyParamId
} from './effect-harvest'
import type { ObjectDescription } from './object-description'

function desc(
  objectTypeId: number,
  name: string,
  flags: number,
  min: number,
  max: number
): ObjectDescription {
  return {
    objectTypeId,
    name,
    byteCount: 1,
    controlFlags: flags,
    optionObjectTypeId: null,
    limits: [{ min, max, displayUnits: 0, signed: min < 0 }]
  }
}

describe('effect-harvest', () => {
  it('slugifies LCD names into ids and filenames', () => {
    expect(slugifyParamId('Dpth1')).toBe('dpth1')
    expect(slugifyParamId('PW 1')).toBe('pw1')
    expect(slugifyEffectName('Stereo Chorus')).toBe('stereo-chorus')
  })

  it('folds program-tree nodes into effect drafts', () => {
    const descriptions = new Map<number, ObjectDescription>([
      [10, desc(10, 'Chorus', ObjectControlFlag.ControlLevel, 0, 0)],
      [11, desc(11, 'Mix', ObjectControlFlag.SoftRowAssignable, 0, 100)],
      [12, desc(12, 'Level', 0, -89, 6)],
      [13, desc(13, 'Rate1', 0, 0, 50)]
    ])

    const drafts = buildEffectDraftsFromHarvest(
      [
        { objectTypeId: 10, levels: [0, 2, 1] },
        { objectTypeId: 11, levels: [0, 2, 1, 0] },
        { objectTypeId: 12, levels: [0, 2, 1, 1] },
        { objectTypeId: 13, levels: [0, 2, 1, 2] },
        // Ignored system path
        { objectTypeId: 99, levels: [1, 8, 1] }
      ],
      descriptions
    )

    expect(drafts).toHaveLength(1)
    const chorus = drafts[0]!
    expect(chorus.name).toBe('Chorus')
    expect(chorus.slug).toBe('chorus')
    expect(chorus.availableIn).toEqual({ chorus: 1 })
    expect(chorus.softRow).toEqual([])
    expect(chorus.params.map(p => p.id)).toEqual(['mix', 'level', 'rate1'])
    expect(chorus.params[0]).toMatchObject({ index: 0, min: 0, max: 100, softRow: true })
  })

  it('merges the same effect name across blocks', () => {
    const descriptions = new Map<number, ObjectDescription>([
      [1, desc(1, 'Phaser', ObjectControlFlag.ControlLevel, 0, 0)],
      [2, desc(2, 'Mix', ObjectControlFlag.SoftRowAssignable, 0, 100)],
      [3, desc(3, 'Level', 0, -89, 6)]
    ])

    const drafts = buildEffectDraftsFromHarvest(
      [
        { objectTypeId: 1, levels: [0, 0, 5] }, // fx1 alg 5
        { objectTypeId: 2, levels: [0, 0, 5, 0] },
        { objectTypeId: 3, levels: [0, 0, 5, 1] },
        { objectTypeId: 1, levels: [0, 2, 17] }, // chorus alg 17
        { objectTypeId: 2, levels: [0, 2, 17, 0] },
        { objectTypeId: 3, levels: [0, 2, 17, 1] }
      ],
      descriptions
    )

    expect(drafts).toHaveLength(1)
    expect(drafts[0]!.availableIn).toEqual({ fx1: 5, chorus: 17 })
  })

  it('emits Content-shaped markdown drafts', () => {
    const md = harvestDraftToMarkdown({
      slug: 'chorus',
      name: 'Chorus',
      modelName: 'Stereo chorus',
      summary: 'TODO',
      dspSteps: null,
      manualSection: '',
      availableIn: { chorus: 1 },
      softRow: ['mix'],
      params: [{
        id: 'mix',
        index: 0,
        label: 'Mix',
        min: 0,
        max: 100,
        description: '',
        softRow: true,
        bytes: 1,
        objectTypeId: 11,
        displayUnits: 0
      }],
      primaryBlock: 'chorus',
      primaryAlg: 1
    })

    expect(md).toContain('name: Chorus')
    expect(md).toContain('color: "#0ea5e9"')
    expect(md).toContain('dspSteps: 0  # TODO')
    expect(md).toContain('chorus: 1')
    expect(md).toContain('id: mix')
    expect(md).toContain('default: 0')
    expect(md).toContain('/effects/chorus.png')
  })
})
