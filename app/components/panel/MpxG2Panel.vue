<script setup lang="ts">
import type { FrontPanelButtonName } from '#shared/types/midi'

const { panelState, status, pressButton, releaseButton, rotateEncoder } = useMidiBridge()

const displayLines = computed(() => {
  const chars = panelState.value.display.characters
  return [chars.slice(0, 16).join('').trimEnd(), chars.slice(16, 32).join('').trimEnd()]
})

const buttonRows: Array<Array<{ name: FrontPanelButtonName, label: string }>> = [
  [
    { name: 'gain', label: 'Gain' },
    { name: 'fx1', label: 'FX 1' },
    { name: 'fx2', label: 'FX 2' },
    { name: 'program', label: 'Program' }
  ],
  [
    { name: 'chorus', label: 'Chorus' },
    { name: 'delay', label: 'Delay' },
    { name: 'reverb', label: 'Reverb' },
    { name: 'edit', label: 'Edit' }
  ],
  [
    { name: 'eq', label: 'EQ' },
    { name: 'insert', label: 'Insert' },
    { name: 'bypass', label: 'Bypass' },
    { name: 'system', label: 'System' }
  ],
  [
    { name: 'tempo', label: 'Tempo' },
    { name: 'a', label: 'A' },
    { name: 'softRow', label: 'Soft Row' },
    { name: 'store', label: 'Store' }
  ],
  [
    { name: 'midi', label: 'MIDI' },
    { name: 'b', label: 'B' },
    { name: 'option', label: 'Option' }
  ]
]

const disabled = computed(() => status.value !== 'connected')
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold">
              Front Panel
            </h2>
            <p class="text-sm text-muted">
              Virtual replica of the MPX-G2 hardware controls
            </p>
          </div>
          <div class="flex items-center gap-3">
            <MpxG2SevenSegment :value="panelState.leds.segments[0]" />
            <MpxG2SevenSegment :value="panelState.leds.segments[1]" />
            <MpxG2SevenSegment :value="panelState.leds.segments[2]" />
          </div>
        </div>
      </template>

      <div class="grid gap-6 lg:grid-cols-[1fr_auto]">
        <div class="space-y-4">
          <MpxG2Display :lines="displayLines" />

          <div
            v-for="(row, rowIndex) in buttonRows"
            :key="rowIndex"
            class="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <MpxG2Button
              v-for="button in row"
              :key="button.name"
              :name="button.name"
              :label="button.label"
              :active="panelState.leds.buttons[button.name]"
              :disabled="disabled"
              @press="pressButton"
              @release="releaseButton"
            />
          </div>
        </div>

        <div class="flex items-start justify-center lg:pt-8">
          <MpxG2Encoder
            :disabled="disabled"
            @rotate="rotateEncoder"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
