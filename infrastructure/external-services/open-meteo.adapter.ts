import type {
  WeatherData,
  WeatherForecast,
  WeatherPort,
} from '../../application/ports/weather.port.js'
import { AppError } from '../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../shared/types/result.type.js'
import { logger } from '../config/logger.js'

interface OpenMeteoCurrentResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
  }
}

interface OpenMeteoDailyResponse {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    weather_code: number[]
  }
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class OpenMeteoAdapter implements WeatherPort {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast'
  // biome-ignore lint/suspicious/noExplicitAny: generic cache
  private readonly cache = new Map<string, CacheEntry<any>>()
  private readonly CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

  async getCurrentWeather(
    latitude: number,
    longitude: number,
  ): Promise<Result<WeatherData, AppError>> {
    // Optimization: Round to 2 decimal places (~1.1km) to improve cache hit rate for nearby requests
    const lat = Number(latitude).toFixed(2)
    const lon = Number(longitude).toFixed(2)
    const cacheKey = `current:${lat}:${lon}`

    const cached = this.getFromCache<WeatherData>(cacheKey)
    if (cached) {
      return ok(cached)
    }

    try {
      const url = `${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`OpenMeteo API error: ${response.statusText}`)
      }

      const data = (await response.json()) as OpenMeteoCurrentResponse
      const current = data.current

      const weatherData: WeatherData = {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        windSpeed: current.wind_speed_10m,
        conditions: this.mapWeatherCodeToCondition(current.weather_code),
        icon: this.mapWeatherCodeToIcon(current.weather_code),
      }

      this.setInCache(cacheKey, weatherData)
      return ok(weatherData)
    } catch (error) {
      logger.error({ error, latitude, longitude }, 'Failed to fetch current weather')
      return fail(new AppError('Failed to fetch weather data', 503, 'WEATHER_SERVICE_ERROR'))
    }
  }

  async getForecast(
    latitude: number,
    longitude: number,
  ): Promise<Result<WeatherForecast, AppError>> {
    // Optimization: Round to 2 decimal places (~1.1km) to improve cache hit rate for nearby requests
    const lat = Number(latitude).toFixed(2)
    const lon = Number(longitude).toFixed(2)
    const cacheKey = `forecast:${lat}:${lon}`

    const cached = this.getFromCache<WeatherForecast>(cacheKey)
    if (cached) {
      return ok(cached)
    }

    try {
      const url = `${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`OpenMeteo API error: ${response.statusText}`)
      }

      const data = (await response.json()) as OpenMeteoDailyResponse
      const daily = data.daily

      const forecast = daily.time.map((date: string, index: number) => ({
        date,
        maxTemp: daily.temperature_2m_max[index] ?? 0,
        minTemp: daily.temperature_2m_min[index] ?? 0,
        precipitation: daily.precipitation_sum[index] ?? 0,
        conditions: this.mapWeatherCodeToCondition(daily.weather_code[index] ?? 0),
        icon: this.mapWeatherCodeToIcon(daily.weather_code[index] ?? 0),
      }))

      const forecastData: WeatherForecast = { daily: forecast }
      this.setInCache(cacheKey, forecastData)
      return ok(forecastData)
    } catch (error) {
      logger.error({ error, latitude, longitude }, 'Failed to fetch forecast')
      return fail(new AppError('Failed to fetch weather forecast', 503, 'WEATHER_SERVICE_ERROR'))
    }
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  private setInCache<T>(key: string, data: T): void {
    // Basic cache eviction if too large (prevent memory leak)
    if (this.cache.size > 1000) {
      this.cache.clear()
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    })
  }

  private mapWeatherCodeToCondition(code: number): string {
    // WMO Weather interpretation codes (WW)
    // https://open-meteo.com/en/docs
    if (code === 0) return 'Clear sky'
    if (code === 1 || code === 2 || code === 3) return 'Mainly clear, partly cloudy, and overcast'
    if (code === 45 || code === 48) return 'Fog and depositing rime fog'
    if (code >= 51 && code <= 55) return 'Drizzle: Light, moderate, and dense intensity'
    if (code >= 61 && code <= 65) return 'Rain: Slight, moderate and heavy intensity'
    if (code >= 80 && code <= 82) return 'Rain showers: Slight, moderate, and violent'
    if (code >= 95) return 'Thunderstorm: Slight or moderate'
    return 'Unknown'
  }

  private mapWeatherCodeToIcon(code: number): string {
    if (code === 0) return 'sunny'
    if (code === 1 || code === 2) return 'partly_cloudy'
    if (code === 3) return 'cloudy'
    if (code >= 45 && code <= 48) return 'fog'
    if (code >= 51 && code <= 67) return 'rainy'
    if (code >= 71 && code <= 77) return 'snowy'
    if (code >= 80 && code <= 86) return 'rainy'
    if (code >= 95) return 'thunderstorm'
    return 'cloudy'
  }
}
