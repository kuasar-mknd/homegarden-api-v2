import { createClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { env } from '../../infrastructure/config/env.js'
import { prisma } from '../../infrastructure/database/prisma.client.js'
import { authMiddleware } from '../../infrastructure/http/middleware/auth.middleware.js'

// Mock dependencies
vi.mock('../../infrastructure/config/env.js', () => ({
  env: {
    SUPABASE_URL: 'http://supabase.test',
    SUPABASE_PUBLISHABLE_KEY: 'test-key',
  },
}))

vi.mock('../../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

describe('AuthMiddleware', () => {
  let mockContext: any
  let mockNext: any
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    mockContext = {
      req: {
        header: vi.fn(),
      },
      json: vi.fn().mockImplementation((data, status) => ({ data, status })),
      set: vi.fn(),
    }

    mockNext = vi.fn()
  })

  it('should return 401 if Authorization header is missing', async () => {
    mockContext.req.header.mockReturnValue(null)

    const result = (await authMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(401)
    expect(result.data.error).toBe('UNAUTHORIZED')
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should return 401 if token is invalid or Supabase returns error', async () => {
    mockContext.req.header.mockReturnValue('Bearer invalid-token')
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    })

    const result = (await authMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(401)
    expect(result.data.message).toBe('Invalid or expired Supabase token')
  })

  it('should sync existing user and call next()', async () => {
    const token = 'Bearer valid-token-' + Math.random()
    mockContext.req.header.mockReturnValue(token)
    const mockUser = { id: 'auth-id', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const dbUser = { id: 'db-id', email: 'test@example.com' }
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser as any)

    await authMiddleware(mockContext, mockNext)

    expect(mockContext.set).toHaveBeenCalledWith('user', dbUser)
    expect(mockContext.set).toHaveBeenCalledWith('userId', dbUser.id)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should create and sync new user if not in database', async () => {
    const token = 'Bearer new-token-' + Math.random()
    mockContext.req.header.mockReturnValue(token)
    const mockUser = {
      id: 'auth-id',
      email: 'new@example.com',
      user_metadata: { full_name: 'New User', avatar_url: 'http://avatar.test' },
    }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const createdUser = { id: 'new-db-id', email: 'new@example.com' }
    vi.mocked(prisma.user.create).mockResolvedValue(createdUser as any)

    await authMiddleware(mockContext, mockNext)

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
        }),
      }),
    )
    expect(mockContext.set).toHaveBeenCalledWith('user', createdUser)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle metadata without full_name', async () => {
    const token = 'Bearer meta-token-' + Math.random()
    mockContext.req.header.mockReturnValue(token)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 'test@test.com', user_metadata: { first_name: 'OnlyFirst' } } },
      error: null,
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'id' } as any)

    await authMiddleware(mockContext, mockNext)

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: 'OnlyFirst',
          lastName: 'User',
        }),
      }),
    )
  })

  it('should return 500 if environment variables are missing', async () => {
    const token = 'Bearer env-token-' + Math.random()
    mockContext.req.header.mockReturnValue(token)
    // Temporarily break env
    const originalUrl = env.SUPABASE_URL
    ;(env as any).SUPABASE_URL = null

    // We also need to clear the cache or use a unique token to force getSupabase() call
    // The previous tests might have cached a valid session for 'token'
    // But since we use Math.random() in other tests, let's ensure this token is unique too

    const result = (await authMiddleware(mockContext, mockNext)) as any

    // authMiddleware catches the error and returns 500
    expect(result).toBeDefined()
    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')

    // Restore
    ;(env as any).SUPABASE_URL = originalUrl
  })

  it('should return 500 if prisma is missing', async () => {
    const token = 'Bearer prisma-token-' + Math.random()
    mockContext.req.header.mockReturnValue(token)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 't@t.com' } },
      error: null,
    })

    // We can mock it to be null if we re-mock the module.
    vi.resetModules()
    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: undefined,
    }))

    // Re-import to get the fresh module with mocked prisma
    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )

    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any
    expect(result.status).toBe(500)
    expect(result.data.message).toContain('Authentication service error')
  })

  it('should handle non-Error object rejection in auth middleware', async () => {
    vi.resetModules()

    // Configure mockSupabase to throw a string
    mockSupabase.auth.getUser.mockRejectedValue('String Error')

    const token = 'Bearer string-error-token-' + Math.random()
    mockContext.req.header.mockReturnValue(token)

    // Re-import to ensure clean state (though might not be strictly necessary if createClient mock persists)
    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })
})
