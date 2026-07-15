const SESSION_PORTS_KEY = 'mpx-g2-webmidi-ports'
const SESSION_WANT_KEY = 'mpx-g2-webmidi-want-connected'

export type PersistedMidiPorts = {
  inputId?: string
  outputId?: string
  productId?: number
}

export function readPersistedPorts(): PersistedMidiPorts | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }
  try {
    const raw = sessionStorage.getItem(SESSION_PORTS_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as PersistedMidiPorts
  } catch {
    return null
  }
}

export function writePersistedPorts(ports: PersistedMidiPorts) {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  sessionStorage.setItem(SESSION_PORTS_KEY, JSON.stringify(ports))
  sessionStorage.setItem(SESSION_WANT_KEY, '1')
}

export function clearPersistedPorts() {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  sessionStorage.removeItem(SESSION_PORTS_KEY)
  sessionStorage.removeItem(SESSION_WANT_KEY)
}

export function wantsAutoReconnect(): boolean {
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_WANT_KEY) === '1'
}
