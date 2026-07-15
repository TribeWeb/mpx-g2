<script setup lang="ts">
import type { EffectPedalParam } from '#shared/types/effect-pedal'
import { formatGainEqValue } from '#shared/midi/display-format'

const props = withDefaults(defineProps<{
  param: EffectPedalParam
  modelValue: number
  size?: 'sm' | 'lg'
  disabled?: boolean
  compact?: boolean
  /** Match the MPX-G2 LCD type (Doto, green, signed values). */
  labelStyle?: 'default' | 'lcd'
  wheelScrollPassthrough?: boolean
  accentColor?: string
}>(), {
  size: 'sm',
  disabled: false,
  compact: false,
  labelStyle: 'default',
  wheelScrollPassthrough: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const step = computed(() => props.param.step ?? 1)

const displayValue = computed(() => {
  if (props.labelStyle === 'lcd') {
    return formatGainEqValue(props.modelValue).trim()
  }

  const value = props.modelValue
  const { min, max } = props.param
  const isDb = min < 0 || max > 50
  if (isDb && (min < 0 || value < 0)) {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value} dB`
  }
  return String(value)
})

function onUpdate(value: number) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="flex flex-col items-center"
    :class="compact ? 'gap-0.5' : labelStyle === 'lcd' ? 'gap-1.5' : 'gap-1'"
  >
    <PanelEncoder
      :model-value="modelValue"
      :min="param.min"
      :max="param.max"
      :step="step"
      :size="size"
      indicator
      ticks
      :disabled="disabled"
      :wheel-scroll-passthrough="wheelScrollPassthrough"
      :accent-color="accentColor"
      @update:model-value="onUpdate"
    />
    <span
      class="text-center"
      :class="labelStyle === 'lcd'
        ? 'pedal-lcd pedal-lcd__label'
        : ['font-medium text-default', compact ? 'text-[0.6rem] leading-tight' : 'text-xs']"
    >
      {{ param.label }}
    </span>
    <span
      class="text-center tabular-nums"
      :class="labelStyle === 'lcd'
        ? 'pedal-lcd pedal-lcd__value'
        : ['font-mono text-muted', compact ? 'text-[0.55rem]' : 'text-[0.65rem]']"
    >
      {{ displayValue }}
    </span>
  </div>
</template>

<style scoped>
.pedal-lcd {
  color: #a4cc00;
  font-family: 'Doto', monospace;
  font-weight: 600;
  font-variation-settings: 'ROND' 0;
  line-height: 1;
}

.pedal-lcd__label {
  font-size: 1rem;
  letter-spacing: 0.04em;
  transform: scaleX(0.82);
}

.pedal-lcd__value {
  font-size: 1rem;
  min-width: 2.5rem;
  transform: scaleX(0.82);
}
</style>
