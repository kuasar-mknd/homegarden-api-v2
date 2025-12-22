import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import app from '../../index.js'
import { prisma } from '../../infrastructure/database/prisma.client.js'
import { disconnectDb, resetDb } from '../helpers/reset-db.js'

// Mock Supabase locally for this file
const mockGetUser = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

describe('Plant Integration Routes', () => {
  let user: any
  let _garden: any

  beforeAll(async () => {
    await resetDb()

    // Create User directly in DB
    const uniqueId = Date.now()
    const email = `plant-routes-${uniqueId}@example.com`
    user = await prisma.user.create({
      data: {
        email,
        firstName: 'Plant',
        lastName: 'Routes',
        password: 'password',
      },
    })

    // Create Garden
    _garden = await prisma.garden.create({
      data: {
        name: 'Route Garden',
        userId: user.id,
        latitude: 10,
        longitude: 10,
      },
    })

    // Setup Auth Mock
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: user.email,
          user_metadata: { full_name: 'Plant Routes' },
        },
      },
      error: null,
    })
  })

  afterAll(async () => {
    await disconnectDb()
  })

  it('should create a new plant', async () => {
    const payload = {
      gardenId: 'garden-123',
      nickname: 'My Tomato',
      location: 'Backyard',
      commonName: 'Tomato',
      scientificName: 'Solanum lycopersicum',
    }

    // Mock Garden found
    ;(prisma.garden.findFirst as any).mockResolvedValueOnce({ id: 'garden-123', name: 'Route Garden', userId: user.id })
    // Mock Plant Created
    ;(prisma.plant.create as any).mockResolvedValueOnce({
      id: 'plant-123',
      nickname: 'My Tomato',
      gardenId: 'garden-123',
    })

    const res = await app.request('/api/v2/gardens/plants', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.plant.nickname).toBe('My Tomato')
  })

  it('should list user plants', async () => {
    // Mock findMany for plants
    ;(prisma.plant.findMany as any).mockResolvedValueOnce([
      { id: 'plant-123', nickname: 'My Tomato', gardenId: 'garden-123', createdAt: new Date(), updatedAt: new Date() },
    ])

    const res = await app.request('/api/v2/gardens/plants', {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    
    // The controller returns { success: true, data: { plants: [...] } } or similar
    // Let's check the schema: GetUserPlantsResponseSchema allows either { plants: [] } or just []
    const plants = json.data.plants || json.data
    expect(Array.isArray(plants)).toBe(true)
    // Should contain the plant created above
    const plant = plants.find((p: any) => p.nickname === 'My Tomato')
    expect(plant).toBeDefined()
  })

  it('should return 401 for unauthorized access to create plant', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' },
    })

    const res = await app.request('/api/v2/gardens/plants', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { Authorization: 'Bearer invalid-token' },
    })

    expect(res.status).toBe(401)
  })

  it('should return 401 for unauthorized access to list plants', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' },
    })

    const res = await app.request('/api/v2/gardens/plants', {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid-token' },
    })

    expect(res.status).toBe(401)
  })
})
