import { createMiddleware } from 'hono/factory'
import { verifyAndSyncUser } from '../../auth/auth.utils.js'
import { logger } from '../../config/logger.js'

/**
 * Authentication Middleware
 *
 * Verifies the Supabase JWT token and syncs the user to the local database.
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Missing Authorization header',
      },
      401,
    )
  }

  // Prevent DoS via extremely long headers (limit to 8KB which is generous for JWT)
  if (authHeader.length > 8192) {
    return c.json(
      {
        success: false,
        error: 'BAD_REQUEST',
        message: 'Authorization header too long',
      },
      400,
    )
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const localUser = await verifyAndSyncUser(token)

    // Attach user to context
    c.set('user', localUser)
    c.set('userId', localUser.id)

    return await next()
  } catch (error) {
    // If verifyAndSyncUser threw "Invalid or expired token", we should return 401
    // Otherwise 500
    if (error instanceof Error && error.message === 'Invalid or expired token') {
      return c.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid or expired Supabase token',
        },
        401,
      )
    }

    logger.error({ err: error }, 'AuthMiddleware Error')
    return c.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Authentication service error',
      },
      500,
    )
  }
})
