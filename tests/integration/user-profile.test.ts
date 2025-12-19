import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import app from '../../index.js'
import { prisma } from '../../infrastructure/database/prisma.client.js'
import { disconnectDb, resetDb } from '../helpers/reset-db.js'

// Mock Supabase
const mockGetUser = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

describe('User Public Profile Integration', () => {
  let targetUser: any
  let _viewerUser: any

  beforeAll(async () => {
    await resetDb()

    // 1. Create Target User (the one whose profile we will view)
    targetUser = await prisma.user.create({
      data: {
        email: 'target@example.com',
        firstName: 'Target',
        lastName: 'Person',
        password: 'securepass',
        avatarUrl: 'https://example.com/avatar.jpg',
      },
    })

    // 2. Create Viewer User (the one making the request)
    _viewerUser = await prisma.user.create({
      data: {
        email: 'viewer@example.com',
        firstName: 'Viewer',
        lastName: 'Person',
        password: 'securepass',
      },
    })
  })

  afterAll(async () => {
    await disconnectDb()
  })

  it('should return public profile for existing user', async () => {
    // Mock Auth as Viewer
    mockGetUser.mockResolvedValue({ data: { user: { email: 'viewer@example.com' } }, error: null })

    const res = await app.request(`/api/v2/users/${targetUser.id}`, {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)

    const data = json.data
    expect(data.id).toBe(targetUser.id)
    expect(data.firstName).toBe('Target')
    expect(data.lastName).toBe('Person')
    expect(data.avatarUrl).toBe('https://example.com/avatar.jpg')

    // Ensure sensitive data is NOT returned
    expect(data.email).toBeUndefined()
    expect(data.password).toBeUndefined()
    expect(data.role).toBeUndefined()
  })

  it('should return 404 for non-existent user', async () => {
    // Mock Auth as Viewer
    mockGetUser.mockResolvedValue({ data: { user: { email: 'viewer@example.com' } }, error: null })

    const res = await app.request('/api/v2/users/non-existent-id', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toBe('NOT_FOUND')
  })

  it('should return 401 if not authenticated', async () => {
    // Mock Auth failure
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth failed' } })

    const res = await app.request(`/api/v2/users/${targetUser.id}`, {
      headers: { Authorization: 'Bearer invalid-token' },
    })

    expect(res.status).toBe(401)
  })
})
