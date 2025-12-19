import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FindNearbyGardensUseCase } from '../../application/use-cases/garden/find-nearby-gardens.use-case'
import { GardenRepository } from '../../domain/repositories/garden.repository'
import { AppError } from '../../shared/errors/app-error'

describe('FindNearbyGardensUseCase', () => {
  let useCase: FindNearbyGardensUseCase
  let mockGardenRepo: GardenRepository

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
    useCase = new FindNearbyGardensUseCase(mockGardenRepo)
  })

  it('should return nearby gardens successfully', async () => {
    const mockGardens = [
      {
        id: '1',
        name: 'Nearby Garden',
        latitude: 48.85,
        longitude: 2.35,
        distance: 5,
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    ;(mockGardenRepo.findNearby as any).mockResolvedValue(mockGardens)

    const result = await useCase.execute({
      latitude: 48.8566,
      longitude: 2.3522,
      radiusKm: 10,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.gardens).toHaveLength(1)
      expect(result.data.gardens[0].name).toBe('Nearby Garden')
      expect(mockGardenRepo.findNearby).toHaveBeenCalledWith({
        latitude: 48.8566,
        longitude: 2.3522,
        radiusKm: 10,
        limit: 50,
      })
    }
  })

  it('should validate latitude range', async () => {
    const result = await useCase.execute({
      latitude: 91, // Invalid
      longitude: 0,
      radiusKm: 10,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError)
      expect(result.error.code).toBe('BAD_REQUEST')
    }
  })

  it('should validate longitude range', async () => {
    const result = await useCase.execute({
      latitude: 0,
      longitude: 181, // Invalid
      radiusKm: 10,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError)
      expect(result.error.code).toBe('BAD_REQUEST')
    }
  })

  it('should handle repository errors gracefully', async () => {
    ;(mockGardenRepo.findNearby as any).mockRejectedValue(new Error('DB Error'))

    const result = await useCase.execute({
      latitude: 48.8566,
      longitude: 2.3522,
      radiusKm: 10,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('INTERNAL_ERROR')
    }
  })
})
