import { rateLimiter } from 'hono-rate-limiter'
import { env } from '../../config/env.js'

/**
 * Rate Limiter Middleware
 *
 * Limits the number of requests from the same IP address within a time window.
 * Uses hono-rate-limiter with in-memory storage.
 */
export const rateLimitMiddleware = rateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
})
