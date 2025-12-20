import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import type { GardenController } from '../controllers/garden.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  AddPlantInputSchema,
  AddPlantResponseSchema,
  ErrorSchema,
  GardenIdParamSchema,
  GardenWeatherResponseSchema,
  GetUserPlantsResponseSchema,
  NearbyGardensQuerySchema,
  NearbyGardensResponseSchema,
} from '../schemas/garden.schema.js'

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
        query: NearbyGardensQuerySchema,
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: NearbyGardensResponseSchema,
            },
          },
          description: 'List of nearby gardens found',
        },
        400: {
          description: 'Bad Request',
        },
        401: {
          description: 'Unauthorized',
        },
        500: {
          description: 'Internal Server Error',
        },
      },
    }),
    controller.getNearby,
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
        params: GardenIdParamSchema,
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: GardenWeatherResponseSchema,
            },
          },
          description: 'Weather data retrieved successfully',
        },
        401: {
          description: 'Unauthorized',
        },
        404: {
          description: 'Garden not found',
        },
        500: {
          description: 'Internal Server Error',
        },
      },
    }),
    controller.getWeather,
  )

  // POST /plants - Add plant to garden
  app.openapi(
    createRoute({
      method: 'post',
      path: '/plants',
      tags: ['Gardens'],
      summary: 'Add plant to garden',
      description: 'Add a new plant to a specific garden. Requires authentication.',
      request: {
        body: {
          content: {
            'application/json': {
              schema: AddPlantInputSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        201: {
          content: {
            'application/json': {
              schema: AddPlantResponseSchema,
            },
          },
          description: 'Plant added successfully',
        },
        400: {
          description: 'Bad Request - Invalid input data',
          content: { 'application/json': { schema: ErrorSchema } },
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
        404: {
          description: 'Garden not found',
          content: { 'application/json': { schema: ErrorSchema } },
        },
        500: {
          description: 'Internal Server Error',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    }),
    controller.addPlant,
  )

  // GET /plants - Get user's plants
  app.openapi(
    createRoute({
      method: 'get',
      path: '/plants',
      tags: ['Gardens'],
      summary: 'Get user plants',
      description:
        'Retrieve all plants belonging to the authenticated user across all their gardens.',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: GetUserPlantsResponseSchema,
            },
          },
          description: 'Plants retrieved successfully',
        },
        401: {
          description: 'Unauthorized',
          content: { 'application/json': { schema: ErrorSchema } },
        },
        500: {
          description: 'Internal Server Error',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      },
    }),
    controller.getPlants,
  )

  return app
}
