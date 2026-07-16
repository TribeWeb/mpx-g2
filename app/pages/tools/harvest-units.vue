<script setup lang="ts">
const config = useRuntimeConfig()
const { status, mode, setMode, connect } = useMidiConnection()
const {
  harvestStatus,
  systemConfig,
  tables,
  jobs,
  canDownload,
  start,
  stop,
  downloadJson
} = useUnitsHarvest()

useSeoMeta({
  title: `Harvest units · ${config.public.appName}`,
  description: 'Capture MPX-G2 Formatted String tables for display units.'
})

const isLiveHardware = computed(
  () => status.value === 'connected' && mode.value === 'hardware'
)

const canStart = computed(
  () => isLiveHardware.value && ['idle', 'done', 'error'].includes(harvestStatus.value.phase)
)

const filledTables = computed(
  () => tables.value.filter(t => t.samples.length > 0)
)
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 max-w-3xl space-y-3">
      <p class="text-sm font-medium text-muted">
        Tools
      </p>
      <h1 class="text-3xl font-semibold tracking-tight">
        Harvest units
      </h1>
      <p class="text-muted">
        Loads each algorithm from
        <code class="text-sm">content/effects</code>,
        reads Object Descriptions to find string-backed display units,
        then sweeps Formatted String labels for each table found.
        Effect-param tables only — Setup/System enums need a separate pass.
        Download JSON, then:
        <code class="text-sm">pnpm run generate:units-strings -- ~/Downloads/mpx-g2-units-harvest.json</code>.
      </p>
      <p class="text-sm text-muted">
        Control Sources are seeded from the MIDI PDF (not swept — too large).
        Numeric units (% , Hz, dB…) are formatted in code without a table dump.
        Hard-refresh this page before re-running so harvest fixes are loaded.
      </p>
    </div>

    <UAlert
      v-if="mode !== 'hardware'"
      class="mb-6 max-w-3xl"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Hardware mode required"
      description="The simulator has no Formatted String tables. Switch to hardware and connect your MPX-G2."
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

    <div class="mb-8 flex flex-wrap items-center gap-3">
      <UButton
        label="Start harvest"
        icon="i-lucide-download"
        :disabled="!canStart"
        @click="start"
      />
      <UButton
        label="Stop"
        color="neutral"
        variant="outline"
        :disabled="harvestStatus.phase === 'idle' || harvestStatus.phase === 'done'"
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
            Catalog probes
          </dt>
          <dd>
            {{ harvestStatus.probesDone }} / {{ harvestStatus.probesTotal || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            String tables found
          </dt>
          <dd>
            {{ harvestStatus.tablesFound }} / {{ harvestStatus.tablesTarget || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            Object Descriptions
          </dt>
          <dd>{{ harvestStatus.descriptionsLoaded }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            Sweep jobs
          </dt>
          <dd>
            {{ harvestStatus.jobsDone }} / {{ harvestStatus.jobCount || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            Samples
          </dt>
          <dd>{{ harvestStatus.samplesCaptured }}</dd>
        </div>
        <div
          v-if="systemConfig"
          class="sm:col-span-2"
        >
          <dt class="text-muted">
            Firmware
          </dt>
          <dd>
            v{{ systemConfig.majorVersion }}.{{ systemConfig.minorVersion }}
            · {{ systemConfig.buildDate }} {{ systemConfig.buildTime }}
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
      v-if="jobs.length"
      class="mb-10 max-w-4xl"
    >
      <h2 class="mb-3 text-lg font-semibold">
        Planned jobs ({{ jobs.length }})
      </h2>
      <ul class="divide-y divide-default border-y border-default text-sm">
        <li
          v-for="job in jobs"
          :key="job.stringTable"
          class="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"
        >
          <div>
            <code class="text-xs">{{ job.stringTable }}</code>
            <span class="text-muted">
              · {{ job.paramName }} · {{ job.min }}…{{ job.max }}
            </span>
          </div>
          <span class="text-muted tabular-nums">
            unit 0x{{ job.displayUnits.toString(16) }}
          </span>
        </li>
      </ul>
    </section>

    <section
      v-if="filledTables.length"
      class="max-w-4xl"
    >
      <h2 class="mb-3 text-lg font-semibold">
        Captured tables ({{ filledTables.length }})
      </h2>
      <div
        v-for="table in filledTables"
        :key="table.stringTable"
        class="mb-6"
      >
        <h3 class="font-medium">
          <code class="text-sm">{{ table.stringTable }}</code>
          <span class="ml-2 text-sm text-muted">
            {{ table.samples.length }} labels · {{ table.paramName }}
          </span>
        </h3>
        <p class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          <span
            v-for="sample in table.samples"
            :key="sample.value"
          >
            <span class="tabular-nums">{{ sample.value }}</span>=<span class="text-default">{{ sample.text }}</span>
          </span>
        </p>
      </div>
      <p class="mt-4 text-sm text-muted">
        After download, run
        <code class="text-xs">pnpm run generate:units-strings -- ~/Downloads/mpx-g2-units-harvest.json</code>
        then commit
        <code class="text-xs">shared/constants/units-strings.generated.ts</code>.
        Re-harvest effects (or hand-edit) to add
        <code class="text-xs">displayUnits</code> on content params for docs ranges.
      </p>
    </section>
  </UContainer>
</template>
