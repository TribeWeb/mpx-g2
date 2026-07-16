import type { ObjectDescription } from '#shared/midi/object-description'

export type ResolvedParamMeta = {
  specId: string
  range: { min: number, max: number }
  valueBytes: 1 | 2
}

/** Serial Object Type ID → Object Description resolver (one param at a time). */
export type ParamResolveState = {
  revision: number
  readyRevision: number
  generation: number
  pendingIds: string[]
  resolvedIds: Set<string>
  inFlight: { specId: string, stage: 'otid' | 'description' } | null
  pendingDescFor: Map<number, string>
  timer: ReturnType<typeof setTimeout> | null
  onParamResolved: ((meta: ResolvedParamMeta) => void) | null
  onComplete: (() => void) | null
}

/** Per-block (or per-feature) algorithm + param-range sync state. */
export type EffectParamSyncState = {
  alg: number
  resyncTimer: ReturnType<typeof setTimeout> | null
  algSyncId: number
  algRespondedId: number
  resolve: ParamResolveState
}

/** @deprecated Prefer EffectParamSyncState — kept for existing Gain wiring. */
export type GainSyncState = EffectParamSyncState

export type EffectParamSyncSlot = 'gainSync' | 'chorusSync'

export type WebMidiRuntime = {
  midiAccess: MIDIAccess | null
  midiOutput: MIDIOutput | null
  connectOptions: { inputId?: string, outputId?: string } | undefined
  rxProbeTimer: ReturnType<typeof setTimeout> | null
  ledPollTimer: ReturnType<typeof setInterval> | null
  displayBlinkFollowUpTimer: ReturnType<typeof setTimeout> | null
  attachedInputs: Map<string, MIDIInput>
  sysexBuffers: Map<string, number[]>
  productId: number
  programDigits: string | null
  handlerEpoch: string | null
  objectDescriptions: Map<number, ObjectDescription>
  gainSync: EffectParamSyncState
  chorusSync: EffectParamSyncState
  programAlgResyncTimer: ReturnType<typeof setTimeout> | null
  /** When true, param sync / resync must not TX or log (harvest owns the bus). */
  harvestPaused: boolean
  autoReconnectStarted: boolean
  midiClockCount: number
  midiClockActiveUntil: number
  tempoLedLit: boolean
  tempoLedOffTimer: ReturnType<typeof setTimeout> | null
}

export function createParamResolveState(): ParamResolveState {
  return {
    revision: 0,
    readyRevision: -1,
    generation: 0,
    pendingIds: [],
    resolvedIds: new Set(),
    inFlight: null,
    pendingDescFor: new Map(),
    timer: null,
    onParamResolved: null,
    onComplete: null
  }
}

export function createEffectParamSyncState(): EffectParamSyncState {
  return {
    alg: 0,
    resyncTimer: null,
    algSyncId: 0,
    algRespondedId: 0,
    resolve: createParamResolveState()
  }
}

function createDefaultRuntime(): WebMidiRuntime {
  return {
    midiAccess: null,
    midiOutput: null,
    connectOptions: undefined,
    rxProbeTimer: null,
    ledPollTimer: null,
    displayBlinkFollowUpTimer: null,
    attachedInputs: new Map(),
    sysexBuffers: new Map(),
    productId: 0x0f,
    programDigits: null,
    handlerEpoch: null,
    objectDescriptions: new Map(),
    gainSync: createEffectParamSyncState(),
    chorusSync: createEffectParamSyncState(),
    programAlgResyncTimer: null,
    harvestPaused: false,
    autoReconnectStarted: false,
    midiClockCount: 0,
    midiClockActiveUntil: 0,
    tempoLedLit: false,
    tempoLedOffTimer: null
  }
}

/** Shared across all `useWebMidi()` callers AND Vite HMR reloads. */
export function getWebMidiRuntime(): WebMidiRuntime {
  const g = globalThis as typeof globalThis & { __mpxG2WebMidi?: WebMidiRuntime }
  if (!g.__mpxG2WebMidi) {
    g.__mpxG2WebMidi = createDefaultRuntime()
  } else {
    const runtime = g.__mpxG2WebMidi
    runtime.autoReconnectStarted ??= false
    runtime.displayBlinkFollowUpTimer ??= null
    runtime.midiClockCount ??= 0
    runtime.midiClockActiveUntil ??= 0
    runtime.tempoLedLit ??= false
    runtime.tempoLedOffTimer ??= null
    runtime.objectDescriptions ??= new Map()
    runtime.gainSync ??= createEffectParamSyncState()
    runtime.gainSync.resolve ??= createParamResolveState()
    runtime.chorusSync ??= createEffectParamSyncState()
    runtime.chorusSync.resolve ??= createParamResolveState()
    runtime.programAlgResyncTimer ??= null
    runtime.harvestPaused ??= false
  }
  return g.__mpxG2WebMidi
}

export const MODULE_HANDLER_EPOCH = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function resetEffectParamSyncState(
  runtime: WebMidiRuntime,
  key: EffectParamSyncSlot = 'gainSync'
) {
  const state = runtime[key]
  if (state.resyncTimer) {
    clearTimeout(state.resyncTimer)
  }
  if (state.resolve.timer) {
    clearTimeout(state.resolve.timer)
  }
  runtime[key] = createEffectParamSyncState()
}

/** @deprecated Prefer resetEffectParamSyncState */
export function resetGainSyncState(runtime: WebMidiRuntime) {
  resetEffectParamSyncState(runtime, 'gainSync')
}
