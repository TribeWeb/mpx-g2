<script setup lang="ts">
import { lcdCellContent, LCD_CELL_HEIGHT, LCD_CELL_WIDTH } from '#shared/midi/lcd-charset'

/** Custom-glyph matrix: 5×7 dots; gutter is half a dot. */
const glyphCols = LCD_CELL_WIDTH
const glyphRows = LCD_CELL_HEIGHT
const gutterRatio = 0.7
/** Vertical pitch in dot-units: 7 dots + 6×½ gutters = 10. */
const heightUnits = glyphRows + (glyphRows - 1) * gutterRatio

const props = defineProps<{
  lines?: string[]
  /** 32-slot highlight mask (active / blinking parameter on G2). */
  flashing?: readonly boolean[]
}>()

const rows = computed(() => {
  const source = props.lines ?? ['', '']
  const flash = props.flashing ?? []
  return [0, 1].map((row) => {
    const text = (source[row] ?? '').padEnd(16, ' ').slice(0, 16)
    const offset = row * 16
    return Array.from({ length: 16 }, (_, i) => {
      const raw = text[i] ?? ' '
      return {
        ...lcdCellContent(raw),
        flashing: Boolean(flash[offset + i])
      }
    })
  })
})
</script>

<template>
  <div class="display border border-default rounded px-6 py-3">
    <div class="display__screen">
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="display__line"
      >
        <span
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          class="display__cell"
          :class="{
            'display__cell--flash': cell.flashing,
            'display__cell--glyph': cell.kind === 'dots'
          }"
        >
          <span
            v-if="cell.kind === 'text'"
            class="display__char"
          >{{ cell.char === ' ' ? '\u00a0' : cell.char }}</span>
          <span
            v-else
            class="display__glyph"
            aria-hidden="true"
          >
            <i
              v-for="(on, dotIndex) in cell.dots"
              :key="dotIndex"
              :class="{ 'display__dot--on': on }"
            />
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.display {
  background: linear-gradient(180deg, #0c1006, #070a04);
}

.display__screen {
  width: fit-content;
  color: #a4cc00;
  font-family: 'Doto', monospace;
  font-size: 2.2rem;
  font-weight: 600;
  font-variation-settings: 'ROND' 0;
  line-height: 1;
  transform: scaleX(0.82) scaleY(1.12);
  transform-origin: top left;
}

.display__line {
  display: flex;
  align-items: center;
  /* 1px between letters — not a gutter pair. */
  gap: 1px;
  margin-bottom: 1px;
}

.display__cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.display__char {
  display: block;
  white-space: pre;
}

/*
 * Font-tall (1em) glyph cell: 7 square dots + 6 gutters (gutter = ½ dot).
 * Width follows the same pitch for 5 dots + 4 gutters.
 */
.display__cell--glyph {
  --lcd-dot: calc(0.7em / v-bind(heightUnits));
  --lcd-gutter: calc(var(--lcd-dot) * v-bind(gutterRatio));
  width: calc(
    var(--lcd-dot) * v-bind(glyphCols)
    + var(--lcd-gutter) * (v-bind(glyphCols) - 1)
  );
  height: 1em;
}

.display__glyph {
  display: grid;
  box-sizing: border-box;
  grid-template-columns: repeat(v-bind(glyphCols), var(--lcd-dot));
  grid-template-rows: repeat(v-bind(glyphRows), var(--lcd-dot));
  gap: var(--lcd-gutter);
  width: max-content;
  height: max-content;
  image-rendering: pixelated;
}

.display__glyph i {
  display: block;
  width: var(--lcd-dot);
  height: var(--lcd-dot);
  background: transparent;
}

.display__glyph i.display__dot--on {
  background: currentColor;
}

.display__cell--flash {
  animation: lcd-highlight-blink 0.9s steps(1, end) infinite;
}

@keyframes lcd-highlight-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.15;
  }
}
</style>
