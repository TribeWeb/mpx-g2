<script setup lang="ts">
const props = defineProps<{
  value?: number
}>()

const segmentMap: Record<number, boolean[]> = {
  0: [true, true, true, true, true, true, false],
  1: [false, true, true, false, false, false, false],
  2: [true, true, false, true, true, false, true],
  3: [true, true, true, true, false, false, true],
  4: [false, true, true, false, false, true, true],
  5: [true, false, true, true, false, true, true],
  6: [true, false, true, true, true, true, true],
  7: [true, true, true, false, false, false, false],
  8: [true, true, true, true, true, true, true],
  9: [true, true, true, true, false, true, true]
}

const segments = computed(() => segmentMap[props.value ?? -1] ?? Array.from({ length: 7 }, () => false))
</script>

<template>
  <div class="relative h-16 w-10">
    <span
      class="absolute left-1/2 top-0 h-1 w-6 -translate-x-1/2 rounded-sm bg-muted transition-colors"
      :class="segments[0] ? 'bg-primary shadow-[0_0_6px] shadow-primary/70' : ''"
    />
    <span
      class="absolute left-0 top-1 h-6 w-1 rounded-sm bg-muted transition-colors"
      :class="segments[5] ? 'bg-primary shadow-[0_0_6px] shadow-primary/70' : ''"
    />
    <span
      class="absolute right-0 top-1 h-6 w-1 rounded-sm bg-muted transition-colors"
      :class="segments[1] ? 'bg-primary shadow-[0_0_6px] shadow-primary/70' : ''"
    />
    <span
      class="absolute left-1/2 top-1/2 h-1 w-6 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-muted transition-colors"
      :class="segments[6] ? 'bg-primary shadow-[0_0_6px] shadow-primary/70' : ''"
    />
    <span
      class="absolute bottom-1 left-0 h-6 w-1 rounded-sm bg-muted transition-colors"
      :class="segments[4] ? 'bg-primary shadow-[0_0_6px] shadow-primary/70' : ''"
    />
    <span
      class="absolute bottom-1 right-0 h-6 w-1 rounded-sm bg-muted transition-colors"
      :class="segments[2] ? 'bg-primary shadow-[0_0_6px] shadow-primary/70' : ''"
    />
    <span
      class="absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-sm bg-muted transition-colors"
      :class="segments[3] ? 'bg-primary shadow-[0_0_6px] shadow-primary/70' : ''"
    />
  </div>
</template>
