import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddPlantUseCase } from '../../application/use-cases/garden/add-plant.use-case.js'
import type { GardenRepository } from '../../domain/repositories/garden.repository.js'
import type { PlantRepository } from '../../domain/repositories/plant.repository.js'

describe('AddPlantUseCase', () => {
  let useCase: AddPlantUseCase
  let gardenRepo: GardenRepository
  let plantRepo: PlantRepository

  beforeEach(() => {
    gardenRepo = {
      findByUserAndName: vi.fn(),
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findNearby: vi.fn(),
    } as unknown as GardenRepository

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

    useCase = new AddPlantUseCase(gardenRepo, plantRepo)
  })

  it('should validate required fields', async () => {
    const input: any = { userId: '' } // Missing fields
    const result = await useCase.execute(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('User ID')
    }
  })

  it('should create new garden if not exists', async () => {
    const input = { userId: 'user-1', location: 'Living Room' }

    // Mock findByUserAndName returns null (not found)
    vi.mocked(gardenRepo.findByUserAndName).mockResolvedValueOnce(null)

    // Mock create garden
    vi.mocked(gardenRepo.create).mockResolvedValueOnce({
      id: 'garden-1',
      name: 'Living Room',
      userId: 'user-1',
    } as any)

    // Mock create plant
    vi.mocked(plantRepo.create).mockResolvedValueOnce({
      id: 'plant-1',
      gardenId: 'garden-1',
      nickname: 'My Plant',
    } as any)

    await useCase.execute(input)

    // Verifications
    expect(gardenRepo.findByUserAndName).toHaveBeenCalledWith('user-1', 'Living Room')
    expect(gardenRepo.create).toHaveBeenCalled()
    expect(plantRepo.create).toHaveBeenCalled()
  })

  it('should use existing garden if found', async () => {
    const input = { userId: 'user-1', location: 'Balcony' }

    // Mock findByUserAndName returns existing garden
    vi.mocked(gardenRepo.findByUserAndName).mockResolvedValueOnce({
      id: 'garden-existing',
      name: 'Balcony',
      userId: 'user-1',
    } as any)

    // Mock create plant
    vi.mocked(plantRepo.create).mockResolvedValueOnce({
      id: 'plant-1',
      gardenId: 'garden-existing',
    } as any)

    await useCase.execute(input)

    // Should NOT create new garden
    expect(gardenRepo.create).not.toHaveBeenCalled()

    // Should create plant linked to existing garden
    expect(plantRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ gardenId: 'garden-existing' }),
    )
  })
})
