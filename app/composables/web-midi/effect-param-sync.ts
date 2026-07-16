import { editorObjectRange, type ObjectDescription } from '#shared/midi/object-description'
import {
  buildDataRequest,
  buildObjectDescriptionRequest,
  buildObjectTypeIdRequest
} from '#shared/midi/requests'
import type { EffectParamSyncState, ResolvedParamMeta, WebMidiRuntime } from './runtime'

const TIMEOUT_MS = 2500
const RESYNC_MS = 450
const VALUE_STAGGER_MS = 60

export type EffectParamSpec = {
  id: string
  /** Short label for log notes (e.g. "low", "mix"). */
  label: string
  /** Control-tree path for this param given the active algorithm index. */
  controlPath: (alg: number) => number[]
  /** Optional Object Description name check; omit to accept any description. */
  matchesDescription?: (name: string) => boolean
  /** Range applied before Object Description replies arrive. */
  fallbackRange?: { min: number, max: number }
}

export type EffectParamSyncDeps = {
  runtime: WebMidiRuntime
  status: { value: string }
  getSysexOptions: () => { deviceId: number, productId: number }
  sendSysEx: (data: Uint8Array, note?: string) => boolean
}

export type EffectParamSyncOptions = {
  /** Log / request note prefix (e.g. "Gain", "Chorus"). */
  blockLabel: string
  /** Mutable sync state stored on the Web MIDI runtime. */
  getState: () => EffectParamSyncState
  /** Static param list (Gain). Prefer getParamSpecs when params vary by algorithm. */
  paramSpecs?: EffectParamSpec[]
  /** Dynamic param list for the active algorithm (Chorus Stereo vs basic). */
  getParamSpecs?: (alg: number) => EffectParamSpec[]
  /**
   * Called when a param's min/max (and byte width) are resolved from Object Description.
   * Used by block adapters to write into panel state.
   */
  onParamResolved: (meta: ResolvedParamMeta) => void
  /** Reset fallback ranges on panel state when a range resolve starts. */
  onRangesStart?: (alg: number, specs: EffectParamSpec[]) => void
  /** Optional: request algorithm index (used by requestState / scheduleResync). */
  requestAlg?: (note: string) => void
  /** Optional: current alg from panel state for fallback when alg reply is late. */
  getCurrentAlg?: () => number
}

export function createEffectParamSync(deps: EffectParamSyncDeps, options: EffectParamSyncOptions) {
  const { runtime, status, getSysexOptions, sendSysEx } = deps
  const {
    blockLabel,
    getState,
    paramSpecs: staticSpecs,
    getParamSpecs,
    onParamResolved,
    onRangesStart,
    requestAlg,
    getCurrentAlg
  } = options

  let activeSpecs: EffectParamSpec[] = staticSpecs ?? []
  let specById = new Map(activeSpecs.map(spec => [spec.id, spec]))

  function loadSpecs(alg: number) {
    activeSpecs = getParamSpecs?.(alg) ?? staticSpecs ?? []
    specById = new Map(activeSpecs.map(spec => [spec.id, spec]))
    return activeSpecs
  }

  const rs = () => getState().resolve

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

  function applyMeta(specId: string, description: ObjectDescription, gen: number) {
    if (!isLive(gen)) {
      return false
    }
    const spec = specById.get(specId)
    if (!spec) {
      return false
    }
    if (spec.matchesDescription && !spec.matchesDescription(description.name)) {
      return false
    }
    const range = editorObjectRange(description)
    if (!range) {
      return false
    }
    const valueBytes: 1 | 2 = description.byteCount === 1 ? 1 : 2
    const meta: ResolvedParamMeta = { specId, range, valueBytes }
    onParamResolved(meta)
    rs().resolvedIds.add(specId)
    rs().inFlight = null
    console.info(
      `[mpx-g2] ${blockLabel} ${spec.label} range ← "${description.name}" ${range.min} <> ${range.max} (${valueBytes} byte)`
    )
    return true
  }

  function pump(note: string, gen: number) {
    const r = rs()
    if (runtime.harvestPaused || !isLive(gen) || r.inFlight) {
      return
    }
    const specId = r.pendingIds[0]
    if (!specId) {
      if (r.resolvedIds.size >= activeSpecs.length) {
        finish()
      }
      return
    }
    const spec = specById.get(specId)
    if (!spec) {
      r.pendingIds = r.pendingIds.filter(id => id !== specId)
      pump(note, gen)
      return
    }

    r.inFlight = { specId, stage: 'otid' }
    const opts = getSysexOptions()
    const alg = getState().alg
    sendSysEx(
      buildObjectTypeIdRequest(spec.controlPath(alg), opts.deviceId, opts.productId),
      `${blockLabel} ${spec.label} Object Type ID (${note}, alg ${alg})`
    )
    clearTimer()
    r.timer = setTimeout(() => {
      r.timer = null
      if (runtime.harvestPaused || !isLive(gen) || r.inFlight?.specId !== specId) {
        return
      }
      console.warn(`[mpx-g2] ${blockLabel} ${spec.label} timed out, retrying`)
      r.inFlight = null
      if (!r.pendingIds.includes(specId)) {
        r.pendingIds.unshift(specId)
      }
      r.pendingDescFor.clear()
      pump('retry', gen)
    }, TIMEOUT_MS)
  }

  function onObjectTypeId(specId: string, objectTypeId: number) {
    const r = rs()
    const flight = r.inFlight
    if (!flight || !isLive() || flight.specId !== specId || flight.stage !== 'otid' || r.resolvedIds.has(specId)) {
      return
    }
    r.pendingIds = r.pendingIds.filter(id => id !== specId)
    flight.stage = 'description'

    const cached = runtime.objectDescriptions.get(objectTypeId)
    if (cached && applyMeta(specId, cached, r.generation)) {
      if (r.resolvedIds.size >= activeSpecs.length) {
        finish()
      } else {
        pump(`${blockLabel.toLowerCase()} ranges`, r.generation)
      }
      return
    }

    if (!r.pendingDescFor.has(objectTypeId)) {
      const opts = getSysexOptions()
      sendSysEx(
        buildObjectDescriptionRequest(objectTypeId, opts.deviceId, opts.productId),
        `Object Description request type=${objectTypeId} (${specId})`
      )
    }
    r.pendingDescFor.set(objectTypeId, specId)
  }

  function requestValues(alg: number, note: string) {
    const opts = getSysexOptions()
    const specs = loadSpecs(alg)
    specs.forEach((spec, i) => {
      window.setTimeout(() => {
        if (runtime.harvestPaused || status.value !== 'connected') {
          return
        }
        sendSysEx(
          buildDataRequest(spec.controlPath(alg), opts.deviceId, opts.productId),
          `${blockLabel} ${spec.label} value request (${note}, alg ${alg})`
        )
      }, i * VALUE_STAGGER_MS)
    })
  }

  function startRanges(alg: number, note: string, onComplete: () => void) {
    const r = rs()
    if (r.readyRevision === r.revision) {
      onComplete()
      return
    }
    const specs = loadSpecs(alg)
    if (specs.length === 0) {
      onComplete()
      return
    }
    getState().alg = alg
    r.generation++
    clearTimer()
    r.pendingDescFor.clear()
    r.pendingIds = specs.map(spec => spec.id)
    r.resolvedIds = new Set()
    r.inFlight = null
    r.onComplete = onComplete
    r.onParamResolved = null
    onRangesStart?.(alg, specs)
    pump(note, r.generation)
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

  function requestParams(alg: number, note = `${blockLabel.toLowerCase()} param sync`) {
    if (alg < 1) {
      return
    }
    startRanges(alg, note, () => requestValues(alg, note))
  }

  function requestState(note = `${blockLabel.toLowerCase()} sync`) {
    if (runtime.harvestPaused) {
      return
    }
    const state = getState()
    const requestId = ++state.algSyncId
    if (requestAlg) {
      requestAlg(note)
    }
    window.setTimeout(() => {
      if (runtime.harvestPaused || state.algRespondedId >= requestId) {
        return
      }
      const alg = getCurrentAlg?.() ?? state.alg
      if (alg >= 1) {
        startRanges(alg, `${note} fallback`, () => requestValues(alg, `${note} fallback`))
      }
    }, 400)
  }

  function scheduleResync(note: string) {
    if (runtime.harvestPaused) {
      return
    }
    invalidate()
    const state = getState()
    if (state.resyncTimer) {
      clearTimeout(state.resyncTimer)
    }
    state.resyncTimer = setTimeout(() => {
      state.resyncTimer = null
      if (runtime.harvestPaused || status.value !== 'connected') {
        return
      }
      console.info(`[mpx-g2] ${blockLabel} param resync (${note})`)
      requestState(note)
    }, RESYNC_MS)
  }

  return {
    applyObjectDescription(description: ObjectDescription) {
      runtime.objectDescriptions.set(description.objectTypeId, description)
      const r = rs()
      if (!isLive()) {
        return
      }
      const specId = r.pendingDescFor.get(description.objectTypeId)
      if (!specId || (r.inFlight && r.inFlight.specId !== specId)) {
        return
      }
      r.pendingDescFor.delete(description.objectTypeId)
      if (applyMeta(specId, description, r.generation)) {
        if (r.resolvedIds.size >= activeSpecs.length) {
          finish()
        } else {
          pump(`${blockLabel.toLowerCase()} ranges`, r.generation)
        }
      }
    },

    acceptObjectTypeId(specId: string, objectTypeId: number) {
      onObjectTypeId(specId, objectTypeId)
    },

    acceptOrphanObjectTypeId(objectTypeId: number) {
      const specId = rs().inFlight?.specId
      if (specId) {
        onObjectTypeId(specId, objectTypeId)
      }
    },

    requestParams,
    requestState,
    scheduleResync,

    noteAlgResponse() {
      getState().algRespondedId = getState().algSyncId
    },

    clearTimers() {
      const state = getState()
      if (state.resyncTimer) {
        clearTimeout(state.resyncTimer)
        state.resyncTimer = null
      }
      clearTimer()
      // Invalidate in-flight resolve so a late timeout cannot retry.
      state.resolve.generation++
      state.resolve.inFlight = null
      state.resolve.pendingIds = []
      state.resolve.pendingDescFor.clear()
    }
  }
}

export type EffectParamSync = ReturnType<typeof createEffectParamSync>
