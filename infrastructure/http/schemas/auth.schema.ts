import { z } from '@hono/zod-openapi'

export const RegisterSchema = z.object({
  email: z.string().email().openapi({
    example: 'user@example.com',
    description: 'User email address',
  }),
  password: z.string().min(8).max(100).openapi({
    example: 'SecurePass123!',
    description: 'Password (min 8 chars)',
  }),
  fullName: z.string().trim().max(100).optional().openapi({
    example: 'John Doe',
    description: 'Full name of the user',
  }),
})

export const LoginSchema = z.object({
  email: z.string().email().openapi({
    example: 'user@example.com',
    description: 'User email address',
  }),
  password: z.string().min(1).max(100).openapi({
    example: 'SecurePass123!',
    description: 'Password',
  }),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1).openapi({
    example: 'refresh_token_xyz',
    description: 'Refresh token received during login',
  }),
})
