import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the rateLimiter function
vi.mock('hono-rate-limiter', () => ({
  rateLimiter: vi.fn((config) => {
    // Return a mock middleware that captures the config
    const middleware = vi.fn((_c: any, next: any) => next())
    // Expose config for testing
    ;(middleware as any).config = config
    return middleware
  }),
}))

describe('Auth Rate Limit Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should use first IP from x-forwarded-for header as key', async () => {
    const { authRateLimitMiddleware } = await import(
      '../../infrastructure/http/middleware/auth-rate-limit.middleware.js'
    )

    const config = (authRateLimitMiddleware as any).config
    const mockContext = {
      req: {
        header: vi.fn((name) => {
          if (name === 'x-forwarded-for') return '10.0.0.1, 10.0.0.2'
          return undefined
        }),
      },
    }

    const key = config.keyGenerator(mockContext)
    expect(key).toBe('10.0.0.1')
  })

  it('should fallback to unknown when no IP header', async () => {
    const { authRateLimitMiddleware } = await import(
      '../../infrastructure/http/middleware/auth-rate-limit.middleware.js'
    )

    const config = (authRateLimitMiddleware as any).config
    const mockContext = {
      req: {
        header: vi.fn().mockReturnValue(undefined),
      },
    }

    const key = config.keyGenerator(mockContext)
    expect(key).toBe('unknown')
  })
})
