import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { CareTrackerController } from '../controllers/care-tracker.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  CompleteTaskSchema,
  CreateCareScheduleSchema,
  GenerateScheduleSchema,
  UpcomingTasksQuerySchema,
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
      request: {
        query: UpcomingTasksQuerySchema,
      },
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
              schema: CreateCareScheduleSchema,
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
    controller.createSchedule,
  )

  // POST /schedules/:id/complete
  app.openapi(
    createRoute({
      method: 'post',
      path: '/schedules/{id}/complete',
      tags: ['CareTracker'],
      summary: 'Complete task',
      description: 'Mark a care task as complete',
      request: {
        params: z.object({
          id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
        }),
        body: {
          content: {
            'application/json': {
              schema: CompleteTaskSchema,
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
    controller.markTaskComplete,
  )

  // POST /generate
  app.openapi(
    createRoute({
      method: 'post',
      path: '/generate',
      tags: ['CareTracker'],
      summary: 'Generate schedule',
      description: 'Generate smart care schedule',
      request: {
        body: {
          content: {
            'application/json': {
              schema: GenerateScheduleSchema,
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
    controller.generateSchedule,
  )

  return app
}
