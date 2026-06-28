export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    ok: true,
    service: 'mpx-g2',
    midiBridgePort: config.midiBridgePort,
    timestamp: new Date().toISOString()
  }
})
