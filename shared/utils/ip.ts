import type { Context } from 'hono'

/**
 * Get the client IP address from the request headers.
 * Prioritizes Cloudflare and Real-IP headers.
 * Falls back to the first IP in X-Forwarded-For.
 */
export function getClientIp(c: Context): string {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
