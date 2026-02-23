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
    // Sentinel: WARNING - This logic relies on 'x-forwarded-for' which can be spoofed if the server
    // is not behind a trusted proxy that strips or validates this header.
    // In a direct-to-internet deployment, an attacker could rotate 'x-forwarded-for' to bypass limits.
    // For robust security, ensure this API is behind a reverse proxy (Nginx, Cloudflare) that
    // overwrites 'x-forwarded-for' with the real IP.
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-real-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    return ip
  },
})
