import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

const effectParam = z.object({
  id: z.string(),
  index: z.number().int().nonnegative(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  /** Pedal / demo starting value; must fall within min…max. */
  default: z.number(),
  description: z.string(),
  bytes: z.union([z.literal(1), z.literal(2)]).optional(),
  /** Display Units Type id from Object Description (MIDI appendix). */
  displayUnits: z.number().int().nonnegative().optional()
}).refine(param => param.default >= param.min && param.default <= param.max, {
  message: 'default must be within min…max',
  path: ['default']
})

const availableIn = z.object({
  gain: z.number().int().positive().optional(),
  fx1: z.number().int().positive().optional(),
  fx2: z.number().int().positive().optional(),
  chorus: z.number().int().positive().optional(),
  delay: z.number().int().positive().optional(),
  reverb: z.number().int().positive().optional(),
  eq: z.number().int().positive().optional()
})

export default defineContentConfig({
  collections: {
    effects: defineCollection({
      type: 'page',
      source: 'effects/*.md',
      schema: z.object({
        // Document identity comes from Content `path` / filename — do not add `id`
        // (reserved by Nuxt Content).
        name: z.string(),
        modelName: z.string(),
        summary: z.string(),
        /** Shared DSP steps used (of 190). Gain/Reverb dedicated paths use 0. */
        dspSteps: z.number().int().nonnegative(),
        manualSection: z.string().optional(),
        availableIn,
        /** Up to 3 character knobs on the stompbox top row (Mix/Level are always bottom). */
        softRow: z.array(z.string()).max(3),
        params: z.array(effectParam),
        /** Pedal accent colour (hex or CSS colour). */
        color: z.string().min(1)
      })
    })
  }
})
