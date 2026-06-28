<script setup lang="ts">
const config = useRuntimeConfig()

useSeoMeta({
  title: `Front Panel · ${config.public.appName}`
})

const { connect } = useMidiBridge()

onMounted(() => {
  connect()
})
</script>

<template>
  <UContainer class="py-8">
    <MpxG2Panel />
  </UContainer>
</template>
