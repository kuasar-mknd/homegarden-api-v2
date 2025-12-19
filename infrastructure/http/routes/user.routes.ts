import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import type { UserController } from '../controllers/user.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { UserPublicProfileResponseSchema, UserIdPropSchema } from '../schemas/user.schema.js'

export const createUserRoutes = (controller: UserController) => {
  const app = new OpenAPIHono()

  // Apply Auth Middleware
  app.use('*', authMiddleware)

  // GET /:id
  app.openapi(
    createRoute({
      method: 'get',
      path: '/{id}',
      tags: ['Users'],
      summary: 'Get public user profile',
      description: 'Retrieve public information for a user by ID.',
      request: {
        params: UserIdPropSchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: UserPublicProfileResponseSchema
            }
          },
          description: 'User profile retrieved successfully'
        },
        401: {
          description: 'Unauthorized'
        },
        404: {
          description: 'User not found'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }),
    controller.getProfile
  )

  return app
}
