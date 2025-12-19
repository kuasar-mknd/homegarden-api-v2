import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { AuthController } from '../controllers/auth.controller.js'

export const createAuthRoutes = (controller: AuthController) => {
  const app = new OpenAPIHono()

  // Note: Auth middleware is NOT applied here globally because login/register are public
  // If we had protected routes here, we'd apply it specifically to them.

  // POST /register
  app.openapi(
    createRoute({
      method: 'post',
      path: '/register',
      tags: ['Auth'],
      summary: 'Register new user',
      description: 'Register a new user (Note: Primary auth is handled by Supabase)',
      responses: {
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.register,
  )

  // POST /login
  app.openapi(
    createRoute({
      method: 'post',
      path: '/login',
      tags: ['Auth'],
      summary: 'Login user',
      description: 'Authenticate user (Note: Primary auth is handled by Supabase)',
      responses: {
        501: {
          description: 'Not Implemented',
        },
      },
    }),
    controller.login,
  )

  return app
}
