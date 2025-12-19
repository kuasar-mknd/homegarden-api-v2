import { z } from 'zod'

// Create Plant DTO
export const CreatePlantSchema = z.object({
  gardenId: z.string().uuid(),
  nickname: z.string().optional(),
  speciesId: z.string().uuid().optional(),
  commonName: z.string().optional(),
  scientificName: z.string().optional(),
  family: z.string().optional(),
  exposure: z.enum(['FULL_SUN', 'PARTIAL_SHADE', 'SHADE']).optional(),
  watering: z.string().optional(),
  soilType: z.string().optional(),
  flowerColor: z.string().optional(),
  height: z.number().positive().optional(),
  plantedDate: z.string().datetime().or(z.date()).optional(), // Accept string or Date
  acquiredDate: z.string().datetime().or(z.date()).optional(),
  bloomingSeason: z.string().optional(),
  plantingSeason: z.string().optional(),
  careNotes: z.string().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  use: z.enum(['ORNAMENTAL', 'GROUNDCOVER', 'FOOD', 'MEDICINAL', 'FRAGRANCE']).optional(),
})

export type CreatePlantDTO = z.infer<typeof CreatePlantSchema>

// Update Plant DTO
export const UpdatePlantSchema = CreatePlantSchema.partial().omit({ gardenId: true })

export type UpdatePlantDTO = z.infer<typeof UpdatePlantSchema>

// Plant Response DTO
export const PlantResponseSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string().nullable().optional(),
  speciesId: z.string().uuid().nullable().optional(),
  commonName: z.string().nullable().optional(),
  scientificName: z.string().nullable().optional(),
  family: z.string().nullable().optional(),
  exposure: z.enum(['FULL_SUN', 'PARTIAL_SHADE', 'SHADE']).nullable().optional(),
  watering: z.string().nullable().optional(),
  soilType: z.string().nullable().optional(),
  flowerColor: z.string().nullable().optional(),
  height: z.number().nullable().optional(),
  plantedDate: z.date().or(z.string()).nullable().optional(),
  acquiredDate: z.date().or(z.string()).nullable().optional(),
  bloomingSeason: z.string().nullable().optional(),
  plantingSeason: z.string().nullable().optional(),
  careNotes: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  use: z
    .enum(['ORNAMENTAL', 'GROUNDCOVER', 'FOOD', 'MEDICINAL', 'FRAGRANCE'])
    .nullable()
    .optional(),
  gardenId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export type PlantResponseDTO = z.infer<typeof PlantResponseSchema>
