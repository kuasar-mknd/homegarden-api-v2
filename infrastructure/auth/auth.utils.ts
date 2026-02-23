import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { prisma } from '../database/prisma.client.js'
import type { User } from '../../domain/entities/user.entity.js'

// Initialize Supabase client
export const getSupabase = () => {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase URL or Publishable Key not configured')
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
}

/**
 * Verifies Supabase token and syncs user to local database
 */
export const verifyAndSyncUser = async (token: string): Promise<User> => {
  try {
    const supabase = getSupabase()

    // 1. Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user || !user.email) {
      logger.warn({ err: error }, 'Auth verification failed')
      throw new Error('Invalid or expired token')
    }

    if (!prisma) {
      throw new Error('Database connection not initialized')
    }

    // 2. Sync user to local database
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    let localUser = existingUser

    if (!localUser) {
      // Create new user if not exists
      const metadata = user.user_metadata || {}
      const firstName = metadata.full_name?.split(' ')[0] || metadata.first_name || 'Garden'
      const lastName =
        metadata.full_name?.split(' ').slice(1).join(' ') || metadata.last_name || 'User'

      localUser = await prisma.user.create({
        data: {
          email: user.email,
          password: globalThis.crypto.randomUUID(),
          firstName,
          lastName,
          avatarUrl: metadata.avatar_url,
          role: 'USER',
        },
      })
      logger.info({ userId: localUser.id }, 'Synced new user')
    }

    return localUser as unknown as User // Cast to domain entity if needed, or prisma type matches mostly
  } catch (error) {
    logger.error({ err: error }, 'Auth Service Error')
    throw error
  }
}
