import { createClient } from '@supabase/supabase-js'
import { createMiddleware } from 'hono/factory'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../../database/prisma.client.js'

// Cache configuration
const CACHE_TTL_MS = 60 * 1000 // 1 minute
const CACHE_MAX_SIZE = 1000

interface CachedSession {
  user: any // We cache the full user object to avoid DB hits
  expiresAt: number
}

// Simple in-memory LRU-like cache
const tokenCache = new Map<string, CachedSession>()

// Cleanup interval to remove expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of tokenCache.entries()) {
    if (value.expiresAt < now) {
      tokenCache.delete(key)
    }
  }
}, CACHE_TTL_MS * 5) // Run cleanup every 5 minutes

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
 * Implements in-memory caching to reduce Supabase API and Database calls.
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
    const now = Date.now()

    // 1. Check Cache
    const cached = tokenCache.get(token)
    if (cached) {
      if (cached.expiresAt > now) {
        c.set('user', cached.user)
        c.set('userId', cached.user.id)
        return await next()
      }
      tokenCache.delete(token) // Expired
    }

    const supabase = getSupabase()

    // 2. Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user || !user.email) {
      // Don't log normal auth failures as errors to avoid log spam, use warning
      logger.warn({ err: error }, 'Auth token verification failed')
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

    // 3. Sync user to local database
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
          // We use a dummy placeholder or could make it optional in schema
          password: 'SUPABASE_AUTH_MANAGED',
          firstName,
          lastName,
          avatarUrl: metadata.avatar_url,
          role: 'USER',
        },
      })
      logger.info({ userId: localUser.id }, 'Synced new user')
    }

    // 4. Update Cache
    if (tokenCache.size >= CACHE_MAX_SIZE) {
      // Simple eviction: clear first item (not true LRU but sufficient for DoS protection)
      const firstKey = tokenCache.keys().next().value
      if (firstKey) tokenCache.delete(firstKey)
    }

    tokenCache.set(token, {
      user: localUser,
      expiresAt: now + CACHE_TTL_MS,
    })

    // 5. Attach user to context
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
