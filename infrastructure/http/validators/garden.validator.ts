import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common.validator.js'

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

export const nearbyGardenSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().default(10),
  limit: z.coerce.number().int().positive().default(50),
})

export const gardenIdSchema = z.object({
  gardenId: uuidSchema,
})
