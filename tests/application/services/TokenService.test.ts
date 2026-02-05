import jwt from 'jsonwebtoken'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// We need to hoist the variable if we use it in vi.mock, but vi.mock is hoisted itself.
// The safe way is to define the mock *inside* vi.mock or use a separate file.
// Or we can use `vi.doMock` inside test blocks, but that requires dynamic imports.
// For now, let's just use a simple mock structure that Vitest can hoist or inline it.

vi.mock('../../../infrastructure/config/env', () => {
  // We can't use outer variables here because of hoisting.
  // So we return a mutable object that we can access via require/import in the test.
  return {
    env: {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
      JWT_REFRESH_EXPIRES_IN: '7d',
    },
  }
})

import { env } from '../../../infrastructure/config/env.js'
import { type TokenPayload, TokenService } from '../../../application/services/TokenService'

describe('TokenService', () => {
  let tokenService: TokenService

  beforeEach(() => {
    // Reset mock values to default before each test
    // We can cast to any to modify readonly properties for testing
    ;(env as any).JWT_SECRET = 'test-secret'

    try {
      tokenService = new TokenService()
    } catch (_e) {
      // Ignore error here, will be handled in specific tests
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    // Modify the mock for this test
    ;(env as any).JWT_SECRET = undefined
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
