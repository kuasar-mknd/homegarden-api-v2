
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import app from '../index.js'
import { resetDb, disconnectDb } from './helpers/reset-db.js'
import { prisma } from '../infrastructure/database/prisma.client.js'

// Mock Supabase to avoid hitting real Auth API
const mockGetUser = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser
    }
  })
}))

describe('Auth Middleware Integration', () => {
    beforeAll(async () => {
        await resetDb()
    })

    afterAll(async () => {
        await disconnectDb()
    })

    it('should allow access to public routes without token', async () => {
        const res = await app.request('/')
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toHaveProperty('status', 'healthy')
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
                Authorization: 'Bearer invalid-token'
            }
        })
        expect(res.status).toBe(401)
    })

    it('should allow access with valid token and sync user to DB', async () => {
        const mockUser = {
            email: 'test@example.com',
            user_metadata: {
                full_name: 'Test User'
            }
        }
        
        // Mock successful Supabase Auth response
        mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })

        // Ensure DB is empty for this user
        const existing = await prisma.user.findUnique({ where: { email: mockUser.email } })
        expect(existing).toBeNull()

        // Make request
        const res = await app.request('/api/v2/gardens/plants', {
            headers: {
                Authorization: 'Bearer valid-token'
            }
        })

        // Should pass auth (even if business logic returns empty list)
        expect(res.status).toBe(200)

        // Verify user was synced to local DB
        const syncedUser = await prisma.user.findUnique({ where: { email: mockUser.email } })
        expect(syncedUser).toBeDefined()
        expect(syncedUser?.email).toBe(mockUser.email)
        expect(syncedUser?.firstName).toBe('Test')
        expect(syncedUser?.lastName).toBe('User')
    })
})
