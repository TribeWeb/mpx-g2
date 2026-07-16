<script setup lang="ts">
import { formatDisplayUnitRange } from '#shared/midi/display-units-format'
import { DISPLAY_UNIT_BY_ID } from '#shared/constants/units-map'
import { algorithmFaceParamIds } from '#shared/constants/algorithms'
import { EFFECT_BLOCKS_BY_ID } from '#shared/constants/effect-blocks'
import type { EffectBlockId } from '#shared/types/effect-blocks'
import type { EffectPedalParam } from '#shared/types/effect-pedal'

const config = useRuntimeConfig()
const route = useRoute()

const slug = computed(() => String(route.params.slug || ''))
const contentPath = computed(() => `/effects/${slug.value}`)

const { data: effect } = await useAsyncData(
  () => `manual-effect-${slug.value}`,
  () => queryCollection('effects').path(contentPath.value).first()
)

if (!effect.value) {
  throw createError({ statusCode: 404, statusMessage: 'Effect not found' })
}

useSeoMeta({
  title: `${effect.value.name} · ${config.public.appName}`,
  description: effect.value.summary
})

const availableBlocks = computed(() =>
  Object.entries(effect.value?.availableIn ?? {})
    .filter(([, index]) => typeof index === 'number')
    .map(([block, index]) => ({ block: block as EffectBlockId, index: index as number }))
)

const availableBlockLabel = computed(() =>
  availableBlocks.value
    .map(({ block }) => EFFECT_BLOCKS_BY_ID[block]?.displayName ?? block)
    .join(' · ')
)

const pedalParams = computed<EffectPedalParam[]>(() =>
  (effect.value?.params ?? []).map(param => ({
    id: param.id,
    label: param.label,
    min: param.min,
    max: param.max,
    step: 1
  }))
)

const faceParamIds = computed(() =>
  algorithmFaceParamIds(effect.value?.params ?? [], effect.value?.softRow ?? [])
)

function faceRole(paramId: string) {
  if (faceParamIds.value.top.includes(paramId)) {
    return 'Top'
  }
  if (faceParamIds.value.bottom.includes(paramId)) {
    return 'Bottom'
  }
  return '—'
}

function defaultsFromParams(params: { id: string, default: number }[]) {
  return Object.fromEntries(params.map(param => [param.id, param.default]))
}

const paramValues = ref<Record<string, number>>(
  defaultsFromParams(effect.value.params)
)
const pedalEnabled = ref(true)

watch(
  () => effect.value?.params,
  (params) => {
    if (params) {
      paramValues.value = defaultsFromParams(params)
      pedalEnabled.value = true
    }
  }
)

function onParamValuesUpdate(values: Record<string, number>) {
  paramValues.value = values
}

function onPedalPress() {
  pedalEnabled.value = !pedalEnabled.value
}

function paramRangeLabel(param: { min: number, max: number, displayUnits?: number | null }) {
  if (param.displayUnits == null) {
    return `${param.min}…${param.max}`
  }
  return formatDisplayUnitRange(param.displayUnits, param.min, param.max)
}

function paramUnitHint(param: { displayUnits?: number | null }) {
  if (param.displayUnits == null) {
    return null
  }
  return DISPLAY_UNIT_BY_ID.get(param.displayUnits & 0x7fff)?.name
    ?? `unit 0x${(param.displayUnits & 0x7fff).toString(16)}`
}
</script>

<template>
  <UContainer
    v-if="effect"
    class="py-10"
  >
    <div class="mb-8 max-w-3xl">
      <NuxtLink
        to="/manual/effects"
        class="text-sm text-muted hover:text-highlighted"
      >
        ← Effects
      </NuxtLink>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight">
        {{ effect.name }}
      </h1>
      <p class="mt-1 text-muted">
        {{ effect.modelName }}
        <span v-if="effect.manualSection">
          · manual §{{ effect.manualSection }}
        </span>
        · {{ effect.dspSteps }} of 190 processing steps
      </p>
      <p class="mt-4 text-pretty">
        {{ effect.summary }}
      </p>
      <img
        :src="`/effects/${slug}.png`"
        :alt="`${effect.name} signal flow`"
        class="mt-6 max-w-full rounded-md border border-default bg-white p-2"
      >
    </div>

    <div class="mb-10 grid gap-6 lg:grid-cols-[1fr_minmax(16rem,18rem)]">
      <section>
        <h2 class="text-sm font-medium uppercase tracking-wide text-muted">
          Parameters
        </h2>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full min-w-[32rem] text-left text-sm">
            <thead class="border-b border-default text-muted">
              <tr>
                <th class="py-2 pr-3 font-medium">
                  Id
                </th>
                <th class="py-2 pr-3 font-medium">
                  Index
                </th>
                <th class="py-2 pr-3 font-medium">
                  Label
                </th>
                <th class="py-2 pr-3 font-medium">
                  Range
                </th>
                <th class="py-2 pr-3 font-medium">
                  Description
                </th>
                <th class="py-2 font-medium">
                  Face
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="param in effect.params"
                :key="param.id"
                class="border-b border-default/60"
              >
                <td class="py-2 pr-3 font-mono text-xs">
                  {{ param.id }}
                </td>
                <td class="py-2 pr-3 tabular-nums">
                  {{ param.index }}
                </td>
                <td class="py-2 pr-3">
                  {{ param.label }}
                </td>
                <td class="py-2 pr-3">
                  <span class="tabular-nums">{{ paramRangeLabel(param) }}</span>
                  <span
                    v-if="paramUnitHint(param)"
                    class="mt-0.5 block text-xs text-muted"
                  >
                    {{ paramUnitHint(param) }}
                  </span>
                </td>
                <td class="py-2 pr-3 text-muted">
                  {{ param.description }}
                </td>
                <td class="py-2">
                  {{ faceRole(param.id) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="space-y-6 overflow-visible">
        <div class="flex justify-center overflow-visible py-2">
          <EffectPedal
            :effect-name="availableBlockLabel"
            :model-name="effect.name"
            :description="effect.summary"
            :color="effect.color"
            :params="pedalParams"
            :soft-row-param-ids="effect.softRow"
            :param-values="paramValues"
            :enabled="pedalEnabled"
            @update:param-values="onParamValuesUpdate"
            @press="onPedalPress"
          />
        </div>

        <section class="rounded-lg border border-default p-4">
          <h2 class="text-sm font-medium uppercase tracking-wide text-muted">
            Available in
          </h2>
          <ul class="mt-3 space-y-1 text-sm">
            <li
              v-for="entry in availableBlocks"
              :key="entry.block"
            >
              <span class="font-medium capitalize">{{ entry.block }}</span>
              · alg {{ entry.index }}
            </li>
          </ul>
        </section>
      </aside>
    </div>

    <ContentRenderer
      v-if="effect"
      :value="effect"
      class="prose prose-neutral dark:prose-invert max-w-3xl"
    />
  </UContainer>
</template>
