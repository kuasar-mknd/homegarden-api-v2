import type { WebSocket } from 'ws'
import { logger } from '../../config/logger.js'
import type { WSMessage } from '../types.js'

export async function handleCareReminderMessage(ws: WebSocket, message: WSMessage) {
  try {
    const userId = ws.userId

    if (!userId) {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          channel: 'care-reminders',
          payload: { message: 'Unauthorized' },
        }),
      )
      return
    }

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

async function checkReminders(ws: WebSocket, _userId: string) {
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
