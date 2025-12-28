import { secureHeaders } from 'hono/secure-headers'

/**
 * Security Headers Middleware
 *
 * Configures HTTP response headers to protect against common web vulnerabilities.
 * Uses Content Security Policy (CSP), HSTS, and other security headers.
 *
 * Headers:
 * - Content-Security-Policy: Restricts sources of content (scripts, images, etc.)
 * - X-Frame-Options: Prevents clickjacking
 * - X-XSS-Protection: Enables browser XSS filtering
 * - Strict-Transport-Security: Enforces HTTPS
 * - Referrer-Policy: Controls referrer information
 * - X-Content-Type-Options: Prevents MIME type sniffing
 */
export const securityHeadersMiddleware = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"], // Restricts <base> tag
    formAction: ["'self'"], // Restricts form submissions
    objectSrc: ["'none'"], // Disables plugins like Flash
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
    connectSrc: ["'self'", 'https://api.open-meteo.com'],
    fontSrc: ["'self'", 'https:', 'data:'],
    frameAncestors: ["'none'"], // Replaces X-Frame-Options
    upgradeInsecureRequests: [], // Upgrades HTTP to HTTPS
  },
  xFrameOptions: 'DENY',
  xXssProtection: '1; mode=block',
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  referrerPolicy: 'strict-origin-when-cross-origin',
  xContentTypeOptions: 'nosniff', // Explicitly set
})
