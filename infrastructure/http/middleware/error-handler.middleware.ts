import type { ErrorHandler } from 'hono'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'

/**
 * Global Error Handler Middleware
 *
 * Catches all unhandled errors and returns a standardized JSON response.
 * Handles known error types (like Hono HTTP exceptions) and unknown errors.
 */
export const errorHandler: ErrorHandler = (err, c) => {
  logger.error({ err }, 'Unhandled error')

  const statusCode = 'statusCode' in err ? (err.statusCode as number) : 500

  // Determine status code safely
  const responseStatus = (statusCode >= 400 && statusCode < 600 ? statusCode : 500) as
    | 400
    | 401
    | 403
    | 404
    | 500

  return c.json(
    {
      success: false,
      error:
        env.NODE_ENV === 'production' ? 'InternalServerError' : err.name || 'InternalServerError',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    responseStatus,
  )
}
