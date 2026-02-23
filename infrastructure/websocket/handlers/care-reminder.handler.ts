import type { WebSocket } from 'ws'
import { logger } from '../../config/logger.js'
import type { AuthenticatedWebSocket, WSMessage } from '../types.js'

export async function handleCareReminderMessage(ws: WebSocket, message: WSMessage) {
  try {
    const user = (ws as AuthenticatedWebSocket).user

    // We trust the authenticated user, ignore message payload userId

    switch (message.type) {
      case 'SUBSCRIBE':
        ws.send(
          JSON.stringify({
            type: 'SUBSCRIBED',
            channel: 'care-reminders',
            payload: { userId: user.id },
          }),
        )
        // Check for any pending reminders immediately
        await checkReminders(ws)
        break

      case 'CHECK_REMINDERS':
        await checkReminders(ws)
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

async function checkReminders(ws: WebSocket) {
  const user = (ws as AuthenticatedWebSocket).user
  if (!user || !user.id) {
    // Should not happen if auth middleware works
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        channel: 'care-reminders',
        payload: { message: 'Unauthorized' },
      }),
    )
    return
  }

  // Mock implementation - in real app, query database for due tasks
  // For demonstration, we'll send a dummy reminder using the AUTHENTICATED userId
  const dummyReminder = {
    id: 'reminder-123',
    plantId: 'plant-abc',
    plantName: 'Monstera',
    action: 'water',
    dueAt: new Date().toISOString(),
    userId: user.id, // Confirming we are using the correct user
  }

  ws.send(
    JSON.stringify({
      type: 'REMINDER',
      channel: 'care-reminders',
      payload: { reminders: [dummyReminder] },
    }),
  )
}
