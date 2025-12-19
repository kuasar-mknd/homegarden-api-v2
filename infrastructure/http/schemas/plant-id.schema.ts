import { z } from '@hono/zod-openapi'

// Re-usable component schemas
export const PlantOrganSchema = z.enum(['leaf', 'flower', 'fruit', 'bark', 'habit']).openapi({
  example: 'leaf',
  description: 'Part of the plant visible in the image',
})

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
})

// Input Schema (Validation)
export const IdentifySpeciesInputSchema = z
  .object({
    imageBase64: z.string().optional().openapi({ description: 'Base64 image data' }),
    imageUrl: z.string().url().optional().openapi({ description: 'Public URL of the image' }),
    mimeType: z.string().optional(),
    organs: z.array(PlantOrganSchema).optional(),
    maxSuggestions: z.number().max(10).optional().default(5),
    location: LocationSchema.optional(),
  })
  .refine((data) => data.imageBase64 || data.imageUrl, {
    message: 'Either imageBase64 or imageUrl is required',
    path: ['imageBase64'],
  })

// Output Schema Components
export const SpeciesSuggestionSchema = z.object({
  confidence: z.number().min(0).max(1),
  commonName: z.string(),
  scientificName: z.string(),
  family: z.string(),
  genus: z.string().optional(),
  description: z.string().optional(),
  origin: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

export const IdentifySpeciesDataSchema = z.object({
  success: z.boolean(),
  suggestions: z.array(SpeciesSuggestionSchema),
  processingTimeMs: z.number(),
  modelUsed: z.string(),
})

// The actual response wrapper
export const IdentifySpeciesResponseSchema = z.object({
  success: z.boolean(),
  data: IdentifySpeciesDataSchema,
})

export const StatusDataSchema = z.object({
  service: z.string(),
  status: z.string(),
  message: z.string(),
})

export const StatusResponseSchema = z.object({
  success: z.boolean(),
  data: StatusDataSchema,
})

export const ErrorSchema = z.object({
  success: z.boolean().default(false),
  error: z.string(),
  message: z.string(),
})
