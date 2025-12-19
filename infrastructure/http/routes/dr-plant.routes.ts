import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { bodyLimit } from 'hono/body-limit'
import type { DrPlantController } from '../controllers/dr-plant.controller.js'
import { DiagnosePlantResponseSchema, ErrorSchema } from '../schemas/dr-plant.schema.js'

export const createDrPlantRoutes = (controller: DrPlantController) => {
  const app = new OpenAPIHono()

  // Define OpenAPI route for diagnosis
  const diagnoseRoute = createRoute({
    method: 'post',
    path: '/diagnose',
    tags: ['Dr. Plant'],
    summary: 'Diagnose plant health',
    description: 'AI-powered plant disease and health diagnosis from an image. Upload a photo of your plant to get detailed analysis, treatment recommendations, and recovery guidance.',
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                image: {
                  type: 'string',
                  format: 'binary',
                  description: 'Plant image file (JPEG, PNG, WEBP). Max size: 10MB',
                },
                symptoms: {
                  type: 'string',
                  description: 'Optional description of visible symptoms to help with diagnosis',
                  example: 'Leaves are turning yellow with brown spots spreading',
                },
              },
              required: ['image'],
            },
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Diagnosis completed successfully',
        content: {
          'application/json': {
            schema: DiagnosePlantResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request - Invalid image format or missing required fields',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      401: {
        description: 'Unauthorized - Valid authentication token required',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      413: {
        description: 'Payload Too Large - Image size exceeds 10MB limit',
        content: { 'application/json': { schema: ErrorSchema } },
      },
      500: {
        description: 'Internal Server Error - AI service unavailable or processing failed',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  })

  // Apply body limit middleware and route handler
  app.openapi(
    diagnoseRoute,
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
    controller.diagnose,
  )

  return app
}
