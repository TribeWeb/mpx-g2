<script setup lang="ts">
const config = useRuntimeConfig()

useSeoMeta({
  title: `Effects · ${config.public.appName}`,
  description: 'MPX-G2 effect reference from the Content collection.'
})

const { data: effects } = await useAsyncData('manual-effects', () =>
  queryCollection('effects')
    .select('path', 'name', 'modelName', 'summary', 'dspSteps', 'manualSection', 'availableIn')
    .order('name', 'ASC')
    .all()
)

/** Content path `/effects/stereo-chorus` → app route `/manual/effects/stereo-chorus`. */
function manualPath(contentPath: string) {
  return `/manual${contentPath}`
}
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 max-w-2xl">
      <p class="text-sm font-medium text-muted">
        Manual
      </p>
      <h1 class="mt-1 text-3xl font-semibold tracking-tight">
        Effects
      </h1>
      <p class="mt-2 text-muted">
        Sourced from <code class="text-sm">content/effects</code>.
        Machine-facing params are compiled into
        <code class="text-sm">shared/constants/algorithms.generated.ts</code>
        (MIDI algorithm indexes).
      </p>
    </div>

    <ul class="divide-y divide-default border-y border-default">
      <li
        v-for="effect in effects"
        :key="effect.path"
        class="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between"
      >
        <div class="min-w-0">
          <NuxtLink
            :to="manualPath(effect.path)"
            class="text-lg font-medium text-highlighted hover:underline"
          >
            {{ effect.name }}
          </NuxtLink>
          <p class="mt-1 text-sm text-muted">
            {{ effect.modelName }} · {{ effect.summary }}
          </p>
        </div>
        <div class="shrink-0 text-sm text-muted">
          <span>{{ effect.dspSteps }} of 190 steps</span>
          <span v-if="effect.manualSection">
            · §{{ effect.manualSection }}
          </span>
        </div>
      </li>
    </ul>
  </UContainer>
</template>
