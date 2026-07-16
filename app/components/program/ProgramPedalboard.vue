<script setup lang="ts">
import {
  algorithmColorForBlockAlg,
  algorithmForBlockAlg,
  algorithmPedalParams
} from '#shared/constants/algorithms'
import {
  demoParamsForBlock,
  demoParamValuesForBlock,
  EFFECT_BLOCKS_PEDAL_ORDER,
  softRowParamIdsForBlock
} from '#shared/constants/effect-blocks'
import {
  chorusParamsForAlg,
  chorusPedalParamsFromState,
  createEmptyChorusRanges,
  createEmptyChorusValues
} from '#shared/constants/chorus-params'
import { GAIN_PEDAL_DEMO } from '#shared/constants/gain-pedal-demo'
import {
  CHORUS_PEDAL_DEMO,
  PROGRAM_PEDAL_DEMO_ALGS,
  PROGRAM_PEDAL_DEMO_ENABLED,
  PROGRAM_PEDAL_DEMO_PARAM_VALUES
} from '#shared/constants/program-pedal-demo'
import { GAIN_EQ_DISPLAY_RANGE } from '#shared/midi/control-paths'
import type { EffectBlockId } from '#shared/types/effect-blocks'
import type { EffectPedalParam } from '#shared/types/effect-pedal'

const {
  panelState,
  status,
  pressButton,
  releaseButton,
  setGainKnob,
  setChorusParam
} = useMidiConnection()

const isLive = computed(() => status.value === 'connected')

const demoAlgs = ref({ ...PROGRAM_PEDAL_DEMO_ALGS })
const demoEnabled = ref({ ...PROGRAM_PEDAL_DEMO_ENABLED })
const demoGainKnobs = ref({
  low: GAIN_PEDAL_DEMO.knobs.gainLow as number,
  mid: GAIN_PEDAL_DEMO.knobs.gainMid as number,
  high: GAIN_PEDAL_DEMO.knobs.gainHigh as number,
  lowRange: { ...GAIN_PEDAL_DEMO.knobs.gainLowRange },
  midRange: { ...GAIN_PEDAL_DEMO.knobs.gainMidRange },
  highRange: { ...GAIN_PEDAL_DEMO.knobs.gainHighRange }
})
const demoGainAdvanced = ref({
  drive: GAIN_PEDAL_DEMO.advanced.drive as number,
  tone: GAIN_PEDAL_DEMO.advanced.tone as number,
  inLvl: GAIN_PEDAL_DEMO.advanced.inLvl as number,
  level: GAIN_PEDAL_DEMO.advanced.level as number
})
const demoChorusValues = ref<Record<string, number>>({
  ...createEmptyChorusValues(),
  mix: CHORUS_PEDAL_DEMO.mix as number,
  level: CHORUS_PEDAL_DEMO.level as number,
  rate1: 2,
  pw1: 50,
  dpth1: 40,
  rate2: 3,
  pw2: 50,
  dpth2: 35,
  res1: 0,
  res2: 0
})
const demoChorusRanges = ref<Record<string, { min: number, max: number }>>({
  ...createEmptyChorusRanges(),
  mix: { ...CHORUS_PEDAL_DEMO.mixRange },
  level: { ...CHORUS_PEDAL_DEMO.levelRange }
})
const demoParamValues = ref<Record<EffectBlockId, Record<string, number>>>(
  Object.fromEntries(
    EFFECT_BLOCKS_PEDAL_ORDER.map(block => [
      block.id,
      { ...PROGRAM_PEDAL_DEMO_PARAM_VALUES, ...demoParamValuesForBlock(block.id) }
    ])
  ) as Record<EffectBlockId, Record<string, number>>
)

function blockAlg(blockId: EffectBlockId) {
  if (isLive.value) {
    const fromProgram = panelState.value.program?.algByBlock?.[blockId]
    if (fromProgram != null) {
      return fromProgram
    }
    if (blockId === 'gain') {
      return panelState.value.knobs?.gainAlg ?? 0
    }
    return 0
  }
  return demoAlgs.value[blockId]
}

function blockEnabled(blockId: EffectBlockId) {
  if (isLive.value) {
    const block = EFFECT_BLOCKS_PEDAL_ORDER.find(entry => entry.id === blockId)
    return block ? panelState.value.leds.buttons[block.panelButton] : false
  }
  return demoEnabled.value[blockId]
}

function gainParams(): EffectPedalParam[] {
  const knobs = panelState.value.knobs
  const lowRange = isLive.value
    ? (knobs?.gainLowRange ?? GAIN_EQ_DISPLAY_RANGE.low)
    : demoGainKnobs.value.lowRange
  const midRange = isLive.value
    ? (knobs?.gainMidRange ?? GAIN_EQ_DISPLAY_RANGE.mid)
    : demoGainKnobs.value.midRange
  const highRange = isLive.value
    ? (knobs?.gainHighRange ?? GAIN_EQ_DISPLAY_RANGE.high)
    : demoGainKnobs.value.highRange

  const def = algorithmForBlockAlg('gain', blockAlg('gain'))
  if (def) {
    return algorithmPedalParams(def, {
      lo: lowRange,
      mid: midRange,
      hi: highRange
    })
  }

  return [
    { id: 'lo', label: 'Lo', ...lowRange, step: 1 },
    { id: 'mid', label: 'Mid', ...midRange, step: 1 },
    { id: 'hi', label: 'Hi', ...highRange, step: 1 }
  ]
}

function chorusParams(): EffectPedalParam[] {
  const alg = blockAlg('chorus')
  const defs = chorusParamsForAlg(alg)
  const ranges = isLive.value
    ? (panelState.value.knobs?.chorusRanges ?? createEmptyChorusRanges())
    : demoChorusRanges.value
  return chorusPedalParamsFromState(defs, ranges)
}

function paramsForBlock(blockId: EffectBlockId): EffectPedalParam[] {
  if (blockId === 'gain') {
    return gainParams()
  }
  if (blockId === 'chorus') {
    return chorusParams()
  }
  return demoParamsForBlock(blockId)
}

function paramValuesForBlock(blockId: EffectBlockId): Record<string, number> {
  if (blockId === 'gain') {
    if (isLive.value) {
      const knobs = panelState.value.knobs
      return {
        lo: knobs?.gainLow ?? 0,
        mid: knobs?.gainMid ?? 0,
        hi: knobs?.gainHigh ?? 0,
        ...demoGainAdvanced.value
      }
    }
    return {
      lo: demoGainKnobs.value.low,
      mid: demoGainKnobs.value.mid,
      hi: demoGainKnobs.value.high,
      ...demoGainAdvanced.value
    }
  }
  if (blockId === 'chorus') {
    if (isLive.value) {
      const knobs = panelState.value.knobs
      const values = { ...(knobs?.chorusValues ?? {}) }
      if (values.mix == null) {
        values.mix = knobs?.chorusMix ?? 0
      }
      if (values.level == null) {
        values.level = knobs?.chorusLevel ?? 0
      }
      return values
    }
    return { ...demoChorusValues.value }
  }
  return { ...demoParamValues.value[blockId] }
}

function softRowIdsForBlock(blockId: EffectBlockId): string[] {
  return softRowParamIdsForBlock(blockId, blockAlg(blockId))
}

function pedalColor(blockId: EffectBlockId, fallback: string): string {
  return algorithmColorForBlockAlg(blockId, blockAlg(blockId), fallback)
}

function clampDemoGain(band: 'low' | 'mid' | 'high', value: number) {
  const rangeKey = `${band}Range` as 'lowRange' | 'midRange' | 'highRange'
  const range = demoGainKnobs.value[rangeKey]
  return Math.min(range.max, Math.max(range.min, Math.round(value)))
}

function clampDemoChorus(paramId: string, value: number) {
  const range = demoChorusRanges.value[paramId] ?? { min: -100, max: 100 }
  return Math.min(range.max, Math.max(range.min, Math.round(value)))
}

function onParamUpdate(blockId: EffectBlockId, values: Record<string, number>) {
  if (blockId === 'gain') {
    const current = paramValuesForBlock('gain')
    if (isLive.value) {
      if (values.lo !== undefined && values.lo !== current.lo) {
        setGainKnob('low', values.lo)
      }
      if (values.mid !== undefined && values.mid !== current.mid) {
        setGainKnob('mid', values.mid)
      }
      if (values.hi !== undefined && values.hi !== current.hi) {
        setGainKnob('high', values.hi)
      }
      return
    }

    if (values.lo !== undefined) {
      demoGainKnobs.value.low = clampDemoGain('low', values.lo)
    }
    if (values.mid !== undefined) {
      demoGainKnobs.value.mid = clampDemoGain('mid', values.mid)
    }
    if (values.hi !== undefined) {
      demoGainKnobs.value.high = clampDemoGain('high', values.hi)
    }
    if (values.drive !== undefined) {
      demoGainAdvanced.value.drive = values.drive
    }
    if (values.tone !== undefined) {
      demoGainAdvanced.value.tone = values.tone
    }
    if (values.inLvl !== undefined) {
      demoGainAdvanced.value.inLvl = values.inLvl
    }
    if (values.level !== undefined) {
      demoGainAdvanced.value.level = values.level
    }
    return
  }

  if (blockId === 'chorus') {
    const current = paramValuesForBlock('chorus')
    if (isLive.value) {
      for (const [id, value] of Object.entries(values)) {
        if (value !== undefined && value !== current[id]) {
          setChorusParam(id, value)
        }
      }
      return
    }
    for (const [id, value] of Object.entries(values)) {
      if (value !== undefined) {
        demoChorusValues.value[id] = clampDemoChorus(id, value)
      }
    }
    return
  }

  demoParamValues.value[blockId] = {
    ...demoParamValues.value[blockId],
    ...values
  }
}

function onPress(blockId: EffectBlockId) {
  const block = EFFECT_BLOCKS_PEDAL_ORDER.find(entry => entry.id === blockId)
  if (!block) {
    return
  }
  if (isLive.value) {
    pressButton(block.panelButton)
    return
  }
  demoEnabled.value[blockId] = true
}

function onRelease(blockId: EffectBlockId) {
  const block = EFFECT_BLOCKS_PEDAL_ORDER.find(entry => entry.id === blockId)
  if (!block) {
    return
  }
  if (isLive.value) {
    releaseButton(block.panelButton)
    return
  }
  demoEnabled.value[blockId] = !demoEnabled.value[blockId]
}

function blockLoaded(blockId: EffectBlockId) {
  return blockAlg(blockId) > 0
}

/** Two rows: front-of-chain (Gain…Chorus) then time/tone (Delay…EQ). */
const pedalRows = computed(() => {
  const blocks = EFFECT_BLOCKS_PEDAL_ORDER
  const split = Math.ceil(blocks.length / 2)
  return [blocks.slice(0, split), blocks.slice(split)]
})
</script>

<template>
  <div class="flex flex-col items-center gap-10 px-2 py-8">
    <div
      v-for="(row, rowIndex) in pedalRows"
      :key="rowIndex"
      class="flex flex-wrap justify-center gap-6"
    >
      <div
        v-for="block in row"
        :key="block.id"
        class="flex shrink-0 flex-col items-center gap-3"
      >
        <EffectPedal
          :effect-name="block.displayName"
          :model-name="block.metadataForAlg(blockAlg(block.id)).modelName"
          :description="block.metadataForAlg(blockAlg(block.id)).description"
          :color="pedalColor(block.id, block.color)"
          :params="paramsForBlock(block.id)"
          :soft-row-param-ids="softRowIdsForBlock(block.id)"
          :param-values="paramValuesForBlock(block.id)"
          :enabled="blockEnabled(block.id)"
          :class="!blockLoaded(block.id) ? 'opacity-45' : undefined"
          @update:param-values="onParamUpdate(block.id, $event)"
          @press="onPress(block.id)"
          @release="onRelease(block.id)"
        />
        <p class="max-w-64 text-center text-xs text-muted">
          <span class="font-medium text-default">
            {{ block.metadataForAlg(blockAlg(block.id)).name }}
          </span>
          <span v-if="blockAlg(block.id) > 0"> · alg {{ blockAlg(block.id) }}</span>
          <span v-else> · unloaded</span>
        </p>
      </div>
    </div>
  </div>
</template>
