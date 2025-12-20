import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WebSocket } from 'ws'

describe('Weather WebSocket Handler', () => {
  let mockWs: WebSocket
  let sentMessages: string[]
  let mockGetCurrentWeather: ReturnType<typeof vi.fn>
  let handleWeatherMessage: typeof import('../../infrastructure/websocket/handlers/weather.handler.js').handleWeatherMessage

  beforeEach(async () => {
    vi.resetModules()
    sentMessages = []
    mockGetCurrentWeather = vi.fn()

    // Mock the logger
    vi.doMock('../../infrastructure/config/logger.js', () => ({
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    }))

    // Mock the OpenMeteoAdapter
    vi.doMock('../../infrastructure/external-services/open-meteo.adapter.js', () => ({
      OpenMeteoAdapter: class MockOpenMeteoAdapter {
        getCurrentWeather = mockGetCurrentWeather
      },
    }))

    // Import after mocks are set
    const module = await import('../../infrastructure/websocket/handlers/weather.handler.js')
    handleWeatherMessage = module.handleWeatherMessage

    mockWs = {
      send: vi.fn((msg: string) => sentMessages.push(msg)),
    } as unknown as WebSocket
  })

  describe('SUBSCRIBE', () => {
    it('should acknowledge subscription', async () => {
      await handleWeatherMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'weather',
        payload: { gardenId: 'garden-1' },
      })

      expect(mockWs.send).toHaveBeenCalled()
      const response = JSON.parse(sentMessages[0])
      expect(response.type).toBe('SUBSCRIBED')
      expect(response.channel).toBe('weather')
      expect(response.payload.gardenId).toBe('garden-1')
    })

    it('should send weather update when location provided and successful', async () => {
      mockGetCurrentWeather.mockResolvedValue({
        success: true,
        data: { temperature: 22, humidity: 65 },
      })

      await handleWeatherMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'weather',
        payload: { latitude: 46.5, longitude: 6.6, gardenId: 'garden-1' },
      })

      expect(mockWs.send).toHaveBeenCalledTimes(2)
      const weatherUpdate = JSON.parse(sentMessages[1])
      expect(weatherUpdate.type).toBe('WEATHER_UPDATE')
      expect(weatherUpdate.payload.temperature).toBe(22)
    })

    it('should not send weather update when location is missing', async () => {
      await handleWeatherMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'weather',
        payload: { gardenId: 'garden-1' },
      })

      // Only subscription acknowledgement should be sent
      expect(mockWs.send).toHaveBeenCalledTimes(1)
    })

    it('should not send weather update when weather fetch fails', async () => {
      mockGetCurrentWeather.mockResolvedValue({
        success: false,
        error: { message: 'Weather API error' },
      })

      await handleWeatherMessage(mockWs, {
        type: 'SUBSCRIBE',
        channel: 'weather',
        payload: { latitude: 46.5, longitude: 6.6, gardenId: 'garden-1' },
      })

      // Only subscription acknowledgement should be sent
      expect(mockWs.send).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET_WEATHER', () => {
    it('should return weather data when location provided', async () => {
      mockGetCurrentWeather.mockResolvedValue({
        success: true,
        data: { temperature: 25, humidity: 50 },
      })

      await handleWeatherMessage(mockWs, {
        type: 'GET_WEATHER',
        channel: 'weather',
        payload: { latitude: 46.5, longitude: 6.6 },
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const response = JSON.parse(sentMessages[0])
      expect(response.type).toBe('WEATHER_UPDATE')
      expect(response.payload.temperature).toBe(25)
    })

    it('should return error when weather fetch fails', async () => {
      mockGetCurrentWeather.mockResolvedValue({
        success: false,
        error: { message: 'API unavailable' },
      })

      await handleWeatherMessage(mockWs, {
        type: 'GET_WEATHER',
        channel: 'weather',
        payload: { latitude: 46.5, longitude: 6.6 },
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const response = JSON.parse(sentMessages[0])
      expect(response.type).toBe('ERROR')
      expect(response.payload.message).toBe('API unavailable')
    })

    it('should return error when location is missing', async () => {
      await handleWeatherMessage(mockWs, {
        type: 'GET_WEATHER',
        channel: 'weather',
        payload: {},
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const response = JSON.parse(sentMessages[0])
      expect(response.type).toBe('ERROR')
      expect(response.payload.message).toBe('Missing location data')
    })
  })

  describe('Unknown message type', () => {
    it('should log warning for unknown message type', async () => {
      const { logger } = await import('../../infrastructure/config/logger.js')

      await handleWeatherMessage(mockWs, {
        type: 'UNKNOWN_TYPE',
        channel: 'weather',
      })

      expect(logger.warn).toHaveBeenCalledWith(
        { type: 'UNKNOWN_TYPE' },
        'Unknown weather message type',
      )
    })
  })

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      mockGetCurrentWeather.mockRejectedValue(new Error('Network error'))

      await handleWeatherMessage(mockWs, {
        type: 'GET_WEATHER',
        channel: 'weather',
        payload: { latitude: 46.5, longitude: 6.6 },
      })

      expect(mockWs.send).toHaveBeenCalledTimes(1)
      const response = JSON.parse(sentMessages[0])
      expect(response.type).toBe('ERROR')
      expect(response.payload.message).toBe('Internal server error')
    })
  })
})
