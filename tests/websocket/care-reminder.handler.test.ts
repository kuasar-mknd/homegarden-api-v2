import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { WebSocket } from 'ws'

describe('Care Reminder WebSocket Handler', () => {
  let mockWs: WebSocket
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
    const module = await import(
      '../../infrastructure/websocket/handlers/care-reminder.handler.js'
    )
    handleCareReminderMessage = module.handleCareReminderMessage

    mockWs = {
      send: vi.fn((msg: string) => sentMessages.push(msg)),
    } as unknown as WebSocket
  })

  describe('SUBSCRIBE', () => {
    it('should acknowledge subscription and send reminders', async () => {
      await handleCareReminderMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'care-reminders',
        payload: { userId: 'user-123' },
      })

      expect(mockWs.send).toHaveBeenCalledTimes(2)
      const subscribed = JSON.parse(sentMessages[0])
      expect(subscribed.type).toBe('SUBSCRIBED')
      expect(subscribed.channel).toBe('care-reminders')
      expect(subscribed.payload.userId).toBe('user-123')

      const reminder = JSON.parse(sentMessages[1])
      expect(reminder.type).toBe('REMINDER')
      expect(reminder.payload.reminders).toBeInstanceOf(Array)
    })

    it('should return error when userId is missing', async () => {
      await handleCareReminderMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'care-reminders',
        payload: {},
      })

      expect(mockWs.send).toHaveBeenCalledTimes(2)
      const error = JSON.parse(sentMessages[1])
      expect(error.type).toBe('ERROR')
      expect(error.payload.message).toBe('Missing user ID')
    })
  })

  describe('CHECK_REMINDERS', () => {
    it('should return reminders when userId provided', async () => {
      await handleCareReminderMessage(mockWs, {
        type: 'CHECK_REMINDERS',
        channel: 'care-reminders',
        payload: { userId: 'user-456' },
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const reminder = JSON.parse(sentMessages[0])
      expect(reminder.type).toBe('REMINDER')
      expect(reminder.channel).toBe('care-reminders')
      expect(reminder.payload.reminders).toHaveLength(1)
      expect(reminder.payload.reminders[0].action).toBe('water')
    })

    it('should return error when userId is missing', async () => {
      await handleCareReminderMessage(mockWs, {
        type: 'CHECK_REMINDERS',
        channel: 'care-reminders',
        payload: {},
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const error = JSON.parse(sentMessages[0])
      expect(error.type).toBe('ERROR')
      expect(error.payload.message).toBe('Missing user ID')
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
      } as unknown as WebSocket

      // This should catch the error and try to send an error message
      await handleCareReminderMessage(brokenWs, {
        type: 'SUBSCRIBE',
        channel: 'care-reminders',
        payload: { userId: 'user-123' },
      })

      // The error handler should have tried to send an error message
      expect(brokenWs.send).toHaveBeenCalled()
    })
  })
})
