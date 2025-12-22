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
    // Mock Auth as Viewer with full user data
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'supabase-viewer-id',
          email: 'viewer@example.com',
          user_metadata: { full_name: 'Viewer Person' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      },
      error: null,
    })

    // Mock Target User found
    ;(prisma.user.findUnique as any).mockResolvedValueOnce({
      id: targetUser.id,
      email: 'target@example.com',
      firstName: 'Target',
      lastName: 'Person',
      avatarUrl: 'https://example.com/avatar.jpg',
    })

    // Mock findUnique based on args
    ;(prisma.user.findUnique as any).mockImplementation((args: any) => {
      if (args.where.email === 'viewer@example.com') {
        return Promise.resolve({
          id: 'viewer-id',
          email: 'viewer@example.com',
          firstName: 'Viewer',
          lastName: 'Person',
        })
      }
      if (args.where.id === targetUser.id) {
        return Promise.resolve({
          id: targetUser.id,
          email: 'target@example.com',
          firstName: 'Target',
          lastName: 'Person',
          avatarUrl: 'https://example.com/avatar.jpg',
        })
      }
      return Promise.resolve(null)
    })

    // Override create mock to return a CUID-like ID if needed,
    // or just assume prisma mocks handle it. But we need to make sure the ID we request is valid.
    // The previous 'targetUser.id' comes from actual prisma.create() in beforeAll.
    // We should ensure that ID is treated or replaced by a valid CUID string if the real DB logic generates one.
    // However, since we are mocking findUnique, let's just make sure the request URL uses a valid CUID,
    // and the mock expects it.

    // Actually targetUser.id comes from prisma.create which uses cuid() in schema likely.
    // Let's force it to be a known CUID for testing if we can't rely on it.
    // For now, let's assume valid ID is 'c123456789012345678905555' for this test case mock matching.

    const validTargetId = 'c123456789012345678905555'
    targetUser.id = validTargetId // Hack to sync ID

    const res = await app.request(`/api/v2/users/${validTargetId}`, {
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

    // Mock User NOT found
    ;(prisma.user.findUnique as any).mockResolvedValueOnce(null)

    // Mock User NOT found (via existing mockImplementation above or override)
    ;(prisma.user.findUnique as any).mockImplementation((args: any) => {
      if (args.where.email === 'viewer@example.com') {
        return Promise.resolve({ id: 'viewer-id', email: 'viewer@example.com' })
      }
      return Promise.resolve(null)
    })

    const res = await app.request('/api/v2/users/c123456789012345678900000', {
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

  it('should return null for avatarUrl if not set', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'viewer@example.com' } }, error: null })

    ;(prisma.user.findUnique as any).mockImplementation((args: any) => {
      // Use CUIDs for all IDs to satisfy schema validation
      if (args.where.email === 'viewer@example.com') {
        return Promise.resolve({ id: 'c123456789012345678901234', email: 'viewer@example.com' })
      }
      if (args.where.id === 'c123456789012345678909999') {
        return Promise.resolve({
          id: 'c123456789012345678909999',
          firstName: 'No',
          lastName: 'Avatar',
          avatarUrl: undefined,
          createdAt: new Date(),
        })
      }
      return Promise.resolve(null)
    })

    const res = await app.request('/api/v2/users/c123456789012345678909999', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.avatarUrl).toBe(null)
  })
})
