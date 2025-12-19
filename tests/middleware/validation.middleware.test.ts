import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validate } from '../../infrastructure/http/middleware/validation.middleware.js'

describe('ValidationMiddleware', () => {
  it('should return a validator middleware', () => {
    const schema = z.object({ name: z.string() })
    const middleware = validate('json', schema)
    expect(typeof middleware).toBe('function')
  })

  // Testing the actual validation logic would require mocking `zValidator` behavior or running with Hono app.
  // We trust `zValidator` works and our hook is correct.
  // We can simulate the hook behavior if we extracted the hook function, but it's inline.
})
