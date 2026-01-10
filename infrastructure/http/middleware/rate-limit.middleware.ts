import { rateLimiter } from 'hono-rate-limiter'
import { env } from '../../config/env.js'

/**
 * Global Rate Limiter Middleware
 *
 * Limits the number of requests from the same IP address within a time window.
 * Uses hono-rate-limiter with in-memory storage.
 */
export const rateLimitMiddleware = rateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    // Prioritize Cloudflare / Real IP headers
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-real-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    return ip
  },
})
