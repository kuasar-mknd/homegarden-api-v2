import { type SupabaseClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Define mocks at top level
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

  // Dynamic dependencies
  let authMiddleware: any
  let prisma: any
  let createClient: any
  let env: any

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    // Re-import dependencies to get fresh mock instances
    const envModule = await import('../../infrastructure/config/env.js')
    env = envModule.env

    const prismaModule = await import('../../infrastructure/database/prisma.client.js')
    prisma = prismaModule.prisma

    const supabaseModule = await import('@supabase/supabase-js')
    createClient = supabaseModule.createClient

    // Import Middleware (this will trigger getSupabase -> createClient if called)
    const middlewareModule = await import('../../infrastructure/http/middleware/auth.middleware.js')
    authMiddleware = middlewareModule.authMiddleware

    // Setup Supabase mock
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
    // Override env for this test
    vi.resetModules() // Clear cache
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: {
        SUPABASE_URL: null, // Missing
        SUPABASE_PUBLISHABLE_KEY: 'test-key',
      },
    }))

    // Re-import with bad env
    const middlewareModule = await import('../../infrastructure/http/middleware/auth.middleware.js')
    authMiddleware = middlewareModule.authMiddleware

    mockContext.req.header.mockReturnValue('Bearer token')

    const result = (await authMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })

  it('should return 500 if prisma is missing', async () => {
    // Override prisma for this test
    vi.resetModules()
    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: undefined,
    }))

    // Re-import
    const middlewareModule = await import('../../infrastructure/http/middleware/auth.middleware.js')
    authMiddleware = middlewareModule.authMiddleware

    // Also re-import supabase/createClient mock as resetModules cleared it
    const supabaseModule = await import('@supabase/supabase-js')
    createClient = supabaseModule.createClient

    // Setup Supabase mock again (since createClient is new)
    vi.mocked(createClient).mockReturnValue(mockSupabase as any)

    mockContext.req.header.mockReturnValue('Bearer token')
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 't@t.com' } },
      error: null,
    })

    const result = (await authMiddleware(mockContext, mockNext)) as any
    expect(result.status).toBe(500)
    expect(result.data.message).toContain('Authentication service error')
  })

  it('should handle non-Error object rejection in auth middleware', async () => {
    // Reset handled by beforeEach, but we need to override supabase behavior
    mockSupabase.auth.getUser.mockRejectedValue('String Error')

    mockContext.req.header.mockReturnValue('Bearer token')

    const result = (await authMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })
})
