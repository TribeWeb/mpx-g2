<script setup lang="ts">

</script>

<template>
  <div
    class="p-2 flex flex-col items-center gap-2 border border-default rounded-md"
    :class="{ 'pt-6': $slots['top-lower'] && !$slots.top }"
  >
    <slot name="main" />
    <div
      v-if="$slots.top || $slots['top-lower']"
      class="w-full h-12 min-h-10 flex flex-col items-center justify-around gap-x-4"
    >
      <div class="w-full flex flex-row items-center justify-around gap-x-4">
        <slot name="top" />
      </div>
      <div
        v-if="$slots['top-lower']"
        class="w-full flex flex-row items-center justify-around gap-x-4"
      >
        <slot name="top-lower" />
      </div>
    </div>

    <div
      v-if="$slots.bottom"
      class="w-full h-28 flex flex-col items-center justify-around gap-x-4"
    >
      <div class="size-full flex flex-row items-center justify-around gap-x-4">
        <slot name="bottom" />
      </div>
    </div>
    <div
      v-if="$slots['bottom-lower']"
      class="w-full flex flex-row items-center justify-around gap-x-4"
    >
      <slot name="bottom-lower" />
    </div>
  </div>
</template>
