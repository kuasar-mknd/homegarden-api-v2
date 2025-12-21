import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WeatherPort } from '../../application/ports/weather.port'
import { GetGardenWeatherUseCase } from '../../application/use-cases/garden/get-garden-weather.use-case'
import type { GardenRepository } from '../../domain/repositories/garden.repository'
import { AppError } from '../../shared/errors/app-error'

describe('GetGardenWeatherUseCase', () => {
  let useCase: GetGardenWeatherUseCase
  let mockGardenRepo: GardenRepository
  let mockWeatherPort: WeatherPort

  beforeEach(() => {
    mockGardenRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findNearby: vi.fn(),
      findByIdWithPlants: vi.fn(),
      findByUserId: vi.fn(),
      findByUserAndName: vi.fn(),
    }
    mockWeatherPort = {
      getCurrentWeather: vi.fn(),
      getForecast: vi.fn(),
    }
    useCase = new GetGardenWeatherUseCase(mockGardenRepo, mockWeatherPort)
  })

  const mockGarden = {
    id: 'garden1',
    name: 'My Garden',
    userId: 'user1',
    latitude: 48.85,
    longitude: 2.35,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockWeather = {
    temperature: 20,
    humidity: 50,
    windSpeed: 10,
    precipitation: 0,
    conditions: 'Sunny',
    icon: 'sunny',
  }

  const mockForecast = {
    daily: [
      {
        date: '2023-10-27',
        maxTemp: 22,
        minTemp: 15,
        precipitation: 0,
        conditions: 'Sunny',
        icon: 'sunny',
      },
    ],
  }

  it('should return weather data for garden owner', async () => {
    ;(mockGardenRepo.findById as any).mockResolvedValue(mockGarden)
    ;(mockWeatherPort.getCurrentWeather as any).mockResolvedValue({
      success: true,
      data: mockWeather,
    })
    ;(mockWeatherPort.getForecast as any).mockResolvedValue({ success: true, data: mockForecast })

    const result = await useCase.execute('garden1', 'user1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.gardenName).toBe('My Garden')
      expect(result.data.current).toEqual(mockWeather)
      expect(result.data.forecast).toEqual(mockForecast)
    }
  })

  it('should return 404 if garden not found', async () => {
    ;(mockGardenRepo.findById as any).mockResolvedValue(null)

    const result = await useCase.execute('garden1', 'user1')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError)
      expect(result.error.code).toBe('GARDEN_NOT_FOUND')
    }
  })

  it('should return 403 if user is not owner', async () => {
    ;(mockGardenRepo.findById as any).mockResolvedValue(mockGarden)

    const result = await useCase.execute('garden1', 'user2') // Different user

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError)
      expect(result.error.code).toBe('FORBIDDEN')
    }
  })

  it('should fail if weather service fails', async () => {
    ;(mockGardenRepo.findById as any).mockResolvedValue(mockGarden)
    ;(mockWeatherPort.getCurrentWeather as any).mockResolvedValue({
      success: false,
      error: new AppError('Service Down', 503),
    })
    ;(mockWeatherPort.getForecast as any).mockResolvedValue({ success: true, data: mockForecast })

    const result = await useCase.execute('garden1', 'user1')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('Service Down')
    }
  })

  it('should fail if forecast service fails', async () => {
    ;(mockGardenRepo.findById as any).mockResolvedValue(mockGarden)
    ;(mockWeatherPort.getCurrentWeather as any).mockResolvedValue({
      success: true,
      data: mockWeather,
    })
    ;(mockWeatherPort.getForecast as any).mockResolvedValue({
      success: false,
      error: new AppError('Forecast Error', 503),
    })

    const result = await useCase.execute('garden1', 'user1')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBe('Forecast Error')
    }
  })
})
