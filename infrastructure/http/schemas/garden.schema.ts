import { z } from '@hono/zod-openapi'

// =============================================================================
// Weather Schemas
// =============================================================================

export const WeatherConditionSchema = z.string().openapi({
  example: 'Sunny',
  description: 'Textual description of the weather condition',
})

export const WeatherDataSchema = z.object({
  temperature: z.number().openapi({ example: 22.5, description: 'Temperature in Celsius' }),
  humidity: z.number().openapi({ example: 60, description: 'Humidity percentage' }),
  windSpeed: z.number().openapi({ example: 12.5, description: 'Wind speed in km/h' }),
  precipitation: z.number().openapi({ example: 0, description: 'Precipitation in mm' }),
  conditions: WeatherConditionSchema,
  icon: z.string().openapi({ example: 'sunny', description: 'Icon identifier' }),
})

export const DailyForecastSchema = z.object({
  date: z.string().openapi({ example: '2023-10-27', description: 'ISO Date string' }),
  maxTemp: z.number().openapi({ example: 25 }),
  minTemp: z.number().openapi({ example: 15 }),
  precipitation: z.number().openapi({ example: 2 }),
  conditions: WeatherConditionSchema,
  icon: z.string().openapi({ example: 'partly-cloudy' }),
})

export const WeatherForecastSchema = z.object({
  daily: z.array(DailyForecastSchema),
})

export const GardenWeatherResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    current: WeatherDataSchema,
    forecast: WeatherForecastSchema,
  }),
})

// =============================================================================
// Nearby Gardens Schemas
// =============================================================================

export const NearbyGardensQuerySchema = z.object({
  lat: z.string().openapi({ example: '48.8566', description: 'Latitude' }),
  lng: z.string().openapi({ example: '2.3522', description: 'Longitude' }),
  radius: z
    .string()
    .optional()
    .default('10')
    .openapi({ example: '10', description: 'Radius in km' }),
  limit: z
    .string()
    .optional()
    .default('50')
    .openapi({ example: '20', description: 'Max number of results' }),
})

export const GardenSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distanceKm: z.number().optional().openapi({ description: 'Distance from query point in km' }),
})

export const GardenIdParamSchema = z.object({
  gardenId: z.string().openapi({
    param: {
      name: 'gardenId',
      in: 'path',
    },
    example: 'cjld2cjxh0000qzrmn831i7rn',
    description: 'Garden ID (CUID)',
  }),
})

export const NearbyGardensResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(GardenSummarySchema),
})

// =============================================================================
// Add Plant Schemas
// =============================================================================

export const AddPlantInputSchema = z.object({
  gardenId: z.string().openapi({
    description: 'Garden ID to add the plant to',
    example: 'cjld2cjxh0000qzrmn831i7rn',
  }),
  nickname: z.string().openapi({
    description: 'Plant nickname/custom name',
    example: 'My Tomato Plant',
  }),
  commonName: z.string().optional().openapi({
    description: 'Common plant name',
    example: 'Tomato',
  }),
  scientificName: z.string().optional().openapi({
    description: 'Scientific botanical name',
    example: 'Solanum lycopersicum',
  }),
  plantedDate: z.string().optional().openapi({
    description: 'Date when the plant was planted (ISO 8601)',
    example: '2024-01-15',
  }),
})

export const PlantSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  commonName: z.string().nullable(),
  scientificName: z.string().nullable(),
  gardenId: z.string(),
  plantedDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const AddPlantResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    plant: PlantSchema,
  }),
})

// =============================================================================
// Get User Plants Schemas
// =============================================================================

export const GetUserPlantsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    plants: z.array(PlantSchema),
  }).or(z.array(PlantSchema)), // Support both formats for backward compatibility
})

// =============================================================================
// Error Schema
// =============================================================================

export const ErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({
    example: 'NOT_FOUND',
    description: 'Error code',
  }),
  message: z.string().openapi({
    example: 'Garden not found',
    description: 'Human-readable error message',
  }),
})
