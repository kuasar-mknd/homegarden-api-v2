import type { Server } from 'node:http'
import { URL } from 'node:url'
import { type WebSocket, WebSocketServer } from 'ws'
import { verifyAndSyncUser } from '../auth/auth.utils.js'
import { logger } from '../config/logger.js'
import { handleCareReminderMessage } from './handlers/care-reminder.handler.js'
import { handleWeatherMessage } from './handlers/weather.handler.js'
import type { AuthenticatedWebSocket, WSMessage } from './types.js'

export function initializeWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server })

  logger.info('WebSocket Server initialized')

  wss.on('connection', async (ws: WebSocket, req) => {
    logger.info('New WebSocket connection request')

    // 1. Authenticate connection
    try {
      const url = new URL(req.url || '', 'http://localhost')
      const token = url.searchParams.get('token')

      if (!token) {
        logger.warn('WebSocket connection rejected: Missing token')
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Authentication required' } }))
        ws.close()
        return
      }

      const user = await verifyAndSyncUser(token)
      ;(ws as AuthenticatedWebSocket).user = user
      logger.info({ userId: user.id }, 'WebSocket authenticated')
    } catch (error) {
      logger.warn({ err: error }, 'WebSocket connection rejected: Invalid token')
      ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid token' } }))
      ws.close()
      return
    }

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
