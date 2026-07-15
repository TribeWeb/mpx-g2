<script setup lang="ts">
import type { FrontPanelButtonName } from '#shared/types/midi'

export type PanelButtonVariant = 'effect' | 'panel'

const props = defineProps<{
  label: string
  name?: FrontPanelButtonName
  variant?: PanelButtonVariant
  active?: boolean
  flashing?: boolean
  disabled?: boolean
  showLed?: boolean
}>()

const emit = defineEmits<{
  press: [name: FrontPanelButtonName]
  release: [name: FrontPanelButtonName]
  click: []
}>()

const isPressed = ref(false)
const variant = computed(() => props.variant ?? 'panel')
const hasLed = computed(() => props.showLed !== false)

function onPointerDown() {
  if (props.disabled) return
  isPressed.value = true
  if (props.name) {
    emit('press', props.name)
  }
}

function onPointerUp() {
  if (!isPressed.value) return
  isPressed.value = false
  if (props.name) {
    emit('release', props.name)
  } else {
    emit('click')
  }
}
</script>

<template>
  <div class="relative flex flex-col items-center gap-1">
    <!-- <PanelLed
      v-if="variant === 'effect' && hasLed"
      variant="bar"
      :active="active"
    /> -->

    <UButton
      v-if="variant === 'panel'"
      variant="subtle"
      color="neutral"
      size="lg"
      :disabled="disabled"
      :ui="{ base: 'size-16 relative flex flex-col items-center justify-center' }"
      @pointerdown.prevent="onPointerDown"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <PanelLed
        v-if="variant === 'panel' && hasLed"
        variant="inset"
        class="absolute top-3 left-1/2 -translate-x-1/2"
        :active="active"
        :flashing="flashing"
      />
      <span class="mt-4">{{ label }}</span>
    </UButton>
    <UButton
      v-else
      variant="subtle"
      :color="active ? 'success' : 'neutral'"
      size="lg"
      :disabled="disabled"
      :ui="{ base: 'w-22 h-8 relative flex flex-col items-center justify-center' }"
      @pointerdown.prevent="onPointerDown"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <span>{{ label }}</span>
    </UButton>
  </div>
</template>
