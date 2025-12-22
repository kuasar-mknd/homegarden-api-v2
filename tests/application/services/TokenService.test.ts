import jwt from 'jsonwebtoken'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type TokenPayload, TokenService } from '../../../application/services/TokenService'

describe('TokenService', () => {
  let tokenService: TokenService
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules() // clears the cache
    process.env = { ...originalEnv } // reset env vars
    process.env.JWT_SECRET = 'test-secret'
    process.env.JWT_EXPIRES_IN = '1h'
    process.env.JWT_REFRESH_EXPIRES_IN = '7d'
    tokenService = new TokenService()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const mockPayload: TokenPayload = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  }

  it('should generate a valid access token', () => {
    const token = tokenService.generateAccessToken(mockPayload)
    expect(token).toBeDefined()

    const decoded = jwt.verify(token, 'test-secret') as TokenPayload
    expect(decoded.id).toBe(mockPayload.id)
    expect(decoded.email).toBe(mockPayload.email)
    expect(decoded.role).toBe(mockPayload.role)
  })

  it('should generate a valid refresh token', () => {
    const token = tokenService.generateRefreshToken(mockPayload)
    expect(token).toBeDefined()

    const decoded = jwt.verify(token, 'test-secret') as TokenPayload
    expect(decoded.id).toBe(mockPayload.id)
  })

  it('should verify a valid token', () => {
    const token = jwt.sign(mockPayload, 'test-secret')
    const decoded = tokenService.verifyToken(token)

    expect(decoded.id).toBe(mockPayload.id)
    expect(decoded.email).toBe(mockPayload.email)
    expect(decoded.role).toBe(mockPayload.role)
  })

  it('should use default values when env vars are missing', () => {
    const originalEnv = { ...process.env }
    delete process.env.JWT_SECRET
    delete process.env.JWT_EXPIRES_IN
    delete process.env.JWT_REFRESH_EXPIRES_IN

    const defaultService = new TokenService()
    expect((defaultService as any).secret).toBe('default-secret-key-change-it')
    expect((defaultService as any).expiresIn).toBe('1h')
    expect((defaultService as any).refreshExpiresIn).toBe('7d')

    process.env = originalEnv
  })

  it('should throw an error for invalid token', () => {
    const invalidToken = 'invalid.token.string'
    expect(() => tokenService.verifyToken(invalidToken)).toThrow('Invalid token')
  })

  it('should throw an error for expired token', () => {
    // Creating an expired token
    const token = jwt.sign(mockPayload, 'test-secret', { expiresIn: '-1s' })
    expect(() => tokenService.verifyToken(token)).toThrow('Invalid token')
  })
})
