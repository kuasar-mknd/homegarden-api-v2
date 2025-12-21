import { z } from 'zod'

export const plantOrganSchema = z.enum(['flower', 'leaf', 'fruit', 'bark', 'habit'])

export const identifyPlantSchema = z.object({
  imageBase64: z.string().optional(),
  imageUrl: z.string().url().optional(),
  mimeType: z.string().optional(),
  organs: z.array(plantOrganSchema).optional(),
  maxSuggestions: z.number().int().min(1).max(10).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    country: z.string().optional(),
  }).optional(),
}).refine(data => data.imageBase64 || data.imageUrl, {
  message: "Either imageBase64 or imageUrl is required",
  path: ["imageBase64"],
})
