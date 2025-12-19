import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/entities/user.entity';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export class TokenService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-key-change-it';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.refreshExpiresIn });
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
