<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: number
  min?: number
  max?: number
  step?: number
  size?: 'sm' | 'lg'
  disabled?: boolean
  indicator?: boolean
  ticks?: boolean
  /** Let wheel events bubble so a parent scroll container can scroll. */
  wheelScrollPassthrough?: boolean
  /** Knob indicator line colour (e.g. pedal accent). */
  accentColor?: string
}>(), {
  min: 0,
  max: 11,
  step: 1,
  size: 'lg',
  disabled: false,
  indicator: false,
  ticks: false,
  wheelScrollPassthrough: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'rotate': [delta: number]
}>()

const internalAngle = ref(0)
const dragging = ref(false)
const lastY = ref(0)

const bounded = computed(() => props.modelValue !== undefined)

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return {
      gap: 'gap-1.5',
      wheel: 'size-[2.8rem]',
      inset: 'inset-[0.35rem]',
      border: 'border-2',
      indicator: 'top-[0.26rem] h-[1.05rem] w-0.5',
      tickInset: '-inset-[0.2rem]',
      buttonSize: 'sm' as const,
      stepGap: 'gap-0.5',
      stepButtonUi: { base: 'size-5 justify-center', leadingIcon: 'text-dimmed' }
    }
  }

  return {
    gap: 'gap-3',
    wheel: 'size-28',
    inset: 'inset-4',
    border: 'border-4',
    indicator: 'top-3 h-11 w-1.5',
    tickInset: '-inset-2',
    buttonSize: 'xl' as const,
    stepGap: 'gap-1',
    stepButtonUi: { base: 'size-6 justify-center', leadingIcon: 'text-dimmed' }
  }
})

// Knob sweep: min → full CCW (7 o'clock), max → full CW (5 o'clock).
// Linear in [min, max] — unipolar 0…5 puts 0 at CCW; bipolar −5…+5 puts 0 at noon.
const KNOB_MIN_ANGLE = 210
const KNOB_ANGLE_SPAN = 300

const displayAngle = computed(() => {
  if (bounded.value && props.modelValue !== undefined) {
    const min = Number(props.min)
    const max = Number(props.max)
    const value = Number(props.modelValue)
    const range = max - min
    if (!Number.isFinite(range) || range === 0) {
      return KNOB_MIN_ANGLE
    }
    const t = Math.min(1, Math.max(0, (value - min) / range))
    return KNOB_MIN_ANGLE + t * KNOB_ANGLE_SPAN
  }
  return internalAngle.value
})

function rotate(deltaSteps: number) {
  if (props.disabled || deltaSteps === 0) return

  if (bounded.value && props.modelValue !== undefined) {
    const next = Math.min(props.max, Math.max(props.min, props.modelValue + deltaSteps * props.step))
    if (next === props.modelValue) return
    const applied = (next - props.modelValue) / props.step
    emit('update:modelValue', next)
    emit('rotate', applied)
  } else {
    internalAngle.value += deltaSteps * 15
    emit('rotate', deltaSteps)
  }
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return
  dragging.value = true
  lastY.value = event.clientY
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return

  const deltaY = lastY.value - event.clientY
  if (Math.abs(deltaY) < 3) return

  const steps = Math.trunc(deltaY / 5)
  if (steps !== 0) {
    rotate(steps)
    lastY.value = event.clientY
  }
}

function onPointerUp(event: PointerEvent) {
  dragging.value = false
  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }
}

function onWheel(event: WheelEvent) {
  if (props.disabled) return
  if (props.wheelScrollPassthrough) {
    return
  }
  event.preventDefault()
  rotate(event.deltaY < 0 ? 1 : -1)
}
</script>

<template>
  <div
    class="flex flex-col items-center"
    :class="sizeClasses.gap"
  >
    <div
      class="relative"
      :class="sizeClasses.wheel"
    >
      <UButton
        color="neutral"
        variant="subtle"
        :size="sizeClasses.buttonSize"
        class="rounded-full"
        :class="[
          sizeClasses.wheel,
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing',
          dragging ? 'scale-[0.98]' : ''
        ]"
        :disabled="disabled"
        :aria-label="bounded ? 'Knob' : 'Data wheel'"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @wheel="onWheel"
      >
        <span
          class="absolute inset-0 rounded-full transition-transform"
          :style="{ transform: `rotate(${displayAngle}deg)` }"
        >
          <span
            class="absolute rounded-full border border-inverted/10"
            :class="sizeClasses.inset"
          />
          <span
            v-if="indicator"
            class="absolute left-1/2 -translate-x-1/2"
            :class="[sizeClasses.indicator, accentColor ? '' : 'bg-inverted/50']"
            :style="accentColor ? { backgroundColor: accentColor } : undefined"
          />
          <span
            v-else
            class="absolute inset-0 rounded-full border-default border-t-inverted/20"
            :class="sizeClasses.border"
          />
        </span>
      </UButton>
      <span
        v-if="ticks"
        class="pointer-events-none absolute rounded-full"
        :class="sizeClasses.tickInset"
        style="
          background: conic-gradient(
            from 210deg,
            #64748b 0deg 1.5deg, transparent 1.5deg 30deg,
            #64748b 30deg 31.5deg, transparent 31.5deg 90deg,
            #64748b 90deg 91.5deg, transparent 91.5deg 120deg,
            #64748b 120deg 121.5deg, transparent 121.5deg 150deg,
            #64748b 150deg 151.5deg, transparent 151.5deg 180deg,
            #64748b 180deg 181.5deg, transparent 181.5deg 210deg,
            #64748b 210deg 211.5deg, transparent 211.5deg 270deg,
            #64748b 270deg 271.5deg, transparent 271.5deg 300deg,
            #64748b 300deg 301.5deg, transparent 301.5deg
          );
          -webkit-mask-image: radial-gradient(circle, transparent 65%, black 66%);
          mask-image: radial-gradient(circle, transparent 65%, black 66%);
        "
      />
    </div>

    <div
      class="flex items-center justify-center"
      :class="sizeClasses.stepGap"
    >
      <UButton
        :disabled="disabled"
        color="neutral"
        variant="subtle"
        size="xs"
        icon="i-heroicons-minus"
        aria-label="Decrement"
        :ui="sizeClasses.stepButtonUi"
        @click="rotate(-1)"
      />
      <UButton
        :disabled="disabled"
        color="neutral"
        variant="subtle"
        size="xs"
        icon="i-heroicons-plus"
        aria-label="Increment"
        :ui="sizeClasses.stepButtonUi"
        @click="rotate(1)"
      />
    </div>
  </div>
</template>
