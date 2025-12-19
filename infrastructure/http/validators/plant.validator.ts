import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common.validator.js'

export const createPlantSchema = z.object({
  gardenId: uuidSchema,
  speciesId: uuidSchema.optional(),
  nickname: z.string().optional(),
  commonName: z.string().optional(),
  scientificName: z.string().optional(),
  family: z.string().optional(),
  exposure: z.enum(['FULL_SUN', 'PARTIAL_SHADE', 'SHADE']).optional(),
  watering: z.string().optional(),
  soilType: z.string().optional(),
  flowerColor: z.string().optional(),
  height: z.number().positive().optional(),
  plantedDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  acquiredDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  bloomingSeason: z.string().optional(),
  plantingSeason: z.string().optional(),
  careNotes: z.string().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  use: z.enum(['ORNAMENTAL', 'GROUNDCOVER', 'FOOD', 'MEDICINAL', 'FRAGRANCE']).optional(),
})

export const updatePlantSchema = createPlantSchema.partial().omit({ gardenId: true })

export const searchPlantSchema = paginationSchema.extend({
  gardenId: uuidSchema.optional(),
  commonName: z.string().optional(),
})
