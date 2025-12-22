import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../../index.js'
import { disconnectDb, resetDb } from '../helpers/reset-db.js'

// Mock Supabase Auth to bypass real authentication
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'integration-user-id',
            email: 'integration@test.com',
            user_metadata: { full_name: 'Integration Tester' },
          },
        },
        error: null,
      }),
    },
  }),
}))

import { prisma } from '../../infrastructure/database/prisma.client.js'

describe('Garden Routes Integration', () => {
  beforeAll(async () => {
    await resetDb()
  })

  // Clean up after each test to ensure isolation, or rely on resetDb at start
  // Given serial execution, resetDb at start of suite is good, but let's be safe.
  beforeEach(async () => {
    // Optional: reset per test? Might be too slow.
  })

  afterAll(async () => {
    await disconnectDb()
  })

  const authHeader = {
    Authorization: 'Bearer valid-test-token',
  }

  it('should return empty list initially', async () => {
    // Mock empty list
    ;(prisma.plant.findMany as any).mockResolvedValueOnce([])

    const res = await app.request('/api/v2/gardens/plants', {
      headers: authHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toEqual([])
  })

  it('should add a new plant', async () => {
    const payload = {
      gardenId: 'garden-123',
      location: 'Kitchen',
      nickname: 'Basil',
      commonName: 'Basil',
      scientificName: 'Ocimum basilicum',
    }

    // Mock Garden found
    ;(prisma.garden.findFirst as any).mockResolvedValueOnce({
      id: 'garden-123',
      name: 'Kitchen',
      userId: 'integration-user-id',
    })
    // Mock Plant created
    ;(prisma.plant.create as any).mockResolvedValueOnce({
      id: 'plant-123',
      nickname: 'Basil',
      gardenId: 'garden-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const res = await app.request('/api/v2/gardens/plants', {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.plant.nickname).toBe('Basil')
    expect(json.data.plant.gardenId).toBeDefined()
  })

  it('should retrieve the added plant', async () => {
    // Mock plant list
    ;(prisma.plant.findMany as any).mockResolvedValueOnce([
      {
        id: 'plant-123',
        nickname: 'Basil',
        gardenId: 'garden-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        garden: { name: 'Kitchen' },
      },
    ])

    const res = await app.request('/api/v2/gardens/plants', {
      headers: authHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()

    // Check if data is array or { plants: [] }
    const plants = json.data.plants || json.data
    expect(plants).toHaveLength(1)
    expect(plants[0].nickname).toBe('Basil')
  })
})
