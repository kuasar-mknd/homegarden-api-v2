import { describe, expect, it, vi } from 'vitest'
import { AuthController } from '../../infrastructure/http/controllers/auth.controller.js'

describe('AuthController', () => {
  const controller = new AuthController()
  const mockContext = {
    json: vi.fn().mockImplementation((data, status) => ({ data, status })),
  }

  it('register should return 501', async () => {
    const result = (await controller.register(mockContext as any)) as any
    expect(result.status).toBe(501)
    expect(result.data.error).toBe('NOT_IMPLEMENTED')
  })

  it('login should return 501', async () => {
    const result = (await controller.login(mockContext as any)) as any
    expect(result.status).toBe(501)
    expect(result.data.error).toBe('NOT_IMPLEMENTED')
  })

  it('refreshToken should return 501', async () => {
    const result = (await controller.refreshToken(mockContext as any)) as any
    expect(result.status).toBe(501)
    expect(result.data.error).toBe('NOT_IMPLEMENTED')
  })
})
