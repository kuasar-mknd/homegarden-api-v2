import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'

// Mock logger
vi.mock('../../infrastructure/config/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { logger } from '../../infrastructure/config/logger.js'
import { loggerMiddleware } from '../../infrastructure/http/middleware/logger.middleware.js'

describe('Logger Middleware', () => {
  it('should log 200 responses as info', async () => {
    const app = new Hono()
    app.use('*', loggerMiddleware)
    app.get('/test', (c) => c.text('ok'))

    await app.request('/test')

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'HTTPRequest',
        status: 200,
        method: 'GET',
        path: '/test',
      }),
    )
  })

  it('should log 400 responses as warn', async () => {
    const app = new Hono()
    app.use('*', loggerMiddleware)
    app.get('/test', (c) => c.text('bad', 400))

    await app.request('/test')

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
      }),
    )
  })

  it('should log 500 responses as error', async () => {
    const app = new Hono()
    app.use('*', loggerMiddleware)
    app.get('/test', (c) => c.text('error', 500))

    await app.request('/test')

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
      }),
    )
  })

  it('should include request ID and custom IP headers', async () => {
    const app = new Hono()
    app.use('*', loggerMiddleware)
    app.get('/test', (c) => c.text('ok'))

    const res = await app.request('/test', {
      headers: {
        'cf-connecting-ip': '1.2.3.4',
      },
    })

    expect(res.headers.get('X-Request-ID')).toBeDefined()
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: '1.2.3.4',
        requestId: expect.any(String),
      }),
    )
  })
})
