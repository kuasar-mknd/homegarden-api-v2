import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { describe, expect, it } from 'vitest'

describe('Compression Middleware', () => {
  it('should compress response when Accept-Encoding is gzip', async () => {
    const app = new Hono()
    app.use('*', compress())
    app.get('/', (c) => c.text('Hello World '.repeat(100)))

    const res = await app.request('/', {
      headers: {
        'Accept-Encoding': 'gzip',
      },
    })

    expect(res.headers.get('Content-Encoding')).toBe('gzip')
  })

  it('should handle small responses without errors', async () => {
    const app = new Hono()
    app.use('*', compress())
    app.get('/', (c) => c.text('Small response'))

    const res = await app.request('/', {
      headers: {
        'Accept-Encoding': 'gzip',
      },
    })

    expect(res.status).toBe(200)
  })
})
