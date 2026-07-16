/* eslint-disable */
/**
 * AUTO-GENERATED display-unit string tables.
 * Seed: Control Sources from MIDI SysEx PDF.
 * Refresh via /tools/harvest-units → apply with:
 *   pnpm run generate:units-strings -- path/to/mpx-g2-units-harvest.json
 */
export const GENERATED_UNIT_STRING_TABLES = {
  DSP_bypass_strings: {} as Record<number, string>,
  SX_bypass_strings: {
    0: "Byp 0", // 0x0
    1: "On 1", // 0x1
  },
  ab_mode_strings: {} as Record<number, string>,
  adsr_mode_strings: {} as Record<number, string>,
  ambience_RT_HC_strings: {
    0: "0.5K", // 0x0
    1: "1.0K", // 0x1
    2: "1.6K", // 0x2
    3: "2.2K", // 0x3
    4: "2.9K", // 0x4
    5: "3.6K", // 0x5
    6: "4.4K", // 0x6
    7: "5.5K", // 0x7
    8: "6.3K", // 0x8
    9: "7.5K", // 0x9
    10: "8.9K", // 0xa
    11: "10.6K", // 0xb
    12: "12.8K", // 0xc
    13: "15.9K", // 0xd
    14: "21.2K", // 0xe
  },
  arpeggiator_mode_strings: {} as Record<number, string>,
  audio_output_mode_strings: {} as Record<number, string>,
  bass_rt_strings: {
    0: "0.2X", // 0x0
    1: "0.4X", // 0x1
    2: "0.6X", // 0x2
    3: "0.8X", // 0x3
    4: "1.0X", // 0x4
    5: "1.2X", // 0x5
    6: "1.5X", // 0x6
    7: "2.0X", // 0x7
    8: "3.0X", // 0x8
    9: "4.0X", // 0x9
  },
  bypass_mode_strings: {} as Record<number, string>,
  cabinet_strings: {} as Record<number, string>,
  chamber_decay_strings: {
    0: "0.12s", // 0x0
    1: "0.13s", // 0x1
    2: "0.14s", // 0x2
    3: "0.15s", // 0x3
    4: "0.16s", // 0x4
    5: "0.17s", // 0x5
    6: "0.18s", // 0x6
    7: "0.19s", // 0x7
    8: "0.20s", // 0x8
    9: "0.21s", // 0x9
    10: "0.22s", // 0xa
    11: "0.22s", // 0xb
    12: "0.23s", // 0xc
    13: "0.24s", // 0xd
    14: "0.25s", // 0xe
    15: "0.26s", // 0xf
    16: "0.27s", // 0x10
    17: "0.28s", // 0x11
    18: "0.29s", // 0x12
    19: "0.30s", // 0x13
    20: "0.31s", // 0x14
    21: "0.32s", // 0x15
    22: "0.34s", // 0x16
    23: "0.35s", // 0x17
    24: "0.36s", // 0x18
    25: "0.38s", // 0x19
    26: "0.39s", // 0x1a
    27: "0.40s", // 0x1b
    28: "0.42s", // 0x1c
    29: "0.44s", // 0x1d
    30: "0.45s", // 0x1e
    31: "0.47s", // 0x1f
    32: "0.49s", // 0x20
    33: "0.51s", // 0x21
    34: "0.54s", // 0x22
    35: "0.56s", // 0x23
    36: "0.58s", // 0x24
    37: "0.61s", // 0x25
    38: "0.64s", // 0x26
    39: "0.67s", // 0x27
    40: "0.70s", // 0x28
    41: "0.74s", // 0x29
    42: "0.78s", // 0x2a
    43: "0.82s", // 0x2b
    44: "0.87s", // 0x2c
    45: "0.92s", // 0x2d
    46: "0.98s", // 0x2e
    47: "1.05s", // 0x2f
    48: "1.12s", // 0x30
    49: "1.20s", // 0x31
    50: "1.30s", // 0x32
    51: "1.41s", // 0x33
    52: "1.53s", // 0x34
    53: "1.68s", // 0x35
    54: "1.86s", // 0x36
    55: "2.08s", // 0x37
    56: "2.36s", // 0x38
    57: "2.71s", // 0x39
    58: "3.18s", // 0x3a
    59: "3.84s", // 0x3b
    60: "4.83s", // 0x3c
    61: "6.48s", // 0x3d
    62: "9.78s", // 0x3e
    63: "19.6s", // 0x3f
  },
  chan_stat_mode_strings: {} as Record<number, string>,
  clock_source_strings: {} as Record<number, string>,
  control_source_strings: {
    0: "Unassigned", // 0x0
    1: "Off", // 0x1
    2: "On", // 0x2
    3: "Knob", // 0x3
    4: "Puls1", // 0x4
    5: "Tri1", // 0x5
    6: "Sine1", // 0x6
    7: "Cos1", // 0x7
    8: "Puls2", // 0x8
    9: "Tri2", // 0x9
    10: "Sine2", // 0xa
    11: "Cos2", // 0xb
    12: "Rand", // 0xc
    13: "Env", // 0xd
    14: "InLvl", // 0xe
    15: "ALvl", // 0xf
    16: "A/B", // 0x10
    17: "ATrg", // 0x11
    18: "BTrg", // 0x12
    19: "ABTrg", // 0x13
    20: "Pedal", // 0x14
    21: "Tog1", // 0x15
    22: "Tog2", // 0x16
    23: "Tog3", // 0x17
    24: "Sw1", // 0x18
    25: "Sw2", // 0x19
    26: "Sw3", // 0x1a
    28: "CC1", // 0x1c
    29: "CC2", // 0x1d
    30: "CC3", // 0x1e
    31: "CC4", // 0x1f
    32: "CC5", // 0x20
    33: "CC6", // 0x21
    34: "CC7", // 0x22
    35: "CC8", // 0x23
    36: "CC9", // 0x24
    37: "CC10", // 0x25
    38: "CC11", // 0x26
    39: "CC12", // 0x27
    40: "CC13", // 0x28
    41: "CC14", // 0x29
    42: "CC15", // 0x2a
    43: "CC16", // 0x2b
    44: "CC17", // 0x2c
    45: "CC18", // 0x2d
    46: "CC19", // 0x2e
    47: "CC20", // 0x2f
    48: "CC21", // 0x30
    49: "CC22", // 0x31
    50: "CC23", // 0x32
    51: "CC24", // 0x33
    52: "CC25", // 0x34
    53: "CC26", // 0x35
    54: "CC27", // 0x36
    55: "CC28", // 0x37
    56: "CC29", // 0x38
    57: "CC30", // 0x39
    58: "CC31", // 0x3a
    59: "CC33", // 0x3b
    60: "CC34", // 0x3c
    61: "CC35", // 0x3d
    62: "CC36", // 0x3e
    63: "CC37", // 0x3f
    64: "CC38", // 0x40
    65: "CC39", // 0x41
    66: "CC40", // 0x42
    67: "CC41", // 0x43
    68: "CC42", // 0x44
    69: "CC43", // 0x45
    70: "CC44", // 0x46
    71: "CC45", // 0x47
    72: "CC46", // 0x48
    73: "CC47", // 0x49
    74: "CC48", // 0x4a
    75: "CC49", // 0x4b
    76: "CC50", // 0x4c
    77: "CC51", // 0x4d
    78: "CC52", // 0x4e
    79: "CC53", // 0x4f
    80: "CC54", // 0x50
    81: "CC55", // 0x51
    82: "CC56", // 0x52
    83: "CC57", // 0x53
    84: "CC58", // 0x54
    85: "CC59", // 0x55
    86: "CC60", // 0x56
    87: "CC61", // 0x57
    88: "CC62", // 0x58
    89: "CC63", // 0x59
    90: "CC64", // 0x5a
    91: "CC65", // 0x5b
    92: "CC66", // 0x5c
    93: "CC67", // 0x5d
    94: "CC68", // 0x5e
    95: "CC69", // 0x5f
    96: "CC70", // 0x60
    97: "CC71", // 0x61
    98: "CC72", // 0x62
    99: "CC73", // 0x63
    100: "CC74", // 0x64
    101: "CC75", // 0x65
    102: "CC76", // 0x66
    103: "CC77", // 0x67
    104: "CC78", // 0x68
    105: "CC79", // 0x69
    106: "CC80", // 0x6a
    107: "CC81", // 0x6b
    108: "CC82", // 0x6c
    109: "CC83", // 0x6d
    110: "CC84", // 0x6e
    111: "CC85", // 0x6f
    112: "CC86", // 0x70
    113: "CC87", // 0x71
    114: "CC88", // 0x72
    115: "CC89", // 0x73
    116: "CC90", // 0x74
    117: "CC91", // 0x75
    118: "CC92", // 0x76
    119: "CC93", // 0x77
    120: "CC94", // 0x78
    121: "CC95", // 0x79
    122: "CC96", // 0x7a
    123: "CC97", // 0x7b
    124: "CC98", // 0x7c
    125: "CC99", // 0x7d
    126: "CC100", // 0x7e
    127: "CC101", // 0x7f
    128: "CC102", // 0x80
    129: "CC103", // 0x81
    130: "CC104", // 0x82
    131: "CC105", // 0x83
    132: "CC106", // 0x84
    133: "CC107", // 0x85
    134: "CC108", // 0x86
    135: "CC109", // 0x87
    136: "CC110", // 0x88
    137: "CC111", // 0x89
    138: "CC112", // 0x8a
    139: "CC113", // 0x8b
    140: "CC114", // 0x8c
    141: "CC115", // 0x8d
    142: "CC116", // 0x8e
    143: "CC117", // 0x8f
    144: "CC119", // 0x90
    145: "Bend", // 0x91
    146: "Touch", // 0x92
    147: "Vel", // 0x93
    148: "Last•", // 0x94
    149: "Low•", // 0x95
    150: "High•", // 0x96
    151: "Tempo", // 0x97
    152: "Cmnds", // 0x98
    153: "Gate", // 0x99
    154: "Trig", // 0x9a
    155: "LGate", // 0x9b
    156: "TSw", // 0x9c
    157: "Toe", // 0x9d
  },
  cromatic_note_strings: {} as Record<number, string>,
  envelope_mode_strings: {} as Record<number, string>,
  envelope_source_strings: {} as Record<number, string>,
  eq_mode_strings: {
    0: "LShlf", // 0x0
    1: "Band", // 0x1
    2: "HShlf", // 0x2
  },
  fb_insert_point_strings: {} as Record<number, string>,
  feel_strings: {} as Record<number, string>,
  global_patch_dest_strings: {} as Record<number, string>,
  input_mode_strings: {} as Record<number, string>,
  insert_mode_strings: {} as Record<number, string>,
  insert_type_strings: {
    0: "Stereo", // 0x0
    1: "Left", // 0x1
    2: "Right", // 0x2
    3: "PreOut", // 0x3
  },
  interval_strings: {} as Record<number, string>,
  left_ins_strings: {} as Record<number, string>,
  lfo_mode_strings: {} as Record<number, string>,
  load_mode_strings: {} as Record<number, string>,
  log_lin_strings: {} as Record<number, string>,
  mem_protect_mode_strings: {} as Record<number, string>,
  meter_strings: {} as Record<number, string>,
  midi_dump_strings: {} as Record<number, string>,
  midi_out_rate_strings: {} as Record<number, string>,
  mix_insert_strings: {} as Record<number, string>,
  mix_mode_strings: {} as Record<number, string>,
  modulation_mode_strings: {} as Record<number, string>,
  mojo_bypass_strings: {
    0: "Byp 0", // 0x0
    1: "On 1", // 0x1
  },
  mute_strings: {} as Record<number, string>,
  noise_gate_enable_strings: {} as Record<number, string>,
  note_strings: {} as Record<number, string>,
  on_off_strings: {
    0: "Off", // 0x0
    1: "On", // 0x1
  },
  on_off_with_bin_strings: {} as Record<number, string>,
  patch_update_mode_strings: {} as Record<number, string>,
  phase_strings: {
    0: "0", // 0x0
    1: "90", // 0x1
    2: "180", // 0x2
    3: "270", // 0x3
  },
  pitch_detect_source_strings: {} as Record<number, string>,
  post_bypass_mode_strings: {} as Record<number, string>,
  program_load_strings: {} as Record<number, string>,
  reverb_freq_strings: {
    0: "525", // 0x0
    1: "589", // 0x1
    2: "654", // 0x2
    3: "818", // 0x3
    4: "986", // 0x4
    5: "1.1K", // 0x5
    6: "1.3K", // 0x6
    7: "1.5K", // 0x7
    8: "1.6K", // 0x8
    9: "1.8K", // 0x9
    10: "2.0K", // 0xa
    11: "2.2K", // 0xb
    12: "2.4K", // 0xc
    13: "2.6K", // 0xd
    14: "2.9K", // 0xe
    15: "3.1K", // 0xf
    16: "3.3K", // 0x10
    17: "3.5K", // 0x11
    18: "3.8K", // 0x12
    19: "4.0K", // 0x13
    20: "4.3K", // 0x14
    21: "4.6K", // 0x15
    22: "4.8K", // 0x16
    23: "5.1K", // 0x17
    24: "5.4K", // 0x18
    25: "5.7K", // 0x19
    26: "6.1K", // 0x1a
    27: "6.4K", // 0x1b
    28: "6.8K", // 0x1c
    29: "7.1K", // 0x1d
    30: "7.5K", // 0x1e
    31: "7.9K", // 0x1f
    32: "8.4K", // 0x20
    33: "8.8K", // 0x21
    34: "9.3K", // 0x22
    35: "9.9K", // 0x23
    36: "10.4K", // 0x24
    37: "11.0K", // 0x25
    38: "11.7K", // 0x26
    39: "12.4K", // 0x27
    40: "13.2K", // 0x28
    41: "14.1K", // 0x29
    42: "15.2K", // 0x2a
    43: "16.3K", // 0x2b
    44: "17.7K", // 0x2c
    45: "19.4K", // 0x2d
    46: "21.6K", // 0x2e
    47: "24.7K", // 0x2f
    48: "Flat", // 0x30
  },
  rt_ins_ct_strings: {} as Record<number, string>,
  scale_strings: {} as Record<number, string>,
  send_bypass_mode_strings: {} as Record<number, string>,
  send_sel_strings: {
    0: "Gn 0", // 0x0
    1: "Cln 1", // 0x1
  },
  sleep_mode_strings: {} as Record<number, string>,
  sort_mode_strings: {} as Record<number, string>,
  speaker_freq_strings: {} as Record<number, string>,
  spkr_sim_bypass_strings: {} as Record<number, string>,
  sum_mono_strings: {} as Record<number, string>,
  tap_mode_strings: {} as Record<number, string>,
  tempo_source_strings: {} as Record<number, string>,
  time_unit_strings: {} as Record<number, string>,
  toe_patch_strings: {} as Record<number, string>,
  tone_strings: {
    0: "Byp 0", // 0x0
    1: "On 1", // 0x1
  },
  tuner_bypass_mode_strings: {} as Record<number, string>,
  tuner_cal_strings: {} as Record<number, string>,
  velocity_mode_strings: {} as Record<number, string>,
  wah_type_strings: {} as Record<number, string>,
  waveform_strings: {} as Record<number, string>,
} as const

export type GeneratedUnitStringTable = keyof typeof GENERATED_UNIT_STRING_TABLES

/** Optional provenance from the last hardware harvest. */
export const GENERATED_UNIT_STRINGS_META = {
  source: "hardware-harvest" as const,
  generatedAt: "2026-07-16T22:43:27.700Z" as string | null,
  tableCount: 67,
  harvestedTableCount: 13
}
