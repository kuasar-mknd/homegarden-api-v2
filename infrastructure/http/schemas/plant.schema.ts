import { z } from '@hono/zod-openapi'

export const CreatePlantInputSchema = z.object({
  name: z.string().trim().min(1).max(100).openapi({ example: 'My Rose' }),
  species: z.string().trim().min(1).max(100).optional().openapi({ example: 'Rosa' }),
  gardenId: z.string().trim().uuid().or(z.string().cuid()).openapi({ example: 'garden_id_123' }),
  plantedDate: z.string().datetime().optional().openapi({ example: '2023-01-01T00:00:00Z' }),
})

export const UpdatePlantInputSchema = CreatePlantInputSchema.partial()

export const PlantResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    species: z.string().nullable(),
    gardenId: z.string(),
    plantedDate: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
})

export const ErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'BAD_REQUEST' }),
  message: z.string().openapi({ example: 'Invalid input' }),
})
