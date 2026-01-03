import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common.validator.js'

export const createPlantSchema = z.object({
  gardenId: uuidSchema,
  speciesId: uuidSchema.optional(),
  nickname: z.string().trim().max(100).optional(),
  commonName: z.string().trim().max(150).optional(),
  scientificName: z.string().trim().max(150).optional(),
  family: z.string().trim().max(100).optional(),
  exposure: z.enum(['FULL_SUN', 'PARTIAL_SHADE', 'SHADE']).optional(),
  watering: z.string().trim().max(100).optional(),
  soilType: z.string().trim().max(100).optional(),
  flowerColor: z.string().trim().max(50).optional(),
  height: z.number().positive().optional(),
  plantedDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  acquiredDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  bloomingSeason: z.string().trim().max(100).optional(),
  plantingSeason: z.string().trim().max(100).optional(),
  careNotes: z.string().trim().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  use: z.enum(['ORNAMENTAL', 'GROUNDCOVER', 'FOOD', 'MEDICINAL', 'FRAGRANCE']).optional(),
})

export const updatePlantSchema = createPlantSchema.partial().omit({ gardenId: true })

export const searchPlantSchema = paginationSchema.extend({
  gardenId: uuidSchema.optional(),
  commonName: z.string().trim().max(150).optional(),
})
