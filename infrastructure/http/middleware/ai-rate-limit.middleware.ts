
import type { MiddlewareHandler } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

/**
 * AI Rate Limit Middleware
 *
 * Stricter rate limiting for expensive AI endpoints (Gemini, etc.)
 * Limit: 10 requests per minute per IP
 */
export const aiRateLimitMiddleware: MiddlewareHandler = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute
  keyGenerator: (c) => {
    // Prioritize Cloudflare / Proxy headers, fall back to IP
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-real-ip') ||
      c.req.header('x-forwarded-for') ||
      'unknown'
    return ip
  },
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many AI requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
