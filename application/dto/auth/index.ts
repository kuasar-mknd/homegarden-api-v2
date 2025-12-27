import { z } from 'zod'

// Register DTO
export const RegisterSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
})

export type RegisterDTO = z.infer<typeof RegisterSchema>

// Login DTO
export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(100),
})

export type LoginDTO = z.infer<typeof LoginSchema>

// Auth Response DTO
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['USER', 'ADMIN']),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export const AuthResponseSchema = z.object({
  user: UserResponseSchema,
  token: z.string(),
})

export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>
