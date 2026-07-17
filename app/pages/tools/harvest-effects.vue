<script setup lang="ts">
const config = useRuntimeConfig()
const { status, mode, setMode, connect } = useMidiConnection()
const {
  harvestStatus,
  drafts,
  systemConfig,
  canDownloadRaw,
  start,
  stop,
  downloadJson,
  downloadMarkdownZipListing
} = useEffectHarvest()

useSeoMeta({
  title: `Harvest effects · ${config.public.appName}`,
  description: 'Capture MPX-G2 control tree + Object Descriptions into Content drafts.'
})

const isLiveHardware = computed(
  () => status.value === 'connected' && mode.value === 'hardware'
)

const canStart = computed(
  () => isLiveHardware.value && ['idle', 'done', 'error'].includes(harvestStatus.value.phase)
)
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8 max-w-3xl space-y-3">
      <p class="text-sm font-medium text-muted">
        Tools
      </p>
      <h1 class="text-3xl font-semibold tracking-tight">
        Harvest effects
      </h1>
      <p class="text-muted">
        Pulls precise algorithm layouts from the G2 via MIDI:
        System Configuration → Object Descriptions →
        Transmit control tree (handshake&nbsp;8), with a Program-branch walk fallback,
        then folds leaves into draft <code class="text-sm">content/effects/*.md</code> files.
        Manual prose, <code class="text-sm">dspSteps</code>, and diagrams still come from the PDF.
      </p>
    </div>

    <UAlert
      v-if="mode !== 'hardware'"
      class="mb-6 max-w-3xl"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Hardware mode required"
      description="The simulator has no control tree. Switch to hardware and connect your MPX-G2."
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
        :disabled="!canDownloadRaw"
        @click="downloadJson"
      />
      <UButton
        label="Download Markdown drafts"
        color="neutral"
        variant="outline"
        icon="i-lucide-file-text"
        :disabled="drafts.length === 0"
        @click="downloadMarkdownZipListing"
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
        <div>
          <dt class="text-muted">
            Note
          </dt>
          <dd>{{ harvestStatus.note }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            Object types
          </dt>
          <dd>
            {{ harvestStatus.descriptionsLoaded }} / {{ harvestStatus.objectTypeCount || '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            Tree nodes
          </dt>
          <dd>{{ harvestStatus.treeNodes }}</dd>
        </div>
        <div>
          <dt class="text-muted">
            Effect drafts
          </dt>
          <dd>{{ harvestStatus.effectCount }}</dd>
        </div>
        <div v-if="systemConfig" class="sm:col-span-2">
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
        <div
          v-if="harvestStatus.waitingForReady"
          class="sm:col-span-2 text-warning"
        >
          Waiting for READY after BUSY…
        </div>
      </dl>
    </UCard>

    <section
      v-if="drafts.length"
      class="max-w-4xl"
    >
      <h2 class="mb-3 text-lg font-semibold">
        Drafts ({{ drafts.length }})
      </h2>
      <ul class="divide-y divide-default border-y border-default">
        <li
          v-for="draft in drafts"
          :key="draft.slug"
          class="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
        >
          <div>
            <p class="font-medium">
              {{ draft.name }}
            </p>
            <p class="text-sm text-muted">
              <code class="text-xs">{{ draft.slug }}.md</code>
              · {{ draft.params.length }} params
              · soft row: {{ draft.softRow.join(', ') || '—' }}
            </p>
          </div>
          <p class="shrink-0 text-sm text-muted">
            <span
              v-for="(alg, block) in draft.availableIn"
              :key="block"
              class="mr-2"
            >
              {{ block }}:{{ alg }}
            </span>
          </p>
        </li>
      </ul>
      <p class="mt-4 text-sm text-muted">
        Split the downloaded Markdown into
        <code class="text-xs">content/effects/&lt;slug&gt;.md</code>,
        fill prose / <code class="text-xs">dspSteps</code> / diagrams from the manual,
        then run <code class="text-xs">pnpm run generate:algorithms</code>.
        For display-unit string tables, use
        <NuxtLink
          to="/tools/harvest-units"
          class="text-highlighted underline"
        >
          Harvest units
        </NuxtLink>.
        To capture program dumps one-at-a-time, use
        <NuxtLink
          to="/tools/harvest-programs"
          class="text-highlighted underline"
        >
          Harvest programs
        </NuxtLink>.
      </p>
    </section>
  </UContainer>
</template>
