import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import type { CareTrackerController } from '../controllers/care-tracker.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { CreateScheduleSchema } from '../schemas/care-tracker.schema.js'

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
              schema: CreateScheduleSchema,
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

  return app
}
