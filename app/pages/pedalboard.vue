<script setup lang="ts">
const config = useRuntimeConfig()
const { status, mode } = useMidiConnection()

useSeoMeta({
  title: `Pedalboard · ${config.public.appName}`
})

const isLive = computed(() => status.value === 'connected')

const statusLabel = computed(() => {
  if (isLive.value) {
    return mode.value === 'simulated'
      ? 'Simulated · effects + bypass LEDs synced'
      : 'Live · effects + bypass LEDs synced'
  }
  return 'Demo pedalboard · connect MIDI or use simulated mode to sync'
})
</script>

<template>
  <div class="bg-neutral-950 py-8">
    <UContainer>
      <div class="mb-8 space-y-2">
        <h1 class="text-2xl font-semibold text-highlighted">
          Pedalboard
        </h1>
        <p class="max-w-3xl text-muted">
          All seven MPX-G2 effect blocks for the active program. Effect
          selection and bypass LEDs sync from the hardware. Parameter editing is
          live for Gain (Lo/Mid/Hi) and Chorus (Mix/Level plus Stereo Chorus
          modulators) — other blocks show demo values until wired.
        </p>
        <UBadge
          :color="isLive ? 'success' : 'warning'"
          variant="subtle"
        >
          {{ statusLabel }}
        </UBadge>
      </div>

      <ProgramPedalboard />
    </UContainer>
  </div>
</template>
