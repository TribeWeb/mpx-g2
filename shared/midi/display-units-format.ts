import { DISPLAY_UNIT_BY_ID, displayUnitStringTable } from '../constants/units-map'
import { GENERATED_UNIT_STRING_TABLES } from '../constants/units-strings.generated'

/**
 * Look up a harvested / seeded label for a display-unit table value.
 * Returns null when the table or value is unknown.
 */
export function lookupUnitString(displayUnits: number, value: number): string | null {
  const tableName = displayUnitStringTable(displayUnits)
  if (!tableName) {
    return null
  }
  const table = GENERATED_UNIT_STRING_TABLES[tableName as keyof typeof GENERATED_UNIT_STRING_TABLES]
  if (!table) {
    return null
  }
  const label = (table as Record<number, string>)[value]
  return label ?? null
}

/**
 * Format a raw parameter value for documentation / UI.
 * Uses harvested string tables when available; falls back to numeric rules from the MIDI appendix.
 */
export function formatDisplayUnitValue(
  displayUnits: number,
  value: number,
  options?: { min?: number, max?: number }
): string {
  const unitId = displayUnits & 0x7fff
  const tableLabel = lookupUnitString(unitId, value)
  if (tableLabel != null) {
    return tableLabel
  }

  switch (unitId) {
    case 0x00: // Mix
    case 0x03: // Percentage
      return `${value}%`
    case 0x01: // No units
    case 0x0e: // Degree
      return String(value)
    case 0x07: // Off / decimal
      return value === 0 ? 'Off' : String(value)
    case 0x09: // Hz
      return `${value} Hz`
    case 0x0a: // Q (1/10ths)
      return `${(value / 10).toFixed(1)} Q`
    case 0x17: // Rate (1/100ths Hz)
      return `${(value / 100).toFixed(2)} Hz`
    case 0x18: { // MIDI channel
      if (value === 16) {
        return 'Off'
      }
      if (value === 17) {
        return 'Omni'
      }
      return String(value + 1)
    }
    case 0x26: // BPM
      return `${value} BPM`
    case 0x2a: // Beats
      return `${value} Beats`
    case 0x3a: // Percent ×2
      return `${value * 2}%`
    case 0x3b: // ms
      return `${value} ms`
    case 0x80: { // Level dB / Off at min
      if (options?.min != null && value === options.min) {
        return 'Off'
      }
      return `${value} dB`
    }
    case 0x81: // Pitch 1/100ths
      return (value / 100).toFixed(2)
    case 0x82: // Bipolar %
      return `${value}%`
    default: {
      const meta = DISPLAY_UNIT_BY_ID.get(unitId)
      if (meta?.stringTable) {
        return `${value}` // table present but value not harvested yet
      }
      return String(value)
    }
  }
}

/** Human-readable range for docs: "Off…On" or "0%…100%" when formatting works. */
export function formatDisplayUnitRange(
  displayUnits: number,
  min: number,
  max: number
): string {
  const lo = formatDisplayUnitValue(displayUnits, min, { min, max })
  const hi = formatDisplayUnitValue(displayUnits, max, { min, max })
  if (lo === String(min) && hi === String(max) && !displayUnitStringTable(displayUnits)) {
    return `${min}…${max}`
  }
  return `${lo}…${hi}`
}
