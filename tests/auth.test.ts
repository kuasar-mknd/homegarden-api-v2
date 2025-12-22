import crypto from 'node:crypto'
import { afterAll, describe, expect, it, vi } from 'vitest'
import app from '../index.js'
import { prisma } from '../infrastructure/database/prisma.client.js'
import { disconnectDb } from './helpers/reset-db.js'

// Mock Prisma
vi.mock('../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    plant: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    garden: {
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}))

// Mock Supabase to avoid hitting real Auth API
const mockGetUser = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

describe('Auth Middleware Integration', () => {
  afterAll(async () => {
    await disconnectDb()
  })

  it('should allow access to public routes without token', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('HomeGarden API')
  })

  it('should block access to protected routes without token', async () => {
    const res = await app.request('/api/v2/gardens/plants')
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toHaveProperty('error', 'UNAUTHORIZED')
  })

  it('should block access with invalid token', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Invalid token' } })

    const res = await app.request('/api/v2/gardens/plants', {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    })
    expect(res.status).toBe(401)
  })

  it('should allow access with valid token and sync user to DB', async () => {
    const userEmail = `auth-test-${crypto.randomUUID()}@example.com`
    const mockUser = {
      id: crypto.randomUUID(),
      email: userEmail,
      user_metadata: {
        full_name: 'Auth Test User',
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }

    // Mock successful Supabase Auth response
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })

    // Mock Prisma findUnique to return null first (user doesn't exist)
    const mockFindUnique = prisma.user.findUnique as any
    const mockCreate = prisma.user.create as any
    
    mockFindUnique.mockResolvedValueOnce(null)
    mockCreate.mockResolvedValueOnce({
      ...mockUser,
      firstName: 'Auth',
      lastName: 'Test User',
      role: 'USER'
    })
    mockFindUnique.mockResolvedValueOnce({
      ...mockUser,
      firstName: 'Auth',
      lastName: 'Test User',
      role: 'USER'
    })

    // Make request
    const res = await app.request('/api/v2/gardens/plants', {
      headers: {
        Authorization: 'Bearer valid-token',
      },
    })

    // Should pass auth
    if (res.status === 500) {
      const body = await res.json()
      throw new Error(`500 Error: ${JSON.stringify(body)}`)
    }
    expect(res.status).toBe(200)

    // Verify user sync was checked
    expect(mockFindUnique).toHaveBeenCalled()
  })
})
