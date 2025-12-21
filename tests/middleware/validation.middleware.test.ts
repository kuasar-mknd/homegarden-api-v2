import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validate } from '../../infrastructure/http/middleware/validation.middleware.js'

describe('ValidationMiddleware', () => {
  it('should return a validator middleware', () => {
    const schema = z.object({ name: z.string() })
    const middleware = validate('json', schema)
    expect(typeof middleware).toBe('function')
  })

  // We trust `zValidator` works and our hook is correct.
  // We can simulate the hook behavior if we extracted the hook function, but it's inline.

  it('should return 400 when validation fails', async () => {
    const { Hono } = await import('hono')
    const app = new Hono()
    const schema = z.object({ name: z.string() })
    app.post('/test', validate('json', schema), (c) => c.text('ok'))

    const res = await app.request('/test', {
      method: 'POST',
      body: JSON.stringify({ name: 123 }), // Should fail
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toBe('VALIDATION_ERROR')
    expect(json.details).toBeDefined()
  })

  it('should call next when validation succeeds', async () => {
    const { Hono } = await import('hono')
    const app = new Hono()
    const schema = z.object({ name: z.string() })
    app.post('/test', validate('json', schema), (c) => c.text('ok'))

    const res = await app.request('/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'Valid Name' }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ok')
  })
})
