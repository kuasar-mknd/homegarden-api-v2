import { createClient } from '@supabase/supabase-js'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { prisma } from '../../database/prisma.client.js'

export const getSupabase = () => {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase URL or Publishable Key not configured')
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
}

/**
 * Verifies Supabase token and syncs user to local database
 * @returns The local user object or null if verification fails
 * @throws Error if system configuration is invalid or database is inaccessible
 */
export const verifySupabaseTokenAndSyncUser = async (token: string) => {
  const supabase = getSupabase()

  // 1. Verify token with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user || !user.email) {
    logger.warn({ err: error }, 'Auth verification failed')
    return null
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
        // We use a random UUID as a placeholder to satisfy the NOT NULL constraint
        password: globalThis.crypto.randomUUID(),
        firstName,
        lastName,
        avatarUrl: metadata.avatar_url,
        role: 'USER',
      },
    })
    logger.info({ userId: localUser.id }, 'Synced new user')
  }

  return localUser
}
