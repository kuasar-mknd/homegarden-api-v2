import { z } from 'zod'

// Create Garden DTO
export const CreateGardenSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().optional(),
  climate: z.string().optional(),
  size: z.number().positive().optional(),
})

export type CreateGardenDTO = z.infer<typeof CreateGardenSchema>

// Update Garden DTO
export const UpdateGardenSchema = CreateGardenSchema.partial()

export type UpdateGardenDTO = z.infer<typeof UpdateGardenSchema>

// Garden Response DTO
export const GardenResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().nullable().optional(),
  climate: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
  userId: z.string().uuid(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export type GardenResponseDTO = z.infer<typeof GardenResponseSchema>
