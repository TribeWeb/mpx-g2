import type { GainEqBand, MpxG2PanelState } from '#shared/types/midi'
import { gainEqControlPath, GAIN_EQ_DISPLAY_RANGE } from '#shared/midi/control-paths'
import { applyGainEqRange } from '#shared/midi/inbound'
import { editorObjectRange, objectDescriptionMatchesGainBand, type ObjectDescription } from '#shared/midi/object-description'
import {
  buildGainAlgRequest,
  buildGainEqRequest,
  buildObjectDescriptionRequest,
  buildObjectTypeIdRequest
} from '#shared/midi/requests'
import type { ResolvedParamMeta, WebMidiRuntime } from './runtime'

const BANDS = ['low', 'mid', 'high'] as const
const TIMEOUT_MS = 2500
const RESYNC_MS = 450

export type GainEqSyncDeps = {
  runtime: WebMidiRuntime
  panelState: { value: MpxG2PanelState }
  status: { value: string }
  getSysexOptions: () => { deviceId: number, productId: number }
  sendSysEx: (data: Uint8Array, note?: string) => boolean
}

export function createGainEqSync(deps: GainEqSyncDeps) {
  const { runtime, panelState, status, getSysexOptions, sendSysEx } = deps
  const gs = () => runtime.gainSync
  const rs = () => gs().resolve

  const isLive = (gen = rs().generation) =>
    gen > 0 && gen === rs().generation

  function clearTimer() {
    const t = rs().timer
    if (t) {
      clearTimeout(t)
      rs().timer = null
    }
  }

  function finish() {
    const r = rs()
    r.readyRevision = r.revision
    clearTimer()
    r.inFlight = null
    const done = r.onComplete
    r.onComplete = r.onParamResolved = null
    done?.()
  }

  function applyMeta(band: GainEqBand, description: ObjectDescription, gen: number) {
    if (!isLive(gen) || !objectDescriptionMatchesGainBand(band, description.name)) {
      return false
    }
    const range = editorObjectRange(description)
    if (!range) {
      return false
    }
    const valueBytes: 1 | 2 = description.byteCount === 1 ? 1 : 2
    rs().onParamResolved?.({ specId: band, range, valueBytes })
    rs().resolvedIds.add(band)
    rs().inFlight = null
    console.info(`[mpx-g2] Gain ${band} range ← "${description.name}" ${range.min} <> ${range.max} (${valueBytes} byte)`)
    return true
  }

  function pump(note: string, gen: number) {
    const r = rs()
    if (!isLive(gen) || r.inFlight) {
      return
    }
    const band = r.pendingIds[0] as GainEqBand | undefined
    if (!band) {
      if (r.resolvedIds.size >= BANDS.length) {
        finish()
      }
      return
    }
    r.inFlight = { specId: band, stage: 'otid' }
    const opts = getSysexOptions()
    const alg = gs().alg
    sendSysEx(
      buildObjectTypeIdRequest(gainEqControlPath(alg, band), opts.deviceId, opts.productId),
      `Gain ${band} Object Type ID (${note}, alg ${alg})`
    )
    clearTimer()
    r.timer = setTimeout(() => {
      r.timer = null
      if (!isLive(gen) || r.inFlight?.specId !== band) {
        return
      }
      console.warn(`[mpx-g2] Gain ${band} timed out, retrying`)
      r.inFlight = null
      if (!r.pendingIds.includes(band)) {
        r.pendingIds.unshift(band)
      }
      r.pendingDescFor.clear()
      pump('retry', gen)
    }, TIMEOUT_MS)
  }

  function onObjectTypeId(band: GainEqBand, objectTypeId: number) {
    const r = rs()
    const flight = r.inFlight
    if (!flight || !isLive() || flight.specId !== band || flight.stage !== 'otid' || r.resolvedIds.has(band)) {
      return
    }
    r.pendingIds = r.pendingIds.filter(id => id !== band)
    flight.stage = 'description'

    const cached = runtime.objectDescriptions.get(objectTypeId)
    if (cached && applyMeta(band, cached, r.generation)) {
      if (r.resolvedIds.size >= BANDS.length) {
        finish()
      } else {
        pump('gain ranges', r.generation)
      }
      return
    }

    if (!r.pendingDescFor.has(objectTypeId)) {
      const opts = getSysexOptions()
      sendSysEx(
        buildObjectDescriptionRequest(objectTypeId, opts.deviceId, opts.productId),
        `Object Description request type=${objectTypeId} (${band})`
      )
    }
    r.pendingDescFor.set(objectTypeId, band)
  }

  function startRanges(alg: number, note: string, onComplete: () => void) {
    const r = rs()
    if (r.readyRevision === r.revision) {
      onComplete()
      return
    }
    gs().alg = alg
    r.generation++
    clearTimer()
    r.pendingDescFor.clear()
    r.pendingIds = [...BANDS]
    r.resolvedIds = new Set()
    r.inFlight = null
    r.onComplete = onComplete
    r.onParamResolved = (meta: ResolvedParamMeta) => {
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
    }
    panelState.value.knobs = {
      ...panelState.value.knobs,
      gainLowRange: { ...GAIN_EQ_DISPLAY_RANGE.low },
      gainMidRange: { ...GAIN_EQ_DISPLAY_RANGE.mid },
      gainHighRange: { ...GAIN_EQ_DISPLAY_RANGE.high }
    }
    pump(note, r.generation)
  }

  function requestValues(alg: number, note: string) {
    const opts = getSysexOptions()
    BANDS.forEach((band, i) => {
      window.setTimeout(() => {
        sendSysEx(
          buildGainEqRequest(alg, band, opts.deviceId, opts.productId),
          `Gain ${band} value request (${note}, alg ${alg})`
        )
      }, i * 60)
    })
  }

  function invalidate() {
    const r = rs()
    r.revision++
    r.readyRevision = -1
    r.generation++
    clearTimer()
    r.pendingIds = []
    r.resolvedIds = new Set()
    r.inFlight = null
    r.pendingDescFor.clear()
    r.onComplete = r.onParamResolved = null
  }

  function requestGainEqState(note = 'gain sync') {
    const g = gs()
    const requestId = ++g.algSyncId
    const opts = getSysexOptions()
    sendSysEx(buildGainAlgRequest(opts.deviceId, opts.productId), `Gain alg request (${note})`)
    window.setTimeout(() => {
      if (g.algRespondedId >= requestId) {
        return
      }
      const alg = panelState.value.knobs.gainAlg
      if (alg >= 1) {
        startRanges(alg, `${note} fallback`, () => requestValues(alg, `${note} fallback`))
      }
    }, 400)
  }

  function scheduleGainEqResync(note: string) {
    invalidate()
    if (gs().resyncTimer) {
      clearTimeout(gs().resyncTimer!)
    }
    gs().resyncTimer = setTimeout(() => {
      gs().resyncTimer = null
      if (status.value !== 'connected') {
        return
      }
      console.info(`[mpx-g2] Gain EQ resync (${note})`)
      requestGainEqState(note)
    }, RESYNC_MS)
  }

  return {
    applyObjectDescription(description: ObjectDescription) {
      runtime.objectDescriptions.set(description.objectTypeId, description)
      const r = rs()
      if (!isLive()) {
        return
      }
      const band = r.pendingDescFor.get(description.objectTypeId) as GainEqBand | undefined
      if (!band || (r.inFlight && r.inFlight.specId !== band)) {
        return
      }
      r.pendingDescFor.delete(description.objectTypeId)
      if (applyMeta(band, description, r.generation)) {
        if (r.resolvedIds.size >= BANDS.length) {
          finish()
        } else {
          pump('gain ranges', r.generation)
        }
      }
    },

    acceptObjectTypeId(band: GainEqBand, objectTypeId: number) {
      onObjectTypeId(band, objectTypeId)
    },

    acceptOrphanObjectTypeId(objectTypeId: number) {
      const band = rs().inFlight?.specId as GainEqBand | undefined
      if (band) {
        onObjectTypeId(band, objectTypeId)
      }
    },

    requestGainEqParams(alg: number, note = 'gain eq sync') {
      if (alg < 1) {
        return
      }
      startRanges(alg, note, () => requestValues(alg, note))
    },

    requestGainEqState,
    scheduleGainEqResync,

    noteGainAlgResponse() {
      gs().algRespondedId = gs().algSyncId
    }
  }
}
