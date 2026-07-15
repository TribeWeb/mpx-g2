export function matchesMpxPort(name: string): boolean {
  const lower = name.toLowerCase()
  return lower.includes('mpx') || lower.includes('lexicon') || lower.includes('g2')
}

export function describeMidiMessage(data: Uint8Array): string {
  const status = data[0] ?? 0
  if (status === 0xf0) {
    return 'SysEx (fragment?)'
  }
  if (status >= 0xf8) {
    return 'System realtime'
  }
  const channel = (status & 0x0f) + 1
  const type = status & 0xf0
  if (type === 0xb0 && data.length >= 3) {
    return `CC ch${channel} #${data[1]} = ${data[2]}`
  }
  if (type === 0xc0 && data.length >= 2) {
    return `Program ch${channel} = ${data[1]}`
  }
  return `MIDI 0x${status.toString(16)}`
}

export function resolveInputPorts(inputs: MIDIInput[], inputId?: string): MIDIInput[] {
  if (inputId) {
    const selected = inputs.find(port => port.id === inputId)
    return selected ? [selected] : []
  }
  return inputs
}
