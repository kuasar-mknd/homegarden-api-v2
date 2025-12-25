import { z } from '@hono/zod-openapi'

// =============================================================================
// User Profile Schemas
// =============================================================================

export const UserIdPropSchema = z.object({
  id: z
    .string()
    .trim()
    .max(50)
    .openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: 'cjld2cjxh0000qzrmn831i7rn',
      description: 'User ID',
    }),
})

export const UserPublicProfileSchema = z.object({
  id: z.string().openapi({ example: 'cjld2cjxh0000qzrmn831i7rn' }),
  firstName: z.string().trim().max(50).openapi({ example: 'John' }),
  lastName: z.string().trim().max(50).openapi({ example: 'Doe' }),
  avatarUrl: z
    .string()
    .url()
    .max(500)
    .nullable()
    .openapi({ example: 'https://example.com/avatar.jpg' }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ example: '2023-01-01T00:00:00Z', description: 'Member since' }),
})

export const UserPublicProfileResponseSchema = z.object({
  success: z.boolean(),
  data: UserPublicProfileSchema,
})
