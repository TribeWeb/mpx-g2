/** Display-unit metadata from the MPX G2 MIDI SysEx appendix. */

export type DisplayUnitMeta = {
  /** Display Units Type id (low 15 bits; bit 15 = signed on the wire). */
  id: number
  name: string
  description: string
  /**
   * Firmware string-table name when values index a fixed list.
   * Tables are harvested into `units-strings.generated.ts`.
   */
  stringTable: string | null
}

export const DISPLAY_UNITS: readonly DisplayUnitMeta[] = [
  {
    id: 0, // 0x00
    name: 'Mix Disp Units',
    description: 'Display in decimal followed by \'%\'',
    stringTable: null
  },
  {
    id: 1, // 0x01
    name: 'No Disp Units',
    description: 'Display in decimal',
    stringTable: null
  },
  {
    id: 2, // 0x02
    name: 'Waveform Disp Units',
    description: 'Use the "waveform_strings"',
    stringTable: 'waveform_strings'
  },
  {
    id: 3, // 0x03
    name: 'Percentage Disp Units',
    description: 'Display in decimal followed by \'%\'',
    stringTable: null
  },
  {
    id: 4, // 0x04
    name: 'On Off Disp Units',
    description: 'Use the "on_off_strings"',
    stringTable: 'on_off_strings'
  },
  {
    id: 5, // 0x05
    name: 'Log Lin Disp Units',
    description: 'Use the "log_lin_strings"',
    stringTable: 'log_lin_strings'
  },
  {
    id: 6, // 0x06
    name: 'Note Disp Units',
    description: 'Use the "note_strings"',
    stringTable: 'note_strings'
  },
  {
    id: 7, // 0x07
    name: '"Off" Decimal Disp Units',
    description: 'Display "Off" for 0, otherwise in decimal',
    stringTable: null
  },
  {
    id: 8, // 0x08
    name: 'Tempo Ratio Disp Units',
    description: 'Display high and low bytes as separate decimal numbers seperated by a \':\'. Strip off the MSB of the high byte.',
    stringTable: null
  },
  {
    id: 9, // 0x09
    name: 'Hz Disp Units',
    description: 'Display in decimal followed by "Hz"',
    stringTable: null
  },
  {
    id: 10, // 0x0a
    name: 'Q Disp Units',
    description: 'Display in decimal 1/10ths units optionally followed by \'Q\' (e.g. 10 would be "1.0 Q")',
    stringTable: null
  },
  {
    id: 11, // 0x0b
    name: 'Envelope Disp Units',
    description: 'Use the "envelope_mode_strings"',
    stringTable: 'envelope_mode_strings'
  },
  {
    id: 12, // 0x0c
    name: 'Velocity Disp Units',
    description: 'Use the "velocity_mode_strings"',
    stringTable: 'velocity_mode_strings'
  },
  {
    id: 13, // 0x0d
    name: 'Modulation Disp Units',
    description: 'Use the "modulation_mode_strings"',
    stringTable: 'modulation_mode_strings'
  },
  {
    id: 14, // 0x0e
    name: 'Degree Disp Units',
    description: 'Display in decimal (optional degree symbol)',
    stringTable: null
  },
  {
    id: 15, // 0x0f
    name: 'Ms Or Time Sig Disp Units',
    description: 'Display high and low bytes as separate decimal numbers seperated by a \':\'. Strip off the MSB of the high byte.',
    stringTable: null
  },
  {
    id: 16, // 0x10
    name: 'Load Mode Disp Units',
    description: 'Use the "load_mode_strings"',
    stringTable: 'load_mode_strings'
  },
  {
    id: 17, // 0x11
    name: 'Lfo Mode Disp Units',
    description: 'Use the "lfo_mode_strings"',
    stringTable: 'lfo_mode_strings'
  },
  {
    id: 18, // 0x12
    name: 'Adsr Mode Disp Units',
    description: 'Use the "adsr_mode_strings"',
    stringTable: 'adsr_mode_strings'
  },
  {
    id: 19, // 0x13
    name: 'Rate Units Disp Units',
    description: 'If the third byte is 1, display "cycles:beat" otherwise display "Hz".',
    stringTable: null
  },
  {
    id: 20, // 0x14
    name: 'Time Units Disp Units',
    description: 'Use the "time_unit_strings" using the third byte as an index.',
    stringTable: 'time_unit_strings'
  },
  {
    id: 21, // 0x15
    name: 'Fb Insert Disp Units',
    description: 'Use the "fb_insert_point_strings" using the option data as an index.',
    stringTable: 'fb_insert_point_strings'
  },
  {
    id: 22, // 0x16
    name: 'Tap Mode Disp Units',
    description: 'Use the "tap_mode_strings"',
    stringTable: 'tap_mode_strings'
  },
  {
    id: 23, // 0x17
    name: 'Rate Disp Units',
    description: 'Display in decimal 1/100ths units with optional "Hz" (e.g. 100 would be "1.00 Hz")',
    stringTable: null
  },
  {
    id: 24, // 0x18
    name: 'Midi Channel Disp Units',
    description: 'For values 0-15, display as decimal number plus 1. For value of 16, display "Off" For value of 17, display "Omni"',
    stringTable: null
  },
  {
    id: 25, // 0x19
    name: 'Midi Out Rate Disp Units',
    description: 'Use the "midi_out_rate_strings"',
    stringTable: 'midi_out_rate_strings'
  },
  {
    id: 26, // 0x1a
    name: 'Meter Disp Units',
    description: 'Use the "meter_strings"',
    stringTable: 'meter_strings'
  },
  {
    id: 27, // 0x1b
    name: 'Sort Mode Disp Units',
    description: 'Use the "sort_mode_strings"',
    stringTable: 'sort_mode_strings'
  },
  {
    id: 28, // 0x1c
    name: 'Bypass Mode Disp Units',
    description: 'Use the "bypass_mode_strings"',
    stringTable: 'bypass_mode_strings'
  },
  {
    id: 29, // 0x1d
    name: 'Mem Protect Disp Units',
    description: 'Use the "mem_protect_mode_strings"',
    stringTable: 'mem_protect_mode_strings'
  },
  {
    id: 30, // 0x1e
    name: 'Patch Update Mode Disp units',
    description: 'Use the "patch_update_mode_strings"',
    stringTable: 'patch_update_mode_strings'
  },
  {
    id: 31, // 0x1f
    name: 'Sleep Mode Disp Units',
    description: 'Use the "sleep_mode_strings"',
    stringTable: 'sleep_mode_strings'
  },
  {
    id: 32, // 0x20
    name: 'Mix Mode Disp Units',
    description: 'Use the "mix_mode_strings"',
    stringTable: 'mix_mode_strings'
  },
  {
    id: 33, // 0x21
    name: 'Program Load Disp Units',
    description: 'Use the "program_load_strings"',
    stringTable: 'program_load_strings'
  },
  {
    id: 34, // 0x22
    name: 'Clock Source Disp Units',
    description: 'Use the "clock_source_strings"',
    stringTable: 'clock_source_strings'
  },
  {
    id: 35, // 0x23
    name: 'Audio Output Disp Units',
    description: 'Use the "audio_output_mode_strings"',
    stringTable: 'audio_output_mode_strings'
  },
  {
    id: 36, // 0x24
    name: 'Chan Stat Disp Units',
    description: 'Use the "chan_stat_mode_strings"',
    stringTable: 'chan_stat_mode_strings'
  },
  {
    id: 37, // 0x25
    name: 'Alphanumeric Disp Units',
    description: 'Display the data as an ASCII string',
    stringTable: null
  },
  {
    id: 38, // 0x26
    name: 'Bpm Disp Units',
    description: 'Display in decimal followed by BPM',
    stringTable: null
  },
  {
    id: 39, // 0x27
    name: 'Tempo Source Disp Units',
    description: 'Use the "tempo_source_strings"',
    stringTable: 'tempo_source_strings'
  },
  {
    id: 40, // 0x28
    name: 'Cont Source Disp Units',
    description: 'Use the display strings in the Control Source table',
    stringTable: 'control_source_strings'
  },
  {
    id: 41, // 0x29
    name: 'Min Off Cont Source Disp Units',
    description: 'Same as previous except display "None" for the "min_value"',
    stringTable: null
  },
  {
    id: 42, // 0x2a
    name: 'Num Beats Disp Units',
    description: 'Display in decimal followed by "Beats"',
    stringTable: null
  },
  {
    id: 43, // 0x2b
    name: 'Options No Disp Units',
    description: 'Display in decimal using option data',
    stringTable: null
  },
  {
    id: 44, // 0x2c
    name: 'Ab Mode Disp Units',
    description: 'Use the "ab_mode_strings"',
    stringTable: 'ab_mode_strings'
  },
  {
    id: 45, // 0x2d
    name: 'Global Patch Dest Disp Units',
    description: 'Use the "global_patch_dest_strings"',
    stringTable: 'global_patch_dest_strings'
  },
  {
    id: 46, // 0x2e
    name: 'MIDI Dump Disp Units',
    description: 'Use the "midi_dump_strings"',
    stringTable: 'midi_dump_strings'
  },
  {
    id: 47, // 0x2f
    name: 'Eq Mode Disp Units',
    description: 'Use the "eq_mode_strings"',
    stringTable: 'eq_mode_strings'
  },
  {
    id: 48, // 0x30
    name: 'Name Disp Units',
    description: 'Display data as an ASCII string',
    stringTable: null
  },
  {
    id: 49, // 0x31
    name: 'Wah Type Disp Units',
    description: 'Use the "wah_type_strings" using the option data as an index',
    stringTable: 'wah_type_strings'
  },
  {
    id: 50, // 0x32
    name: 'Input Mode Disp Units',
    description: 'Use the "input_mode_strings"',
    stringTable: 'input_mode_strings'
  },
  {
    id: 51, // 0x33
    name: 'Arp Mode Disp Units',
    description: 'Use the "arpeggiator_mode_strings"',
    stringTable: 'arpeggiator_mode_strings'
  },
  {
    id: 52, // 0x34
    name: 'Env Source Disp Units',
    description: 'Use the "envelope_source_strings"',
    stringTable: 'envelope_source_strings'
  },
  {
    id: 53, // 0x35
    name: 'Size Disp Units',
    description: 'Divide the value by 2 and add 4. If LSB of value is 1, add ".5" else add ".0". Optionally add "M" or "Meters".',
    stringTable: null
  },
  {
    id: 54, // 0x36
    name: 'Treb Disp Units',
    description: 'Use "reverb_freq_strings"',
    stringTable: 'reverb_freq_strings'
  },
  {
    id: 55, // 0x37
    name: 'Bassrt Disp Units',
    description: 'Display \'X\' followed by "bass_rt_strings"',
    stringTable: 'bass_rt_strings'
  },
  {
    id: 56, // 0x38
    name: 'Crossover Disp Units',
    description: 'Use "reverb_freq_strings" offsetting the parameter value by 12. If value = 48 use "Flat".',
    stringTable: 'reverb_freq_strings'
  },
  {
    id: 57, // 0x39
    name: 'Midrt Disp Units',
    description: 'If reverb algorithm is 1 or 5 use the "chamber_decay_strings", if 2 then use "hall_decay_strings", if 3 use "plate_decay_strings"',
    stringTable: 'chamber_decay_strings'
  },
  {
    id: 58, // 0x3a
    name: 'Percent50 Disp Units',
    description: 'Multiply value by 2 and display in decimal followed by \'%\'',
    stringTable: null
  },
  {
    id: 59, // 0x3b
    name: 'MSec Disp Units',
    description: 'Display in decimal (optionally follow with "ms")',
    stringTable: null
  },
  {
    id: 60, // 0x3c
    name: 'Spread Disp Units',
    description: 'Display in decimal. Note that if "Link" is turned on, the value is scaled',
    stringTable: null
  },
  {
    id: 61, // 0x3d
    name: 'Shape Disp Units',
    description: 'Display in decimal',
    stringTable: null
  },
  {
    id: 62, // 0x3e
    name: 'Slope Disp Units',
    description: 'If the value is < 16, a minus sign is displayed followed by 16 minus the value in decimal. Otherwise, a plus sign is displayed followed by the value minus 16 in decimal',
    stringTable: null
  },
  {
    id: 63, // 0x3f
    name: 'DPLevel Disp Units',
    description: 'If the value is 0, "Off" is displayed. If the value is the "max_value", "Full" is displayed. Otherwise, a minus sign is displayed, the value is multiplied by 2 and used as an offset into the "levelog_db" table, where the first display value is derived. The value is incremented then used again for an index into the table for the second character. Finally, the letters "dB" are tacked onto the end.',
    stringTable: null
  },
  {
    id: 64, // 0x40
    name: 'Duration Disp Units',
    description: '140 is added to the value multiplied by 5 (140+(value*5)) and displayed as decimal with "ms" tacked onto the end.',
    stringTable: null
  },
  {
    id: 65, // 0x41
    name: 'Cromatics Note Disp Units',
    description: 'The value has 12 subtracted from it until is less than 11 with the octave incremented each time. The resulting "octave" number is displayed in hex followed by the note using what’s left of the value as an index into "cromatic_note_strings".',
    stringTable: 'cromatic_note_strings'
  },
  {
    id: 66, // 0x42
    name: 'AmbRtHc Disp Units',
    description: 'Use "ambience_RT_HC_strings"',
    stringTable: 'ambience_RT_HC_strings'
  },
  {
    id: 67, // 0x43
    name: 'Word No Disp Units',
    description: 'Display as a decimal word (2 bytes)',
    stringTable: null
  },
  {
    id: 68, // 0x44
    name: 'Dump Disp Units',
    description: 'Display "Dump"',
    stringTable: null
  },
  {
    id: 69, // 0x45
    name: 'Feet Disp Units',
    description: 'Display in decimal (optionally add "Feet")',
    stringTable: null
  },
  {
    id: 70, // 0x46
    name: 'Meters Disp Units',
    description: 'Display in decimal (optionally add "Meters")',
    stringTable: null
  },
  {
    id: 71, // 0x47
    name: 'Phase Disp Units',
    description: 'Use "phase_strings"',
    stringTable: 'phase_strings'
  },
  {
    id: 72, // 0x48
    name: 'PDly Disp Units',
    description: 'Display in decimal (optionally add "ms")',
    stringTable: null
  },
  {
    id: 73, // 0x49
    name: 'Optimize Disp Units',
    description: 'Display in decimal using option data (optionally add "ms")',
    stringTable: null
  },
  {
    id: 74, // 0x4a
    name: 'Arp Velocity Source Disp Units',
    description: 'If value is < 128, display as a decimal number otherwise subtract 127 and use 0x28 Controller Source Display Units.',
    stringTable: null
  },
  {
    id: 75, // 0x4b
    name: 'Control Level Disp Units',
    description: 'Display the parameters name',
    stringTable: null
  },
  {
    id: 76, // 0x4c
    name: 'On/Off with bin Disp Units',
    description: 'Use "on_off_with_bin_strings"',
    stringTable: 'on_off_with_bin_strings'
  },
  {
    id: 77, // 0x4d
    name: 'DSP Bypass Disp Units',
    description: 'Use "DSP_bypass_strings"',
    stringTable: 'DSP_bypass_strings'
  },
  {
    id: 78, // 0x4e
    name: 'Tone Disp Units',
    description: 'Use "tone_strings"',
    stringTable: 'tone_strings'
  },
  {
    id: 79, // 0x4f
    name: 'MoJo Disp Units',
    description: 'Use "mojo_bypass_strings"',
    stringTable: 'mojo_bypass_strings'
  },
  {
    id: 80, // 0x50
    name: 'SX Bypass Disp Units',
    description: 'Use "SX_bypass_strings"',
    stringTable: 'SX_bypass_strings'
  },
  {
    id: 81, // 0x51
    name: 'Feel Disp Units',
    description: 'Use "feel_strings"',
    stringTable: 'feel_strings'
  },
  {
    id: 82, // 0x52
    name: 'Send Select Disp Units',
    description: 'Use "send_sel_strings"',
    stringTable: 'send_sel_strings'
  },
  {
    id: 83, // 0x53
    name: 'Sum Mono Disp Units',
    description: 'Use "sum_mono_strings"',
    stringTable: 'sum_mono_strings'
  },
  {
    id: 84, // 0x54
    name: 'Left Insert Disp Units',
    description: 'Use "left_ins_strings"',
    stringTable: 'left_ins_strings'
  },
  {
    id: 85, // 0x55
    name: 'Speaker Sim Bypass Disp Units',
    description: 'Use "spkr_sim_bypass_strings"',
    stringTable: 'spkr_sim_bypass_strings'
  },
  {
    id: 86, // 0x56
    name: 'Right Insert CT Disp Units',
    description: 'Use "rt_ins_ct_strings"',
    stringTable: 'rt_ins_ct_strings'
  },
  {
    id: 87, // 0x57
    name: 'Mix Insert Disp Units',
    description: 'Use "mix_insert_strings"',
    stringTable: 'mix_insert_strings'
  },
  {
    id: 88, // 0x58
    name: 'Mute Disp Units',
    description: 'Use "mute_strings"',
    stringTable: 'mute_strings'
  },
  {
    id: 89, // 0x59
    name: 'Send Bypass Disp Units',
    description: 'Use "send_bypass_mode_strings"',
    stringTable: 'send_bypass_mode_strings'
  },
  {
    id: 90, // 0x5a
    name: 'Post Bypass Disp Units',
    description: 'Use "post_bypass_mode_strings"',
    stringTable: 'post_bypass_mode_strings'
  },
  {
    id: 91, // 0x5b
    name: 'Insert Mode Disp Units',
    description: 'Use "insert_mode_strings"',
    stringTable: 'insert_mode_strings'
  },
  {
    id: 92, // 0x5c
    name: 'Tuner Bypass Mode Disp Units',
    description: 'Use "tuner_bypass_mode_strings"',
    stringTable: 'tuner_bypass_mode_strings'
  },
  {
    id: 93, // 0x5d
    name: 'Noise Gate Enable Disp Units',
    description: 'Use "noise_gate_enable_strings"',
    stringTable: 'noise_gate_enable_strings'
  },
  {
    id: 94, // 0x5e
    name: 'Cabinet Disp Units',
    description: 'Use "cabinet_strings"',
    stringTable: 'cabinet_strings'
  },
  {
    id: 95, // 0x5f
    name: 'Toe Patch Disp Units',
    description: 'Use "toe_patch_strings"',
    stringTable: 'toe_patch_strings'
  },
  {
    id: 96, // 0x60
    name: 'Key Disp Units',
    description: 'Use "cromatic_note_strings"',
    stringTable: 'cromatic_note_strings'
  },
  {
    id: 97, // 0x61
    name: 'Scale Disp Units',
    description: 'Use "scale_strings"',
    stringTable: 'scale_strings'
  },
  {
    id: 98, // 0x62
    name: 'Interval Disp Units',
    description: 'Use "interval_strings"',
    stringTable: 'interval_strings'
  },
  {
    id: 99, // 0x63
    name: 'Pitch Detect Source',
    description: 'Use "pitch_detect_source_strings"',
    stringTable: 'pitch_detect_source_strings'
  },
  {
    id: 100, // 0x64
    name: 'Insert Type',
    description: 'Use "insert_type_strings"',
    stringTable: 'insert_type_strings'
  },
  {
    id: 101, // 0x65
    name: 'Speaker Frequency',
    description: 'Use the "speaker_freq_strings"',
    stringTable: 'speaker_freq_strings'
  },
  {
    id: 102, // 0x66
    name: 'Tuner Calibration',
    description: 'Display the string "A=" followed by the string in the "tuner_cal_strings" identified by the parameter.',
    stringTable: 'tuner_cal_strings'
  },
  {
    id: 103, // 0x67
    name: 'Patch Destination',
    description: 'See “Patch Destination Display Units” below.',
    stringTable: null
  },
  {
    id: 104, // 0x68
    name: 'Controller Group and Source',
    description: 'Use the display strings in the Control Source table',
    stringTable: 'control_source_strings'
  },
  {
    id: 105, // 0x69
    name: 'Soft Row Assign',
    description: 'See Patch Destination Display Units” below.',
    stringTable: null
  },
  {
    id: 106, // 0x6a
    name: 'Diatonic Input',
    description: 'Use the "noise_gate_enable_strings"',
    stringTable: 'noise_gate_enable_strings'
  },
  {
    id: 107, // 0x6b
    name: 'Program Name',
    description: 'Each byte of the parameter represents an ASCII character.',
    stringTable: null
  },
  {
    id: 128, // 0x80
    name: 'Level Disp Units',
    description: 'If value = "min_value", display "Off" otherwise display a signed decimal number followed by "dB".',
    stringTable: null
  },
  {
    id: 129, // 0x81
    name: 'Pitch Disp Units',
    description: 'Display as signed decimal number in 100ths (100 = "1.00")',
    stringTable: null
  },
  {
    id: 130, // 0x82
    name: 'Bipolar Percentage',
    description: 'Dis',
    stringTable: null
  }
]

export const DISPLAY_UNIT_BY_ID: ReadonlyMap<number, DisplayUnitMeta> = new Map(
  DISPLAY_UNITS.map(unit => [unit.id, unit])
)

/** Unit ids that index a harvested / seeded string table. */
export function displayUnitStringTable(unitId: number): string | null {
  return DISPLAY_UNIT_BY_ID.get(unitId & 0x7fff)?.stringTable ?? null
}
