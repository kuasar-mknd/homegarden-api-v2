import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import type { GardenController } from '../controllers/garden.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { GardenWeatherResponseSchema, NearbyGardensQuerySchema, NearbyGardensResponseSchema, GardenIdParamSchema } from '../schemas/garden.schema.js'
import { z } from '@hono/zod-openapi'

export const createGardenRoutes = (controller: GardenController) => {
  const app = new OpenAPIHono()

  // Apply Auth Middleware
  app.use('*', authMiddleware)

  // GET /nearby
  app.openapi(
    createRoute({
      method: 'get',
      path: '/nearby',
      tags: ['Gardens'],
      summary: 'Find nearby gardens',
      description: 'Search for gardens within a specific radius of a geolocation.',
      request: {
        query: NearbyGardensQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: NearbyGardensResponseSchema
            }
          },
          description: 'List of nearby gardens found'
        },
        400: {
          description: 'Bad Request'
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }),
    controller.getNearby
  )

  // GET /:gardenId/weather
  app.openapi(
    createRoute({
      method: 'get',
      path: '/{gardenId}/weather',
      tags: ['Gardens'],
      summary: 'Get garden weather',
      description: 'Retrieve current weather and forecast for a specific garden.',
      request: {
        params: GardenIdParamSchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: GardenWeatherResponseSchema
            }
          },
          description: 'Weather data retrieved successfully'
        },
        401: {
          description: 'Unauthorized'
        },
        404: {
          description: 'Garden not found'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }),
    controller.getWeather
  )

  // Standard routes (not documented yet or already present)
  app.post('/plants', controller.addPlant)
  app.get('/plants', controller.getPlants)

  return app
}
