import type { z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import type { LoginSchema, RefreshTokenSchema, RegisterSchema } from '../schemas/auth.schema.js'

export class AuthController {
  /**
   * POST /register
   * Register a new user
   */
  register = async (c: Context) => {
    // Validate input schema
    const _body = (await c.req.valid('json' as never)) as z.infer<typeof RegisterSchema>

    return c.json(
      {
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Auth registration handled by Supabase client',
      },
      501,
    )
  }

  /**
   * POST /login
   * Login user
   */
  login = async (c: Context) => {
    // Validate input schema
    const _body = (await c.req.valid('json' as never)) as z.infer<typeof LoginSchema>

    return c.json(
      {
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Auth login handled by Supabase client',
      },
      501,
    )
  }

  /**
   * POST /refresh-token
   * Refresh access token
   */
  refreshToken = async (c: Context) => {
    // Validate input schema
    const _body = (await c.req.valid('json' as never)) as z.infer<typeof RefreshTokenSchema>

    return c.json(
      {
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Auth token refresh handled by Supabase client',
      },
      501,
    )
  }
}
