import { buildDisplayDumpRequest, buildLedDumpRequest } from '#shared/midi/requests'
import type { WebMidiRuntime } from './runtime'

export type PanelMirrorDeps = {
  runtime: WebMidiRuntime
  status: { value: string }
  getSysexOptions: () => { deviceId: number, productId: number }
  sendSysEx: (data: Uint8Array, note?: string, options?: { silent?: boolean }) => boolean
}

export function startPanelMirrorPoll(deps: PanelMirrorDeps) {
  stopPanelMirrorPoll(deps)
  const { runtime, status, getSysexOptions, sendSysEx } = deps

  // Hardware sync strategy: 1 Hz LED + display poll (silent TX), plus a 280 ms
  // follow-up display sample to catch active-parameter blink toggles. Auto Display
  // is enabled but unreliable on some units — inbound dumps are the LCD source of truth.
  runtime.ledPollTimer = setInterval(() => {
    if (status.value !== 'connected' || !runtime.midiOutput) {
      return
    }
    const opts = getSysexOptions()
    sendSysEx(
      buildLedDumpRequest(opts.deviceId, opts.productId),
      'LED dump poll',
      { silent: true }
    )
    sendSysEx(
      buildDisplayDumpRequest(opts.deviceId, opts.productId),
      'Display dump poll',
      { silent: true }
    )
    if (runtime.displayBlinkFollowUpTimer) {
      clearTimeout(runtime.displayBlinkFollowUpTimer)
    }
    runtime.displayBlinkFollowUpTimer = setTimeout(() => {
      runtime.displayBlinkFollowUpTimer = null
      if (status.value !== 'connected' || !runtime.midiOutput) {
        return
      }
      const followOpts = getSysexOptions()
      sendSysEx(
        buildDisplayDumpRequest(followOpts.deviceId, followOpts.productId),
        'Display dump poll (blink phase)',
        { silent: true }
      )
    }, 280)
  }, 1000)
}

export function stopPanelMirrorPoll(deps: Pick<PanelMirrorDeps, 'runtime'>) {
  const { runtime } = deps
  if (runtime.ledPollTimer) {
    clearInterval(runtime.ledPollTimer)
    runtime.ledPollTimer = null
  }
  if (runtime.displayBlinkFollowUpTimer) {
    clearTimeout(runtime.displayBlinkFollowUpTimer)
    runtime.displayBlinkFollowUpTimer = null
  }
}

export function clearRxProbeTimer(runtime: WebMidiRuntime) {
  if (runtime.rxProbeTimer) {
    clearTimeout(runtime.rxProbeTimer)
    runtime.rxProbeTimer = null
  }
}
