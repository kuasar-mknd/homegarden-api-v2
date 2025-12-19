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
})
