import { createMiddleware } from 'hono/factory'
import { logger } from '../../config/logger.js'

/**
 * Structured Request Logger Middleware
 *
 * Logs incoming requests and outgoing responses using Pino.
 * Adds a unique Request ID to correlation.
 */
export const loggerMiddleware = createMiddleware(async (c, next) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()

  // Attach request ID to context and headers
  c.set('requestId', requestId)
  c.header('X-Request-ID', requestId)

  const { method, path } = c.req

  // Log Request (Optional: keeping it minimal to avoid noise, focusing on response)
  // logger.info({ msg: 'Incoming Request', method, path, requestId })

  await next()

  const durationMs = Date.now() - start
  const status = c.res.status

  // Log Response with correct level based on status
  const logData = {
    msg: 'HTTPRequest',
    method,
    path,
    status,
    durationMs,
    requestId,
    ip: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip'),
  }

  if (status >= 500) {
    logger.error(logData)
  } else if (status >= 400) {
    logger.warn(logData)
  } else {
    logger.info(logData)
  }
})
