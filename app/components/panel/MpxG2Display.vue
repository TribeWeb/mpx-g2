<script setup lang="ts">
const props = defineProps<{
  lines?: string[]
}>()

const displayLines = computed(() => {
  const source = props.lines ?? ['', '']
  return [source[0] ?? '', source[1] ?? '']
})
</script>

<template>
  <div class="rounded-md border border-default bg-black px-4 py-3 font-mono text-sm text-emerald-400 shadow-inner">
    <p
      v-for="(line, index) in displayLines"
      :key="index"
      class="min-h-5 truncate tracking-wider"
    >
      {{ line || '\u00a0' }}
    </p>
  </div>
</template>
