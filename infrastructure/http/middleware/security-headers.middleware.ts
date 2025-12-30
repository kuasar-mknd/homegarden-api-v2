import { secureHeaders } from 'hono/secure-headers'

/**
 * Security Headers Middleware
 *
 * Configures Content Security Policy (CSP) and other security headers.
 * Centralized configuration ensures consistent security policy across the application.
 */
export const securityHeadersMiddleware = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
    connectSrc: ["'self'", 'https://api.open-meteo.com'],
    fontSrc: ["'self'", 'https:', 'data:'],
  },
  xFrameOptions: 'DENY',
  xXssProtection: '1; mode=block',
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  referrerPolicy: 'strict-origin-when-cross-origin',
})
