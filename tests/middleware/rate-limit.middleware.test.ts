import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock the env before importing the middleware
vi.mock('../../infrastructure/config/env.js', () => ({
  env: {
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX: 100,
  },
}))

// Mock the rateLimiter function
vi.mock('hono-rate-limiter', () => ({
  rateLimiter: vi.fn((config) => {
    // Return a mock middleware that captures the config
    const middleware = vi.fn((c: any, next: any) => next())
    // Expose config for testing
    ;(middleware as any).config = config
    return middleware
  }),
}))

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create rate limiter with correct configuration', async () => {
    // Import after mocks are set up
    const { rateLimitMiddleware } = await import(
      '../../infrastructure/http/middleware/rate-limit.middleware.js'
    )

    expect(rateLimitMiddleware).toBeDefined()
    expect((rateLimitMiddleware as any).config).toMatchObject({
      windowMs: 60000,
      limit: 100,
      standardHeaders: 'draft-6',
    })
  })

  it('should use x-forwarded-for header as key', async () => {
    const { rateLimitMiddleware } = await import(
      '../../infrastructure/http/middleware/rate-limit.middleware.js'
    )

    const config = (rateLimitMiddleware as any).config
    const mockContext = {
      req: {
        header: vi.fn().mockReturnValue('192.168.1.1'),
      },
    }

    const key = config.keyGenerator(mockContext)
    expect(key).toBe('192.168.1.1')
  })

  it('should fallback to unknown when no x-forwarded-for header', async () => {
    const { rateLimitMiddleware } = await import(
      '../../infrastructure/http/middleware/rate-limit.middleware.js'
    )

    const config = (rateLimitMiddleware as any).config
    const mockContext = {
      req: {
        header: vi.fn().mockReturnValue(null),
      },
    }

    const key = config.keyGenerator(mockContext)
    expect(key).toBe('unknown')
  })
})
