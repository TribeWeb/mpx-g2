import type { FrontPanelButtonName, MpxG2PanelState } from '#shared/types/midi'
import { createDemoPanelState } from '#shared/constants/program-pedal-demo'
import { getPanelButtonSysExValue } from '#shared/midi/panel-buttons'
import { createEmptyPanelState } from '#shared/midi/sysex'

const EFFECT_TOGGLE_BUTTONS = new Set<FrontPanelButtonName>([
  'gain', 'fx1', 'fx2', 'chorus', 'delay', 'reverb', 'eq', 'insert', 'bypass'
])
const SIM_DISPLAY_TOP = 'MPX-G2 READY   '
const SIM_DISPLAY_BOTTOM = 'SIM MODE        '

export class MidiSimulator {
  state: MpxG2PanelState = createEmptyPanelState()
  encoderValue = 120

  constructor() {
    this.reset()
  }

  reset() {
    const demo = createDemoPanelState()
    this.state = {
      ...demo,
      display: {
        characters: [
          ...SIM_DISPLAY_TOP,
          ...SIM_DISPLAY_BOTTOM
        ],
        flashing: Array.from({ length: 32 }, () => false)
      },
      leds: {
        ...demo.leds,
        segments: [1, 2, 0] as [number, number, number]
      },
      lastUpdated: Date.now()
    }
    this.encoderValue = 120
  }

  getDisplayCharacters(): string[] {
    return [...this.state.display.characters]
  }

  getLedState() {
    return structuredClone(this.state.leds)
  }

  getPanelState(): MpxG2PanelState {
    return structuredClone({
      ...this.state,
      connected: true,
      lastUpdated: Date.now()
    })
  }

  /**
   * Simulates G2 panel-button handling. LEDs follow press (not optimistic toggle)
   * so the simulator path matches hardware: UI updates via led_dump replies.
   */
  handlePanel(action: 'press' | 'release', button: FrontPanelButtonName) {
    if (action === 'press') {
      const code = getPanelButtonSysExValue(button, 'press')
      if (code != null && !EFFECT_TOGGLE_BUTTONS.has(button)) {
        this.state.leds.buttons[button] = true
      }
      this.setDisplayLine(1, `${button.toUpperCase()} PRESSED`.padEnd(16).slice(0, 16))
    } else {
      if (EFFECT_TOGGLE_BUTTONS.has(button)) {
        this.state.leds.buttons[button] = !this.state.leds.buttons[button]
      }
      this.setDisplayLine(1, SIM_DISPLAY_BOTTOM)
    }
    this.state.lastUpdated = Date.now()
  }

  handleEncoder(delta: number) {
    this.encoderValue = Math.max(0, Math.min(999, this.encoderValue + delta))
    const digits = String(this.encoderValue).padStart(3, '0')
    this.state.leds.segments = [
      Number(digits[0]),
      Number(digits[1]),
      Number(digits[2])
    ] as [number, number, number]
    this.setDisplayLine(1, `ENCODER: ${this.encoderValue}`.padEnd(16).slice(0, 16))
    this.state.lastUpdated = Date.now()
  }

  handleGainKnob(band: 'low' | 'mid' | 'high', value: number) {
    if (band === 'low') {
      this.state.knobs.gainLow = value
    } else if (band === 'mid') {
      this.state.knobs.gainMid = value
    } else {
      this.state.knobs.gainHigh = value
    }
    // LCD updates via display_dump from the bridge — not synthesized here.
    this.state.lastUpdated = Date.now()
  }

  handleChorusParam(param: string, value: number) {
    this.state.knobs.chorusValues = {
      ...this.state.knobs.chorusValues,
      [param]: value
    }
    if (param === 'mix') {
      this.state.knobs.chorusMix = value
    } else if (param === 'level') {
      this.state.knobs.chorusLevel = value
    }
    this.state.lastUpdated = Date.now()
  }

  private setDisplayLine(lineIndex: 0 | 1, text: string) {
    const start = lineIndex * 16
    for (let i = 0; i < 16; i++) {
      this.state.display.characters[start + i] = text[i] ?? ' '
    }
  }
}
