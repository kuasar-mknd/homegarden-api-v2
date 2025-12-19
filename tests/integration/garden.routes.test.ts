import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import app from '../../index.js'
import { disconnectDb, resetDb } from '../helpers/reset-db.js'

// Mock Supabase Auth to bypass real authentication
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            email: 'integration@test.com',
            user_metadata: { full_name: 'Integration Tester' },
          },
        },
        error: null,
      }),
    },
  }),
}))

describe('Garden Routes Integration', () => {
  beforeAll(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await disconnectDb()
  })

  const authHeader = {
    Authorization: 'Bearer valid-test-token',
  }

  it('should return empty list initially', async () => {
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
      location: 'Kitchen',
      nickname: 'Basil',
      speciesInfo: {
        commonName: 'Basil',
        scientificName: 'Ocimum basilicum',
      },
    }

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
    expect(json.data.nickname).toBe('Basil')
    expect(json.data.gardenId).toBeDefined()
  })

  it('should retrieve the added plant', async () => {
    const res = await app.request('/api/v2/gardens/plants', {
      headers: authHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
    expect(json.data[0].nickname).toBe('Basil')
    expect(json.data[0].garden.name).toBe('Kitchen')
  })
})
