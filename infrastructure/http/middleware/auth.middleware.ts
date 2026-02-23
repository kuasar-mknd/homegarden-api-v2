import { createClient } from '@supabase/supabase-js'
import { createMiddleware } from 'hono/factory'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../../database/prisma.client.js'

// Optimization: Select only fields required for user context to avoid fetching
// large JSON blobs (preferences) and sensitive data (password) on every request.
const AUTH_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  avatarUrl: true,
  birthDate: true,
  createdAt: true,
  updatedAt: true,
}

// Initialize Supabase client
const getSupabase = () => {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase URL or Publishable Key not configured')
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
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
      select: AUTH_USER_SELECT,
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
          // We use a random UUID as a placeholder to satisfy the NOT NULL constraint
          // and ensure it's unguessable and not a static string.
          // Using globalThis.crypto for Node.js 19+ / Web Crypto compatibility
          password: globalThis.crypto.randomUUID(),
          firstName,
          lastName,
          avatarUrl: metadata.avatar_url,
          role: 'USER',
        },
        select: AUTH_USER_SELECT,
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
