import { z } from '@hono/zod-openapi'

const PlantUseSchema = z.enum(['ORNAMENTAL', 'GROUNDCOVER', 'FOOD', 'MEDICINAL', 'FRAGRANCE'])
const PlantExposureSchema = z.enum(['Full Sun', 'Partial Shade', 'Shade'])

export const CreatePlantSchema = z.object({
  gardenId: z.string().uuid(),
  nickname: z.string().optional(),
  commonName: z.string().optional(),
  scientificName: z.string().optional(),
  family: z.string().optional(),
  exposure: PlantExposureSchema.optional(),
  watering: z.string().optional(),
  soilType: z.string().optional(),
  flowerColor: z.string().optional(),
  height: z.number().optional(),
  plantedDate: z.string().datetime().or(z.date()).optional(),
  acquiredDate: z.string().datetime().or(z.date()).optional(),
  bloomingSeason: z.string().optional(),
  plantingSeason: z.string().optional(),
  careNotes: z.string().optional(),
  imageUrl: z.string().url().optional(),
  use: PlantUseSchema.optional(),
})

export const UpdatePlantSchema = CreatePlantSchema.partial().omit({ gardenId: true })
