import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetUserPlantsUseCase } from '../../application/use-cases/garden/get-user-plants.use-case.js'
import type { PlantRepository } from '../../domain/repositories/plant.repository.js'
import { Plant } from '../../domain/entities/plant.entity.js'

describe('GetUserPlantsUseCase', () => {
  let useCase: GetUserPlantsUseCase
  let plantRepo: PlantRepository

  beforeEach(() => {
    plantRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByGardenId: vi.fn(),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByGardenId: vi.fn(),
      findAll: vi.fn(),
      countByGardenId: vi.fn(),
      aggregateByCommonName: vi.fn(),
    } as unknown as PlantRepository

    useCase = new GetUserPlantsUseCase(plantRepo)
  })

  it('should validate required user ID', async () => {
    const result = await useCase.execute('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('User ID')
    }
  })

  it('should return plants for user', async () => {
    const userId = 'user-1'
    const expectedPlants = [
      Plant.fromPersistence({
        id: 'plant-1',
        gardenId: 'garden-1',
        nickname: 'My Plant',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any),
    ]

    // Brute force mock
    plantRepo.findByUserId = vi.fn().mockResolvedValue(expectedPlants)

    const result = await useCase.execute(userId)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(expectedPlants)
    }

    expect(plantRepo.findByUserId).toHaveBeenCalledWith(userId)
  })

  it('should return empty list if no plants found', async () => {
    const userId = 'user-2'
    plantRepo.findByUserId = vi.fn().mockResolvedValue([])

    const result = await useCase.execute(userId)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual([])
    }
  })
})
