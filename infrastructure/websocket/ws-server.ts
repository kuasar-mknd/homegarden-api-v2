import type { IncomingMessage, Server } from 'node:http'
import { type WebSocket, WebSocketServer } from 'ws'
import { logger } from '../config/logger.js'
import { verifySupabaseTokenAndSyncUser } from '../http/middleware/auth.utils.js'
import { handleCareReminderMessage } from './handlers/care-reminder.handler.js'
import { handleWeatherMessage } from './handlers/weather.handler.js'
import type { WSMessage } from './types.js'

// Augment WebSocket to include userId
declare module 'ws' {
  interface WebSocket {
    userId?: string
  }
}

export function initializeWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server })

  logger.info('WebSocket Server initialized')

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    logger.info('New WebSocket connection attempt')

    // Parse token from query string
    // req.url is typically just the path + query string (e.g., /?token=...)
    // We use a dummy base URL to parse it easily
    const url = new URL(req.url || '/', 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      logger.warn('WebSocket connection rejected: Missing token')
      ws.close(1008, 'Missing authentication token')
      return
    }

    try {
      const user = await verifySupabaseTokenAndSyncUser(token)

      if (!user) {
        logger.warn('WebSocket connection rejected: Invalid token')
        ws.close(1008, 'Invalid authentication token')
        return
      }

      // Attach userId to ws instance
      ws.userId = user.id
      logger.info({ userId: user.id }, 'WebSocket authenticated')

      ws.on('message', async (data: string) => {
        try {
          const message: WSMessage = JSON.parse(data.toString())
          logger.debug({ message, userId: ws.userId }, 'Received WebSocket message')

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
        logger.info({ userId: ws.userId }, 'WebSocket connection closed')
      })

      ws.on('error', (error) => {
        logger.error({ error, userId: ws.userId }, 'WebSocket error')
      })
    } catch (error) {
      logger.error({ error }, 'WebSocket authentication error')
      ws.close(1011, 'Internal server error')
    }
  })

  return wss
}
