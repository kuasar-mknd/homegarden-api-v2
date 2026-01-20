import jwt from 'jsonwebtoken'
import { env } from '../../infrastructure/config/env.js'
import type { UserRole } from '../../domain/entities/user.entity.js'

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
    this.secret = env.JWT_SECRET as string

    // Sentinel: Critical check - ensure secret is defined before proceeding
    if (!this.secret) {
      throw new Error('JWT_SECRET must be defined')
    }

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
