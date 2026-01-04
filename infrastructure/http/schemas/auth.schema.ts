import { z } from '@hono/zod-openapi'

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
})
