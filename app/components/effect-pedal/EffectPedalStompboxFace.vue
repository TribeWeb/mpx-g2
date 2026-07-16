<script setup lang="ts">
import type { EffectPedalParam } from '#shared/types/effect-pedal'

defineProps<{
  modelName: string
  effectName: string
  color: string
  topRowParams: EffectPedalParam[]
  bottomRowParams: EffectPedalParam[]
  paramValues: Record<string, number>
  enabled: boolean
  disabled: boolean
  hasAdvancedParams: boolean
  advancedOpen: boolean
}>()

const emit = defineEmits<{
  'update:param': [id: string, value: number]
  'press': []
  'release': []
  'toggle-advanced': []
}>()

const footswitchPressed = ref(false)

function paramValue(paramValues: Record<string, number>, id: string) {
  return paramValues[id] ?? 0
}

function onFootswitchDown() {
  footswitchPressed.value = true
  emit('press')
}

function onFootswitchUp() {
  if (!footswitchPressed.value) {
    return
  }
  footswitchPressed.value = false
  emit('release')
}
</script>

<template>
  <div class="effect-pedal-stompbox-face flex min-h-0 flex-1 flex-col">
    <div
      class="h-2 w-full shrink-0"
      :style="{ background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, white))` }"
    />

    <div class="flex items-start justify-between gap-2 px-3 pt-3 pb-1">
      <div class="min-w-0">
        <h3 class="truncate text-sm font-bold tracking-wide text-highlighted uppercase">
          {{ modelName }}
        </h3>
        <p class="truncate text-[0.65rem] text-muted uppercase">
          {{ effectName }}
        </p>
      </div>
      <UButton
        v-if="hasAdvancedParams"
        icon="i-lucide-sliders-horizontal"
        size="xs"
        color="neutral"
        :variant="advancedOpen ? 'subtle' : 'ghost'"
        :disabled="disabled"
        aria-label="Advanced parameters"
        @click="emit('toggle-advanced')"
      />
    </div>

    <div class="flex flex-1 flex-col items-center justify-end gap-3 px-2 pt-2 pb-3">
      <div
        v-if="topRowParams.length"
        class="flex w-full items-end justify-center gap-2"
      >
        <EffectPedalParamKnob
          v-for="param in topRowParams"
          :key="param.id"
          :param="param"
          :model-value="paramValue(paramValues, param.id)"
          label-style="lcd"
          compact
          :accent-color="color"
          :disabled="disabled"
          @update:model-value="emit('update:param', param.id, $event)"
        />
      </div>
      <div
        v-if="bottomRowParams.length"
        class="flex w-full items-end justify-center gap-6"
      >
        <EffectPedalParamKnob
          v-for="param in bottomRowParams"
          :key="param.id"
          :param="param"
          :model-value="paramValue(paramValues, param.id)"
          label-style="lcd"
          compact
          :accent-color="color"
          :disabled="disabled"
          @update:model-value="emit('update:param', param.id, $event)"
        />
      </div>
    </div>

    <div class="flex flex-col items-center gap-2 border-t border-default bg-neutral-950/60 px-4 py-4">
      <PanelLed
        variant="round"
        :active="enabled"
        class="effect-pedal__led"
      />
      <button
        type="button"
        class="effect-pedal__footswitch relative size-16 rounded-full border-4 border-neutral-700 bg-linear-to-b from-neutral-600 to-neutral-800 shadow-inner transition-transform select-none"
        :class="[
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95',
          footswitchPressed ? 'scale-95 from-neutral-700 to-neutral-900' : '',
          enabled ? 'effect-pedal__footswitch--on' : ''
        ]"
        :disabled="disabled"
        :aria-pressed="enabled"
        aria-label="Effect bypass"
        @pointerdown.prevent="onFootswitchDown"
        @pointerup="onFootswitchUp"
        @pointerleave="onFootswitchUp"
        @pointercancel="onFootswitchUp"
      >
        <span class="absolute inset-2 rounded-full border border-white/10 bg-neutral-800/80" />
      </button>
      <span class="text-[0.6rem] tracking-widest text-muted uppercase">
        {{ enabled ? 'On' : 'Off' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.effect-pedal__footswitch--on {
  border-color: var(--pedal-accent);
  box-shadow:
    0 0 12px var(--pedal-accent-glow),
    inset 0 2px 6px rgb(0 0 0 / 0.5);
}

.effect-pedal__led:deep(.led--round-green) {
  background: var(--pedal-accent);
  border-color: color-mix(in srgb, var(--pedal-accent) 70%, white);
  box-shadow: 0 0 8px var(--pedal-accent-glow);
}

.effect-pedal__led:deep(.led--round-green.led--off) {
  background: #0d0d0d;
  border-color: #222;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 0.8);
}
</style>
