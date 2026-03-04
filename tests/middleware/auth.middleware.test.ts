import { createClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
  let authMiddleware: any
  let prisma: any
  let env: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

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

    const envModule = await import('../../infrastructure/config/env.js')
    env = envModule.env

    const prismaModule = await import('../../infrastructure/database/prisma.client.js')
    prisma = prismaModule.prisma

    const authMiddlewareModule = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    authMiddleware = authMiddlewareModule.authMiddleware
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
    mockContext.req.header.mockReturnValue('Bearer valid-token')
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
    mockContext.req.header.mockReturnValue('Bearer valid-token')
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
        select: expect.any(Object),
      }),
    )
    expect(mockContext.set).toHaveBeenCalledWith('user', createdUser)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle metadata without full_name', async () => {
    mockContext.req.header.mockReturnValue('Bearer token')
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
    mockContext.req.header.mockReturnValue('Bearer token')
    // Temporarily break env
    const originalUrl = env.SUPABASE_URL
    ;(env as any).SUPABASE_URL = null

    // Force re-import of auth middleware to catch the env validation in singleton init
    vi.resetModules()
    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )

    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')

    // Restore
    ;(env as any).SUPABASE_URL = originalUrl
  })

  it('should return 500 if prisma is missing', async () => {
    mockContext.req.header.mockReturnValue('Bearer token')
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

    mockContext.req.header.mockReturnValue('Bearer token')

    // Re-import to ensure clean state
    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )

    // We need to overwrite the createClient mock *after* resetModules
    const { createClient } = await import('@supabase/supabase-js')
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockRejectedValue('String Error'),
      },
    } as any)

    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })
})
