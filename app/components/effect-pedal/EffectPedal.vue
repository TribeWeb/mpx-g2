<script setup lang="ts">
import { algorithmFaceParamIds } from '#shared/constants/algorithms'
import type { EffectPedalParam } from '#shared/types/effect-pedal'

const props = withDefaults(defineProps<{
  effectName: string
  modelName: string
  description: string
  /** Accent colour (hex or CSS colour) used for borders, LEDs and highlights. */
  color: string
  params: EffectPedalParam[]
  /** Character knobs for the top row (≤3). Mix/Level are placed on the bottom automatically. */
  softRowParamIds: string[]
  paramValues: Record<string, number>
  enabled?: boolean
  disabled?: boolean
}>(), {
  enabled: false,
  disabled: false
})

const emit = defineEmits<{
  'update:paramValues': [values: Record<string, number>]
  'press': []
  'release': []
}>()

const advancedOpen = ref(false)

const faceIds = computed(() =>
  algorithmFaceParamIds(props.params, props.softRowParamIds)
)

function paramsByIds(ids: string[]) {
  return ids
    .map(id => props.params.find(param => param.id === id))
    .filter((param): param is EffectPedalParam => Boolean(param))
}

const topRowParams = computed(() => paramsByIds(faceIds.value.top))
const bottomRowParams = computed(() => paramsByIds(faceIds.value.bottom))

const advancedParams = computed(() => {
  const onFace = new Set(faceIds.value.all)
  return props.params.filter(param => !onFace.has(param.id))
})

const hasAdvancedParams = computed(() => advancedParams.value.length > 0)

const pedalStyle = computed(() => ({
  '--pedal-accent': props.color,
  '--pedal-accent-soft': `color-mix(in srgb, ${props.color} 28%, transparent)`,
  '--pedal-accent-glow': `color-mix(in srgb, ${props.color} 55%, transparent)`
}))

function updateParam(id: string, value: number) {
  emit('update:paramValues', { ...props.paramValues, [id]: value })
}

function toggleAdvanced() {
  if (!hasAdvancedParams.value || props.disabled) {
    return
  }
  const opening = !advancedOpen.value
  advancedOpen.value = opening
  if (opening) {
    nextTick(updateWingPlacement)
  }
}

const WING_WIDTH_PX = 208 // w-52
const WING_BEHIND_OVERLAP_PX = 16

const wingPedalRef = ref<HTMLElement | null>(null)
const wingPedalHeight = ref<number | null>(null)
const wingPlacement = ref<'right' | 'left'>('right')

let wingResizeObserver: ResizeObserver | null = null

function syncWingPedalHeight() {
  wingPedalHeight.value = wingPedalRef.value?.offsetHeight ?? null
}

function updateWingPlacement() {
  const el = wingPedalRef.value
  if (!el) {
    return
  }
  const rect = el.getBoundingClientRect()
  const spaceRight = window.innerWidth - rect.right + WING_BEHIND_OVERLAP_PX
  const spaceLeft = rect.left + WING_BEHIND_OVERLAP_PX
  wingPlacement.value = spaceRight < WING_WIDTH_PX && spaceLeft > spaceRight
    ? 'left'
    : 'right'
}

function onWingViewportChange() {
  if (advancedOpen.value) {
    updateWingPlacement()
  }
}

const wingTransform = computed(() => {
  if (advancedOpen.value) {
    return 'translateX(0)'
  }
  if (wingPlacement.value === 'right') {
    return `translateX(calc(-100% + ${WING_BEHIND_OVERLAP_PX}px))`
  }
  return `translateX(calc(100% - ${WING_BEHIND_OVERLAP_PX}px))`
})

const wingAsideStyle = computed(() => ({
  height: wingPedalHeight.value ? `${wingPedalHeight.value}px` : undefined,
  transform: wingTransform.value,
  ...(wingPlacement.value === 'right'
    ? { left: `calc(100% - ${WING_BEHIND_OVERLAP_PX}px)` }
    : { right: `calc(100% - ${WING_BEHIND_OVERLAP_PX}px)` })
}))

function onWingWheel(event: WheelEvent) {
  if (!advancedOpen.value) {
    return
  }
  const el = event.currentTarget as HTMLElement
  if (el.scrollHeight <= el.clientHeight) {
    return
  }
  event.preventDefault()
  el.scrollTop += event.deltaY
}

onMounted(() => {
  syncWingPedalHeight()
  if (wingPedalRef.value) {
    wingResizeObserver = new ResizeObserver(() => syncWingPedalHeight())
    wingResizeObserver.observe(wingPedalRef.value)
  }
  window.addEventListener('resize', onWingViewportChange)
  window.addEventListener('scroll', onWingViewportChange, true)
})

onUnmounted(() => {
  wingResizeObserver?.disconnect()
  window.removeEventListener('resize', onWingViewportChange)
  window.removeEventListener('scroll', onWingViewportChange, true)
})
</script>

<template>
  <div
    class="effect-pedal-unit effect-pedal-unit--wing relative w-64"
    :class="advancedOpen ? 'z-30' : 'z-0'"
    :style="pedalStyle"
  >
    <article
      ref="wingPedalRef"
      class="effect-pedal effect-pedal--stompbox relative z-20 flex w-64 flex-col overflow-hidden rounded-xl border-2 border-default bg-neutral-900 shadow-xl"
    >
      <EffectPedalStompboxFace
        :model-name="modelName"
        :effect-name="effectName"
        :color="color"
        :top-row-params="topRowParams"
        :bottom-row-params="bottomRowParams"
        :param-values="paramValues"
        :enabled="enabled"
        :disabled="disabled"
        :has-advanced-params="hasAdvancedParams"
        :advanced-open="advancedOpen"
        @update:param="updateParam"
        @press="emit('press')"
        @release="emit('release')"
        @toggle-advanced="toggleAdvanced"
      />
    </article>

    <aside
      v-if="hasAdvancedParams"
      class="effect-pedal-wing absolute top-0 z-10 w-52 overflow-x-hidden overflow-y-auto overscroll-y-contain border-2 border-default bg-neutral-900 shadow-xl"
      :class="[
        advancedOpen ? 'pointer-events-auto effect-pedal-wing--open' : 'pointer-events-none',
        wingPlacement === 'right' ? 'rounded-r-xl' : 'rounded-l-xl effect-pedal-wing--left'
      ]"
      :style="wingAsideStyle"
      :aria-hidden="!advancedOpen"
      :tabindex="advancedOpen ? 0 : -1"
      @wheel="onWingWheel"
    >
      <div
        class="h-2 w-full shrink-0"
        :style="wingPlacement === 'right'
          ? { background: `linear-gradient(90deg, color-mix(in srgb, ${color} 40%, #171717), ${color})` }
          : { background: `linear-gradient(270deg, color-mix(in srgb, ${color} 40%, #171717), ${color})` }"
      />
      <div
        class="border-b border-default py-2"
        :class="wingPlacement === 'right' ? 'pl-5 pr-3' : 'pr-5 pl-3'"
      >
        <p class="truncate text-[0.6rem] font-bold tracking-wide text-highlighted uppercase">
          {{ modelName }}
        </p>
        <p class="truncate text-[0.55rem] text-muted">
          {{ effectName }} · advanced
        </p>
      </div>
      <div
        class="py-3"
        :class="wingPlacement === 'right' ? 'pl-5 pr-3' : 'pr-5 pl-3'"
      >
        <EffectPedalAdvancedPanel
          :model-name="modelName"
          :effect-name="effectName"
          :description="description"
          :advanced-params="advancedParams"
          :param-values="paramValues"
          :disabled="disabled"
          :accent-color="color"
          compact
          description-position="none"
          wheel-scroll-passthrough
          @update:param="updateParam"
        />
      </div>
      <p
        class="border-t border-default pt-3 pb-4 text-[0.65rem] leading-snug text-muted"
        :class="wingPlacement === 'right' ? 'pl-5 pr-3' : 'pr-5 pl-3'"
      >
        {{ description }}
      </p>
    </aside>
  </div>
</template>

<style scoped>
.effect-pedal-wing {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.effect-pedal-wing--open {
  box-shadow:
    12px 8px 24px rgb(0 0 0 / 0.35),
    inset -2px 0 6px color-mix(in srgb, var(--pedal-accent) 8%, transparent);
}

.effect-pedal-wing--open.effect-pedal-wing--left {
  box-shadow:
    -12px 8px 24px rgb(0 0 0 / 0.35),
    inset 2px 0 6px color-mix(in srgb, var(--pedal-accent) 8%, transparent);
}
</style>
