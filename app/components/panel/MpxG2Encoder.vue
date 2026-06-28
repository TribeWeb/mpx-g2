<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  rotate: [delta: number]
}>()

const angle = ref(0)
const dragging = ref(false)
const lastY = ref(0)

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return
  dragging.value = true
  lastY.value = event.clientY
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return

  const deltaY = lastY.value - event.clientY
  if (Math.abs(deltaY) < 2) return

  const steps = Math.trunc(deltaY / 4)
  if (steps !== 0) {
    angle.value += steps * 15
    emit('rotate', steps)
    lastY.value = event.clientY
  }
}

function onPointerUp() {
  dragging.value = false
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="relative size-24 rounded-full border-4 border-default bg-elevated shadow-lg transition-transform select-none"
      :class="[
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing',
        dragging ? 'scale-95' : ''
      ]"
      :disabled="disabled"
      :style="{ transform: `rotate(${angle}deg)` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <span class="absolute inset-3 rounded-full border border-default/60" />
      <span class="absolute left-1/2 top-2 h-8 w-1 -translate-x-1/2 rounded-full bg-primary" />
      <span class="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />
    </button>
    <p class="text-xs uppercase tracking-wide text-muted">
      Data Wheel
    </p>
  </div>
</template>
