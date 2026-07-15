import type { GainEqBand, MpxG2PanelState } from '#shared/types/midi'
import { applyGainEqRange } from '#shared/midi/inbound'
import { primaryObjectRange, type ObjectDescription } from '#shared/midi/object-description'
import {
  buildGainAlgRequest,
  buildGainEqObjectTypeIdRequest,
  buildGainEqRequest,
  buildObjectDescriptionRequest
} from '#shared/midi/requests'
import type { WebMidiRuntime } from './runtime'

export type GainEqSyncDeps = {
  runtime: WebMidiRuntime
  panelState: { value: MpxG2PanelState }
  status: { value: string }
  getSysexOptions: () => { deviceId: number, productId: number }
  sendSysEx: (data: Uint8Array, note?: string) => boolean
}

export function createGainEqSync(deps: GainEqSyncDeps) {
  const { runtime, panelState, status, getSysexOptions, sendSysEx } = deps

  function applyObjectDescriptionToBand(band: GainEqBand, description: ObjectDescription) {
    const range = primaryObjectRange(description)
    if (!range) {
      return
    }
    applyGainEqRange(
      panelState.value,
      band,
      range,
      description.byteCount === 1 || description.byteCount === 2 ? description.byteCount : undefined
    )
    const knobs = panelState.value.knobs
    const valueKey = band === 'low' ? 'gainLow' : band === 'mid' ? 'gainMid' : 'gainHigh'
    const value = knobs[valueKey]
    if (value < range.min || value > range.max) {
      panelState.value.knobs = {
        ...knobs,
        [valueKey]: Math.min(range.max, Math.max(range.min, value))
      }
    }
    console.info(
      `[mpx-g2] Gain ${band} range ← "${description.name}" ${range.min}…${range.max} (${description.byteCount} byte)`
    )
  }

  function applyObjectDescription(description: ObjectDescription) {
    runtime.objectDescriptions.set(description.objectTypeId, description)
    const pending = runtime.pendingDescriptionBands.get(description.objectTypeId)
    if (!pending || pending.size === 0) {
      return
    }
    for (const band of pending) {
      applyObjectDescriptionToBand(band, description)
    }
    runtime.pendingDescriptionBands.delete(description.objectTypeId)
  }

  function pumpGainRangeRequests(note: string, gen = runtime.rangeRequestGen) {
    if (runtime.rangeRequestGen !== gen) {
      return
    }
    if (runtime.rangeAwaitingBand) {
      return
    }
    const band = runtime.pendingObjectTypeBands[0]
    const alg = runtime.rangeAwaitingAlg
    if (!band || alg < 1) {
      return
    }
    runtime.rangeAwaitingBand = band
    const opts = getSysexOptions()
    sendSysEx(
      buildGainEqObjectTypeIdRequest(alg, band, opts.deviceId, opts.productId),
      `Gain ${band} Object Type ID (${note}, alg ${alg})`
    )
  }

  function resolveGainObjectType(band: GainEqBand, objectTypeId: number) {
    const cached = runtime.objectDescriptions.get(objectTypeId)
    if (cached) {
      applyObjectDescriptionToBand(band, cached)
      return
    }

    let pending = runtime.pendingDescriptionBands.get(objectTypeId)
    if (!pending) {
      pending = new Set()
      runtime.pendingDescriptionBands.set(objectTypeId, pending)
      const opts = getSysexOptions()
      sendSysEx(
        buildObjectDescriptionRequest(objectTypeId, opts.deviceId, opts.productId),
        `Object Description request type=${objectTypeId} (${band})`
      )
    }
    pending.add(band)
  }

  function acceptGainObjectTypeId(band: GainEqBand, objectTypeId: number) {
    const pendingIdx = runtime.pendingObjectTypeBands.indexOf(band)
    if (pendingIdx >= 0) {
      runtime.pendingObjectTypeBands.splice(pendingIdx, 1)
    }
    if (runtime.rangeAwaitingBand === band) {
      runtime.rangeAwaitingBand = null
    }
    resolveGainObjectType(band, objectTypeId)
    pumpGainRangeRequests('gain ranges')
  }

  function requestGainEqRanges(alg: number, note = 'gain ranges') {
    if (alg < 1) {
      return
    }
    const gen = ++runtime.rangeRequestGen
    runtime.pendingObjectTypeBands = ['low', 'mid', 'high']
    runtime.rangeAwaitingBand = null
    runtime.rangeAwaitingAlg = alg
    pumpGainRangeRequests(note, gen)
  }

  function requestGainEqParams(alg: number, note = 'gain eq sync') {
    if (alg < 1) {
      return
    }
    const opts = getSysexOptions()
    const bands = ['low', 'mid', 'high'] as const
    bands.forEach((band, index) => {
      window.setTimeout(() => {
        sendSysEx(
          buildGainEqRequest(alg, band, opts.deviceId, opts.productId),
          `Gain ${band} request (${note}, alg ${alg})`
        )
      }, index * 60)
    })
    requestGainEqRanges(alg, note)
  }

  function requestGainEqState(note = 'gain sync') {
    const opts = getSysexOptions()
    sendSysEx(buildGainAlgRequest(opts.deviceId, opts.productId), `Gain alg request (${note})`)

    window.setTimeout(() => {
      const alg = panelState.value.knobs.gainAlg
      if (alg >= 1) {
        requestGainEqParams(alg, `${note} fallback`)
      }
    }, 400)
  }

  function scheduleGainEqResync(note: string) {
    if (runtime.gainResyncTimer) {
      clearTimeout(runtime.gainResyncTimer)
    }
    runtime.gainResyncTimer = setTimeout(() => {
      runtime.gainResyncTimer = null
      if (status.value !== 'connected') {
        return
      }
      console.info(`[mpx-g2] Gain EQ resync (${note})`)
      requestGainEqState(note)
    }, 450)
  }

  return {
    applyObjectDescription,
    acceptGainObjectTypeId,
    requestGainEqParams,
    requestGainEqState,
    scheduleGainEqResync
  }
}
