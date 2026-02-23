import { createClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { env } from '../../infrastructure/config/env.js'
import { prisma } from '../../infrastructure/database/prisma.client.js'

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

  beforeEach(async () => {
    vi.resetModules() // Reset modules to clear singleton state
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

    // Dynamically import the middleware to get a fresh instance
    const module = await import('../../infrastructure/http/middleware/auth.middleware.js')
    authMiddleware = module.authMiddleware
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

    const dbUser = { id: 'db-id', email: 'test@example.com', password: 'hashed-password' }
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser as any)

    await authMiddleware(mockContext, mockNext)

    // Check that password was stripped
    const { password, ...safeUser } = dbUser
    expect(mockContext.set).toHaveBeenCalledWith('user', safeUser)
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
    const createdUser = { id: 'new-db-id', email: 'new@example.com', password: 'new-password' }
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

    // Check password stripped
    const { password, ...safeUser } = createdUser
    expect(mockContext.set).toHaveBeenCalledWith('user', safeUser)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle metadata without full_name', async () => {
    mockContext.req.header.mockReturnValue('Bearer token')
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 'test@test.com', user_metadata: { first_name: 'OnlyFirst' } } },
      error: null,
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'id', password: 'pwd' } as any)

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
    vi.resetModules()

    // Mock env to have missing vars
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: {
        SUPABASE_URL: null,
        SUPABASE_PUBLISHABLE_KEY: null,
      },
    }))

    mockContext.req.header.mockReturnValue('Bearer token')

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )

    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })

  it('should return 500 if prisma is missing', async () => {
    vi.resetModules() // Clear cache from beforeEach

    mockContext.req.header.mockReturnValue('Bearer token')
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 't@t.com' } },
      error: null,
    })

    // We mock the prisma module to return undefined
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
    // Configure mockSupabase to throw a string
    mockSupabase.auth.getUser.mockRejectedValue('String Error')

    mockContext.req.header.mockReturnValue('Bearer token')

    const result = (await authMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })
})
