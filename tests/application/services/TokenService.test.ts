import jwt from 'jsonwebtoken'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type TokenPayload, TokenService } from '../../../application/services/TokenService'
import { env } from '../../../infrastructure/config/env.js'

vi.mock('../../../infrastructure/config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1h',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}))

describe('TokenService', () => {
  let tokenService: TokenService

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset env mock
    env.JWT_SECRET = 'test-secret'
    env.JWT_EXPIRES_IN = '1h'
    env.JWT_REFRESH_EXPIRES_IN = '7d'

    tokenService = new TokenService()
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

  it('should throw if JWT_SECRET is missing', () => {
    // @ts-expect-error - testing missing secret
    env.JWT_SECRET = undefined
    expect(() => new TokenService()).toThrow('JWT_SECRET must be defined')
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
