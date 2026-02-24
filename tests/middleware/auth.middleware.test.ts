import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies handled in beforeEach with doMock/resetModules
describe('AuthMiddleware', () => {
  let mockContext: any
  let mockNext: any
  let mockSupabase: any
  let authMiddleware: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    }

    // Mock dependencies for every test to ensure clean state
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => mockSupabase),
    }))

    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: {
        SUPABASE_URL: 'http://supabase.test',
        SUPABASE_PUBLISHABLE_KEY: 'test-key',
      },
    }))

    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: {
        user: {
          findUnique: vi.fn(),
          create: vi.fn(),
        },
      },
    }))

    // Re-import middleware to get fresh singleton state
    const module = await import('../../infrastructure/http/middleware/auth.middleware.js')
    authMiddleware = module.authMiddleware

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
    // We need to get the prisma mock from the re-imported module or global mock
    const { prisma } = await import('../../infrastructure/database/prisma.client.js')
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

    const { prisma } = await import('../../infrastructure/database/prisma.client.js')
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
    const { prisma } = await import('../../infrastructure/database/prisma.client.js')
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
    // Reset modules and mock env to be missing
    vi.resetModules()
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: {
        SUPABASE_URL: null, // Missing
        SUPABASE_PUBLISHABLE_KEY: 'test-key',
      },
    }))
    // We also need to mock other dependencies again since resetModules cleared them
    vi.doMock('@supabase/supabase-js', () => ({ createClient: vi.fn() }))
    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: { user: {} },
    }))

    // Re-import
    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )

    mockContext.req.header.mockReturnValue('Bearer token')
    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })

  it('should return 500 if prisma is missing', async () => {
    vi.resetModules()
    // Re-setup basic mocks
    vi.doMock('../../infrastructure/config/env.js', () => ({
      env: {
        SUPABASE_URL: 'http://supabase.test',
        SUPABASE_PUBLISHABLE_KEY: 'test-key',
      },
    }))
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => mockSupabase),
    }))
    // Mock prisma as undefined
    vi.doMock('../../infrastructure/database/prisma.client.js', () => ({
      prisma: undefined,
    }))

    // Setup supabase mock which is used by createClient
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 't@t.com' } },
      error: null,
    })

    const { authMiddleware: freshAuthMiddleware } = await import(
      '../../infrastructure/http/middleware/auth.middleware.js'
    )

    mockContext.req.header.mockReturnValue('Bearer token')

    const result = (await freshAuthMiddleware(mockContext, mockNext)) as any
    expect(result.status).toBe(500)
    expect(result.data.message).toContain('Authentication service error')
  })

  it('should handle non-Error object rejection in auth middleware', async () => {
    // Re-setup is handled by beforeEach mostly, but we need to ensure the supabase mock behavior
    mockSupabase.auth.getUser.mockRejectedValue('String Error')

    mockContext.req.header.mockReturnValue('Bearer token')

    const result = (await authMiddleware(mockContext, mockNext)) as any

    expect(result.status).toBe(500)
    expect(result.data.message).toBe('Authentication service error')
  })
})
