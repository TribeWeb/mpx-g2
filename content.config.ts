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
  path: ['default'],
  /** Whether the param can be interpolated between min and max by a controller. */
  canInterpolate: z.boolean().optional()
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

const programBlock = z.object({
  id: z.enum(['gain', 'fx1', 'fx2', 'chorus', 'delay', 'reverb', 'eq']),
  /** 1-based algorithm index in this block; 0 = unloaded. */
  alg: z.number().int().nonnegative(),
  /** content/effects slug when known. */
  effect: z.string().nullable(),
  /** Raw wire param values keyed by effect param id. */
  params: z.record(z.string(), z.number())
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
    }),
    programs: defineCollection({
      type: 'page',
      source: 'programs/*.md',
      schema: z.object({
        group: z.enum(['Amp Input + FX Loop', 'Amp Input Only', 'Stand Alone']),
        subGroup: z.enum(['Top Nineteen', 'Vintage Rig', 'Chorus Delay Rig', 'Pitch Rig', 'Tremelo + Filter FX', 'FX Collection', 'Analog Gain', 'JamMan', 'Top Ten', 'Bass FX', 'Artist/Song', 'Amp Collection', 'Studio Spaces', 'Studio FX', 'Styles', 'Live Rigs', 'Tremelo/Pitch', 'Utility']),
        /** G2 LCD program name from MIDI dump (12-char label). */
        dumpName: z.string().optional(),
        /** Loaded effect blocks + param values from program dump. */
        parameters: z.array(programBlock)
      })
    })
  }
})
