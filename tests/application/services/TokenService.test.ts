import { TokenService, type TokenPayload } from '../../../application/services/TokenService.js'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

describe('TokenService', () => {
  let tokenService: TokenService
  const mockPayload: TokenPayload = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  }

  beforeEach(() => {
    vi.resetModules()
    process.env.JWT_SECRET = 'test-secret'
    process.env.JWT_EXPIRES_IN = '1h'
    tokenService = new TokenService()
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
    delete process.env.JWT_EXPIRES_IN
  })

  it('should generate a valid access token', () => {
    const token = tokenService.generateAccessToken(mockPayload)
    expect(typeof token).toBe('string')
    const decoded = jwt.verify(token, 'test-secret') as any
    expect(decoded.id).toBe(mockPayload.id)
    expect(decoded.email).toBe(mockPayload.email)
  })

  it('should generate a valid refresh token', () => {
    const token = tokenService.generateRefreshToken(mockPayload)
    expect(typeof token).toBe('string')
    const decoded = jwt.verify(token, 'test-secret') as any
    expect(decoded.id).toBe(mockPayload.id)
  })

  it('should verify a valid token', () => {
    const token = tokenService.generateAccessToken(mockPayload)
    const decoded = tokenService.verifyToken(token)
    expect(decoded.id).toBe(mockPayload.id)
    expect(decoded.email).toBe(mockPayload.email)
    expect(decoded.role).toBe(mockPayload.role)
  })

  it('should throw error for invalid token', () => {
    expect(() => tokenService.verifyToken('invalid-token')).toThrow('Invalid token')
  })

  it('should use default values if env vars missing', () => {
    delete process.env.JWT_SECRET
    const defaultService = new TokenService()
    const token = defaultService.generateAccessToken(mockPayload)
    const decoded = defaultService.verifyToken(token)
    expect(decoded.id).toBe(mockPayload.id)
  })
})
