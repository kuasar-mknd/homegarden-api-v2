
import { createMiddleware } from 'hono/factory'
import { createClient } from '@supabase/supabase-js'
import { env } from '../../config/env.js'
import { prisma } from '../../database/prisma.client.js'


// Initialize Supabase client
// We use a factory or singleton pattern here to// Initialize Supabase client
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
    return c.json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing Authorization header'
    }, 401)
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const supabase = getSupabase()
    
    // 1. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user || !user.email) {
      console.warn('Auth failed:', error?.message)
      return c.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }, 401)
    }

    if (!prisma) {
        throw new Error('Database connection not initialized')
    }

    // 2. Sync user to local database
    // Check if user exists first to avoid unnecessary write operations
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    let localUser = existingUser

    if (!localUser) {
      // Create new user if not exists
      // Parse name from metadata if available
      const metadata = user.user_metadata || {}
      const firstName = metadata.full_name?.split(' ')[0] || metadata.first_name || 'Garden'
      const lastName = metadata.full_name?.split(' ').slice(1).join(' ') || metadata.last_name || 'User'

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
        }
      })
      console.log(`[Auth] Synced new user: ${user.email}`)
    }

    // 3. Attach user to context
    c.set('user', localUser)
    c.set('userId', localUser.id)

    return await next()

  } catch (error) {
    console.error('[AuthMiddleware] Error:', error)
    return c.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: `Authentication service error: ${error instanceof Error ? error.message : String(error)}`
    }, 500)
  }
})
