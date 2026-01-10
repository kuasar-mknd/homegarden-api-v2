import { createClient } from '@supabase/supabase-js'
import { createMiddleware } from 'hono/factory'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../../database/prisma.client.js'

// Initialize Supabase client singleton to avoid overhead on every request
const supabaseClient =
  env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
    : null

const getSupabase = () => {
  if (!supabaseClient) {
    throw new Error('Supabase URL or Publishable Key not configured')
  }
  return supabaseClient
}

/**
 * Authentication Middleware
 *
 * Verifies the Supabase JWT token and syncs the user to the local database.
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json(
      {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Missing Authorization header',
      },
      401,
    )
  }

  // Prevent DoS via extremely long headers (limit to 8KB which is generous for JWT)
  if (authHeader.length > 8192) {
    return c.json(
      {
        success: false,
        error: 'BAD_REQUEST',
        message: 'Authorization header too long',
      },
      400,
    )
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const supabase = getSupabase()

    // 1. Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user || !user.email) {
      logger.warn({ err: error }, 'Auth failed')
      return c.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid or expired Supabase token',
        },
        401,
      )
    }

    if (!prisma) {
      throw new Error('Database connection not initialized')
    }

    // 2. Sync user to local database
    // Check if user exists first to avoid unnecessary write operations
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    let localUser = existingUser

    if (!localUser) {
      // Create new user if not exists
      // Parse name from metadata if available
      const metadata = user.user_metadata || {}
      const firstName = metadata.full_name?.split(' ')[0] || metadata.first_name || 'Garden'
      const lastName =
        metadata.full_name?.split(' ').slice(1).join(' ') || metadata.last_name || 'User'

      localUser = await prisma.user.create({
        data: {
          email: user.email,
          // We don't store the actual password since auth is handled by Supabase
          // Security: Use random UUID to prevent any theoretical well-known password attack
          password: crypto.randomUUID(),
          firstName,
          lastName,
          avatarUrl: metadata.avatar_url,
          role: 'USER',
        },
      })
      logger.info({ userId: localUser.id }, 'Synced new user')
    }

    // 3. Attach user to context
    c.set('user', localUser)
    c.set('userId', localUser.id)

    return await next()
  } catch (error) {
    logger.error({ err: error }, 'AuthMiddleware Error')
    return c.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Authentication service error',
      },
      500,
    )
  }
})
