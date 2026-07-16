<script setup lang="ts">
const config = useRuntimeConfig()
const { error } = useMidiConnection()

const roadmap = [
  {
    icon: 'i-lucide-monitor',
    title: 'Front panel replica',
    description: 'Mirror the MPX-G2 LCD, LEDs, buttons, and data wheel in the browser with live state sync.'
  },
  {
    icon: 'i-lucide-radio',
    title: 'Chrome Web MIDI',
    description: 'Direct SysEx communication with the MPX-G2 via the Web MIDI API — no native bridge required.'
  },
  {
    icon: 'i-lucide-sliders-horizontal',
    title: 'Modern editor (next)',
    description: 'Parameter tree browsing, program management, and routing UI built on the same protocol layer.'
  }
]
</script>

<template>
  <div>
    <UPageHero
      :title="config.public.appName"
      description="A browser-based MIDI controller for the Lexicon MPX-G2. Use Chrome Web MIDI for hardware, or the built-in simulator for UI development."
      :links="[{
        label: 'Open front panel',
        to: '/panel',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl'
      }, {
        label: 'Gain pedal',
        to: '/pedals',
        trailingIcon: 'i-lucide-guitar',
        size: 'xl',
        color: 'neutral',
        variant: 'outline'
      }, {
        label: 'Pedalboard',
        to: '/pedalboard',
        trailingIcon: 'i-lucide-layout-grid',
        size: 'xl',
        color: 'neutral',
        variant: 'outline'
      }]"
    />

    <UAlert
      v-if="error"
      class="mx-auto mb-8 max-w-3xl"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="MIDI connection issue"
      :description="error"
    />

    <UPageSection
      title="Project roadmap"
      description="Nuxt 4 front panel with a TypeScript SysEx protocol layer and Chrome Web MIDI transport."
      :features="roadmap"
    />

    <UPageSection>
      <UCard class="mx-auto max-w-3xl">
        <template #header>
          <h3 class="font-semibold">
            Architecture
          </h3>
        </template>

        <pre class="overflow-x-auto rounded-lg bg-elevated p-4 text-sm text-muted"><code>Chrome (Web MIDI API + SysEx)
  ↕ USB MIDI
Lexicon MPX-G2

Optional: Simulated mode (WebSocket, no hardware)</code></pre>
      </UCard>
    </UPageSection>
  </div>
</template>
