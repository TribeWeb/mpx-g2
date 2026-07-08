// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
  // Server-only: set MPX_G2_MIDI_BRIDGE_PORT to override the WebSocket port
    midiBridgePort: 3101,
    public: {
      appName: 'MPX-G2 Controller',
      midiBridgeUrl: 'ws://localhost:3101',
      midiDefaultMode: 'hardware' as 'hardware' | 'simulated',
      /** SysEx device ID — must match G2 SYSTEM → MIDI → SysEx Device ID and MIDI Remote. */
      midiDeviceId: 0,
      /** SysEx product ID byte (try 0x09 or 0x0f if handshake is rejected). */
      midiProductId: 0x09
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
