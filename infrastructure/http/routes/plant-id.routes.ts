/**
 * Plant ID Routes
 *
 * HTTP routes for plant identification endpoints.
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { bodyLimit } from 'hono/body-limit'
import type { PlantIdController } from '../controllers/plant-id.controller.js'
import {
  ErrorSchema,
  IdentifySpeciesInputSchema,
  IdentifySpeciesResponseSchema,
  StatusResponseSchema,
} from '../schemas/plant-id.schema.js'

/**
 * Create Plant ID routes
 *
 * @param controller - PlantIdController instance
 * @returns Hono router with plant-id routes
 */
export const createPlantIdRoutes = (controller: PlantIdController) => {
  const router = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: result.error.message,
          },
          400,
        )
      }
      return
    },
  })

  // ============================================================
  // MIDDLEWARE
  // ============================================================

  // Body size limit for image uploads (10MB)
  router.use(
    '/identify',
    bodyLimit({
      maxSize: 10 * 1024 * 1024, // 10MB
      onError: (c) => {
        return c.json(
          {
            success: false,
            error: 'PAYLOAD_TOO_LARGE',
            message: 'Image size exceeds 10MB limit',
          },
          413,
        )
      },
    }),
  )

  // ============================================================
  // ROUTES definition (OpenAPI)
  // ============================================================

  const statusRoute = createRoute({
    method: 'get',
    path: '/status',
    description: 'Check Plant ID service availability',
    tags: ['PlantID'],
    responses: {
      200: {
        description: 'Service status',
        content: {
          'application/json': {
            schema: StatusResponseSchema,
          },
        },
      },
    },
  })

  const identifyRoute = createRoute({
    method: 'post',
    path: '/identify',
    description: 'Identify plant species from an image',
    tags: ['PlantID'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: IdentifySpeciesInputSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Identification successful',
        content: {
          'application/json': {
            schema: IdentifySpeciesResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request (Missing image or invalid data)',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Internal Server Error (AI Service failed)',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  })

  // ============================================================
  // HANDLERS
  // ============================================================

  router.openapi(statusRoute, controller.status)
  router.openapi(identifyRoute, controller.identify)

  return router
}

export default createPlantIdRoutes
