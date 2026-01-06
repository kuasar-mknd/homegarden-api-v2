import { z } from '@hono/zod-openapi'

export const CreatePlantSchema = z.object({
  gardenId: z.string().trim().uuid().or(z.string().cuid()).openapi({ example: 'garden_123' }),
  nickname: z.string().trim().min(1).max(50).openapi({ example: 'My Fern' }),
  commonName: z.string().trim().max(100).optional().openapi({ example: 'Boston Fern' }),
  scientificName: z.string().trim().max(100).optional().openapi({ example: 'Nephrolepis exaltata' }),
  plantedDate: z.string().datetime().optional().openapi({ example: '2023-01-01T00:00:00Z' }),
})

export const UpdatePlantSchema = z.object({
  nickname: z.string().trim().min(1).max(50).optional(),
  commonName: z.string().trim().max(100).optional(),
  scientificName: z.string().trim().max(100).optional(),
  plantedDate: z.string().datetime().optional(),
})
