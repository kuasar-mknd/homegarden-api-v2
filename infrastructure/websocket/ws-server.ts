import { createClient } from '@supabase/supabase-js'
import type { Server } from 'node:http'
import { type WebSocket, WebSocketServer } from 'ws'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { prisma } from '../database/prisma.client.js'
import { handleCareReminderMessage } from './handlers/care-reminder.handler.js'
import { handleWeatherMessage } from './handlers/weather.handler.js'
import type { WSMessage } from './types.js'

let supabaseClient: ReturnType<typeof createClient> | null = null
const getSupabase = () => {
  if (!supabaseClient) {
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Supabase URL or Publishable Key not configured')
    }
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)
  }
  return supabaseClient
}

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
}

export function initializeWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
    verifyClient: async (info, cb) => {
      try {
        const url = new URL(info.req.url || '', `http://${info.req.headers.host}`)
        const token = url.searchParams.get('token')

        if (!token) {
          // Allow unauthenticated connections, handlers will check auth if needed
          return cb(true)
        }

        const supabase = getSupabase()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token)

        if (error || !user) {
          return cb(false, 401, 'Unauthorized: Invalid token')
        }

        if (user.email) {
          const localUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          })
          if (localUser) {
            // @ts-expect-error - Adding custom property to req
            info.req.userId = localUser.id
            return cb(true)
          }
        }

        return cb(false, 401, 'Unauthorized: User not synced')
      } catch (err) {
        logger.error({ err }, 'WebSocket authentication error')
        cb(false, 500, 'Internal Server Error')
      }
    },
  })

  logger.info('WebSocket Server initialized')

  // @ts-expect-error - overriding connection typings
  wss.on('connection', async (ws: AuthenticatedWebSocket, request: any) => {
    logger.info('New WebSocket connection')
    ws.userId = request.userId

    ws.on('message', async (data: string) => {
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
    })

    ws.on('close', () => {
      logger.info('WebSocket connection closed')
    })

    ws.on('error', (error) => {
      logger.error({ error }, 'WebSocket error')
    })
  })

  return wss
}
