<script setup lang="ts">
const props = defineProps<{
  value?: number | null
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

const segments = computed(() => {
  const digit = props.value
  if (digit == null || digit < 0 || digit > 9) {
    return Array.from({ length: 7 }, () => false)
  }
  return segmentMap[digit] ?? Array.from({ length: 7 }, () => false)
})
</script>

<template>
  <div class="h-16 w-10 flex flex-row items-center justify-center gap-[0.5px]">
    <div class="size-full basis-1/6 flex flex-col items-center justify-start gap-[0.5px]">
      <!-- f -->
      <div
        class="size-full basis-1/2 rounded-tl-sm rounded-br-sm transition-colors"
        :class="{ 'bg-success': segments[5], 'bg-elevated': !segments[5] }"
      />
      <!-- e -->
      <div
        class="size-full basis-1/2 rounded-tr-sm rounded-bl-sm transition-colors"
        :class="{ 'bg-success': segments[4], 'bg-elevated': !segments[4] }"
      />
    </div>
    <div class="size-full basis-2/3 flex flex-col items-center justify-between">
      <!-- a -->
      <div
        class="h-1/10 w-full rounded-none transition-colors"
        :class="{ 'bg-success': segments[0], 'bg-elevated': !segments[0] }"
      />
      <!-- g -->
      <div
        class="h-1/10 w-full rounded-sm transition-colors"
        :class="{ 'bg-success': segments[6], 'bg-elevated': !segments[6] }"
      />
      <!-- d -->
      <div
        class="h-1/10 w-full rounded-none transition-colors"
        :class="{ 'bg-success': segments[3], 'bg-elevated': !segments[3] }"
      />
    </div>
    <div class="size-full basis-1/6 flex flex-col items-center justify-start gap-[0.5px]">
      <!-- b -->
      <div
        class="size-full basis-1/2 rounded-tr-sm rounded-bl-sm transition-colors"
        :class="{ 'bg-success': segments[1], 'bg-elevated': !segments[1] }"
      />
      <!-- c -->
      <div
        class="size-full basis-1/2 rounded-tl-sm rounded-br-sm transition-colors"
        :class="{ 'bg-success': segments[2], 'bg-elevated': !segments[2] }"
      />
    </div>
  </div>
</template>
