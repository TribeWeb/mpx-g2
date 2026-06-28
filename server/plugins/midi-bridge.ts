import { startMidiBridge, stopMidiBridge } from '../utils/midi-bridge'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  const port = Number(config.midiBridgePort)

  startMidiBridge(port)

  if (import.meta.dev) {
    process.once('SIGINT', () => stopMidiBridge())
    process.once('SIGTERM', () => stopMidiBridge())
  }
})
