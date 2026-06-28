<script setup lang="ts">
const { status, error, connect, disconnect } = useMidiBridge()

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
  switch (status.value) {
    case 'connected':
      return 'Bridge connected'
    case 'connecting':
      return 'Connecting…'
    case 'error':
      return 'Connection error'
    default:
      return 'Disconnected'
  }
})

onMounted(() => {
  connect()
})
</script>

<template>
  <UBadge
    :color="statusColor"
    variant="subtle"
    class="capitalize"
  >
    {{ statusLabel }}
  </UBadge>

  <UTooltip
    v-if="error"
    :text="error"
  >
    <UButton
      icon="i-lucide-refresh-cw"
      color="error"
      variant="ghost"
      size="xs"
      aria-label="Retry connection"
      @click="disconnect(); connect()"
    />
  </UTooltip>
</template>
