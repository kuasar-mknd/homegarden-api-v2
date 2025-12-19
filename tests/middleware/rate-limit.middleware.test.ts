import { beforeEach, describe, expect, it, vi } from 'vitest'
import { env } from '../../infrastructure/config/env.js'
import { rateLimitMiddleware } from '../../infrastructure/http/middleware/rate-limit.middleware.js'

vi.mock('../../infrastructure/config/env.js', () => ({
  env: {
    RATE_LIMIT_WINDOW_MS: 1000,
    RATE_LIMIT_MAX: 2,
  },
}))

describe('RateLimitMiddleware', () => {
  let mockContext: any
  let mockNext: any

  beforeEach(() => {
    mockContext = {
      req: {
        header: vi.fn().mockReturnValue('127.0.0.1'),
      },
      res: {
        headers: new Headers(),
      },
      header: vi.fn(),
      status: vi.fn(),
      json: vi.fn(),
      set: vi.fn(),
    }
    mockNext = vi.fn()
  })

  it('should export a middleware function', () => {
    expect(typeof rateLimitMiddleware).toBe('function')
  })

  // Testing the internal behavior of hono-rate-limiter is hard without a full Hono app context or inspecting the library internals.
  // However, we can verify that it is configured with the correct environment variables.
  // Since we cannot easily introspect the `rateLimitMiddleware` function (it's a closure),
  // we rely on the fact that we mocked the env variables it uses.

  it('should allow requests under the limit', async () => {
    // This is an integration test mostly, but we can try calling it.
    // hono-rate-limiter implementation might require a real context.
    await rateLimitMiddleware(mockContext, mockNext)
    expect(mockNext).toHaveBeenCalled()
  })
})
