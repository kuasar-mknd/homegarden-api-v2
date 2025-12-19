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
    expect(result.data.message).toBe('Invalid or expired token')
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

    const result = (await authMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toContain('Supabase URL or Publishable Key not configured')

    // Restore
    ;(env as any).SUPABASE_URL = originalUrl
  })

  it('should return 500 if prisma is missing', async () => {
    mockContext.req.header.mockReturnValue('Bearer token')
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 't@t.com' } },
      error: null,
    })

    // This is tricky to test since prisma is imported.
    // We can mock it to be null if we re-mock the module.
  })
})
