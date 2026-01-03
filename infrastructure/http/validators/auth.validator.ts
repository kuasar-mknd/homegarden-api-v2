import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  birthDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  avatarUrl: z.string().url().optional(),
})

export const refreshTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})
