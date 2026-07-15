import type { DeepReadonly, Ref } from 'vue'
import type {
  FrontPanelButtonName,
  GainEqBand,
  MidiBridgeConnectionStatus,
  MpxG2PanelState
} from './midi'

/** Shared panel-control surface for hardware and simulated transports. */
export interface MidiTransport {
  status: Readonly<Ref<MidiBridgeConnectionStatus>>
  error: Readonly<Ref<string | null>>
  deviceMode: Readonly<Ref<'simulated' | 'hardware' | null>>
  deviceName: Readonly<Ref<string | null>>
  panelState: Readonly<Ref<DeepReadonly<MpxG2PanelState>>>
  connect(options?: { inputId?: string, outputId?: string }): void | Promise<void>
  disconnect(): void
  pressButton(button: FrontPanelButtonName): boolean
  releaseButton(button: FrontPanelButtonName): boolean
  rotateEncoder(delta: number): boolean
  setGainKnob(band: GainEqBand, value: number): boolean
  resetPanelState(): void
}

export interface HardwareMidiDebug {
  isWebMidiSupported(): boolean
  refreshPorts(): Promise<void>
  pingDevice(note?: string, productId?: number): boolean
  requestPanelDumps(note?: string): void
  requestGainEqState(note?: string): void
  clearLog(): void
}
