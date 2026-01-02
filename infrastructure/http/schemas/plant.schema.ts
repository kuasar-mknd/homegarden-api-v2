import { z } from '@hono/zod-openapi'

export const PlantCreateSchema = z.object({
  nickname: z.string().trim().min(1).max(100).openapi({
    example: 'My Tomato',
    description: 'Nickname for the plant',
  }),
  commonName: z.string().trim().max(100).optional().openapi({
    example: 'Tomato',
    description: 'Common name of the plant species',
  }),
  scientificName: z.string().trim().max(100).optional().openapi({
    example: 'Solanum lycopersicum',
    description: 'Scientific name of the plant species',
  }),
  gardenId: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the garden where the plant is located',
  }),
  plantedDate: z.string().datetime().optional().openapi({
    example: '2023-10-27T10:00:00Z',
    description: 'Date when the plant was planted',
  }),
  imageUrl: z.string().url().max(500).optional().openapi({
    example: 'https://example.com/plant.jpg',
    description: 'URL to the plant image',
  }),
})

export const PlantUpdateSchema = z.object({
  nickname: z.string().trim().min(1).max(100).optional().openapi({
    example: 'My Big Tomato',
    description: 'New nickname',
  }),
  commonName: z.string().trim().max(100).optional(),
  scientificName: z.string().trim().max(100).optional(),
  plantedDate: z.string().datetime().optional(),
  imageUrl: z.string().url().max(500).optional(),
})

export const PlantResponseSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
  commonName: z.string().nullable(),
  scientificName: z.string().nullable(),
  gardenId: z.string().uuid(),
  plantedDate: z.string().datetime().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
