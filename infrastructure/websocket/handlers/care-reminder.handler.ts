import type { WebSocket } from 'ws'
import { logger } from '../../config/logger.js'
import type { WSMessage } from '../types.js'
import type { AuthenticatedWebSocket } from '../ws-server.js'

export async function handleCareReminderMessage(ws: AuthenticatedWebSocket, message: WSMessage) {
  try {
    const userId = ws.userId

    switch (message.type) {
      case 'SUBSCRIBE':
        ws.send(
          JSON.stringify({
            type: 'SUBSCRIBED',
            channel: 'care-reminders',
            payload: { userId },
          }),
        )
        // Check for any pending reminders immediately
        await checkReminders(ws, userId)
        break

      case 'CHECK_REMINDERS':
        await checkReminders(ws, userId)
        break

      default:
        logger.warn({ type: message.type }, 'Unknown care-reminder message type')
    }
  } catch (error) {
    logger.error({ error }, 'Error in care-reminder handler')
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        channel: 'care-reminders',
        payload: { message: 'Internal server error' },
      }),
    )
  }
}

async function checkReminders(ws: WebSocket, userId?: string) {
  if (!userId) {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        channel: 'care-reminders',
        payload: { message: 'Missing user ID' },
      }),
    )
    return
  }

  // Mock implementation - in real app, query database for due tasks
  // For demonstration, we'll send a dummy reminder if userId is provided
  const dummyReminder = {
    id: 'reminder-123',
    plantId: 'plant-abc',
    plantName: 'Monstera',
    action: 'water',
    dueAt: new Date().toISOString(),
  }

  ws.send(
    JSON.stringify({
      type: 'REMINDER',
      channel: 'care-reminders',
      payload: { reminders: [dummyReminder] },
    }),
  )
}
