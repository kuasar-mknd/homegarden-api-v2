import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { PlantController } from '../controllers/plant.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  CreatePlantSchema,
  PlantIdParamSchema,
  UpdatePlantSchema,
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
              schema: CreatePlantSchema,
            },
          },
        },
      },
      responses: {
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
        params: PlantIdParamSchema,
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
      description: 'Update a plant',
      request: {
        params: PlantIdParamSchema,
        body: {
          content: {
            'application/json': {
              schema: UpdatePlantSchema,
            },
          },
        },
      },
      responses: {
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.updatePlant,
  )

  // DELETE /:id
  app.openapi(
    createRoute({
      method: 'delete',
      path: '/{id}',
      tags: ['Plants'],
      summary: 'Delete plant',
      description: 'Delete a plant',
      request: {
        params: PlantIdParamSchema,
      },
      responses: {
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.deletePlant,
  )

  return app
}
