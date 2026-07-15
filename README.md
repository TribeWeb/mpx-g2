# MPX-G2 Controller

Browser-based MIDI controller for the [Lexicon MPX-G2](https://www.lexiconpro.com) effects processor. Built with **Nuxt 4**, **Nuxt UI**, and **TypeScript**.

## Roadmap and goals

[x] **Front panel replica** — virtual LCD, LEDs, buttons, encoder
[ ] **Chrome Web MIDI** — SysEx handshake, display/LED dumps, panel button messages (almost complete)
[ ] **Modern editor** — A modern GUI for the lexicon MPXG2. The ability to view and edit the MPXG2 settings using a drag n drop interface showing each effect as a pedal with visual routing.

## Stack

- [Nuxt 4](https://nuxt.com) — application framework
- [Nuxt UI 4](https://ui.nuxt.com) — component library
- TypeScript — shared SysEx protocol layer (`shared/midi/`)
- [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) — direct browser ↔ hardware (Chrome / Edge)
- WebSocket + in-process simulator — optional dev mode without hardware

## Project structure

```
app/
  components/       # UI components (front panel replica)
  composables/      # useMidiConnection(), useWebMidi(), useMidiBridge()
  pages/            # Routes: / and /panel
server/
  plugins/          # Nitro plugin — starts WebSocket simulator (dev)
  utils/            # MIDI bridge + simulator (simulated mode only)
shared/
  midi/             # SysEx encode/decode utilities
  types/            # Shared TypeScript types
```

## Getting started

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Google Chrome** (desktop). Use the plug icon in the header to connect to your MPX-G2 via Web MIDI — pick MIDI input/output ports and view the SysEx log.

**Simulated mode** (no hardware): switch mode to *Simulated* in the connection dialog, or set `NUXT_PUBLIC_MIDI_DEFAULT_MODE=simulated`. The dev server also starts a WebSocket simulator on `ws://localhost:3101`.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Nuxt dev server (and WebSocket simulator for simulated mode) |
| `pnpm run build` | Production build |
| `pnpm run preview` | Preview production build |
| `pnpm run typecheck` | TypeScript check |
| `pnpm run lint` | ESLint |
| `pnpm run test` | Unit tests (SysEx protocol layer) |

## Architecture

**Hardware (default)** — browser talks to the G2 directly; no server-side MIDI bridge is involved at runtime:

```
Chrome (Web MIDI API + SysEx)
  ↕ USB MIDI interface
Lexicon MPX-G2
```

**Simulated (optional)** — for UI development without cables or hardware. The client uses `useMidiBridge()` over WebSocket; the Nitro server runs an in-memory `MidiSimulator` that mirrors panel state:

```
Browser (useMidiBridge)
  ↕ WebSocket (ws://localhost:3101)
Nitro (MidiSimulator)
```

`useMidiConnection()` selects hardware or simulated transport; the panel components are transport-agnostic.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_MIDI_DEFAULT_MODE` | `hardware` | `hardware` or `simulated` |
| `NUXT_MIDI_BRIDGE_PORT` | `3101` | WebSocket port for simulated mode (server) |
| `NUXT_PUBLIC_MIDI_BRIDGE_URL` | `ws://localhost:3101` | Client WebSocket URL (simulated mode) |

Additional SysEx options (`midiDeviceId`, `midiProductId`) live in `nuxt.config.ts` → `runtimeConfig.public`.

## References

- [Hardware verification checklist](docs/HARDWARE_VERIFICATION.md) — stage 2 sign-off matrix
- [MPX-G2 MIDI SysEx documentation](https://stecrecords.com/gear/mpxg2/doc/MPXG2_MIDI_Impl.htm)
- [Web MIDI API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) — Chrome / Edge
