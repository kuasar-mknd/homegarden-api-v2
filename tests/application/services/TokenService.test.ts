import jwt from 'jsonwebtoken'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type TokenPayload, TokenService } from '../../../application/services/TokenService'

// Mock the environment configuration
vi.mock('../../../infrastructure/config/env', () => ({
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
    tokenService = new TokenService()
  })

  afterEach(() => {
    vi.resetModules()
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

  it('should throw if JWT_SECRET is missing', async () => {
    // Reset modules to reload the mock with different values
    vi.resetModules()

    // Mock env with missing secret
    vi.doMock('../../../infrastructure/config/env', () => ({
      env: {
        JWT_SECRET: undefined,
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_EXPIRES_IN: '7d',
      },
    }))

    // Import the class again so it uses the new mock
    const { TokenService: TokenServiceWithoutSecret } = await import('../../../application/services/TokenService')

    expect(() => new TokenServiceWithoutSecret()).toThrow('JWT_SECRET must be defined')
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
