import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { prisma } from '../database/prisma.client.js'

export class AuthService {
  private getSupabase() {
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Supabase URL or Publishable Key not configured')
    }
    return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
  }

  async validateTokenAndGetUser(token: string) {
    try {
      const supabase = this.getSupabase()

      // 1. Verify token with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)

      if (error || !user || !user.email) {
        logger.warn({ err: error }, 'Auth failed: Invalid Supabase token')
        return null
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
        })
        logger.info({ userId: localUser.id }, 'Synced new user')
      }

      return localUser
    } catch (error) {
      logger.error({ err: error }, 'Auth validation error')
      // Re-throw if it's a critical infrastructure error, otherwise return null?
      // For now we re-throw to allow caller to decide between 500 and 401
      throw error
    }
  }
}

export const authService = new AuthService()
