import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OpenMeteoAdapter } from '../../infrastructure/external-services/open-meteo.adapter.js'

describe('OpenMeteoAdapter', () => {
  let adapter: OpenMeteoAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new OpenMeteoAdapter()
    // Mock global fetch
    global.fetch = vi.fn()
  })

  describe('getCurrentWeather', () => {
    it('should fetch and map current weather successfully', async () => {
      const mockData = {
        current: {
          temperature_2m: 20.5,
          relative_humidity_2m: 50,
          precipitation: 0.1,
          weather_code: 0,
          wind_speed_10m: 10,
        },
      }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as any)

      const result = await adapter.getCurrentWeather(48.8, 2.3)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.temperature).toBe(20.5)
        expect(result.data.conditions).toBe('Clear sky')
        expect(result.data.icon).toBe('sunny')
      }
    })

    it('should cache successful responses', async () => {
      const mockData = {
        current: {
          temperature_2m: 25.0,
          relative_humidity_2m: 60,
          precipitation: 0.0,
          weather_code: 0,
          wind_speed_10m: 5,
        },
      }
      // Mock fetch to return success
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as any)

      // First call - should trigger fetch
      await adapter.getCurrentWeather(48.8, 2.3)
      expect(fetch).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      const result2 = await adapter.getCurrentWeather(48.8, 2.3)
      expect(result2.success).toBe(true)
      expect(fetch).toHaveBeenCalledTimes(1) // Still 1

      // Different location - should trigger new fetch
      await adapter.getCurrentWeather(40.0, -74.0)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should expire cache after TTL', async () => {
      const mockData = { current: { temperature_2m: 20 } }
      vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => mockData } as any)

      vi.useFakeTimers()
      const start = Date.now()
      vi.setSystemTime(start)

      await adapter.getCurrentWeather(48.8, 2.3)
      expect(fetch).toHaveBeenCalledTimes(1)

      // Move time forward by 1 hour + 1 second
      vi.setSystemTime(start + 60 * 60 * 1000 + 1000)

      await adapter.getCurrentWeather(48.8, 2.3)
      expect(fetch).toHaveBeenCalledTimes(2)
      vi.useRealTimers()
    })

    it('should clear cache if it grows too large', async () => {
      const mockData = { current: { temperature_2m: 20 } }
      vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => mockData } as any)

      // Fill cache with 1001 entries to reach threshold
      for (let i = 0; i < 1001; i++) {
        await adapter.getCurrentWeather(i, 0)
      }
      expect(fetch).toHaveBeenCalledTimes(1001)

      // 1002nd entry should trigger clear() because size was 1001
      await adapter.getCurrentWeather(1002, 0)
      expect(fetch).toHaveBeenCalledTimes(1002)

      // Verify that the first entry (0, 0) is no longer in cache and triggers a new fetch
      await adapter.getCurrentWeather(0, 0)
      expect(fetch).toHaveBeenCalledTimes(1003)
    })

    it('should handle API error response (not ok)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      } as any)

      const result = await adapter.getCurrentWeather(0, 0)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('WEATHER_SERVICE_ERROR')
      }
    })

    it('should handle network/fetch errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

      const result = await adapter.getCurrentWeather(0, 0)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('Failed to fetch weather data')
      }
    })
  })

  describe('getForecast', () => {
    it('should fetch and map forecast correctly', async () => {
      const mockData = {
        daily: {
          time: ['2023-01-01', '2023-01-02'],
          temperature_2m_max: [10, 12],
          temperature_2m_min: [5, 6],
          precipitation_sum: [0, 2],
          weather_code: [1, 61],
        },
      }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as any)

      const result = await adapter.getForecast(48.8, 2.3)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.daily).toHaveLength(2)
        expect(result.data.daily[0].conditions).toBe('Mainly clear, partly cloudy, and overcast')
        expect(result.data.daily[1].conditions).toBe('Rain: Slight, moderate and heavy intensity')
        expect(result.data.daily[1].icon).toBe('rainy')
      }
    })

    it('should cache successful forecast responses', async () => {
      const mockData = {
        daily: {
          time: ['2023-01-01'],
          temperature_2m_max: [10],
          temperature_2m_min: [5],
          precipitation_sum: [0],
          weather_code: [1],
        },
      }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as any)

      // First call
      await adapter.getForecast(48.8, 2.3)
      expect(fetch).toHaveBeenCalledTimes(1)

      // Second call - cached
      await adapter.getForecast(48.8, 2.3)
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle missing indices in forecast data safely', async () => {
      const mockData = {
        daily: {
          time: ['2023-01-01'],
          temperature_2m_max: [], // Missing
          temperature_2m_min: [], // Missing
          precipitation_sum: [], // Missing
          weather_code: [], // Missing
        },
      }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as any)

      const result = await adapter.getForecast(0, 0)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.daily[0].maxTemp).toBe(0)
        expect(result.data.daily[0].conditions).toBe('Clear sky')
      }
    })

    it('should handle forecast API errors', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false } as any)
      const result = await adapter.getForecast(0, 0)
      expect(result.success).toBe(false)
    })
  })

  describe('weather code mapping', () => {
    // We can test the exhaustive cases by calling getCurrentWeather and checking mapped values
    // We use different coordinates to avoid cache hits between sub-tests
    let lat = 0
    const testMapping = async (code: number, expectedCondition: string, expectedIcon: string) => {
      lat += 1 // Increment lat to ensure unique cache key
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ current: { weather_code: code } }),
      } as any)
      const result = await adapter.getCurrentWeather(lat, 0)
      if (result.success) {
        expect(result.data.conditions).toBe(expectedCondition)
        expect(result.data.icon).toBe(expectedIcon)
      }
    }

    it('should map various weather codes correctly', async () => {
      await testMapping(3, 'Mainly clear, partly cloudy, and overcast', 'cloudy')
      await testMapping(45, 'Fog and depositing rime fog', 'fog')
      await testMapping(51, 'Drizzle: Light, moderate, and dense intensity', 'rainy')
      await testMapping(75, 'Unknown', 'snowy') // 71-77 maps to snowy icon
      await testMapping(80, 'Rain showers: Slight, moderate, and violent', 'rainy')
      await testMapping(95, 'Thunderstorm: Slight or moderate', 'thunderstorm')
      await testMapping(4, 'Unknown', 'cloudy') // Gap code
      await testMapping(999, 'Thunderstorm: Slight or moderate', 'thunderstorm')
    })
  })
})
