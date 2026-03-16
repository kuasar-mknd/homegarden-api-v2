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

    // reset supabase client instance in middleware
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: {
        SUPABASE_URL: 'http://supabase.test',
        SUPABASE_PUBLISHABLE_KEY: 'test-key',
      },
    }))
  })

  it('should return 401 if Authorization header is missing', async () => {
    mockContext.req.header.mockReturnValue(null)

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

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

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(401)
    expect(result.data.message).toBe('Invalid or expired Supabase token')
  })

  it('should sync existing user and call next()', async () => {
    mockContext.req.header.mockReturnValue('Bearer valid-token')
    const mockUser = { id: 'auth-id', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const dbUser = { id: 'db-id', email: 'test@example.com' }

    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: {
        user: {
          findUnique: vi.fn().mockResolvedValue(dbUser as any),
          create: vi.fn(),
        },
      },
    }))

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    await freshAuthMiddleware(mockContext, mockNext)

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

    const createdUser = { id: 'new-db-id', email: 'new@example.com' }

    const mockCreate = vi.fn().mockResolvedValue(createdUser as any)
    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: {
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: mockCreate,
        },
      },
    }))

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    await freshAuthMiddleware(mockContext, mockNext)

    expect(mockCreate).toHaveBeenCalledWith(
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
    mockContext.req.header.mockReturnValue('Bearer token')
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 'test@test.com', user_metadata: { first_name: 'OnlyFirst' } } },
      error: null,
    })

    const mockCreate = vi.fn().mockResolvedValue({ id: 'id' } as any)
    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: {
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: mockCreate,
        },
      },
    }))

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    await freshAuthMiddleware(mockContext, mockNext)

    expect(mockCreate).toHaveBeenCalledWith(
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

    vi.resetModules()
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: {
        SUPABASE_URL: null,
        SUPABASE_PUBLISHABLE_KEY: 'test-key',
      },
    }))

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )

    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
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

    // Configure mockSupabase to throw a string
    mockSupabase.auth.getUser.mockRejectedValue('String Error')

    mockContext.req.header.mockReturnValue('Bearer token')

    // Re-import to ensure clean state (though might not be strictly necessary if createClient mock persists)
    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )
    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })
})
