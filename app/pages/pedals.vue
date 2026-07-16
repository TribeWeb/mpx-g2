<script setup lang="ts">
import { gainAdvancedParams, gainEffectForAlg } from '#shared/constants/gain-effects'
import { GAIN_PEDAL_DEMO, TUBE_SCREAMER_GREEN } from '#shared/constants/gain-pedal-demo'
import { GAIN_EQ_DISPLAY_RANGE } from '#shared/midi/control-paths'
import type { EffectPedalParam } from '#shared/types/effect-pedal'

const config = useRuntimeConfig()

const {
  panelState,
  status,
  mode,
  pressButton,
  releaseButton,
  setGainKnob
} = useMidiConnection()

useSeoMeta({
  title: `Gain pedal · ${config.public.appName}`
})

const isLive = computed(() => status.value === 'connected')

const demoEnabled = ref<boolean>(GAIN_PEDAL_DEMO.enabled)
const demoAlg = ref<number>(GAIN_PEDAL_DEMO.gainAlg)
const demoKnobs = ref({
  low: GAIN_PEDAL_DEMO.knobs.gainLow as number,
  mid: GAIN_PEDAL_DEMO.knobs.gainMid as number,
  high: GAIN_PEDAL_DEMO.knobs.gainHigh as number,
  lowRange: { ...GAIN_PEDAL_DEMO.knobs.gainLowRange },
  midRange: { ...GAIN_PEDAL_DEMO.knobs.gainMidRange },
  highRange: { ...GAIN_PEDAL_DEMO.knobs.gainHighRange }
})
const demoAdvanced = ref({
  drive: GAIN_PEDAL_DEMO.advanced.drive as number,
  tone: GAIN_PEDAL_DEMO.advanced.tone as number,
  inLvl: GAIN_PEDAL_DEMO.advanced.inLvl as number,
  level: GAIN_PEDAL_DEMO.advanced.level as number
})

const gainEnabled = computed(() =>
  isLive.value ? panelState.value.leds.buttons.gain : demoEnabled.value
)

const gainAlg = computed(() =>
  isLive.value
    ? (panelState.value.knobs?.gainAlg ?? 1)
    : demoAlg.value
)

const gainMeta = computed(() => gainEffectForAlg(gainAlg.value))

const softRowParamIds = ['lo', 'mid', 'hi'] as const

const gainParams = computed<EffectPedalParam[]>(() => {
  const knobs = panelState.value.knobs
  const lowRange = isLive.value
    ? (knobs?.gainLowRange ?? GAIN_EQ_DISPLAY_RANGE.low)
    : demoKnobs.value.lowRange
  const midRange = isLive.value
    ? (knobs?.gainMidRange ?? GAIN_EQ_DISPLAY_RANGE.mid)
    : demoKnobs.value.midRange
  const highRange = isLive.value
    ? (knobs?.gainHighRange ?? GAIN_EQ_DISPLAY_RANGE.high)
    : demoKnobs.value.highRange

  return [
    { id: 'lo', label: 'Lo', ...lowRange, step: 1 },
    { id: 'mid', label: 'Mid', ...midRange, step: 1 },
    { id: 'hi', label: 'Hi', ...highRange, step: 1 },
    ...gainAdvancedParams(gainAlg.value)
  ]
})

const gainParamValues = computed(() => {
  if (isLive.value) {
    const knobs = panelState.value.knobs
    return {
      lo: knobs?.gainLow ?? 0,
      mid: knobs?.gainMid ?? 0,
      hi: knobs?.gainHigh ?? 0,
      drive: demoAdvanced.value.drive,
      tone: demoAdvanced.value.tone,
      inLvl: demoAdvanced.value.inLvl,
      level: demoAdvanced.value.level
    }
  }

  return {
    lo: demoKnobs.value.low,
    mid: demoKnobs.value.mid,
    hi: demoKnobs.value.high,
    ...demoAdvanced.value
  }
})

const statusLabel = computed(() => {
  if (isLive.value) {
    return mode.value === 'simulated' ? 'Simulated · Gain synced' : 'Gain synced'
  }
  return 'Demo values · connect MIDI or use simulated mode to sync'
})

function clampDemo(band: 'low' | 'mid' | 'high', value: number) {
  const rangeKey = `${band}Range` as 'lowRange' | 'midRange' | 'highRange'
  const range = demoKnobs.value[rangeKey]
  return Math.min(range.max, Math.max(range.min, Math.round(value)))
}

function onGainParamUpdate(values: Record<string, number>) {
  const current = gainParamValues.value
  const lo = values.lo
  const mid = values.mid
  const hi = values.hi

  if (isLive.value) {
    if (lo !== undefined && lo !== current.lo) {
      setGainKnob('low', lo)
    }
    if (mid !== undefined && mid !== current.mid) {
      setGainKnob('mid', mid)
    }
    if (hi !== undefined && hi !== current.hi) {
      setGainKnob('high', hi)
    }
    return
  }

  if (lo !== undefined) {
    demoKnobs.value.low = clampDemo('low', lo)
  }
  if (mid !== undefined) {
    demoKnobs.value.mid = clampDemo('mid', mid)
  }
  if (hi !== undefined) {
    demoKnobs.value.high = clampDemo('high', hi)
  }
  if (values.drive !== undefined) {
    demoAdvanced.value.drive = values.drive
  }
  if (values.tone !== undefined) {
    demoAdvanced.value.tone = values.tone
  }
  if (values.inLvl !== undefined) {
    demoAdvanced.value.inLvl = values.inLvl
  }
  if (values.level !== undefined) {
    demoAdvanced.value.level = values.level
  }
}

function onGainPress() {
  if (isLive.value) {
    pressButton('gain')
    return
  }
  demoEnabled.value = true
}

function onGainRelease() {
  if (isLive.value) {
    releaseButton('gain')
    return
  }
  demoEnabled.value = !demoEnabled.value
}
</script>

<template>
  <div class="bg-neutral-950 py-8">
    <UContainer>
      <div class="mb-8 space-y-2">
        <h1 class="text-2xl font-semibold text-highlighted">
          Gain pedal
        </h1>
        <p class="max-w-2xl text-muted">
          Stompbox editor with soft-row Lo / Mid / Hi on the face. Advanced
          parameters slide out in a side wing — use the sliders icon to open.
        </p>
        <UBadge
          :color="isLive ? 'success' : 'warning'"
          variant="subtle"
        >
          {{ statusLabel }}
        </UBadge>
      </div>

      <div class="flex justify-center overflow-visible py-8">
        <EffectPedal
          effect-name="Gain"
          :model-name="gainMeta.modelName"
          :description="gainMeta.description"
          :color="TUBE_SCREAMER_GREEN"
          :params="gainParams"
          :soft-row-param-ids="[...softRowParamIds]"
          :param-values="gainParamValues"
          :enabled="gainEnabled"
          @update:param-values="onGainParamUpdate"
          @press="onGainPress"
          @release="onGainRelease"
        />
      </div>

      <p class="text-center text-sm text-muted">
        Active algorithm:
        <span class="font-medium text-default">{{ gainMeta.name }}</span>
        (index {{ gainAlg }})
      </p>
    </UContainer>
  </div>
</template>
