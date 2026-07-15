<script setup lang="ts">
const config = useRuntimeConfig()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = config.public.appName
const description = 'Browser-based MIDI controller for the Lexicon MPX-G2 effects processor.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-semibold"
        >
          <UIcon
            name="i-lucide-audio-lines"
            class="size-5 text-primary"
          />
          <span>{{ config.public.appName }}</span>
        </NuxtLink>

        <nav class="hidden sm:flex items-center gap-1 ml-4">
          <UButton
            to="/"
            label="Home"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="/panel"
            label="Front Panel"
            color="neutral"
            variant="ghost"
          />
        </nav>
      </template>

      <template #right>
        <MidiConnectionBadge />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Lexicon MPX-G2 · Nuxt 4 · {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
