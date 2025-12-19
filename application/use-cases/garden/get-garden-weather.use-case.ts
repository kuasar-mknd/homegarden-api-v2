import { AppError } from '../../../shared/errors/app-error.js'
import { fail, ok, type Result } from '../../../shared/types/result.type.js'
import type { GardenRepository } from '../../../domain/repositories/garden.repository.js'
import type { WeatherPort, WeatherData, WeatherForecast } from '../../ports/weather.port.js'

export interface GetGardenWeatherOutput {
  gardenName: string
  current: WeatherData
  forecast: WeatherForecast
}

export class GetGardenWeatherUseCase {
  constructor(
    private readonly gardenRepository: GardenRepository,
    private readonly weatherPort: WeatherPort
  ) {}

  async execute(gardenId: string, userId: string): Promise<Result<GetGardenWeatherOutput, AppError>> {
    // 1. Get Garden
    const gardenResult = await this.gardenRepository.findById(gardenId)
    if (!gardenResult) {
      return fail(new AppError('Garden not found', 404, 'GARDEN_NOT_FOUND'))
    }

    // 2. Verify Ownership
    if (gardenResult.userId !== userId) {
      return fail(new AppError('Not authorized to view this garden', 403, 'FORBIDDEN'))
    }

    // 3. Get Weather Data in Parallel
    const [currentResult, forecastResult] = await Promise.all([
      this.weatherPort.getCurrentWeather(gardenResult.latitude, gardenResult.longitude),
      this.weatherPort.getForecast(gardenResult.latitude, gardenResult.longitude)
    ])

    if (!currentResult.success) return fail(currentResult.error)
    if (!forecastResult.success) return fail(forecastResult.error)

    return ok({
      gardenName: gardenResult.name,
      current: currentResult.data,
      forecast: forecastResult.data
    })
  }
}
