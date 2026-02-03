import type { MiddlewareHandler } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'
import { getClientIp } from '../../../shared/utils/ip.js'

/**
 * Auth Rate Limit Middleware
 *
 * Stricter rate limiting for authentication endpoints to prevent brute-force attacks.
 * Limit: 5 requests per minute per IP
 */
export const authRateLimitMiddleware: MiddlewareHandler = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // 5 requests per minute
  keyGenerator: (c) => getClientIp(c),
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
})
