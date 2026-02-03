import type { MiddlewareHandler } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'
import { getClientIp } from '../../../shared/utils/ip.js'

/**
 * AI Rate Limit Middleware
 *
 * Stricter rate limiting for expensive AI endpoints (Gemini, etc.)
 * Limit: 10 requests per minute per IP
 */
export const aiRateLimitMiddleware: MiddlewareHandler = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute
  keyGenerator: (c) => getClientIp(c),
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many AI requests, please try again later.',
  },
  standardHeaders: true,
})
