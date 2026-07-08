<script setup lang="ts">
import type { FrontPanelButtonName } from '#shared/types/midi'

const { panelState, status, deviceMode, pressButton, releaseButton, rotateEncoder } = useMidiConnection()

const displayLines = computed(() => {
  const chars = panelState.value.display.characters
  return [chars.slice(0, 16).join('').trimEnd(), chars.slice(16, 32).join('').trimEnd()]
})

const effectButtons: Array<{ name: FrontPanelButtonName, label: string }> = [
  { name: 'gain', label: 'Gain' },
  { name: 'fx1', label: 'Effect 1' },
  { name: 'fx2', label: 'Effect 2' },
  { name: 'chorus', label: 'Chorus' },
  { name: 'delay', label: 'Delay' },
  { name: 'reverb', label: 'Reverb' },
  { name: 'eq', label: 'EQ' },
  { name: 'insert', label: 'Insert' },
  { name: 'bypass', label: 'Bypass' }
]

const panelRow: Array<{ name?: FrontPanelButtonName, label: string, showLed?: boolean }> = [
  { name: 'softRow', label: 'Soft Row' },
  { name: 'option', label: 'Options' },
  { name: 'program', label: 'Program' },
  { name: 'edit', label: 'Edit' },
  { label: 'No<', showLed: false },
  { label: '>Yes', showLed: false },
  { name: 'system', label: 'System' },
  { name: 'store', label: 'Store' }
]

const disabled = computed(() => status.value !== 'connected')
const midiActive = computed(() => panelState.value.leds.buttons.midi || status.value === 'connected')

// Local knob state for visual testing (hardware MIDI later)
const inputLevel = ref(4)
const outputLevel = ref(6)
const gainLow = ref(3)
const gainMid = ref(5)
const gainHigh = ref(4)
const levelLed = ref(false)
const clipLed = ref(false)

function onIoKnobRotate() {
  levelLed.value = inputLevel.value > 2 || outputLevel.value > 2
  clipLed.value = inputLevel.value > 9 || outputLevel.value > 9
}

function onGainKnobRotate() {
  // visual-only for now
}
</script>

<template>
  <UCard variant="outline">
    <!-- Title bar -->
    <template #title>
      MPX G2 Guitar Effects Processor
    </template>
    <template #description>
      <div class="flex flex-row items-center justify-between">
        Lexicon · Virtual front panel  <span v-if="deviceMode === 'simulated'"> · simulation</span>
        <UBadge
          :color="disabled ? 'neutral' : 'success'"
          variant="subtle"
          size="sm"
        >
          {{ disabled ? 'Waiting for bridge…' : 'Ready' }}
        </UBadge>
      </div>
    </template>

    <div class="mb-4 flex min-w-[720px] flex-wrap items-stretch gap-3">
      <!-- Input / Output -->
      <PanelSection>
        <template #top>
          <span class="text-xs text-default">Level</span>
          <span class="text-xs text-default">Clip</span>
        </template>
        <template #top-lower>
          <PanelLed
            variant="round"
            :active="levelLed"
          />
          <PanelLed
            variant="round"
            color="red"
            :active="clipLed"
          />
        </template>
        <template #bottom>
          <PanelEncoder
            v-model="inputLevel"
            size="sm"
            indicator
            ticks
            :disabled="disabled"
            @rotate="onIoKnobRotate"
          />
          <PanelEncoder
            v-model="outputLevel"
            size="sm"
            indicator
            ticks
            :disabled="disabled"
            @rotate="onIoKnobRotate"
          />
        </template>
        <template #bottom-lower>
          <span class="text-xs text-default">Input / Output</span>
        </template>
      </PanelSection>

      <!-- Gain: Low / Mid / High -->
      <PanelSection>
        <template #top>
          <span class="text-xs text-default">
            ┌─── Gain ───┐
          </span>
        </template>
        <template #top-lower>
          <span class="text-xs text-default">Low</span>
          <span class="text-xs text-default">Mid</span>
          <span class="text-xs text-default">High</span>
        </template>
        <template #bottom>
          <PanelEncoder
            v-model="gainLow"
            indicator
            ticks
            size="sm"
            :disabled="disabled"
            @rotate="onGainKnobRotate"
          />
          <PanelEncoder
            v-model="gainMid"
            indicator
            ticks
            size="sm"
            :disabled="disabled"
            @rotate="onGainKnobRotate"
          />
          <PanelEncoder
            v-model="gainHigh"
            indicator
            ticks
            size="sm"
            :disabled="disabled"
            @rotate="onGainKnobRotate"
          />
        </template>
      </PanelSection>

      <!-- Aux / Clip / MIDI + 7-segment -->
      <PanelSection>
        <template #top>
          <span class="w-full text-xs text-default">Aux In<br><span class="pl-[1px]">|</span></span>
          <span class="w-full text-xs text-default">Clip<br><span class="pl-[1px]">|</span></span>
          <span class="w-full text-xs text-default">MIDI<br><span class="pl-[1px]">|</span></span>
        </template>
        <template #top-lower>
          <div class="min-w-0 flex-1 flex items-center justify-start">
            <PanelLed
              variant="round"
              size="sm"
            />
          </div>

          <div class="min-w-0 flex-1 flex items-center justify-start">
            <PanelLed
              variant="round"
              size="sm"
            />
          </div>

          <div class="min-w-0 flex-1 flex items-center justify-start">
            <PanelLed
              variant="round"
              size="sm"
              :active="midiActive"
            />
          </div>
        </template>
        <template #bottom>
          <PanelSevenSegment :value="panelState.leds.segments[0]" />
          <PanelSevenSegment :value="panelState.leds.segments[1]" />
          <PanelSevenSegment :value="panelState.leds.segments[2]" />
        </template>
      </PanelSection>

      <!-- LCD -->
      <PanelSection>
        <template #top>
          <span class="w-full text-default text-md text-center font-bold">MPX G2 Guitar Effects Processor</span>
        </template>
        <template #bottom>
          <div class="">
            <PanelDisplay
              :lines="displayLines"
              class="w-96 h-32"
            />
          </div>
        </template>
      </PanelSection>

      <!-- Tempo / A / B -->
      <PanelSection>
        <template #top-lower>
          <div class="flex flex-row items-center gap-x-2 gap-y-4">
            <span class="w-10 text-center text-xs text-default">Tempo</span>
            <PanelLed
              variant="bar"
              :active="panelState.leds.buttons.tempo"
            />
          </div>
          <PanelButton
            name="tap"
            label="Tap"
            variant="panel"
            :show-led="false"
            class="!min-w-[2.5rem]"
            :disabled="disabled"
            @press="pressButton"
            @release="releaseButton"
          />
        </template>
        <template #bottom>
          <div class="flex flex-col items-center gap-y-4">
            <div class="flex flex-row items-center gap-x-2">
              <span class="w-10 text-center text-xs text-default">A</span>
              <PanelLed
                variant="bar"
                :active="panelState.leds.buttons.ab"
              />
            </div>
            <div class="flex flex-row items-center gap-x-2">
              <span class="w-10 text-center text-xs text-default">B</span>
              <PanelLed
                variant="bar"
                :active="!panelState.leds.buttons.ab"
              />
            </div>
          </div>
          <PanelButton
            name="ab"
            label="A/B"
            variant="panel"
            :show-led="false"
            class="!min-w-[2.5rem]"
            :disabled="disabled"
            @press="pressButton"
            @release="releaseButton"
          />
        </template>
      </PanelSection>

      <!-- Effect buttons -->
      <PanelSection>
        <template #main>
          <div class="pt-6 grid grid-cols-3 gap-x-4 gap-y-6">
            <PanelButton
              v-for="button in effectButtons"
              :key="button.name"
              :name="button.name"
              :label="button.label"
              variant="effect"
              :active="panelState.leds.buttons[button.name]"
              :disabled="disabled"
              @press="pressButton"
              @release="releaseButton"
            />
          </div>
        </template>
        <template #bottom-lower>
          <span class="w-full pe-8 text-xs text-end text-default">Tuner</span>
        </template>
      </PanelSection>

      <!-- Data wheel -->
      <PanelSection>
        <template #main>
          <PanelEncoder
            ticks
            :disabled="disabled"
            @rotate="rotateEncoder"
          />
        </template>
      </PanelSection>

      <!-- Panel buttons -->
      <PanelSection>
        <template #main>
          <div class="pt-6 grid grid-cols-4 gap-4">
            <PanelButton
              v-for="(button, index) in panelRow"
              :key="button.name ?? `local-${index}`"
              :name="button.name"
              :label="button.label"
              variant="panel"
              :show-led="button.showLed !== false"
              :active="button.name ? panelState.leds.buttons[button.name] : false"
              :disabled="disabled"
              @press="pressButton"
              @release="releaseButton"
            />
          </div>
        </template>
      </PanelSection>
    </div>
    <!-- </div> -->
  </UCard>
</template>
