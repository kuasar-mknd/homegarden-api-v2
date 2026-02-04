import { logger } from '../../config/logger.js'
import type { AuthenticatedWebSocket, WSMessage } from '../types.js'

export async function handleCareReminderMessage(ws: AuthenticatedWebSocket, message: WSMessage) {
  try {
    switch (message.type) {
      case 'SUBSCRIBE':
        ws.send(
          JSON.stringify({
            type: 'SUBSCRIBED',
            channel: 'care-reminders',
            payload: { userId: ws.user.id },
          }),
        )
        // Check for any pending reminders immediately
        await checkReminders(ws, ws.user.id)
        break

      case 'CHECK_REMINDERS':
        await checkReminders(ws, ws.user.id)
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

async function checkReminders(ws: AuthenticatedWebSocket, userId: string) {
  if (!userId) {
    // Should not happen with authenticated socket
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
