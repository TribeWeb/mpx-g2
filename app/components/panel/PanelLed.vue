<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: boolean
  /** G2 highlight blink — animate locally; phase need not match hardware. */
  flashing?: boolean
  color?: 'green' | 'red'
  variant?: 'bar' | 'inset' | 'round'
  size?: 'sm' | 'md'
}>(), {
  active: false,
  flashing: false,
  color: 'green',
  variant: 'bar',
  size: 'md'
})

const classes = computed(() => {
  const base = ['led']
  // Flashing = highlighted: keep the lit style and pulse via CSS.
  const off = !props.active && !props.flashing

  if (props.variant === 'inset') {
    return [...base, 'led--inset', off ? 'led--off' : '', props.flashing ? 'led--flash' : '']
  }

  if (props.variant === 'round') {
    return [
      ...base,
      props.color === 'red' ? 'led--round-red' : 'led--round-green',
      off ? 'led--off' : '',
      props.flashing ? 'led--flash' : ''
    ]
  }

  return [
    ...base,
    props.color === 'red' ? 'led--bar-red' : 'led--soft',
    off ? 'led--off' : '',
    props.flashing ? 'led--flash' : ''
  ]
})
</script>

<template>
  <span
    class="inline-block shrink-0 transition-colors duration-150"
    :class="classes"
    aria-hidden="true"
  />
</template>

<style scoped>
.led--soft {
  background: #a4cc00;
  border: 1px solid;
  border-color: #b8e000 #8aaa00 #8aaa00 #b8e000;
  border-radius: 2px;
  box-shadow: 0 0 8px rgb(164 204 0 / 0.55);
  height: 5px;
  width: 28px;
}

.led--soft.led--off {
  background: #0d0d0d;
  border-color: #222 #1a1a1a #1a1a1a #222;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 0.8);
}

.led--inset {
  background: #a4cc00;
  border: 1px solid #6a8800;
  border-radius: 1px;
  box-shadow: 0 0 6px rgb(164 204 0 / 0.7);
  height: 4px;
  width: 22px;
}

.led--inset.led--off {
  background: #0a0a0a;
  border-color: #1a1a1a;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.9);
}

.led--round-green {
  background: #a4cc00;
  border: 1px solid #c4ff00;
  border-radius: 5px;
  box-shadow: 0 0 6px rgb(164 204 0 / 0.6);
  height: 10px;
  width: 10px;
}

.led--round-red {
  background: #bb0000;
  border: 1px solid #ff0000;
  border-radius: 5px;
  box-shadow: 0 0 6px rgb(255 0 0 / 0.5);
  height: 10px;
  width: 10px;
}

.led--round-green.led--off,
.led--round-red.led--off {
  background: #333;
  border-color: #555;
  box-shadow: none;
}

.led--bar-red {
  background: #bb0000;
  border: 1px solid #ff0000;
  box-shadow: 0 0 6px rgb(255 0 0 / 0.5);
  height: 4px;
  width: 10px;
}

.led--bar-red.led--off {
  background: #1a1a1a;
  border-color: #222;
  box-shadow: none;
}

.led--flash {
  animation: led-highlight-blink 0.9s steps(1, end) infinite;
}

@keyframes led-highlight-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.12;
  }
}
</style>
