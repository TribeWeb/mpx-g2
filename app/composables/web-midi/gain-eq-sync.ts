import type { GainEqBand, MpxG2PanelState } from '#shared/types/midi'
import { gainEqControlPath, GAIN_EQ_DISPLAY_RANGE } from '#shared/midi/control-paths'
import { applyGainEqRange } from '#shared/midi/inbound'
import { objectDescriptionMatchesGainBand } from '#shared/midi/object-description'
import { buildGainAlgRequest } from '#shared/midi/requests'
import {
  createEffectParamSync,
  type EffectParamSpec,
  type EffectParamSyncDeps
} from './effect-param-sync'

const BANDS = ['low', 'mid', 'high'] as const

function gainEqParamSpecs(): EffectParamSpec[] {
  return BANDS.map(band => ({
    id: band,
    label: band,
    controlPath: (alg: number) => gainEqControlPath(alg, band),
    matchesDescription: (name: string) => objectDescriptionMatchesGainBand(band, name),
    fallbackRange: { ...GAIN_EQ_DISPLAY_RANGE[band] }
  }))
}

export type GainEqSyncDeps = EffectParamSyncDeps & {
  panelState: { value: MpxG2PanelState }
}

/**
 * Gain Lo/Mid/Hi sync — thin adapter over the generic effect-param-sync pipeline.
 * Keeps the previous Gain-facing API for useWebMidi / connection helpers.
 */
export function createGainEqSync(deps: GainEqSyncDeps) {
  const { runtime, panelState, status, getSysexOptions, sendSysEx } = deps

  const sync = createEffectParamSync(
    { runtime, status, getSysexOptions, sendSysEx },
    {
      blockLabel: 'Gain',
      getState: () => runtime.gainSync,
      paramSpecs: gainEqParamSpecs(),
      onParamResolved: (meta) => {
        const band = meta.specId as GainEqBand
        applyGainEqRange(panelState.value, band, meta.range, meta.valueBytes)
        const key = band === 'low' ? 'gainLow' : band === 'mid' ? 'gainMid' : 'gainHigh'
        const v = panelState.value.knobs[key]
        if (v < meta.range.min || v > meta.range.max) {
          panelState.value.knobs = {
            ...panelState.value.knobs,
            [key]: Math.min(meta.range.max, Math.max(meta.range.min, v))
          }
        }
      },
      onRangesStart: () => {
        panelState.value.knobs = {
          ...panelState.value.knobs,
          gainLowRange: { ...GAIN_EQ_DISPLAY_RANGE.low },
          gainMidRange: { ...GAIN_EQ_DISPLAY_RANGE.mid },
          gainHighRange: { ...GAIN_EQ_DISPLAY_RANGE.high }
        }
      },
      requestAlg: (note) => {
        const opts = getSysexOptions()
        sendSysEx(buildGainAlgRequest(opts.deviceId, opts.productId), `Gain alg request (${note})`)
      },
      getCurrentAlg: () => panelState.value.knobs.gainAlg
    }
  )

  return {
    applyObjectDescription: sync.applyObjectDescription,
    acceptObjectTypeId(band: GainEqBand, objectTypeId: number) {
      sync.acceptObjectTypeId(band, objectTypeId)
    },
    acceptOrphanObjectTypeId: sync.acceptOrphanObjectTypeId,
    requestGainEqParams(alg: number, note = 'gain eq sync') {
      sync.requestParams(alg, note)
    },
    requestGainEqState(note = 'gain sync') {
      sync.requestState(note)
    },
    scheduleGainEqResync(note: string) {
      sync.scheduleResync(note)
    },
    noteGainAlgResponse() {
      sync.noteAlgResponse()
    },
    clearTimers: sync.clearTimers
  }
}
