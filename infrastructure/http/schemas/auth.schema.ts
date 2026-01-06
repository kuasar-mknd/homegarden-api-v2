import { z } from '@hono/zod-openapi'

export const LoginSchema = z.object({
  email: z.string().trim().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(1).openapi({ example: 'password123' }),
})

export const RegisterSchema = z.object({
  email: z.string().trim().email().openapi({ example: 'newuser@example.com' }),
  password: z.string().min(8).openapi({ example: 'securePassword123' }),
  name: z.string().trim().min(2).optional().openapi({ example: 'John Doe' }),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1).openapi({ example: 'refresh_token_xyz' }),
})
