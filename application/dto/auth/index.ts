import { z } from 'zod'

// Register DTO
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

export type RegisterDTO = z.infer<typeof RegisterSchema>

// Login DTO
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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
