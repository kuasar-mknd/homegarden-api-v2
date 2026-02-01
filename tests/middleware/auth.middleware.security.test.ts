import { createClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('AuthMiddleware Security', () => {
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

  it('should NOT expose password field in context user object', async () => {
    mockContext.req.header.mockReturnValue('Bearer valid-token')
    const mockUser = { id: 'auth-id', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    // Database returns user WITH password (even if it's a placeholder)
    const dbUser = {
      id: 'db-id',
      email: 'test@example.com',
      password: 'secret-uuid-placeholder'
    }
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser as any)

    await authMiddleware(mockContext, mockNext)

    // Verify user was set on context
    expect(mockContext.set).toHaveBeenCalledWith('user', expect.anything())

    // Get the user object passed to context
    const userSetOnContext = mockContext.set.mock.calls.find((call: any[]) => call[0] === 'user')?.[1]

    // Security assertion: Password should be stripped
    // Currently this test is EXPECTED TO FAIL until we fix the middleware
    expect(userSetOnContext).not.toHaveProperty('password')
    expect(userSetOnContext).not.toEqual(expect.objectContaining({ password: expect.anything() }))
  })
})
