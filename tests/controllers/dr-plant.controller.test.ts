import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DrPlantController } from '../../infrastructure/http/controllers/dr-plant.controller.js'
import { AppError } from '../../shared/errors/app-error.js'
import { fail, ok } from '../../shared/types/result.type.js'

// Mock the file signature validator
vi.mock('../../infrastructure/http/validators/file-signature.validator.js', () => ({
  validateImageSignature: vi.fn().mockReturnValue(true),
}))

describe('DrPlantController', () => {
  let controller: DrPlantController
  let mockUseCase: any
  let mockContext: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCase = { execute: vi.fn() }
    controller = new DrPlantController(mockUseCase)

    mockContext = {
      get: vi.fn(),
      req: {
        parseBody: vi.fn(),
      },
      json: vi.fn().mockImplementation((data, status) => ({ data, status })),
    }
  })

  it('should diagnose successfully', async () => {
    const mockFile = new File(['fake-content'], 'plant.jpg', { type: 'image/jpeg' })
    mockContext.req.parseBody.mockResolvedValue({
      image: mockFile,
      symptoms: 'yellow leaves',
    })

    mockUseCase.execute.mockResolvedValue(ok({ isHealthy: false, diagnosis: 'Sick' }))

    const result = (await controller.diagnose(mockContext)) as any

    expect(result.status).toBe(200)
    expect(result.data.success).toBe(true)
    expect(result.data.data.isHealthy).toBe(false)
    expect(mockUseCase.execute).toHaveBeenCalled()
  })

  it('should handle use case failure', async () => {
    mockContext.req.parseBody.mockResolvedValue({ symptoms: 'none' })
    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(400)
    expect(result.data.message).toBe('Image file is required')
  })

  it('should return 400 if image is not a File', async () => {
    mockContext.req.parseBody.mockResolvedValue({ image: 'not-a-file' })
    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(400)
  })

  it('should return 400 if image size exceeds 10MB', async () => {
    // We create a mock file with a large size.
    // Since Zod checks instanceOf File and then checks properties.
    // However, File constructor doesn't accept size. Size is determined by content length.
    // We can just define a property on the instance if needed, or use a large buffer.
    // Creating 11MB buffer is slow. Let's mock the file object more directly if possible,
    // or rely on the fact that we can cast to any to overwrite size.

    const mockFile = new File([''], 'large.jpg', { type: 'image/jpeg' })
    Object.defineProperty(mockFile, 'size', { value: 11 * 1024 * 1024 })

    mockContext.req.parseBody.mockResolvedValue({ image: mockFile })

    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(400)
    expect(result.data.message).toContain('exceeds 10MB')
  })

  it('should return 400 if image type is invalid', async () => {
    const mockFile = new File(['...'], 'test.gif', { type: 'image/gif' })
    mockContext.req.parseBody.mockResolvedValue({ image: mockFile })
    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(400)
    expect(result.data.message).toContain('Invalid image type')
  })

  it('should handle use case failure with mapped status', async () => {
    const mockFile = new File(['...'], 'test.jpg', { type: 'image/jpeg' })
    mockContext.req.parseBody.mockResolvedValue({ image: mockFile })
    mockUseCase.execute.mockResolvedValue(
      fail(new AppError('AI Error', 503, 'SERVICE_UNAVAILABLE')),
    )

    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(503)
    expect(result.data.error).toBe('SERVICE_UNAVAILABLE')
  })

  it('should return 500 on unexpected errors', async () => {
    mockContext.req.parseBody.mockRejectedValue(new Error('Unexpected'))
    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(500)
    expect(result.data.error).toBe('INTERNAL_ERROR')
  })

  it('should return 500 if error is not an Error instance', async () => {
    mockContext.req.parseBody.mockImplementation(() => {
      throw 'String error'
    })
    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(500)
    expect(result.data.message).toBe('An unexpected error occurred')
  })

  it('should use 500 if use case error has invalid status code', async () => {
    const mockFile = new File(['...'], 'test.jpg', { type: 'image/jpeg' })
    mockContext.req.parseBody.mockResolvedValue({ image: mockFile })
    mockUseCase.execute.mockResolvedValue(fail(new AppError('Bad status', 0, 'BAD')))

    const result = (await controller.diagnose(mockContext)) as any
    expect(result.status).toBe(500)
  })

  it('should fallback to DIAGNOSIS_FAILED if error code is missing', async () => {
    const mockFile = new File(['...'], 'test.jpg', { type: 'image/jpeg' })
    mockContext.req.parseBody.mockResolvedValue({ image: mockFile })
    mockUseCase.execute.mockResolvedValue(fail(new Error('Generic failure')))

    const result = (await controller.diagnose(mockContext)) as any
    expect(result.data.error).toBe('DIAGNOSIS_FAILED')
  })
})
