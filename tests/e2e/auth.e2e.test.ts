import { serve } from '@hono/node-server'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import app from '../../index.js'
import { prisma } from '../../infrastructure/database/prisma.client.js'
import { disconnectDb, resetDb } from '../helpers/reset-db.js'

// Mock Supabase with controllable behavior
const mockGetUser = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

describe('E2E: Authentication Flow', () => {
  let server: any
  let baseUrl: string
  // biome-ignore lint/correctness/noUnusedVariables: used for setup
  let _testUser: any

  beforeAll(async () => {
    await resetDb()

    // Create a test user in the database
    _testUser = await prisma.user.create({
      data: {
        email: 'e2e-auth@example.com',
        firstName: 'E2E',
        lastName: 'Tester',
        password: 'hashedpassword',
      },
    })

    // Start a real server
    server = serve({
      fetch: app.fetch,
      port: 0,
    })
    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : 3000
    baseUrl = `http://localhost:${port}`
  })

  afterAll(async () => {
    server.close()
    await disconnectDb()
  })

  describe('Public Routes', () => {
    it('should allow access to public routes without token', async () => {
      const res = await request(baseUrl).get('/')

      expect(res.status).toBe(200)
    })

    it('should allow access to API info without token', async () => {
      const res = await request(baseUrl).get('/api/v2')

      expect(res.status).toBe(200)
    })

    it('should allow access to OpenAPI spec without token', async () => {
      const res = await request(baseUrl).get('/doc')

      expect(res.status).toBe(200)
    })
  })

  describe('Protected Routes', () => {
    it('should block access to protected routes without token', async () => {
      const res = await request(baseUrl).get('/api/v2/gardens/plants')

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('UNAUTHORIZED')
    })

    it('should block access with invalid token', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid token' },
      })

      const res = await request(baseUrl)
        .get('/api/v2/gardens/plants')
        .set('Authorization', 'Bearer invalid-token')

      expect(res.status).toBe(401)
    })

    it('should allow access with valid token', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'supabase-user-id',
            email: 'e2e-auth@example.com',
            user_metadata: { full_name: 'E2E Tester' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      })

      const res = await request(baseUrl)
        .get('/api/v2/gardens/plants')
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('User Sync on Auth', () => {
    it('should sync new Supabase user to local DB', async () => {
      const newEmail = `e2e-new-${Date.now()}@example.com`

      mockGetUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'new-supabase-id',
            email: newEmail,
            user_metadata: { full_name: 'New User' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      })

      // Make authenticated request
      await request(baseUrl)
        .get('/api/v2/gardens/plants')
        .set('Authorization', 'Bearer new-user-token')

      // Check user was created in local DB
      const syncedUser = await prisma.user.findUnique({
        where: { email: newEmail },
      })

      expect(syncedUser).not.toBeNull()
      expect(syncedUser?.firstName).toBe('New')
      expect(syncedUser?.lastName).toBe('User')
    })
  })
})
