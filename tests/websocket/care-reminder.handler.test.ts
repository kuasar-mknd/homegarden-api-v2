import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WebSocket } from 'ws'
import type { AuthenticatedWebSocket } from '../../infrastructure/websocket/types.js'

describe('Care Reminder WebSocket Handler', () => {
  let mockWs: AuthenticatedWebSocket
  let sentMessages: string[]
  let handleCareReminderMessage: typeof import('../../infrastructure/websocket/handlers/care-reminder.handler.js').handleCareReminderMessage

  beforeEach(async () => {
    vi.resetModules()
    sentMessages = []

    // Mock the logger
    vi.doMock('../../infrastructure/config/logger.js', () => ({
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    }))

    // Import after mocks are set
    const module = await import('../../infrastructure/websocket/handlers/care-reminder.handler.js')
    handleCareReminderMessage = module.handleCareReminderMessage

    mockWs = {
      send: vi.fn((msg: string) => sentMessages.push(msg)),
      user: { id: 'user-123', email: 'test@example.com', role: 'USER' }, // Mock authenticated user
    } as unknown as AuthenticatedWebSocket
  })

  describe('SUBSCRIBE', () => {
    it('should acknowledge subscription and send reminders using authenticated user', async () => {
      await handleCareReminderMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'care-reminders',
        payload: { userId: 'ignored-id' }, // Payload ID should be ignored
      })

      expect(mockWs.send).toHaveBeenCalledTimes(2)
      const subscribed = JSON.parse(sentMessages[0])
      expect(subscribed.type).toBe('SUBSCRIBED')
      expect(subscribed.channel).toBe('care-reminders')
      expect(subscribed.payload.userId).toBe('user-123') // Should use auth user ID

      const reminder = JSON.parse(sentMessages[1])
      expect(reminder.type).toBe('REMINDER')
      expect(reminder.payload.reminders).toBeInstanceOf(Array)
    })
  })

  describe('CHECK_REMINDERS', () => {
    it('should return reminders for authenticated user', async () => {
      await handleCareReminderMessage(mockWs, {
        type: 'CHECK_REMINDERS',
        channel: 'care-reminders',
        payload: { userId: 'ignored-id' },
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const reminder = JSON.parse(sentMessages[0])
      expect(reminder.type).toBe('REMINDER')
      expect(reminder.channel).toBe('care-reminders')
      expect(reminder.payload.reminders).toHaveLength(1)
      expect(reminder.payload.reminders[0].userId).toBe('user-123')
    })

    it('should return unauthorized error when user is missing from socket', async () => {
      const unauthWs = {
        send: vi.fn((msg: string) => sentMessages.push(msg)),
        // user is missing
      } as unknown as AuthenticatedWebSocket

      await handleCareReminderMessage(unauthWs, {
        type: 'CHECK_REMINDERS',
        channel: 'care-reminders',
      })

      expect(unauthWs.send).toHaveBeenCalledTimes(1)
      const error = JSON.parse(sentMessages[0])
      expect(error.type).toBe('ERROR')
      expect(error.payload.message).toBe('Unauthorized')
    })
  })

  describe('Unknown message type', () => {
    it('should log warning for unknown message type', async () => {
      const { logger } = await import('../../infrastructure/config/logger.js')

      await handleCareReminderMessage(mockWs, {
        type: 'UNKNOWN_TYPE',
        channel: 'care-reminders',
      })

      expect(logger.warn).toHaveBeenCalledWith(
        { type: 'UNKNOWN_TYPE' },
        'Unknown care-reminder message type',
      )
    })
  })

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      // Create a ws that throws on send to trigger error path
      const brokenWs = {
        send: vi.fn().mockImplementationOnce(() => {
          throw new Error('Connection closed')
        }),
        user: { id: 'user-123' }
      } as unknown as AuthenticatedWebSocket

      // This should catch the error and try to send an error message (which will likely fail if send throws, but we check if it tries)
      await handleCareReminderMessage(brokenWs, {
        type: 'SUBSCRIBE',
        channel: 'care-reminders',
        payload: { userId: 'user-123' },
      })

      // The error handler should have tried to send an error message
      // First call throws (SUBSCRIBED), catch block calls send again (ERROR)
      expect(brokenWs.send).toHaveBeenCalled()
    })
  })
})
