<script setup lang="ts">
const config = useRuntimeConfig()

useSeoMeta({
  title: `Front Panel · ${config.public.appName}`
})
</script>

<template>
  <div class="bg-neutral-950 py-8">
    <UContainer>
      <PanelWrapper />
    </UContainer>
  </div>
</template>
