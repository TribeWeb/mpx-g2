import type { MpxG2PanelState } from '#shared/types/midi'
import {
  chorusParamMatchesDescription,
  chorusParamsForAlg,
  type ChorusParamId
} from '#shared/constants/chorus-params'
import { chorusParamControlPath } from '#shared/midi/control-paths'
import { applyChorusParamRange } from '#shared/midi/inbound'
import { buildEffectAlgRequest } from '#shared/midi/requests'
import {
  createEffectParamSync,
  type EffectParamSpec,
  type EffectParamSyncDeps
} from './effect-param-sync'

function chorusParamSpecsForAlg(alg: number): EffectParamSpec[] {
  return chorusParamsForAlg(alg).map(def => ({
    id: def.id,
    label: def.label,
    controlPath: (activeAlg: number) => chorusParamControlPath(activeAlg, def.index),
    matchesDescription: (name: string) => chorusParamMatchesDescription(def, name),
    fallbackRange: { ...def.fallbackRange }
  }))
}

export type ChorusSyncDeps = EffectParamSyncDeps & {
  panelState: { value: MpxG2PanelState }
}

/**
 * Chorus param sync — Mix/Level for all algs; full Stereo Chorus set for alg 1.
 */
export function createChorusSync(deps: ChorusSyncDeps) {
  const { runtime, panelState, status, getSysexOptions, sendSysEx } = deps

  const sync = createEffectParamSync(
    { runtime, status, getSysexOptions, sendSysEx },
    {
      blockLabel: 'Chorus',
      getState: () => runtime.chorusSync,
      getParamSpecs: chorusParamSpecsForAlg,
      onParamResolved: (meta) => {
        const paramId = meta.specId
        applyChorusParamRange(panelState.value, paramId, meta.range, meta.valueBytes)
        const knobs = panelState.value.knobs
        const current = knobs.chorusValues[paramId] ?? 0
        if (current < meta.range.min || current > meta.range.max) {
          const nextValues = {
            ...knobs.chorusValues,
            [paramId]: Math.min(meta.range.max, Math.max(meta.range.min, current))
          }
          panelState.value.knobs = {
            ...knobs,
            chorusValues: nextValues,
            chorusMix: nextValues.mix ?? knobs.chorusMix,
            chorusLevel: nextValues.level ?? knobs.chorusLevel
          }
        }
      },
      onRangesStart: (_alg, specs) => {
        const knobs = panelState.value.knobs
        const nextRanges = { ...knobs.chorusRanges }
        for (const spec of specs) {
          if (spec.fallbackRange) {
            nextRanges[spec.id] = { ...spec.fallbackRange }
          }
        }
        panelState.value.knobs = {
          ...knobs,
          chorusRanges: nextRanges,
          chorusMixRange: nextRanges.mix ?? knobs.chorusMixRange,
          chorusLevelRange: nextRanges.level ?? knobs.chorusLevelRange
        }
      },
      requestAlg: (note) => {
        const opts = getSysexOptions()
        sendSysEx(
          buildEffectAlgRequest('chorus', opts.deviceId, opts.productId),
          `Chorus alg request (${note})`
        )
      },
      getCurrentAlg: () => panelState.value.program.algByBlock.chorus
    }
  )

  return {
    applyObjectDescription: sync.applyObjectDescription,
    acceptObjectTypeId(param: ChorusParamId | string, objectTypeId: number) {
      sync.acceptObjectTypeId(param, objectTypeId)
    },
    acceptOrphanObjectTypeId: sync.acceptOrphanObjectTypeId,
    requestChorusParams(alg: number, note = 'chorus param sync') {
      sync.requestParams(alg, note)
    },
    requestChorusState(note = 'chorus sync') {
      sync.requestState(note)
    },
    scheduleChorusResync(note: string) {
      sync.scheduleResync(note)
    },
    noteChorusAlgResponse() {
      sync.noteAlgResponse()
    },
    clearTimers: sync.clearTimers
  }
}
