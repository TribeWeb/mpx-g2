import type { FrontPanelButtonName, MpxG2PanelState } from '#shared/types/midi'
import { createEmptyPanelState } from '#shared/midi/sysex'

const SIM_DISPLAY_TOP = 'MPX-G2 READY   '
const SIM_DISPLAY_BOTTOM = 'SIM MODE        '

export class MidiSimulator {
  state: MpxG2PanelState = createEmptyPanelState()
  encoderValue = 120

  constructor() {
    this.reset()
  }

  reset() {
    this.state = {
      ...createEmptyPanelState(),
      connected: true,
      display: {
        characters: [
          ...SIM_DISPLAY_TOP,
          ...SIM_DISPLAY_BOTTOM
        ]
      },
      leds: {
        ...createEmptyPanelState().leds,
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

  handlePanel(action: 'press' | 'release', button: FrontPanelButtonName) {
    if (action === 'press') {
      this.state.leds.buttons[button] = !this.state.leds.buttons[button]
      this.setDisplayLine(1, `${button.toUpperCase()} PRESSED`.padEnd(16).slice(0, 16))
    } else {
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

  private setDisplayLine(lineIndex: 0 | 1, text: string) {
    const start = lineIndex * 16
    for (let i = 0; i < 16; i++) {
      this.state.display.characters[start + i] = text[i] ?? ' '
    }
  }
}
