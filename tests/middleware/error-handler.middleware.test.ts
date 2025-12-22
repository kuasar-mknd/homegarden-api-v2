import { describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../infrastructure/http/middleware/error-handler.middleware.js'

describe('ErrorHandlerMiddleware', () => {
  it('should return 500 for generic errors', async () => {
    const err = new Error('Test error')
    const mockContext: any = {
      json: vi.fn(),
    }

    await errorHandler(err, mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Error',
        message: 'Test error',
      }),
      500,
    )
  })

  it('should return specific status code if present in error', async () => {
    const err: any = new Error('Not Found')
    err.statusCode = 404
    const mockContext: any = {
      json: vi.fn(),
    }

    await errorHandler(err, mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Error',
      }),
      404,
    )
  })

  it('should sanitize error message in production', async () => {
    vi.resetModules()
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: { NODE_ENV: 'production' },
    }))

    // We need to re-import errorHandler to pick up the mocked env
    const { errorHandler: eh } = await import(
      '../../infrastructure/http/middleware/error-handler.middleware.js'
    )

    const err = new Error('Secret error')
    const mockContext: any = { json: vi.fn() }

    eh(err, mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Something went wrong',
      }),
      500,
    )
  })

  it('should include stack trace in development', async () => {
    vi.resetModules()
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: { NODE_ENV: 'development' },
    }))

    const { errorHandler: eh } = await import(
      '../../infrastructure/http/middleware/error-handler.middleware.js'
    )

    const err = new Error('Dev error')
    const mockContext: any = { json: vi.fn() }

    eh(err, mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      }),
      500,
    )
  })

  it('should default to 500 for invalid status codes', async () => {
    const err: any = new Error('Bad Status')
    err.statusCode = 200 // Success code shouldn't be an error status
    const mockContext: any = { json: vi.fn() }

    await errorHandler(err, mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Bad Status' }),
      500,
    )
  })

  it('should use default error name if missing', async () => {
    const err: any = { message: 'No Name' } // Not an Error instance, name undefined
    const mockContext: any = { json: vi.fn() }

    // reset modules to ensure clean env mock state (though default mock is fine)
    vi.resetModules()
    const { errorHandler: eh } = await import(
      '../../infrastructure/http/middleware/error-handler.middleware.js'
    )

    eh(err, mockContext)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'InternalServerError' }),
      500,
    )
  })
})
