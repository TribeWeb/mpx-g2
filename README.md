# MPX-G2 Controller

Browser-based MIDI controller for the [Lexicon MPX-G2](https://www.lexiconpro.com) effects processor. Built with **Nuxt 4**, **Nuxt UI**, and **TypeScript**.

## Stack

- [Nuxt 4](https://nuxt.com) — application framework
- [Nuxt UI 4](https://ui.nuxt.com) — component library
- TypeScript — MIDI protocol layer and bridge (no Python)
- WebSocket — browser ↔ hardware bridge

## Project structure

```
app/
  components/       # UI components (front panel replica)
  composables/      # useMidiBridge() client composable
  pages/            # Routes: / and /panel
server/
  plugins/          # Nitro plugin — starts WebSocket MIDI bridge
  utils/            # Bridge + SysEx helpers (server-side)
shared/
  midi/             # SysEx encode/decode utilities
  types/            # Shared TypeScript types
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The MIDI bridge starts automatically on `ws://localhost:3101`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Nuxt dev server + MIDI bridge |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Architecture

```
Browser (Nuxt UI)
  ↕ WebSocket (JSON messages)
Nitro MIDI bridge (TypeScript)
  ↕ USB MIDI / SysEx
Lexicon MPX-G2
```

The bridge currently runs in **simulation mode** — it accepts connections and returns stub panel state. Hardware MIDI forwarding (via a library such as `easymidi` or `node-midi`) is the next integration step.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MPX_G2_MIDI_BRIDGE_PORT` | `3101` | WebSocket bridge port |

Public runtime config (`nuxt.config.ts` → `runtimeConfig.public.midiBridgeUrl`) controls the client WebSocket URL.

## Roadmap

1. **Front panel replica** — virtual LCD, LEDs, buttons, encoder (in progress)
2. **Hardware MIDI** — SysEx handshake, display/LED dumps, panel button messages
3. **Modern editor** — parameter tree, program management, routing UI

## References

- [MPX-G2 MIDI SysEx documentation](https://stecrecords.com/gear/mpxg2/doc/MPXG2_MIDI_Impl.htm)
- [Web MIDI API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) — optional direct browser MIDI on Chrome/Edge
