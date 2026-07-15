# Hardware verification matrix

Use this checklist when signing off stage 2 (Chrome Web MIDI). Mark each row after testing on a real MPX-G2.

## Connection

| Item | Expected | Verified |
|------|----------|----------|
| MIDI Out → G2 In | TX commands reach unit | ☐ |
| G2 Out → MIDI In | RX replies and automation | ☐ |
| SysEx Device ID 0 | Ping returns System Configuration | ☐ |
| Product ID 0x0f | Handshake and data messages accepted | ☐ |
| Port hot-plug | Re-scan reattaches inputs | ☐ |

## Panel buttons (SysEx)

Codes are MPX 1 keyboard-driver mappings remapped to G2 labels unless noted.

| Button | Press TX | Release TX | LED RX (dump) | Verified |
|--------|----------|------------|---------------|----------|
| Gain | 0x00 | 0x2c | gain column | ☐ |
| FX1 | 0x01 | 0x2d | fx1 column | ☐ |
| FX2 | 0x02 | 0x2e | fx2 column | ☐ |
| Program | 0x03 | 0x2f | program column | ☐ |
| Chorus | 0x04 | 0x30 | chorus column | ☐ |
| Delay | 0x05 | 0x31 | delay column | ☐ |
| Reverb | 0x06 | 0x32 | reverb column | ☐ |
| Edit | 0x07 | 0x33 | edit column | ☐ |
| EQ | 0x08 | 0x34 | eq column | ☐ |
| Insert | 0x09 | 0x35 | insert column | ☐ |
| Bypass | 0x20 (hold) | 0x36 (release) | bypass column | ☐ |
| System | 0x0b | 0x37 | system column | ☐ |
| Tap | 0x0c | 0x38 | — | ☐ |
| Soft Row | 0x0e | 0x3a | softRow column | ☐ |
| Store | 0x0f | 0x3b | store column | ☐ |
| A/B | 0x45 (toggle) | — | ab column | ☐ |
| Options | 0x12 | 0x3e | option column | ☐ |
| Left `<` | 0x0d | 0x39 | no LED bit | ☐ |
| Right `>` | 0x11 | 0x3d | no LED bit | ☐ |
| Tempo | — | — | tempo column (RX only) | ☐ |
| MIDI | — | — | midi column (RX only) | ☐ |

## Encoder

| Item | Code | Verified |
|------|------|----------|
| Data wheel CW | 0x42 (MPX 1 driver) | ☐ |
| Data wheel CCW | 0x43 (MPX 1 driver) | ☐ |

## Gain EQ knobs

| Item | Verified |
|------|----------|
| Lo/Mid/Hi values sync from automation | ☐ |
| Per-algorithm ranges from Object Description | ☐ |
| Knob TX writes control path (no Edit→Gain nav) | ☐ |
| LCD follows via display dump / Auto Display | ☐ |

## LCD / LED sync

| Item | Verified |
|------|----------|
| 32-char LCD mirrors G2 | ☐ |
| Active-parameter blink (highlight flash) | ☐ |
| 7-segment program digits | ☐ |
| Tempo LED from MIDI Clock when present | ☐ |
| 1 Hz poll keeps panel in sync when Auto Display stalls | ☐ |

## Deferred (not stage 2)

| Item | Notes |
|------|-------|
| Input/Output level knobs | Visual-only in UI; no G2 SysEx path identified |
| Aux In / Clip LEDs (top row) | Not in LED dump mapping |
| Left/Right navigator LEDs | Physical buttons have no LED bits in dump |
