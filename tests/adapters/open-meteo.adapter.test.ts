import { describe, it, expect, vi, beforeEach } from 'vitest'
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
          wind_speed_10m: 10
        }
      }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData
      } as any)

      const result = await adapter.getCurrentWeather(48.8, 2.3)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.temperature).toBe(20.5)
        expect(result.data.conditions).toBe('Clear sky')
        expect(result.data.icon).toBe('sunny')
      }
    })

    it('should handle API error response (not ok)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
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
          weather_code: [1, 61]
        }
      }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData
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

    it('should handle missing indices in forecast data safely', async () => {
        const mockData = {
            daily: {
              time: ['2023-01-01'],
              temperature_2m_max: [], // Missing
              temperature_2m_min: [], // Missing
              precipitation_sum: [], // Missing
              weather_code: [] // Missing
            }
          }
          vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => mockData
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
    const testMapping = async (code: number, expectedCondition: string, expectedIcon: string) => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ current: { weather_code: code } })
        } as any)
        const result = await adapter.getCurrentWeather(0, 0)
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
