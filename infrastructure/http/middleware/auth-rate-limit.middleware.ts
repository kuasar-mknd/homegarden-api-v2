import type { MiddlewareHandler } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'

/**
 * Auth Rate Limit Middleware
 *
 * Stricter rate limiting for authentication endpoints to prevent brute-force attacks.
 * Limit: 5 requests per minute per IP
 */
export const authRateLimitMiddleware: MiddlewareHandler = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // 5 requests per minute
  keyGenerator: (c) => {
    // Prioritize Cloudflare / Proxy headers, fall back to IP
    // Fix: Extract the last IP to prevent spoofing of the first IP.
    const forwardedFor = c.req.header('x-forwarded-for')
    let lastForwardedIp: string | undefined
    if (forwardedFor) {
      const parts = forwardedFor.split(',')
      lastForwardedIp = parts[parts.length - 1]?.trim()
    }
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-real-ip') ||
      lastForwardedIp ||
      'unknown'
    return ip
  },
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
})
