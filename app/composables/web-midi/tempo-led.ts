import {
  MIDI_CLOCK,
  MIDI_CLOCK_ACTIVE_MS,
  MIDI_CLOCKS_PER_QUARTER,
  MIDI_CONTINUE,
  MIDI_START,
  MIDI_STOP,
  TEMPO_LED_FLASH_MS
} from '#shared/midi/midi-clock'
import type { MpxG2PanelState } from '#shared/types/midi'
import type { WebMidiRuntime } from './runtime'

export type TempoLedDeps = {
  runtime: WebMidiRuntime
  panelState: { value: MpxG2PanelState }
}

export function createTempoLedController(deps: TempoLedDeps) {
  const { runtime, panelState } = deps

  function isMidiClockDrivingTempo(): boolean {
    return Date.now() < runtime.midiClockActiveUntil
  }

  function setTempoLed(on: boolean, options?: { fromDump?: boolean }) {
    runtime.tempoLedLit = on
    const leds = panelState.value.leds
    if (leds.buttons.tempo === on) {
      return
    }
    panelState.value.leds = {
      ...leds,
      buttons: { ...leds.buttons, tempo: on }
    }
    if (!options?.fromDump) {
      panelState.value.lastUpdated = Date.now()
    }
  }

  function flashTempoLed() {
    if (runtime.tempoLedOffTimer) {
      clearTimeout(runtime.tempoLedOffTimer)
      runtime.tempoLedOffTimer = null
    }
    setTempoLed(true)
    runtime.tempoLedOffTimer = setTimeout(() => {
      runtime.tempoLedOffTimer = null
      setTempoLed(false)
    }, TEMPO_LED_FLASH_MS)
  }

  function handleMidiRealtime(byte: number) {
    if (byte === MIDI_CLOCK) {
      runtime.midiClockActiveUntil = Date.now() + MIDI_CLOCK_ACTIVE_MS
      runtime.midiClockCount = (runtime.midiClockCount + 1) % MIDI_CLOCKS_PER_QUARTER
      if (runtime.midiClockCount === 0) {
        flashTempoLed()
      }
      return
    }
    if (byte === MIDI_START || byte === MIDI_CONTINUE) {
      runtime.midiClockActiveUntil = Date.now() + MIDI_CLOCK_ACTIVE_MS
      runtime.midiClockCount = 0
      flashTempoLed()
      return
    }
    if (byte === MIDI_STOP) {
      runtime.midiClockCount = 0
      runtime.midiClockActiveUntil = 0
      if (runtime.tempoLedOffTimer) {
        clearTimeout(runtime.tempoLedOffTimer)
        runtime.tempoLedOffTimer = null
      }
      setTempoLed(false)
    }
  }

  function clearTempoLedTimers() {
    if (runtime.tempoLedOffTimer) {
      clearTimeout(runtime.tempoLedOffTimer)
      runtime.tempoLedOffTimer = null
    }
    runtime.midiClockCount = 0
    runtime.midiClockActiveUntil = 0
    runtime.tempoLedLit = false
  }

  return {
    isMidiClockDrivingTempo,
    setTempoLed,
    handleMidiRealtime,
    clearTempoLedTimers
  }
}
