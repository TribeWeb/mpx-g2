import type { GainEqBand, MpxG2PanelState } from '#shared/types/midi'
import { GAIN_EQ_DISPLAY_RANGE } from '#shared/midi/control-paths'
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

  function isActiveRangeGeneration(gen = runtime.rangeActiveGen): boolean {
    return gen > 0 && gen === runtime.rangeRequestGen && gen === runtime.rangeActiveGen
  }

  function resetGainEqRangesToFallback() {
    panelState.value.knobs = {
      ...panelState.value.knobs,
      gainLowRange: { ...GAIN_EQ_DISPLAY_RANGE.low },
      gainMidRange: { ...GAIN_EQ_DISPLAY_RANGE.mid },
      gainHighRange: { ...GAIN_EQ_DISPLAY_RANGE.high }
    }
    panelState.value.lastUpdated = Date.now()
  }

  function applyObjectDescriptionToBand(band: GainEqBand, description: ObjectDescription, gen: number) {
    if (!isActiveRangeGeneration(gen)) {
      return
    }
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
      `[mpx-g2] Gain ${band} range ← "${description.name}" ${range.min} <> ${range.max} (${description.byteCount} byte)`
    )
  }

  function applyObjectDescription(description: ObjectDescription) {
    runtime.objectDescriptions.set(description.objectTypeId, description)
    const pending = runtime.pendingDescriptionBands.get(description.objectTypeId)
    if (!pending || pending.size === 0) {
      return
    }
    const gen = runtime.rangeActiveGen
    if (!isActiveRangeGeneration(gen)) {
      runtime.pendingDescriptionBands.delete(description.objectTypeId)
      return
    }
    for (const band of pending) {
      applyObjectDescriptionToBand(band, description, gen)
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
    runtime.rangeInFlight = { gen, band, alg }
    const opts = getSysexOptions()
    sendSysEx(
      buildGainEqObjectTypeIdRequest(alg, band, opts.deviceId, opts.productId),
      `Gain ${band} Object Type ID (${note}, alg ${alg})`
    )
  }

  function resolveGainObjectType(band: GainEqBand, objectTypeId: number, gen: number) {
    if (!isActiveRangeGeneration(gen)) {
      return
    }

    const cached = runtime.objectDescriptions.get(objectTypeId)
    if (cached) {
      applyObjectDescriptionToBand(band, cached, gen)
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

  function acceptGainObjectTypeId(band: GainEqBand, objectTypeId: number, alg?: number) {
    const inFlight = runtime.rangeInFlight
    if (!inFlight || !isActiveRangeGeneration(inFlight.gen)) {
      return
    }
    if (band !== inFlight.band) {
      return
    }
    if (alg != null && (alg !== inFlight.alg || alg !== runtime.rangeAwaitingAlg)) {
      return
    }

    const pendingIdx = runtime.pendingObjectTypeBands.indexOf(band)
    if (pendingIdx >= 0) {
      runtime.pendingObjectTypeBands.splice(pendingIdx, 1)
    }
    if (runtime.rangeAwaitingBand === band) {
      runtime.rangeAwaitingBand = null
    }
    runtime.rangeInFlight = null
    resolveGainObjectType(band, objectTypeId, inFlight.gen)
    pumpGainRangeRequests('gain ranges', inFlight.gen)
  }

  function requestGainEqRanges(alg: number, note = 'gain ranges') {
    if (alg < 1) {
      return
    }
    const gen = ++runtime.rangeRequestGen
    runtime.rangeActiveGen = gen
    runtime.rangeSyncedAlg = alg
    runtime.rangeInFlight = null
    runtime.pendingDescriptionBands.clear()
    runtime.pendingObjectTypeBands = ['low', 'mid', 'high']
    runtime.rangeAwaitingBand = null
    runtime.rangeAwaitingAlg = alg
    resetGainEqRangesToFallback()
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
    if (runtime.rangeSyncedAlg !== alg) {
      requestGainEqRanges(alg, note)
    }
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
