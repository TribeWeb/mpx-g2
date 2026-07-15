<script setup lang="ts">
import type { MidiConnectionMode } from '#shared/types/midi'

const open = ref(false)

const {
  mode,
  setMode,
  status,
  error,
  deviceMode,
  deviceName,
  connect,
  disconnect,
  isWebMidiSupported,
  availableInputs,
  availableOutputs,
  refreshPorts,
  midiLog,
  midiRxStats,
  midiRxPathStatus,
  remoteDetected,
  pingDevice,
  requestPanelDumps,
  clearLog
} = useMidiConnection()

const selectedInputId = ref<string | undefined>()
const selectedOutputId = ref<string | undefined>()

const statusColor = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'success'
    case 'connecting':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'neutral'
  }
})

const statusLabel = computed(() => {
  if (status.value === 'connected' && deviceMode.value === 'simulated') {
    return 'Simulated'
  }
  if (status.value === 'connected' && deviceName.value) {
    return deviceName.value
  }
  switch (status.value) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting…'
    case 'error':
      return 'MIDI error'
    default:
      return 'Disconnected'
  }
})

const modeOptions = [
  { label: 'Hardware (Chrome Web MIDI)', value: 'hardware' as MidiConnectionMode },
  { label: 'Simulated', value: 'simulated' as MidiConnectionMode }
]

const inputOptions = computed(() =>
  availableInputs.value.map(port => ({ label: port.name, value: port.id }))
)

const outputOptions = computed(() =>
  availableOutputs.value.map(port => ({ label: port.name, value: port.id }))
)

const rxSummary = computed(() => {
  const stats = midiRxStats.value
  if (stats.count === 0) {
    return 'No MIDI received yet'
  }
  const ago = stats.lastAt
    ? `${Math.round((Date.now() - stats.lastAt) / 1000)}s ago`
    : ''
  return `${stats.count} message${stats.count === 1 ? '' : 's'} received · last ${ago}`
})

watch(mode, async (value) => {
  if (value === 'hardware' && open.value) {
    await refreshPorts()
  }
})

watch(open, async (isOpen) => {
  if (isOpen && mode.value === 'hardware') {
    await refreshPorts()
  }
})

async function onConnect() {
  if (mode.value === 'hardware') {
    await connect({
      inputId: selectedInputId.value,
      outputId: selectedOutputId.value
    })
  } else {
    await connect()
  }
  // Keep modal open when RX path is unverified so troubleshooting stays visible.
  if (status.value === 'connected' && midiRxPathStatus.value === 'ok') {
    open.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge
      :color="statusColor"
      variant="subtle"
      class="max-w-[12rem] truncate capitalize"
    >
      {{ statusLabel }}
    </UBadge>

    <UButton
      icon="i-lucide-plug"
      color="neutral"
      variant="ghost"
      size="xs"
      aria-label="MIDI connection settings"
      @click="open = true"
    />

    <UModal
      v-model:open="open"
      title="MIDI Connection"
      description="Connect to your MPX-G2 via Chrome Web MIDI, or use the built-in simulator."
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Mode">
            <USelect
              :model-value="mode"
              :items="modeOptions"
              value-key="value"
              label-key="label"
              @update:model-value="setMode($event as MidiConnectionMode)"
            />
          </UFormField>

          <UAlert
            v-if="mode === 'hardware' && !isWebMidiSupported()"
            color="warning"
            icon="i-lucide-triangle-alert"
            title="Web MIDI unavailable"
            description="Use Google Chrome on desktop. Safari and Firefox do not support Web MIDI."
          />

          <template v-if="mode === 'hardware'">
            <UFormField label="MIDI output (to G2)">
              <USelect
                v-model="selectedOutputId"
                :items="outputOptions"
                value-key="value"
                label-key="label"
                placeholder="Select port → G2 MIDI In"
              />
            </UFormField>

            <UFormField label="MIDI input (from G2)">
              <USelect
                v-model="selectedInputId"
                :items="inputOptions"
                value-key="value"
                label-key="label"
                placeholder="Select port ← G2 MIDI Out"
              />
            </UFormField>

            <div class="flex gap-2">
              <UButton
                label="Re-scan ports"
                size="xs"
                color="neutral"
                variant="outline"
                @click="refreshPorts()"
              />
            </div>

            <UAlert
              color="info"
              icon="i-lucide-cable"
              title="Required wiring"
              variant="subtle"
            >
              <template #description>
                <p class="mb-2">
                  The MPX-G2 has no USB port. You need <strong>two</strong> DIN cables (or a 2-port interface):
                </p>
                <ul class="list-disc space-y-1 ps-4 text-xs">
                  <li>Computer/interface <strong>MIDI Out</strong> → G2 <strong>MIDI In</strong> (commands to G2)</li>
                  <li>G2 <strong>MIDI Out</strong> → computer/interface <strong>MIDI In</strong> (replies &amp; automation)</li>
                </ul>
                <p class="mt-2 text-xs">
                  If only one cable is connected, TX can work while RX stays at zero.
                </p>
              </template>
            </UAlert>

            <UAlert
              v-if="status === 'connected' && midiRxPathStatus === 'no_reply'"
              color="warning"
              icon="i-lucide-triangle-alert"
              title="No MIDI received from G2"
            >
              <template #description>
                <ul class="list-disc space-y-1 ps-4 text-xs">
                  <li>Confirm the G2 <strong>MIDI Out</strong> cable goes to your interface <strong>MIDI In</strong>.</li>
                  <li>Try each <strong>MIDI input</strong> port in the dropdown (interfaces often expose several).</li>
                  <li>On the G2, enable <strong>SYSTEM → MIDI → Soft Thru</strong>, then Ping — if RX jumps, the input port works but G2 Out may be uncabled.</li>
                  <li>Use macOS “Audio MIDI Setup” or MIDI Monitor to confirm the G2 sends data before debugging the browser.</li>
                </ul>
              </template>
            </UAlert>

            <div
              v-if="status === 'connected'"
              class="space-y-2 rounded-md border border-default bg-elevated p-3 text-xs"
            >
              <p>
                <span class="font-medium">RX:</span> {{ rxSummary }}
              </p>
              <p
                v-if="midiRxStats.listeningOn.length > 0"
                class="text-muted"
              >
                Listening: {{ midiRxStats.listeningOn.join(', ') }}
              </p>
              <p v-if="remoteDetected" class="text-success">
                G2 responded to SysEx (input path OK)
              </p>
              <p
                v-else-if="midiRxStats.count > 0"
                class="text-muted"
              >
                Receiving MIDI but no SysEx config reply yet — try Ping or check G2 SysEx Device ID (0).
              </p>
              <UButton
                label="Ping (SysEx config request)"
                size="xs"
                color="neutral"
                variant="outline"
                @click="pingDevice()"
              />
              <UButton
                label="Sync panel (LED + LCD)"
                size="xs"
                color="neutral"
                variant="outline"
                @click="requestPanelDumps()"
              />
            </div>
          </template>

          <UAlert
            v-if="error"
            color="error"
            icon="i-lucide-circle-alert"
            :title="error"
          />

          <div v-if="mode === 'hardware' && (midiLog.length > 0 || status === 'connected')">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-sm font-medium">
                MIDI log
              </p>
              <UButton
                label="Clear"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="clearLog()"
              />
            </div>
            <div class="max-h-48 overflow-y-auto rounded-md border border-default bg-elevated p-2 font-mono text-[0.65rem] leading-relaxed">
              <p
                v-for="(entry, index) in midiLog.slice(0, 30)"
                :key="index"
                class="mb-1 text-muted"
              >
                <span
                  :class="entry.direction === 'tx' ? 'text-primary' : 'text-info'"
                >
                  {{ entry.direction.toUpperCase() }}
                </span>
                <span
                  v-if="entry.note"
                  class="text-highlighted"
                > · {{ entry.note }}</span>
                <span
                  v-if="entry.port"
                  class="text-dimmed"
                > · {{ entry.port }}</span>
                <br>
                {{ entry.hex }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            v-if="status === 'connected'"
            label="Disconnect"
            color="neutral"
            variant="outline"
            @click="disconnect()"
          />
          <UButton
            label="Connect"
            color="primary"
            :loading="status === 'connecting'"
            @click="onConnect()"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
