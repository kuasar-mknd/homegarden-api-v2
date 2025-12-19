import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserController } from '../../infrastructure/http/controllers/user.controller.js'
import { ok, fail } from '../../shared/types/result.type.js'
import { AppError } from '../../shared/errors/app-error.js'

describe('UserController', () => {
  let controller: UserController
  let mockUseCase: any
  let mockContext: any

  beforeEach(() => {
    mockUseCase = { execute: vi.fn() }
    controller = new UserController(mockUseCase)

    mockContext = {
      get: vi.fn(),
      req: {
        param: vi.fn(),
      },
      json: vi.fn().mockImplementation((data, status) => ({ data, status })),
    }
  })

  it('should get profile successfully', async () => {
    mockContext.get.mockReturnValue({ id: 'u1' })
    mockContext.req.param.mockReturnValue('target-u1')
    mockUseCase.execute.mockResolvedValue(ok({ id: 'target-u1', firstName: 'John' }))

    const result = await controller.getProfile(mockContext) as any

    expect(result.status).toBe(200)
    expect(result.data.success).toBe(true)
    expect(result.data.data.firstName).toBe('John')
  })

  it('should return 401 if unauthorized', async () => {
    mockContext.get.mockReturnValue(null)
    const result = await controller.getProfile(mockContext) as any
    expect(result.status).toBe(401)
  })

  it('should return 400 if user ID is missing', async () => {
    mockContext.get.mockReturnValue({ id: 'u1' })
    mockContext.req.param.mockReturnValue(null)
    const result = await controller.getProfile(mockContext) as any
    expect(result.status).toBe(400)
  })

  it('should handle use case failure with mapped status', async () => {
    mockContext.get.mockReturnValue({ id: 'u1' })
    mockContext.req.param.mockReturnValue('target-u1')
    mockUseCase.execute.mockResolvedValue(fail(new AppError('Not Found', 404, 'NOT_FOUND')))

    const result = await controller.getProfile(mockContext) as any
    expect(result.status).toBe(404)
    expect(result.data.error).toBe('NOT_FOUND')
  })

  it('should return 500 on unexpected errors', async () => {
    mockContext.get.mockReturnValue({ id: 'u1' })
    mockContext.req.param.mockImplementation(() => { throw new Error('Explosion') })
    const result = await controller.getProfile(mockContext) as any
    expect(result.status).toBe(500)
  })
})
