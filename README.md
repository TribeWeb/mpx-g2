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
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000). The MIDI bridge starts automatically on `ws://localhost:3101`.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Nuxt dev server + MIDI bridge |
| `pnpm run build` | Production build |
| `pnpm run preview` | Preview production build |
| `pnpm run typecheck` | TypeScript check |
| `pnpm run lint` | ESLint |

## Architecture

```
Chrome (Web MIDI API + SysEx)
  ↕ USB MIDI
Lexicon MPX-G2
```

**Simulated mode** (optional): WebSocket bridge on `ws://localhost:3101` for UI development without hardware.

The default connection mode is **hardware** via Chrome Web MIDI. Open the plug icon in the header to connect, pick MIDI ports, and view the SysEx log.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MPX_G2_MIDI_BRIDGE_PORT` | `3101` | WebSocket bridge port (simulated mode only) |
| `NUXT_PUBLIC_MIDI_DEFAULT_MODE` | `hardware` | `hardware` or `simulated` |

Public runtime config (`nuxt.config.ts` → `runtimeConfig.public`) controls the client WebSocket URL and default MIDI mode.

## Roadmap

1. **Front panel replica** — virtual LCD, LEDs, buttons, encoder
2. **Chrome Web MIDI** — SysEx handshake, display/LED dumps, panel button messages (in progress)
3. **Modern editor** — parameter tree, program management, routing UI

## References

- [MPX-G2 MIDI SysEx documentation](https://stecrecords.com/gear/mpxg2/doc/MPXG2_MIDI_Impl.htm)
- [Web MIDI API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) — Chrome / Edge
