import type { Server } from 'node:http'
import { type WebSocket, WebSocketServer } from 'ws'
import { logger } from '../config/logger.js'
import { handleCareReminderMessage } from './handlers/care-reminder.handler.js'
import { handleWeatherMessage } from './handlers/weather.handler.js'
import type { WSMessage } from './types.js'

export function initializeWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server })

  logger.info('WebSocket Server initialized')

  wss.on('connection', (ws: WebSocket) => {
    logger.info('New WebSocket connection')

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
