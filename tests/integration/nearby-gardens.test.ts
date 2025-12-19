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

describe('Nearby Gardens Integration', () => {
  let user: any

  beforeAll(async () => {
    await resetDb()

    // 1. Create User
    const uniqueId = Date.now()
    const email = `geo-${uniqueId}@test.com`

    user = await prisma.user.create({
      data: {
        email,
        firstName: 'Geo',
        lastName: 'Tester',
        password: 'password',
      },
    })

    // Store email for mocks
    ;(global as any).testEmail = email

    // 2. Create Gardens at specific locations
    // Paris: 48.8566, 2.3522
    await prisma.garden.create({
      data: {
        name: 'Paris Garden',
        userId: user.id,
        latitude: 48.8566,
        longitude: 2.3522,
        description: 'Central Paris',
      },
    })

    // Versailles: 48.8049, 2.1204 (~17km from Paris center)
    await prisma.garden.create({
      data: {
        name: 'Versailles Garden',
        userId: user.id,
        latitude: 48.8049,
        longitude: 2.1204,
        description: 'Near Paris',
      },
    })

    // London: 51.5074, -0.1278 (~340km from Paris)
    await prisma.garden.create({
      data: {
        name: 'London Garden',
        userId: user.id,
        latitude: 51.5074,
        longitude: -0.1278,
        description: 'Far away',
      },
    })
  })

  afterAll(async () => {
    await disconnectDb()
  })

  it('should return gardens within default radius (10km)', async () => {
    // Mock Auth
    const email = (global as any).testEmail
    mockGetUser.mockResolvedValue({ data: { user: { email } }, error: null })

    // Query mostly focused on Paris center
    const res = await app.request('/api/v2/gardens/nearby?lat=48.8566&lng=2.3522', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)

    // Should find Paris Garden (0km)
    // Should NOT find Versailles (17km > 10km)
    // Should NOT find London
    const names = json.data.gardens.map((g: any) => g.name)
    expect(names).toContain('Paris Garden')
    expect(names).not.toContain('Versailles Garden')
    expect(names).not.toContain('London Garden')
  })

  it('should return gardens within expanded radius (30km)', async () => {
    // Mock Auth
    const email = (global as any).testEmail
    mockGetUser.mockResolvedValue({ data: { user: { email } }, error: null })

    const res = await app.request('/api/v2/gardens/nearby?lat=48.8566&lng=2.3522&radius=30', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()

    // Should find Paris and Versailles
    const names = json.data.gardens.map((g: any) => g.name)
    expect(names).toContain('Paris Garden')
    expect(names).toContain('Versailles Garden')
    expect(names).not.toContain('London Garden')
  })

  it('should validate input parameters', async () => {
    // Mock Auth
    const email = (global as any).testEmail
    mockGetUser.mockResolvedValue({ data: { user: { email } }, error: null })

    const res = await app.request('/api/v2/gardens/nearby?lat=invalid&lng=2.3522', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(400)
  })
})
