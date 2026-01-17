import jwt from 'jsonwebtoken'
import type { UserRole } from '../../domain/entities/user.entity.js'

export interface TokenPayload {
  id: string
  email: string
  role: UserRole
}

export interface TokenServiceConfig {
  secret: string
  expiresIn?: string
  refreshExpiresIn?: string
}

export class TokenService {
  private readonly secret: string
  private readonly expiresIn: string
  private readonly refreshExpiresIn: string

  constructor(config: TokenServiceConfig) {
    this.secret = config.secret

    if (!this.secret) {
      throw new Error('JWT_SECRET must be defined')
    }

    this.expiresIn = config.expiresIn || '1h'
    this.refreshExpiresIn = config.refreshExpiresIn || '7d'
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
