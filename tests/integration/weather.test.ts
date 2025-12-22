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

// Mock Weather Adapter
vi.mock('../../infrastructure/external-services/open-meteo.adapter.js', () => ({
  OpenMeteoAdapter: class {
    getCurrentWeather = vi.fn().mockResolvedValue({
      success: true,
      data: {
        temperature: 20,
        humidity: 50,
        precipitation: 0,
        windSpeed: 10,
        conditions: 'Clear',
        icon: 'sunny',
      },
    })
    getForecast = vi.fn().mockResolvedValue({
      success: true,
      data: {
        daily: [
          {
            date: '2025-01-01',
            maxTemp: 25,
            minTemp: 15,
            precipitation: 0,
            conditions: 'Clear',
            icon: 'sunny',
          },
        ],
      },
    })
  },
}))

describe('Weather Integration', () => {
  let user: any
  let garden: any

  beforeAll(async () => {
    await resetDb()

    // Create User in DB (Mocking the sync that usually happens)
    user = await prisma.user.create({
      data: {
        email: `weather-test-${Date.now()}@example.com`,
        firstName: 'Weather',
        lastName: 'Tester',
        password: 'password123',
      },
    })

    // Create Garden
    garden = await prisma.garden.create({
      data: {
        name: 'My Weather Garden',
        userId: user.id,
        latitude: 48.8566, // Paris
        longitude: 2.3522,
        description: 'Test Garden',
      },
    })
  })

  afterAll(async () => {
    await disconnectDb()
  })

  it('should return 401 if not authenticated', async () => {
    // No mock needed as it returns early due to missing headers
    const res = await app.request(`/api/v2/gardens/${garden.id}/weather`)
    expect(res.status).toBe(401)
  })

  it('should return weather data for valid garden', async () => {
    // Mock Supabase Auth Success
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          email: user.email,
          user_metadata: { full_name: 'Weather Tester' },
        },
      },
      error: null,
    })

    // Mock Garden found with correct name
    const validGardenId = 'c123456789012345678905678'
    garden.id = validGardenId // Hack: Sync mocked ID

    // Mock Garden found with correct name
    ;(prisma.garden.findUnique as any).mockResolvedValueOnce({
      id: validGardenId,
      name: 'My Weather Garden',
      userId: user.id,
      latitude: 48.8566,
      longitude: 2.3522,
    })

    const res = await app.request(`/api/v2/gardens/${validGardenId}/weather`, {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const json = await res.json()

    expect(json.success).toBe(true)
    expect(json.data.gardenName).toBe('My Weather Garden')
    expect(json.data.current).toBeDefined()
    expect(json.data.current.temperature).toBeTypeOf('number')
    expect(json.data.forecast).toBeDefined()
    expect(json.data.forecast.daily.length).toBeGreaterThan(0)
  })

  it('should return 400 for invalid garden ID format', async () => {
    // Mock Supabase Auth Success
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: { email: user.email },
      },
      error: null,
    })

    // Validation middleware will catch 'invalid-id' before logic runs, returning 400
    const res = await app.request(`/api/v2/gardens/invalid-id/weather`, {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(400)
  })
})
