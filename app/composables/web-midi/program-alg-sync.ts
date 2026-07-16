import type { EffectBlockId } from '#shared/types/effect-blocks'
import { EFFECT_BLOCKS_PEDAL_ORDER } from '#shared/constants/effect-blocks'
import { buildEffectAlgRequest } from '#shared/midi/requests'
import type { WebMidiRuntime } from './runtime'

const RESYNC_MS = 450
const REQUEST_STAGGER_MS = 45

export type ProgramAlgSyncDeps = {
  runtime: WebMidiRuntime
  status: { value: string }
  getSysexOptions: () => { deviceId: number, productId: number }
  sendSysEx: (data: Uint8Array, note?: string) => boolean
}

export function createProgramAlgSync(deps: ProgramAlgSyncDeps) {
  const { runtime, status, getSysexOptions, sendSysEx } = deps

  function requestAll(note = 'program alg sync') {
    const opts = getSysexOptions()
    EFFECT_BLOCKS_PEDAL_ORDER.forEach((block, index) => {
      window.setTimeout(() => {
        if (status.value !== 'connected') {
          return
        }
        sendSysEx(
          buildEffectAlgRequest(block.id, opts.deviceId, opts.productId),
          `${block.displayName} alg request (${note})`
        )
      }, index * REQUEST_STAGGER_MS)
    })
  }

  function scheduleResync(note: string) {
    if (runtime.programAlgResyncTimer) {
      clearTimeout(runtime.programAlgResyncTimer)
    }
    runtime.programAlgResyncTimer = setTimeout(() => {
      runtime.programAlgResyncTimer = null
      if (status.value !== 'connected') {
        return
      }
      console.info(`[mpx-g2] Program alg resync (${note})`)
      requestAll(note)
    }, RESYNC_MS)
  }

  function clearTimer() {
    if (runtime.programAlgResyncTimer) {
      clearTimeout(runtime.programAlgResyncTimer)
      runtime.programAlgResyncTimer = null
    }
  }

  return {
    requestAll,
    scheduleResync,
    clearTimer
  }
}

export type ProgramAlgSync = ReturnType<typeof createProgramAlgSync>

/** Blocks included in the staggered alg discovery sweep. */
export const PROGRAM_ALG_BLOCKS = EFFECT_BLOCKS_PEDAL_ORDER.map(block => block.id) satisfies EffectBlockId[]
