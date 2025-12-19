import type { Context } from 'hono'

export class AuthController {
  /**
   * POST /register
   * Register a new user
   */
  register = async (c: Context) => {
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
