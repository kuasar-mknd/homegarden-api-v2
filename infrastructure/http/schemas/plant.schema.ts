import { z } from '@hono/zod-openapi'

export const PlantIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The UUID of the plant',
  }),
})

export const CreatePlantSchema = z.object({
  nickname: z.string().trim().min(1).max(50).openapi({
    example: 'My Monstera',
    description: 'Nickname for the plant',
  }),
  commonName: z.string().trim().max(100).optional().openapi({
    example: 'Monstera Deliciosa',
    description: 'Common name of the plant species',
  }),
  scientificName: z.string().trim().max(100).optional().openapi({
    example: 'Monstera deliciosa',
    description: 'Scientific name of the plant species',
  }),
  gardenId: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the garden where the plant is located',
  }),
  plantedDate: z.string().datetime().optional().openapi({
    example: '2023-01-01T00:00:00Z',
    description: 'Date when the plant was planted',
  }),
  imageUrl: z.string().url().max(2048).optional().openapi({
    example: 'https://example.com/plant.jpg',
    description: 'URL to an image of the plant',
  }),
})

export const UpdatePlantSchema = CreatePlantSchema.partial()
