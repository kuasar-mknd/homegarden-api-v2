import { z } from '@hono/zod-openapi'

// =============================================================================
// Weather Schemas
// =============================================================================

export const WeatherConditionSchema = z.string().openapi({
  example: 'Sunny',
  description: 'Textual description of the weather condition'
})

export const WeatherDataSchema = z.object({
  temperature: z.number().openapi({ example: 22.5, description: 'Temperature in Celsius' }),
  humidity: z.number().openapi({ example: 60, description: 'Humidity percentage' }),
  windSpeed: z.number().openapi({ example: 12.5, description: 'Wind speed in km/h' }),
  precipitation: z.number().openapi({ example: 0, description: 'Precipitation in mm' }),
  conditions: WeatherConditionSchema,
  icon: z.string().openapi({ example: 'sunny', description: 'Icon identifier' })
})

export const DailyForecastSchema = z.object({
  date: z.string().openapi({ example: '2023-10-27', description: 'ISO Date string' }),
  maxTemp: z.number().openapi({ example: 25 }),
  minTemp: z.number().openapi({ example: 15 }),
  precipitation: z.number().openapi({ example: 2 }),
  conditions: WeatherConditionSchema,
  icon: z.string().openapi({ example: 'partly-cloudy' })
})

export const WeatherForecastSchema = z.object({
  daily: z.array(DailyForecastSchema)
})

export const GardenWeatherResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    current: WeatherDataSchema,
    forecast: WeatherForecastSchema
  })
})

// =============================================================================
// Nearby Gardens Schemas
// =============================================================================

export const NearbyGardensQuerySchema = z.object({
  lat: z.string().openapi({ example: '48.8566', description: 'Latitude' }),
  lng: z.string().openapi({ example: '2.3522', description: 'Longitude' }),
  radius: z.string().optional().default('10').openapi({ example: '10', description: 'Radius in km' }),
  limit: z.string().optional().default('50').openapi({ example: '20', description: 'Max number of results' })
})

export const GardenSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distanceKm: z.number().optional().openapi({ description: 'Distance from query point in km' })
})

export const GardenIdParamSchema = z.object({
  gardenId: z.string().openapi({
    param: {
      name: 'gardenId',
      in: 'path'
    },
    example: 'cjld2cjxh0000qzrmn831i7rn',
    description: 'Garden ID (CUID)'
  })
})

export const NearbyGardensResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(GardenSummarySchema)
})
