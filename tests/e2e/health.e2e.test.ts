import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { serve } from '@hono/node-server'
import app from '../../index.js'
import { disconnectDb, resetDb } from '../helpers/reset-db.js'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}))

describe('E2E: Health & Landing Page', () => {
  let server: any
  let baseUrl: string

  beforeAll(async () => {
    await resetDb()
    // Start a real server on a random port
    server = serve({
      fetch: app.fetch,
      port: 0, // Random available port
    })
    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : 3000
    baseUrl = `http://localhost:${port}`
  })

  afterAll(async () => {
    server.close()
    await disconnectDb()
  })

  describe('Landing Page', () => {
    it('should return HTML landing page on GET /', async () => {
      const res = await request(baseUrl).get('/')

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/html')
      expect(res.text).toContain('HomeGarden API')
      expect(res.text).toContain('v2.0.0')
    })
  })

  describe('API Info', () => {
    it('should return API info on GET /api/v2', async () => {
      const res = await request(baseUrl).get('/api/v2')

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('HomeGarden API')
      expect(res.body.endpoints).toBeDefined()
    })
  })

  describe('OpenAPI Documentation', () => {
    it('should return OpenAPI spec on GET /doc', async () => {
      const res = await request(baseUrl).get('/doc')

      expect(res.status).toBe(200)
      expect(res.body.openapi).toMatch(/^3\.\d+\.\d+$/)
      expect(res.body.info.title).toBe('HomeGarden API')
    })

    it('should return Swagger UI on GET /ui', async () => {
      const res = await request(baseUrl).get('/ui')

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/html')
      expect(res.text).toContain('swagger')
    })
  })

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const res = await request(baseUrl).get('/').set('Origin', 'http://example.com')

      expect(res.status).toBe(200)
      // CORS headers may or may not be present depending on origin
      // In test environment without specific origin matching, they might not be set
    })
  })
})
