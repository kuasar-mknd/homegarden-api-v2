import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IdentifySpeciesUseCase } from '../../application/use-cases/plant-id/identify-species.use-case.js'
import {
  createPlantIdController,
  PlantIdController,
} from '../../infrastructure/http/controllers/plant-id.controller.js'
import { AppError } from '../../shared/errors/app-error.js'
import { fail, ok } from '../../shared/types/result.type.js'

describe('PlantIdController', () => {
  let controller: PlantIdController
  let mockUseCase: IdentifySpeciesUseCase
  let mockContext: any

  beforeEach(() => {
    mockUseCase = {
      execute: vi.fn(),
    } as any
    controller = new PlantIdController(mockUseCase)

    mockContext = {
      req: {
        json: vi.fn(),
        valid: vi.fn(),
      },
      json: vi.fn().mockImplementation(
        (val, status) =>
          ({
            status,
            json: async () => val,
          }) as any,
      ),
    }
  })

  describe('identify', () => {
    it('should return 200 on success', async () => {
      const body = { imageBase64: 'data', organs: ['leaf'] }
      mockContext.req.valid.mockResolvedValue(body)

      const mockResult = { suggestions: [] }
      vi.mocked(mockUseCase.execute).mockResolvedValue(ok(mockResult as any))

      const res = await controller.identify(mockContext)

      expect(res.status).toBe(200)
      const resData = await res.json()
      expect(resData.success).toBe(true)
      expect(resData.data).toEqual(mockResult)
    })

    it('should handle imageUrl source', async () => {
      const body = { imageUrl: 'http://link.com' }
      mockContext.req.valid.mockResolvedValue(body)
      vi.mocked(mockUseCase.execute).mockResolvedValue(ok({} as any))

      await controller.identify(mockContext)
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'http://link.com' }),
      )
    })

    it('should identify plant with all optional fields successfully', async () => {
      const body = {
        imageUrl: 'http://img.com',
        mimeType: 'image/jpeg',
        organs: ['leaf'],
        maxSuggestions: 3,
        location: { latitude: 10, longitude: 20 },
      }
      mockContext.req.valid.mockResolvedValue(body)
      vi.mocked(mockUseCase.execute).mockResolvedValue(ok({ suggestions: [] } as any))

      await controller.identify(mockContext)
      expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining(body))
    })

    it('should return use case error with correct status', async () => {
      mockContext.req.valid.mockResolvedValue({ imageBase64: 'data' })
      vi.mocked(mockUseCase.execute).mockResolvedValue(
        fail(new AppError('Service Error', 503, 'SERVICE_UNAVAILABLE')),
      )

      const res = await controller.identify(mockContext)

      expect(res.status).toBe(503)
      const resData = await res.json()
      expect(resData.error).toBe('SERVICE_UNAVAILABLE')
    })

    it('should handle generic errors', async () => {
      mockContext.req.valid.mockRejectedValue(new Error('Boom'))

      const res = await controller.identify(mockContext)

      expect(res.status).toBe(500)
      const resData = await res.json()
      expect(resData.error).toBe('INTERNAL_ERROR')
      expect(resData.message).toBe('An unexpected error occurred')
    })

    it('should handle non-error objects', async () => {
      mockContext.req.valid.mockRejectedValue('not an error')

      const res = await controller.identify(mockContext)

      expect(res.status).toBe(500)
      const resData = await res.json()
      expect(resData.message).toBe('An unexpected error occurred')
    })
  })

  describe('status', () => {
    it('should return operational status', async () => {
      const res = await controller.status(mockContext)
      expect(res.status).toBe(200)
      const resData = await res.json()
      expect(resData.data.status).toBe('operational')
    })
  })

  describe('Factory', () => {
    it('createPlantIdController should create an instance', () => {
      const instance = createPlantIdController(mockUseCase)
      expect(instance).toBeInstanceOf(PlantIdController)
    })
  })
})
