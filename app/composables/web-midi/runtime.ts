import type { ObjectDescription } from '#shared/midi/object-description'
import type { GainEqBand } from '#shared/types/midi'

export type WebMidiRuntime = {
  midiAccess: MIDIAccess | null
  midiOutput: MIDIOutput | null
  connectOptions: { inputId?: string, outputId?: string } | undefined
  rxProbeTimer: ReturnType<typeof setTimeout> | null
  gainResyncTimer: ReturnType<typeof setTimeout> | null
  ledPollTimer: ReturnType<typeof setInterval> | null
  displayBlinkFollowUpTimer: ReturnType<typeof setTimeout> | null
  attachedInputs: Map<string, MIDIInput>
  sysexBuffers: Map<string, number[]>
  productId: number
  programDigits: string | null
  handlerEpoch: string | null
  objectDescriptions: Map<number, ObjectDescription>
  pendingDescriptionBands: Map<number, Set<GainEqBand>>
  pendingObjectTypeBands: GainEqBand[]
  rangeAwaitingBand: GainEqBand | null
  rangeAwaitingAlg: number
  rangeRequestGen: number
  autoReconnectStarted: boolean
  midiClockCount: number
  midiClockActiveUntil: number
  tempoLedLit: boolean
  tempoLedOffTimer: ReturnType<typeof setTimeout> | null
}

function createDefaultRuntime(): WebMidiRuntime {
  return {
    midiAccess: null,
    midiOutput: null,
    connectOptions: undefined,
    rxProbeTimer: null,
    gainResyncTimer: null,
    ledPollTimer: null,
    displayBlinkFollowUpTimer: null,
    attachedInputs: new Map(),
    sysexBuffers: new Map(),
    productId: 0x0f,
    programDigits: null,
    handlerEpoch: null,
    objectDescriptions: new Map(),
    pendingDescriptionBands: new Map(),
    pendingObjectTypeBands: [],
    rangeAwaitingBand: null,
    rangeAwaitingAlg: 0,
    rangeRequestGen: 0,
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
    runtime.pendingDescriptionBands ??= new Map()
    runtime.pendingObjectTypeBands ??= []
    runtime.rangeAwaitingBand ??= null
    runtime.rangeAwaitingAlg ??= 0
  }
  return g.__mpxG2WebMidi
}

/** Unique per module evaluation; used to rebind port handlers after HMR. */
export const MODULE_HANDLER_EPOCH = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function resetGainEqSyncState(runtime: WebMidiRuntime) {
  runtime.pendingObjectTypeBands = []
  runtime.rangeAwaitingBand = null
  runtime.rangeAwaitingAlg = 0
  runtime.pendingDescriptionBands.clear()
}
