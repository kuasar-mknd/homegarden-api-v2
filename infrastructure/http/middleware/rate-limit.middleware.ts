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

/**
 * AI Rate Limiter Middleware
 *
 * Stricter limits for expensive AI endpoints (Gemini).
 */
export const aiRateLimitMiddleware = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-real-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    return ip
  },
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'AI request limit exceeded. Please try again later.',
  },
})
