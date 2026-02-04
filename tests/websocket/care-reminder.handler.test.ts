import { beforeEach, describe, expect, it, vi } from 'vitest'
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
    const module = await import(
      '../../infrastructure/websocket/handlers/care-reminder.handler.js'
    )
    handleCareReminderMessage = module.handleCareReminderMessage

    mockWs = {
      send: vi.fn((msg: string) => sentMessages.push(msg)),
      user: { id: 'user-123' },
    } as unknown as AuthenticatedWebSocket
  })

  describe('SUBSCRIBE', () => {
    it('should acknowledge subscription and send reminders', async () => {
      await handleCareReminderMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'care-reminders',
        payload: { userId: 'ignored-user-id' }, // Payload ID should be ignored
      })

      expect(mockWs.send).toHaveBeenCalledTimes(2)
      const subscribed = JSON.parse(sentMessages[0])
      expect(subscribed.type).toBe('SUBSCRIBED')
      expect(subscribed.channel).toBe('care-reminders')
      expect(subscribed.payload.userId).toBe('user-123') // Should be the auth user id

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
        // No payload needed
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const reminder = JSON.parse(sentMessages[0])
      expect(reminder.type).toBe('REMINDER')
      expect(reminder.channel).toBe('care-reminders')
      expect(reminder.payload.reminders).toHaveLength(1)
      expect(reminder.payload.reminders[0].action).toBe('water')
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
        user: { id: 'user-123' },
      } as unknown as AuthenticatedWebSocket

      // This should catch the error and try to send an error message
      // (The second send will work because mockImplementationOnce only affects the first one)
      // wait, if send throws, it goes to catch block.
      // catch block calls ws.send.
      // if ws.send is mocked to throw once, the second call (in catch) should succeed?
      // Wait, brokenWs.send is the spy.
      // If the first call inside handler (SUBSCRIBED msg) throws, it goes to catch.
      // Catch calls ws.send(ERROR).
      // So checking brokenWs.send was called is correct.

      await handleCareReminderMessage(brokenWs, {
        type: 'SUBSCRIBE',
        channel: 'care-reminders',
        payload: { userId: 'user-123' },
      })

      expect(brokenWs.send).toHaveBeenCalledTimes(2) // 1st throw, 2nd success
    })
  })
})
