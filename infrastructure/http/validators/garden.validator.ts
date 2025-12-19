import { z } from 'zod'
import { paginationSchema } from './common.validator.js'

export const createGardenSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().optional(),
  size: z.number().positive().optional(),
  climate: z.string().optional(),
})

export const updateGardenSchema = createGardenSchema.partial()

export const searchGardenSchema = paginationSchema.extend({
  name: z.string().optional(),
})
