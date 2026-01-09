import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { PlantController } from '../controllers/plant.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  CreatePlantInputSchema,
  ErrorSchema,
  PlantResponseSchema,
  UpdatePlantInputSchema,
} from '../schemas/plant.schema.js'

export const createPlantRoutes = (controller: PlantController) => {
  const app = new OpenAPIHono()

  app.use('*', authMiddleware)

  // GET /
  app.openapi(
    createRoute({
      method: 'get',
      path: '/',
      tags: ['Plants'],
      summary: 'List plants',
      description: 'List all plants for the user',
      responses: {
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.listPlants,
  )

  // POST /
  app.openapi(
    createRoute({
      method: 'post',
      path: '/',
      tags: ['Plants'],
      summary: 'Create plant',
      description: 'Create a new plant',
      request: {
        body: {
          content: {
            'application/json': {
              schema: CreatePlantInputSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        201: {
          content: {
            'application/json': {
              schema: PlantResponseSchema,
            },
          },
          description: 'Plant created',
        },
        400: {
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
          description: 'Validation Error',
        },
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.createPlant,
  )

  // GET /:id
  app.openapi(
    createRoute({
      method: 'get',
      path: '/{id}',
      tags: ['Plants'],
      summary: 'Get plant',
      description: 'Get plant details by ID',
      request: {
        params: z.object({
          id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
      },
      responses: {
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.getPlant,
  )

  // PATCH /:id
  app.openapi(
    createRoute({
      method: 'patch',
      path: '/{id}',
      tags: ['Plants'],
      summary: 'Update plant',
      description: 'Update plant details',
      request: {
        params: z.object({
          id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
        body: {
          content: {
            'application/json': {
              schema: UpdatePlantInputSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: PlantResponseSchema,
            },
          },
          description: 'Plant updated',
        },
        400: {
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
          description: 'Validation Error',
        },
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.updatePlant,
  )

  return app
}
