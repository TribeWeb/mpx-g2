import type { ObjectDescription } from '#shared/midi/object-description'
import type { GainEqBand } from '#shared/types/midi'

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

export type GainSyncState = {
  alg: number
  resyncTimer: ReturnType<typeof setTimeout> | null
  algSyncId: number
  algRespondedId: number
  resolve: ParamResolveState
}

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
  gainSync: GainSyncState
  autoReconnectStarted: boolean
  midiClockCount: number
  midiClockActiveUntil: number
  tempoLedLit: boolean
  tempoLedOffTimer: ReturnType<typeof setTimeout> | null
}

function createParamResolveState(): ParamResolveState {
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

function createGainSyncState(): GainSyncState {
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
    gainSync: createGainSyncState(),
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
    runtime.gainSync ??= createGainSyncState()
    runtime.gainSync.resolve ??= createParamResolveState()
  }
  return g.__mpxG2WebMidi
}

export const MODULE_HANDLER_EPOCH = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function resetGainSyncState(runtime: WebMidiRuntime) {
  const gs = runtime.gainSync
  if (gs.resyncTimer) {
    clearTimeout(gs.resyncTimer)
  }
  if (gs.resolve.timer) {
    clearTimeout(gs.resolve.timer)
  }
  runtime.gainSync = createGainSyncState()
}
