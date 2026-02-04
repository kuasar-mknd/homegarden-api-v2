import type { Server } from 'node:http'
import { type WebSocket, WebSocketServer } from 'ws'
import { User } from '../../domain/entities/user.entity.js'
import { logger } from '../config/logger.js'
import { authService } from '../security/auth.service.js'
import { handleCareReminderMessage } from './handlers/care-reminder.handler.js'
import { handleWeatherMessage } from './handlers/weather.handler.js'
import type { AuthenticatedWebSocket, WSMessage } from './types.js'

export function initializeWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server })

  logger.info('WebSocket Server initialized')

  wss.on('connection', async (ws: WebSocket, req) => {
    logger.info('New WebSocket connection request')

    let token = ''
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
      token = url.searchParams.get('token') || ''
    } catch (_e) {
      // ignore parsing error
    }

    if (!token) {
      logger.warn('WebSocket connection missing token')
      ws.close(4001, 'Unauthorized: Missing token')
      return
    }

    try {
      const localUser = await authService.validateTokenAndGetUser(token)
      if (!localUser) {
        logger.warn('WebSocket connection invalid token')
        ws.close(4001, 'Unauthorized: Invalid token')
        return
      }

      const { password, ...userProps } = localUser
      // Map Prisma user to Domain User
      const userEntity = User.fromPersistence(userProps as any)

      const authWs = ws as AuthenticatedWebSocket
      authWs.user = userEntity

      logger.info({ userId: userEntity.id }, 'WebSocket authenticated')

      ws.on('message', async (data: string) => {
        try {
          const message: WSMessage = JSON.parse(data.toString())
          logger.debug({ message }, 'Received WebSocket message')

          switch (message.channel) {
            case 'weather':
              await handleWeatherMessage(authWs, message)
              break
            case 'care-reminders':
              await handleCareReminderMessage(authWs, message)
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
    } catch (error) {
      logger.error({ error }, 'WebSocket auth error')
      ws.close(1011, 'Internal Error')
    }
  })

  return wss
}
