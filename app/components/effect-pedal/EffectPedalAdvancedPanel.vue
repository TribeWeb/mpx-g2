<script setup lang="ts">
import type { EffectPedalParam } from '#shared/types/effect-pedal'

defineProps<{
  modelName: string
  effectName: string
  description: string
  advancedParams: EffectPedalParam[]
  paramValues: Record<string, number>
  disabled: boolean
  compact?: boolean
  descriptionPosition?: 'top' | 'bottom' | 'none'
  wheelScrollPassthrough?: boolean
  accentColor?: string
}>()

const emit = defineEmits<{
  'update:param': [id: string, value: number]
}>()

function paramValue(paramValues: Record<string, number>, id: string) {
  return paramValues[id] ?? 0
}
</script>

<template>
  <div
    class="effect-pedal-advanced flex min-h-0 flex-col"
    :class="descriptionPosition === 'bottom' ? 'h-full' : ''"
  >
    <p
      v-if="descriptionPosition === 'top'"
      class="text-muted"
      :class="compact ? 'mb-3 text-[0.65rem] leading-snug' : 'mb-4 text-sm'"
    >
      {{ description }}
    </p>
    <div
      class="grid gap-4"
      :class="[
        compact ? 'grid-cols-2' : 'grid-cols-2 gap-6 sm:grid-cols-2',
        descriptionPosition === 'bottom' ? 'min-h-0 flex-1' : ''
      ]"
    >
      <EffectPedalParamKnob
        v-for="param in advancedParams"
        :key="param.id"
        :param="param"
        :model-value="paramValue(paramValues, param.id)"
        label-style="lcd"
        :disabled="disabled"
        size="sm"
        :compact="compact"
        :wheel-scroll-passthrough="wheelScrollPassthrough"
        :accent-color="accentColor"
        @update:model-value="emit('update:param', param.id, $event)"
      />
    </div>
    <p
      v-if="descriptionPosition === 'bottom'"
      class="shrink-0 border-t border-default pt-3 text-[0.65rem] leading-snug text-muted"
    >
      {{ description }}
    </p>
  </div>
</template>
