import type { AppError } from '../../shared/errors/app-error.js'
import type { Result } from '../../shared/types/result.type.js'

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  conditions: string
  icon: string // Common identifier for weather icons (e.g. 'cloudy', 'sunny')
}

export interface WeatherForecast {
  daily: Array<{
    date: string
    maxTemp: number
    minTemp: number
    precipitation: number
    conditions: string
    icon: string
  }>
}

export interface WeatherPort {
  /**
   * Get current weather for a specific location
   */
  getCurrentWeather(latitude: number, longitude: number): Promise<Result<WeatherData, AppError>>

  /**
   * Get 7-day forecast for a specific location
   */
  getForecast(latitude: number, longitude: number): Promise<Result<WeatherForecast, AppError>>
}
