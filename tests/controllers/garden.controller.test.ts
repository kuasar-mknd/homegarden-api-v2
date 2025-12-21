import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GardenController } from '../../infrastructure/http/controllers/garden.controller.js'
import { AppError } from '../../shared/errors/app-error.js'
import { fail, ok } from '../../shared/types/result.type.js'

describe('GardenController', () => {
  let controller: GardenController
  let mockAddPlant: any
  let mockGetPlants: any
  let mockGetWeather: any
  let mockGetNearby: any
  let mockContext: any

  beforeEach(() => {
    mockAddPlant = { execute: vi.fn() }
    mockGetPlants = { execute: vi.fn() }
    mockGetWeather = { execute: vi.fn() }
    mockGetNearby = { execute: vi.fn() }

    controller = new GardenController(mockAddPlant, mockGetPlants, mockGetWeather, mockGetNearby)

    mockContext = {
      get: vi.fn(),
      set: vi.fn(),
      req: {
        json: vi.fn(),
        valid: vi.fn(),
        param: vi.fn(),
        query: vi.fn(),
      },
      json: vi.fn().mockImplementation((data, status) => ({ data, status })),
    }
  })

  describe('addPlant', () => {
    it('should add plant successfully', async () => {
      mockContext.get.mockImplementation((key: string) => (key === 'user' ? { id: 'u1' } : null))
      mockContext.req.valid.mockReturnValue({
        nickname: 'Fern',
        location: 'My Garden',
        commonName: 'Fern',
        scientificName: 'Fernus',
      })
      mockAddPlant.execute.mockResolvedValue(ok({ id: 'p1', nickname: 'Fern' }))

      const result = (await controller.addPlant(mockContext)) as any

      expect(result.status).toBe(201)
      expect(result.data.success).toBe(true)
      expect(result.data.data.nickname).toBe('Fern')
      expect(mockAddPlant.execute).toHaveBeenCalledWith({
        userId: 'u1',
        nickname: 'Fern',
        location: 'My Garden',
        speciesInfo: {
          commonName: 'Fern',
          scientificName: 'Fernus',
          family: undefined,
          imageUrl: undefined,
        },
      })
    })

    it('should return 401 if unauthorized', async () => {
      mockContext.get.mockReturnValue(null)
      const result = (await controller.addPlant(mockContext)) as any
      expect(result.status).toBe(401)
    })

    it('should handle use case error', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.valid.mockReturnValue({ location: 'G1' })
      mockAddPlant.execute.mockResolvedValue(fail(new AppError('Invalid', 400, 'BAD')))

      const result = (await controller.addPlant(mockContext)) as any
      expect(result.status).toBe(400)
      expect(result.data.error).toBe('BAD')
    })

    it('should handle generic error', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.valid.mockImplementation(() => {
        throw new Error('Boom')
      })
      const result = (await controller.addPlant(mockContext)) as any
      expect(result.status).toBe(500)
    })
  })

  describe('getPlants', () => {
    it('should return 200 and plants list', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockGetPlants.execute.mockResolvedValue(ok([{ id: 'p1' }]))

      const result = (await controller.getPlants(mockContext)) as any

      expect(result.status).toBe(200)
      expect(result.data.data).toHaveLength(1)
    })

    it('should handle use case failure', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockGetPlants.execute.mockResolvedValue(fail(new Error('Failed')))
      const result = (await controller.getPlants(mockContext)) as any
      expect(result.status).toBe(500)
    })

    it('should return 401 if unauthorized in getPlants', async () => {
      mockContext.get.mockReturnValue(null)
      const result = (await controller.getPlants(mockContext)) as any
      expect(result.status).toBe(401)
    })

    it('should handle generic error in getPlants', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockGetPlants.execute.mockSideEffect = () => {
        throw new Error('ERR')
      }
      // Use spy if mockSideEffect is not available in this vitest version,
      // or just mockRejectedValue.
      mockGetPlants.execute.mockRejectedValue(new Error('ERR'))
      const result = (await controller.getPlants(mockContext)) as any
      expect(result.status).toBe(500)
    })
  })

  describe('getWeather', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'

    it('should return 200 and weather data', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.param.mockReturnValue({ gardenId: validUuid })
      mockGetWeather.execute.mockResolvedValue(ok({ temperature: 20 }))

      const result = (await controller.getWeather(mockContext)) as any
      expect(result.status).toBe(200)
      expect(result.data.data.temperature).toBe(20)
    })

    it('should return 401 if unauthorized in getWeather', async () => {
      mockContext.get.mockReturnValue(null)
      const result = (await controller.getWeather(mockContext)) as any
      expect(result.status).toBe(401)
    })

    it('should return 400 if gardenId is missing or invalid', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      // Missing
      mockContext.req.param.mockReturnValue({})
      let result = (await controller.getWeather(mockContext)) as any
      expect(result.status).toBe(400)
      // Updated expectation: The controller returns "Invalid Garden ID" if validation fails
      expect(result.data.message).toBe('Invalid Garden ID')

      // Invalid UUID
      mockContext.req.param.mockReturnValue({ gardenId: 'invalid' })
      result = (await controller.getWeather(mockContext)) as any
      expect(result.status).toBe(400)
    })

    it('should handle use case failure in getWeather', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.param.mockReturnValue({ gardenId: validUuid })
      mockGetWeather.execute.mockResolvedValue(fail(new AppError('Unauthorized', 403, 'FORBIDDEN')))
      const result = (await controller.getWeather(mockContext)) as any
      expect(result.status).toBe(403)
    })

    it('should handle generic error in getWeather', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.param.mockImplementation(() => {
        throw new Error('ERR')
      })
      const result = (await controller.getWeather(mockContext)) as any
      expect(result.status).toBe(500)
    })
  })

  describe('getNearby', () => {
    it('should return 200 and nearby gardens', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.query.mockReturnValue({
        lat: '10.5',
        lng: '20.3',
        radius: '15',
        limit: '10'
      })
      mockGetNearby.execute.mockResolvedValue(ok([{ id: 'g2' }]))

      const result = (await controller.getNearby(mockContext)) as any
      expect(result.status).toBe(200)
      expect(result.data.data).toHaveLength(1)
    })

    it('should return 401 if unauthorized in getNearby', async () => {
      mockContext.get.mockReturnValue(null)
      const result = (await controller.getNearby(mockContext)) as any
      expect(result.status).toBe(401)
    })

    it('should return 400 if lat/lng is invalid', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.query.mockReturnValue({ lat: 'not-a-number', lng: '20' })

      const result = (await controller.getNearby(mockContext)) as any
      expect(result.status).toBe(400)
    })

    it('should handle use case failure in getNearby', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.query.mockReturnValue({ lat: '10.5', lng: '20.3' })
      mockGetNearby.execute.mockResolvedValue(fail(new AppError('Fail', 400, 'ERR')))
      const result = (await controller.getNearby(mockContext)) as any
      expect(result.status).toBe(400)
    })

    it('should return 400 if lat/lng are missing', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.query.mockReturnValue({})

      const result = (await controller.getNearby(mockContext)) as any
      expect(result.status).toBe(400)
    })

    it('should handle generic error in getNearby', async () => {
      mockContext.get.mockReturnValue({ id: 'u1' })
      mockContext.req.query.mockImplementation(() => {
        throw new Error('ERR')
      })
      const result = (await controller.getNearby(mockContext)) as any
      expect(result.status).toBe(500)
    })
  })
})
