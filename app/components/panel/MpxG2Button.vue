<script setup lang="ts">
import type { FrontPanelButtonName } from '#shared/types/midi'

const props = defineProps<{
  label: string
  name: FrontPanelButtonName
  active?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  press: [name: FrontPanelButtonName]
  release: [name: FrontPanelButtonName]
}>()

const isPressed = ref(false)

function onPointerDown() {
  if (props.disabled) return
  isPressed.value = true
  emit('press', props.name)
}

function onPointerUp() {
  if (!isPressed.value) return
  isPressed.value = false
  emit('release', props.name)
}
</script>

<template>
  <button
    type="button"
    class="relative flex min-h-14 flex-col items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors select-none"
    :class="[
      active
        ? 'border-primary bg-primary/15 text-primary'
        : 'border-default bg-elevated text-highlighted hover:bg-accented/50',
      isPressed ? 'scale-95' : '',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    ]"
    :disabled="disabled"
    @pointerdown.prevent="onPointerDown"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <span
      class="mb-2 size-2 rounded-full"
      :class="active ? 'bg-primary shadow-[0_0_8px] shadow-primary/80' : 'bg-muted'"
    />
    {{ label }}
  </button>
</template>
