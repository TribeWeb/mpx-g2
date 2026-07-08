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
  <div class="display rounded px-4 py-3">
    <p
      v-for="(line, index) in displayLines"
      :key="index"
      class="display__line min-h-6 truncate"
    >
      {{ line || '\u00a0' }}
    </p>
  </div>
</template>

<style scoped>
.display {
  background: #0a0a0a;
  border: 1px solid #888;
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 0.8);
  font-family: "Lucida Console", Monaco, "Courier New", monospace;
}

.display__line {
  color: #a4cc00;
  font-size: 1.05rem;
  letter-spacing: 0.12em;
  line-height: 1.5;
  text-shadow: 0 0 8px rgb(164 204 0 / 0.5);
}
</style>
