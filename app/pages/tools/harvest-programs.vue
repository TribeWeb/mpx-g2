<script setup lang="ts">
import { FACTORY_PROGRAM_COUNT } from '#shared/midi/program-dump'

const config = useRuntimeConfig()
const { status, mode, setMode, connect } = useMidiConnection()
const {
  harvestStatus,
  dumps,
  failedNumbers,
  canDownload,
  start,
  stop,
  downloadJson,
  downloadSyxListing
} = useProgramHarvest()

useSeoMeta({
  title: `Harvest programs · ${config.public.appName}`,
  description: 'Load each MPX-G2 program then request its Active Program dump via SysEx.'
})

const rangeFrom = ref(1)
const rangeTo = ref(FACTORY_PROGRAM_COUNT)
const strategy = ref<'active' | 'stored'>('active')

const strategyItems = [
  { label: 'Load + Active dump (recommended)', value: 'active' as const },
  { label: 'Stored-path Data request', value: 'stored' as const }
]

const isLiveHardware = computed(
  () => status.value === 'connected' && mode.value === 'hardware'
)

const canStart = computed(
  () => isLiveHardware.value && ['idle', 'done', 'error'].includes(harvestStatus.value.phase)
)

const progressLabel = computed(() => {
  const total = Math.max(0, harvestStatus.value.to - harvestStatus.value.from + 1)
  if (total <= 0) {
    return '—'
  }
  return `${harvestStatus.value.received} / ${total}`
})

function onStart() {
  start(rangeFrom.value, rangeTo.value, strategy.value)
}
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 max-w-3xl space-y-3">
      <p class="text-sm font-medium text-muted">
        Tools
      </p>
      <h1 class="text-3xl font-semibold tracking-tight">
        Harvest programs
      </h1>
      <p class="text-muted">
        Default strategy: MIDI Program Change to load each program, then SysEx request of the
        <strong>Active Program</strong> dump (same payload as front-panel Current Pgm).
        Panel Auto Display / polls are quieted while running; dump TX/RX diagnostics stay visible here.
      </p>
    </div>

    <UAlert
      v-if="mode !== 'hardware'"
      class="mb-6 max-w-3xl"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Hardware mode required"
      description="Switch to hardware and connect your MPX-G2. Close MIDI Monitor so Chrome owns the input port. Set G2 MIDI Receive to the channel you use (or OMNI)."
      :actions="[{
        label: 'Use hardware',
        color: 'neutral',
        variant: 'outline',
        onClick: () => setMode('hardware')
      }]"
    />

    <UAlert
      v-else-if="status !== 'connected'"
      class="mb-6 max-w-3xl"
      color="warning"
      icon="i-lucide-unplug"
      title="Not connected"
      description="Open the connection dialog in the header and connect to the G2 first."
      :actions="[{
        label: 'Connect',
        color: 'neutral',
        variant: 'outline',
        onClick: () => connect()
      }]"
    />

    <div class="mb-6 flex flex-wrap items-end gap-4">
      <UFormField
        label="From"
        class="w-24"
      >
        <UInput
          v-model.number="rangeFrom"
          type="number"
          :min="1"
          :max="300"
          :disabled="harvestStatus.phase === 'running'"
        />
      </UFormField>
      <UFormField
        label="To"
        class="w-24"
      >
        <UInput
          v-model.number="rangeTo"
          type="number"
          :min="1"
          :max="300"
          :disabled="harvestStatus.phase === 'running'"
        />
      </UFormField>
      <UFormField label="Strategy">
        <USelect
          v-model="strategy"
          :items="strategyItems"
          class="w-72"
          :disabled="harvestStatus.phase === 'running'"
        />
      </UFormField>
      <UButton
        label="Start harvest"
        icon="i-lucide-download"
        :disabled="!canStart"
        @click="onStart"
      />
      <UButton
        label="Stop"
        color="neutral"
        variant="outline"
        :disabled="harvestStatus.phase !== 'running'"
        @click="stop()"
      />
      <UButton
        label="Download JSON"
        color="neutral"
        variant="outline"
        icon="i-lucide-file-json"
        :disabled="!canDownload"
        @click="downloadJson"
      />
      <UButton
        label="Download hex listing"
        color="neutral"
        variant="outline"
        icon="i-lucide-file-code"
        :disabled="!canDownload"
        @click="downloadSyxListing"
      />
    </div>

    <div class="mb-8 flex flex-wrap gap-2">
      <UButton
        label="1–3 (smoke)"
        size="xs"
        color="neutral"
        variant="soft"
        :disabled="!canStart"
        @click="() => { rangeFrom = 1; rangeTo = 3; start(1, 3, strategy) }"
      />
      <UButton
        label="1–250 factory"
        size="xs"
        color="neutral"
        variant="soft"
        :disabled="!canStart"
        @click="() => { rangeFrom = 1; rangeTo = 250; start(1, 250, strategy) }"
      />
      <UButton
        label="251–300 user"
        size="xs"
        color="neutral"
        variant="soft"
        :disabled="!canStart"
        @click="() => { rangeFrom = 251; rangeTo = 300; start(251, 300, strategy) }"
      />
    </div>

    <UCard class="mb-8 max-w-3xl">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold">
            Status
          </h2>
          <UBadge
            :color="harvestStatus.phase === 'error'
              ? 'error'
              : harvestStatus.phase === 'done'
                ? 'success'
                : 'neutral'"
            variant="subtle"
          >
            {{ harvestStatus.phase }}
          </UBadge>
        </div>
      </template>

      <dl class="grid gap-2 text-sm sm:grid-cols-2">
        <div class="sm:col-span-2">
          <dt class="text-muted">
            Note
          </dt>
          <dd>{{ harvestStatus.note }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            Progress
          </dt>
          <dd>{{ progressLabel }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            Current
          </dt>
          <dd>{{ harvestStatus.current ?? '—' }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            Strategy
          </dt>
          <dd>{{ harvestStatus.strategy }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            Retries
          </dt>
          <dd>{{ harvestStatus.retries }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            RX during harvest
          </dt>
          <dd>{{ harvestStatus.rxCount }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-muted">
            Last RX
          </dt>
          <dd class="font-mono text-xs">
            {{ harvestStatus.lastRxNote ?? '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            Failed
          </dt>
          <dd>
            {{ harvestStatus.failed }}
            <span
              v-if="failedNumbers.length"
              class="text-muted"
            >({{ failedNumbers.join(', ') }})</span>
          </dd>
        </div>
        <div
          v-if="harvestStatus.error"
          class="sm:col-span-2 text-error"
        >
          {{ harvestStatus.error }}
        </div>
      </dl>
    </UCard>

    <section
      v-if="dumps.length > 0"
      class="max-w-3xl"
    >
      <h2 class="mb-3 font-semibold">
        Received ({{ dumps.length }})
      </h2>
      <ul class="space-y-4">
        <li
          v-for="dump in dumps"
          :key="dump.programNumber"
          class="rounded-md border border-default px-3 py-3 text-sm"
        >
          <div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span class="font-mono text-muted">{{ String(dump.programNumber).padStart(3, '0') }}</span>
              <span class="ml-2 font-medium">{{ dump.name || '—' }}</span>
            </div>
            <p class="font-mono text-xs text-muted">
              {{ dump.byteCount }} B
            </p>
          </div>
          <ul class="space-y-2">
            <li
              v-for="block in dump.blocks.filter(b => b.alg > 0)"
              :key="block.id"
              class="rounded bg-elevated/60 px-2 py-1.5"
            >
              <p class="font-mono text-xs">
                <span class="text-muted">{{ block.id }}</span>
                · {{ block.effect ?? `alg ${block.alg}` }}
                <span class="text-muted">({{ block.alg }})</span>
              </p>
              <p
                v-if="Object.keys(block.params).length"
                class="mt-0.5 font-mono text-[0.65rem] leading-relaxed text-muted"
              >
                <span
                  v-for="(value, id) in block.params"
                  :key="id"
                  class="mr-2"
                >{{ id }}={{ value }}</span>
              </p>
            </li>
          </ul>
        </li>
      </ul>
      <p class="mt-4 text-sm text-muted">
        Download JSON includes full <code class="text-xs">blocks[].params</code> for
        <code class="text-xs">content/programs/*.md</code>.
        Related:
        <NuxtLink
          to="/tools/harvest-effects"
          class="text-highlighted underline"
        >
          Harvest effects
        </NuxtLink>.
      </p>
    </section>
  </UContainer>
</template>
