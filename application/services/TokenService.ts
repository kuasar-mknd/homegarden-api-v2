import jwt from 'jsonwebtoken'
import type { UserRole } from '../../domain/entities/user.entity.js'
import { env } from '../../infrastructure/config/env.js'

export interface TokenPayload {
  id: string
  email: string
  role: UserRole
}

export class TokenService {
  private readonly secret: string
  private readonly expiresIn: string
  private readonly refreshExpiresIn: string

  constructor() {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be defined')
    }
    this.secret = env.JWT_SECRET

    this.expiresIn = env.JWT_EXPIRES_IN
    this.refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions)
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.refreshExpiresIn,
    } as jwt.SignOptions)
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch (_error) {
      throw new Error('Invalid token')
    }
  }
}
