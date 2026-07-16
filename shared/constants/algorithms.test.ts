import { describe, expect, it } from 'vitest'
import {
  algorithmFaceParamIds,
  algorithmForBlockAlg,
  GENERATED_ALGORITHMS,
  GENERATED_ALGORITHM_BY_BLOCK_ALG
} from '../constants/algorithms'
import { chorusParamsForAlg } from '../constants/chorus-params'
import { gainAdvancedParams, gainEffectForAlg } from '../constants/gain-effects'

describe('algorithm content library', () => {
  it('compiles stereo chorus and tube screamer from Content', () => {
    expect(GENERATED_ALGORITHMS['stereo-chorus'].dspSteps).toBe(60)
    expect(GENERATED_ALGORITHMS['tube-screamer'].dspSteps).toBe(0)
    expect(GENERATED_ALGORITHM_BY_BLOCK_ALG.chorus?.[1]).toBe('stereo-chorus')
    expect(GENERATED_ALGORITHM_BY_BLOCK_ALG.gain?.[3]).toBe('tube-screamer')
  })

  it('resolves chorus alg 1 params from the library', () => {
    const defs = chorusParamsForAlg(1)
    expect(defs.map(param => param.id)).toEqual([
      'mix',
      'level',
      'rate1',
      'pw1',
      'dpth1',
      'rate2',
      'pw2',
      'dpth2',
      'res1',
      'res2'
    ])
    expect(algorithmForBlockAlg('chorus', 1)?.name).toBe('Chorus')
    expect(algorithmForBlockAlg('chorus', 1)?.params[0]?.description).toBe('Dry/Wet ratio')
  })

  it('resolves tube screamer metadata and advanced params', () => {
    const meta = gainEffectForAlg(3)
    expect(meta.name).toBe('Screamer')
    expect(meta.modelName).toBe('Tube Screamer')
    expect(meta.color).toBe('#009739')
    expect('dspSteps' in meta && meta.dspSteps).toBe(0)

    const advanced = gainAdvancedParams(3)
    expect(advanced.map(param => param.id)).toEqual([
      'lo',
      'hi'
    ])
  })

  it('places Mix/Level on the face bottom and softRow on top', () => {
    const def = GENERATED_ALGORITHMS.hall
    const face = algorithmFaceParamIds(def.params, def.softRow)
    expect(face.top).toEqual(['size', 'decay', 'shape'])
    expect(face.bottom).toEqual(['mix', 'level'])
  })
})
