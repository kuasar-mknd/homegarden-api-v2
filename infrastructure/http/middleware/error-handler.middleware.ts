import type { ErrorHandler } from 'hono'
import { getErrorPageHtml } from '../../../shared/ui/templates.js'
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

  // Content negotiation: return HTML if requested (e.g., by a browser)
  if (c.req.header('Accept')?.includes('text/html')) {
    return c.html(getErrorPageHtml(err instanceof Error ? err : new Error(String(err))), responseStatus)
  }

  return c.json(
    {
      success: false,
      error: err.name || 'InternalServerError',
      message: env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    responseStatus,
  )
}
