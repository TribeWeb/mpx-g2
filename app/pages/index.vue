<script setup lang="ts">
const config = useRuntimeConfig()
const { error, connect } = useMidiBridge()

const roadmap = [
  {
    icon: 'i-lucide-monitor',
    title: 'Front panel replica',
    description: 'Mirror the MPX-G2 LCD, LEDs, buttons, and data wheel in the browser with live state sync.'
  },
  {
    icon: 'i-lucide-radio',
    title: 'TypeScript MIDI bridge',
    description: 'WebSocket bridge between the browser and hardware MIDI via SysEx — no Python required.'
  },
  {
    icon: 'i-lucide-sliders-horizontal',
    title: 'Modern editor (next)',
    description: 'Parameter tree browsing, program management, and routing UI built on the same protocol layer.'
  }
]

onMounted(() => {
  connect()
})
</script>

<template>
  <div>
    <UPageHero
      :title="config.public.appName"
      description="A browser-based MIDI controller for the Lexicon MPX-G2. Start with a virtual front panel, then grow into a full patch editor."
      :links="[{
        label: 'Open front panel',
        to: '/panel',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl'
      }]"
    />

    <UAlert
      v-if="error"
      class="mx-auto mb-8 max-w-3xl"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="MIDI bridge not reachable"
      :description="`${error}. Start the dev server — the bridge starts automatically on port 3101.`"
    />

    <UPageSection
      title="Project roadmap"
      description="This scaffold sets up Nuxt 4, Nuxt UI, and a TypeScript MIDI layer ready for hardware integration."
      :features="roadmap"
    />

    <UPageSection>
      <UCard class="mx-auto max-w-3xl">
        <template #header>
          <h3 class="font-semibold">
            Architecture
          </h3>
        </template>

        <pre class="overflow-x-auto rounded-lg bg-elevated p-4 text-sm text-muted"><code>Browser (Nuxt UI)
  ↕ WebSocket (JSON)
Nitro MIDI bridge (TypeScript + ws)
  ↕ USB MIDI / SysEx
Lexicon MPX-G2</code></pre>
      </UCard>
    </UPageSection>
  </div>
</template>
