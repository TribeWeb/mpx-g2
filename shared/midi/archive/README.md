# Archived MIDI helpers

## Soft-UI panel-button probe

Removed from the live app after Soft-page discovery did not yield a Gain-knob UI path.

**What it did**

- Sent System → Panel → Pnl Button codes (priority list, then optional 0–127 sweep)
- Reset to Program mode (`0x03` / `0x2f`) before each code
- Pulled a display dump after each attempt; paused on LCD changes
- Also walked System → Panel Object Type IDs (`C=0…8`) via “Discover Panel branch”

**What we use instead**

- Gain knob writes go directly to the Gain EQ control-tree path (`gainEqControlPath`).
- The G2 LCD is mirrored only via Auto Display pushes and display dump replies — not by synthesizing Gain page text in the app.

**To revive**

1. Re-import constants from `soft-ui-panel-button-probe.ts`
2. Restore probe UI in `MidiConnectionBadge.vue` and the probe functions formerly in `useWebMidi.ts` (see git history for this folder’s introduction)
