/** Lexicon manufacturer ID in SysEx messages */
export const LEXICON_MANUFACTURER_ID = 0x06

/** MPX-G2 product ID */
export const MPX_G2_PRODUCT_ID = 0x0f

/** Default device ID when not configured */
export const DEFAULT_DEVICE_ID = 0x00

/** SysEx message type identifiers (post-header) */
export const SysExMessageType = {
  SystemConfiguration: 0x00,
  Data: 0x01,
  FormattedString: 0x02,
  ObjectTypeId: 0x03,
  ObjectDescription: 0x04,
  ObjectLabel: 0x05,
  Request: 0x06,
  MidiTerminal: 0x11,
  Handshake: 0x12
} as const

export type SysExMessageTypeValue = typeof SysExMessageType[keyof typeof SysExMessageType]

/** Handshake sub-commands */
export const HandshakeCommand = {
  Nop: 0x00,
  AreYouThere: 0x01,
  ImAlive: 0x02,
  Busy: 0x03,
  Ready: 0x04,
  Error: 0x05,
  TurnOnAutoDisplay: 0x0f,
  TurnOffAutoDisplay: 0x10
} as const

export type HandshakeCommandValue = typeof HandshakeCommand[keyof typeof HandshakeCommand]

/** Front panel button identifiers (panel button SysEx values) */
export const PanelButton = {
  BypassHold: 0x20,
  BypassRelease: 0x36,
  AbToggle: 0x45,
  ToeOff: 0x46,
  ToeOn: 0x47
} as const

export type PanelButtonId = keyof typeof PanelButton

/** Named front-panel buttons for the virtual UI */
export const FrontPanelButtons = [
  'gain',
  'fx1',
  'fx2',
  'program',
  'chorus',
  'delay',
  'reverb',
  'edit',
  'eq',
  'insert',
  'bypass',
  'system',
  'tempo',
  'a',
  'softRow',
  'store',
  'midi',
  'b',
  'option'
] as const

export type FrontPanelButtonName = typeof FrontPanelButtons[number]

export interface PanelLedState {
  buttons: Record<FrontPanelButtonName, boolean>
  segments: [number, number, number]
  scanBits: number[]
}

export interface PanelDisplayState {
  /** 32 LCD characters (top-left to bottom-right) */
  characters: string[]
}

export interface MpxG2PanelState {
  leds: PanelLedState
  display: PanelDisplayState
  connected: boolean
  lastUpdated: number | null
}

export type MidiBridgeClientMessage
  = | { type: 'handshake', command: 'im_alive' }
    | { type: 'panel', action: 'press', button: FrontPanelButtonName }
    | { type: 'panel', action: 'release', button: FrontPanelButtonName }
    | { type: 'encoder', delta: number }
    | { type: 'enable_auto_display' }
    | { type: 'request_led_dump' }
    | { type: 'request_display_dump' }

export type MidiBridgeServerMessage
  = | { type: 'connected', deviceName?: string }
    | { type: 'disconnected', reason?: string }
    | { type: 'panel_state', state: MpxG2PanelState }
    | { type: 'display_dump', characters: string[] }
    | { type: 'led_dump', leds: PanelLedState }
    | { type: 'sysex', data: number[] }
    | { type: 'error', message: string }

export type MidiBridgeConnectionStatus
  = | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error'
