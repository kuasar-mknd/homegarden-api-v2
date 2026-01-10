import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { CareTrackerController } from '../controllers/care-tracker.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  CreateScheduleInputSchema,
  ErrorSchema,
  MarkTaskCompleteInputSchema,
  ScheduleResponseSchema,
} from '../schemas/care-tracker.schema.js'

export const createCareTrackerRoutes = (controller: CareTrackerController) => {
  const app = new OpenAPIHono()

  app.use('*', authMiddleware)

  // GET /upcoming
  app.openapi(
    createRoute({
      method: 'get',
      path: '/upcoming',
      tags: ['CareTracker'],
      summary: 'Get upcoming tasks',
      description: 'Get list of upcoming care tasks',
      responses: {
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.getUpcomingTasks,
  )

  // POST /schedules
  app.openapi(
    createRoute({
      method: 'post',
      path: '/schedules',
      tags: ['CareTracker'],
      summary: 'Create schedule',
      description: 'Create a new care schedule',
      request: {
        body: {
          content: {
            'application/json': {
              schema: CreateScheduleInputSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        201: {
          content: {
            'application/json': {
              schema: ScheduleResponseSchema,
            },
          },
          description: 'Schedule created',
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
    controller.createSchedule,
  )

  // POST /schedules/:id/complete
  app.openapi(
    createRoute({
      method: 'post',
      path: '/schedules/{id}/complete',
      tags: ['CareTracker'],
      summary: 'Mark task complete',
      description: 'Mark a care task as complete',
      request: {
        params: z.object({
          id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
        body: {
          content: {
            'application/json': {
              schema: MarkTaskCompleteInputSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: ScheduleResponseSchema,
            },
          },
          description: 'Task completed',
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
    controller.markTaskComplete,
  )

  return app
}
