import { z } from '@hono/zod-openapi'

export const RegisterInputSchema = z.object({
  email: z.string().trim().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(8).max(100).openapi({ example: 'SecureP@ss123' }),
  firstName: z.string().trim().min(1).max(50).openapi({ example: 'John' }),
  lastName: z.string().trim().min(1).max(50).openapi({ example: 'Doe' }),
})

export const LoginInputSchema = z.object({
  email: z.string().trim().email().openapi({ example: 'user@example.com' }),
  password: z.string().openapi({ example: 'SecureP@ss123' }),
})

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().trim().min(1).openapi({ example: 'refresh_token_xyz' }),
})

export const AuthResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    }),
  }),
})

export const ErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'AUTH_FAILED' }),
  message: z.string().openapi({ example: 'Invalid credentials' }),
})
