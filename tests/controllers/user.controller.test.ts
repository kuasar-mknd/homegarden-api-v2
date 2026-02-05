import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserController } from '../../infrastructure/http/controllers/user.controller.js'
import { AppError } from '../../shared/errors/app-error.js'
import { fail, ok } from '../../shared/types/result.type.js'

describe('UserController', () => {
  let controller: UserController
  let mockUseCase: any
  let mockContext: any
  const validUuid = '123e4567-e89b-12d3-a456-426614174000'

  beforeEach(() => {
    mockUseCase = { execute: vi.fn() }
    controller = new UserController(mockUseCase)

    mockContext = {
      get: vi.fn(),
      req: {
        valid: vi.fn(),
      },
      json: vi.fn().mockImplementation((data, status) => ({ data, status })),
      header: vi.fn(),
    }
  })

  it('should get profile successfully', async () => {
    mockContext.get.mockReturnValue({ id: 'u1' })
    mockContext.req.valid.mockReturnValue({ id: validUuid })
    mockUseCase.execute.mockResolvedValue(ok({ id: validUuid, firstName: 'John' }))

    const result = (await controller.getProfile(mockContext)) as any

    expect(result.status).toBe(200)
    expect(result.data.success).toBe(true)
    expect(result.data.data.firstName).toBe('John')
  })

  it('should return 401 if unauthorized', async () => {
    mockContext.get.mockReturnValue(null)
    const result = (await controller.getProfile(mockContext)) as any
    expect(result.status).toBe(401)
  })

  // Validation handled by middleware

  it('should handle use case failure with mapped status', async () => {
    mockContext.get.mockReturnValue({ id: 'u1' })
    mockContext.req.valid.mockReturnValue({ id: validUuid })
    mockUseCase.execute.mockResolvedValue(fail(new AppError('Not Found', 404, 'NOT_FOUND')))

    const result = (await controller.getProfile(mockContext)) as any
    expect(result.status).toBe(404)
    expect(result.data.error).toBe('NOT_FOUND')
  })

  it('should return 500 on unexpected errors', async () => {
    mockContext.get.mockReturnValue({ id: 'u1' })
    mockContext.req.valid.mockImplementation(() => {
      throw new Error('Explosion')
    })
    const result = (await controller.getProfile(mockContext)) as any
    expect(result.status).toBe(500)
  })
})
