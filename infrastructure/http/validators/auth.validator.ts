import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  avatarUrl: z.string().url().optional(),
});

export const refreshTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
