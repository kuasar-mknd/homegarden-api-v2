/**
 * Weather Port
 * 
 * Interface for weather data services
 */

export interface CurrentWeather {
  temperature: number
  humidity?: number
  cloudCover: number
  skyCondition: string
  windSpeed?: number
  precipitation?: number
}

export interface WeatherForecast {
  hourly: {
    time: Date
    temperature: number
    precipitation: number
    cloudCover: number
  }[]
  precipitationNext48h: number
}

export interface WeatherPort {
  /**
   * Get current weather for a location
   */
  getCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeather>
  
  /**
   * Get weather forecast for a location
   */
  getForecast(latitude: number, longitude: number, hours?: number): Promise<WeatherForecast>
  
  /**
   * Check if watering is recommended based on weather
   */
  shouldWater(latitude: number, longitude: number): Promise<{
    recommend: boolean
    reason: string
  }>
}
