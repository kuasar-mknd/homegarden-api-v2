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
    // Fix: Prevent rate limit spoofing.
    // We extract the last IP from x-forwarded-for instead of the first IP.
    // The first IP can easily be spoofed by an attacker, whereas the last IP
    // is appended by our trusted proxy.
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
})
