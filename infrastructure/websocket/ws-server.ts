import type { IncomingMessage, Server } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import { type WebSocket, WebSocketServer } from 'ws'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { prisma } from '../database/prisma.client.js'
import { handleCareReminderMessage } from './handlers/care-reminder.handler.js'
import { handleWeatherMessage } from './handlers/weather.handler.js'
import type { WSMessage } from './types.js'

// Initialize Supabase client
const getSupabase = () => {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase URL or Publishable Key not configured')
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
}

export function initializeWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server })

  logger.info('WebSocket Server initialized')

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    logger.info('New WebSocket connection')

    let isAuthenticated = false
    const messageBuffer: string[] = []

    const processMessage = async (data: string) => {
      try {
        const message: WSMessage = JSON.parse(data.toString())
        logger.debug({ message }, 'Received WebSocket message')

        switch (message.channel) {
          case 'weather':
            await handleWeatherMessage(ws, message)
            break
          case 'care-reminders':
            await handleCareReminderMessage(ws, message)
            break
          default:
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Unknown channel' },
              }),
            )
        }
      } catch (error) {
        logger.error({ error }, 'Error handling WebSocket message')
        ws.send(
          JSON.stringify({
            type: 'ERROR',
            payload: { message: 'Invalid message format' },
          }),
        )
      }
    }

    ws.on('message', async (data: string) => {
      if (!isAuthenticated) {
        messageBuffer.push(data)
        return
      }
      await processMessage(data)
    })

    const authenticate = async () => {
      try {
        // Extract token from query parameters
        const url = new URL(req.url || '', `http://${req.headers.host}`)
        const token = url.searchParams.get('token')

        if (!token) {
          logger.warn('WebSocket connection attempt without token')
          ws.close(1008, 'Authentication required')
          return
        }

        const supabase = getSupabase()

        // Verify token with Supabase
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token)

        if (error || !user || !user.email) {
          logger.warn({ err: error }, 'WebSocket authentication failed')
          ws.close(1008, 'Authentication failed')
          return
        }

        if (!prisma) {
          logger.error('Database connection not initialized for WebSocket')
          ws.close(1011, 'Internal Server Error')
          return
        }

        // Sync user to local database and get local ID
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
          logger.info({ userId: localUser.id }, 'Synced new user via WebSocket')
        }
        // Attach user ID to the WebSocket connection
        ;(ws as any).userId = localUser.id
        isAuthenticated = true

        // Process buffered messages
        for (const data of messageBuffer) {
          await processMessage(data)
        }
        messageBuffer.length = 0 // clear buffer
      } catch (authError) {
        logger.error({ err: authError }, 'WebSocket auth error')
        ws.close(1011, 'Authentication error')
      }
    }

    authenticate()

    ws.on('close', () => {
      logger.info('WebSocket connection closed')
    })

    ws.on('error', (error) => {
      logger.error({ error }, 'WebSocket error')
    })
  })

  return wss
}
