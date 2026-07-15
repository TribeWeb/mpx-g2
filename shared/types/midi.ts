/** Lexicon manufacturer ID in SysEx messages */
export const LEXICON_MANUFACTURER_ID = 0x06

/** Accepted MPX-G2 product IDs (0x09 appears in R1 examples, 0x0f on the unit itself). */
export const MPX_G2_PRODUCT_IDS = [0x09, 0x0f] as const

/**
 * Default outbound product ID.
 * Hardware automation from the G2 uses 0x0f; R1 docs often show 0x09.
 */
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
  TurnOnAllMidiOutput: 0x0b,
  TurnOffAllMidiOutput: 0x0c,
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
  'ab',
  'tap',
  'softRow',
  'store',
  'midi',
  'option',
  'left',
  'right'
] as const

export type FrontPanelButtonName = typeof FrontPanelButtons[number]

export interface PanelLedState {
  buttons: Record<FrontPanelButtonName, boolean>
  /** Highlight blink (Options, Soft Row, …) — app flashes locally when set. */
  flashing: Record<FrontPanelButtonName, boolean>
  /** Consecutive non-toggle samples per button (clears highlight flash). */
  flashStable: Record<FrontPanelButtonName, number>
  segments: [number, number, number]
  scanBits: number[]
}

export interface PanelDisplayState {
  /** 32 LCD characters (top-left to bottom-right) */
  characters: string[]
  /** Per-character highlight blink (active parameter on G2). */
  flashing: boolean[]
}

/** Front-panel Gain Low / Mid / High EQ knobs (automation-mirrored). */
export type GainEqBand = 'low' | 'mid' | 'high'

export interface ParamRange {
  min: number
  max: number
}

export interface PanelKnobState {
  gainLow: number
  gainMid: number
  gainHigh: number
  /** Current Gain algorithm index from last automation message (1–8). */
  gainAlg: number
  /** Wire size for Gain EQ params (audio params are 2 bytes on Lexicon gear). */
  gainValueBytes: 1 | 2
  /** Live Lo/Mid/Hi ranges from Object Description (effect-dependent). */
  gainLowRange: ParamRange
  gainMidRange: ParamRange
  gainHighRange: ParamRange
}

export interface MpxG2PanelState {
  leds: PanelLedState
  display: PanelDisplayState
  knobs: PanelKnobState
  connected: boolean
  lastUpdated: number | null
}

export type MidiBridgeClientMessage
  = | { type: 'handshake', command: 'im_alive' }
    | { type: 'panel', action: 'press', button: FrontPanelButtonName }
    | { type: 'panel', action: 'release', button: FrontPanelButtonName }
    | { type: 'encoder', delta: number }
    | { type: 'gain_knob', band: GainEqBand, value: number }
    | { type: 'enable_auto_display' }
    | { type: 'request_led_dump' }
    | { type: 'request_display_dump' }

export type MidiBridgeServerMessage
  = | { type: 'connected', deviceName?: string, deviceMode?: 'simulated' | 'hardware' }
    | { type: 'disconnected', reason?: string }
    | { type: 'panel_state', state: MpxG2PanelState }
    | { type: 'display_dump', characters: string[] }
    | { type: 'led_dump', leds: PanelLedState }
    | { type: 'sysex', data: number[] }
    | { type: 'error', message: string }

export type MidiConnectionMode = 'simulated' | 'hardware'

export interface MidiLogEntry {
  ts: number
  direction: 'tx' | 'rx'
  hex: string
  note?: string
  port?: string
}

export interface MidiRxStats {
  count: number
  lastAt: number | null
  listeningOn: string[]
}

/** Set when connected but no inbound MIDI after the RX probe window. */
export type MidiRxPathStatus = 'unknown' | 'ok' | 'no_reply'

export interface MidiPortInfo {
  id: string
  name: string
  manufacturer?: string
}

export type MidiBridgeConnectionStatus
  = | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error'
