import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Plant } from '../../domain/entities/plant.entity.js'
import { PlantPrismaRepository } from '../../infrastructure/database/repositories/plant.prisma-repository.js'

// Mock Prisma client
vi.mock('../../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    plant: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    garden: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '../../infrastructure/database/prisma.client.js'

describe('PlantPrismaRepository Unit Tests', () => {
  const repository = new PlantPrismaRepository()
  const mockPlant = {
    id: 'plant-123',
    nickname: 'My Plant',
    gardenId: 'garden-123',
    speciesId: 'species-123',
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    family: 'Solanaceae',
    exposure: 'Full Sun',
    watering: 'Regular',
    soilType: 'Loamy',
    flowerColor: 'Yellow',
    height: '1m',
    plantedDate: new Date(),
    acquiredDate: new Date(),
    bloomingSeason: 'Summer',
    plantingSeason: 'Spring',
    careNotes: 'Water daily',
    imageUrl: 'https://example.com/image.jpg',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    use: 'Food',
    createdAt: new Date(),
    updatedAt: new Date(),
    garden: {
      id: 'garden-123',
      name: 'Test Garden',
      userId: 'user-123',
      latitude: 0,
      longitude: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a plant', async () => {
    ;(prisma.plant.create as any).mockResolvedValue(mockPlant)

    const result = await repository.create({
      gardenId: mockPlant.gardenId,
      nickname: mockPlant.nickname,
      commonName: mockPlant.commonName,
    })

    expect(prisma.plant.create).toHaveBeenCalled()
    expect(result.id).toBe(mockPlant.id)
    expect(result.gardenId).toBe(mockPlant.gardenId)
  })

  it('should find a plant by ID', async () => {
    ;(prisma.plant.findUnique as any).mockResolvedValue(mockPlant)

    const result = await repository.findById(mockPlant.id)

    expect(prisma.plant.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockPlant.id },
      }),
    )
    expect(result?.id).toBe(mockPlant.id)
  })

  it('should return null if plant not found by ID', async () => {
    ;(prisma.plant.findUnique as any).mockResolvedValue(null)
    const result = await repository.findById('non-existent')
    expect(result).toBeNull()
  })

  it('should find plants by garden ID', async () => {
    ;(prisma.plant.findMany as any).mockResolvedValue([mockPlant])

    const result = await repository.findByGardenId(mockPlant.gardenId)

    expect(result).toHaveLength(1)
    expect(result[0].gardenId).toBe(mockPlant.gardenId)

    // Verify optimization: excluding careNotes
    const callArgs = (prisma.plant.findMany as any).mock.calls[0][0]
    const selectKeys = Object.keys(callArgs?.select || {})
    expect(selectKeys).not.toContain('careNotes')
    expect(selectKeys).toContain('id')
  })

  it('should find plants by user ID', async () => {
    // Mock fetching gardens first
    ;(prisma.garden.findMany as any).mockResolvedValue([{ id: 'garden-123' }])
    ;(prisma.plant.findMany as any).mockResolvedValue([mockPlant])

    const result = await repository.findByUserId('user-123')

    expect(result).toHaveLength(1)

    // Check fetching gardens
    expect(prisma.garden.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      select: { id: true },
    })

    // Check fetching plants with application-side join
    expect(prisma.plant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          gardenId: { in: ['garden-123'] },
        },
      }),
    )

    // Verify optimization: excluding careNotes
    const callArgs = (prisma.plant.findMany as any).mock.calls[0][0]
    const selectKeys = Object.keys(callArgs?.select || {})
    expect(selectKeys).not.toContain('careNotes')
    expect(selectKeys).toContain('id')
  })

  it('should return empty array when user has no gardens', async () => {
    ;(prisma.garden.findMany as any).mockResolvedValue([])

    const result = await repository.findByUserId('user-123')

    expect(result).toHaveLength(0)
    expect(prisma.plant.findMany).not.toHaveBeenCalled()
  })

  it('should update a plant', async () => {
    ;(prisma.plant.update as any).mockResolvedValue({
      ...mockPlant,
      nickname: 'New Name',
    })

    const result = await repository.update(mockPlant.id, { nickname: 'New Name' })

    expect(prisma.plant.update).toHaveBeenCalled()
    expect(result.nickname).toBe('New Name')
  })

  it('should delete a plant', async () => {
    ;(prisma.plant.delete as any).mockResolvedValue(mockPlant)

    await repository.delete(mockPlant.id)

    expect(prisma.plant.delete).toHaveBeenCalledWith({
      where: { id: mockPlant.id },
    })
  })

  it('should delete plants by garden ID', async () => {
    ;(prisma.plant.deleteMany as any).mockResolvedValue({ count: 2 })

    await repository.deleteByGardenId(mockPlant.gardenId)

    expect(prisma.plant.deleteMany).toHaveBeenCalledWith({
      where: { gardenId: mockPlant.gardenId },
    })
  })

  it('should find all with pagination and filters', async () => {
    ;(prisma.plant.findMany as any).mockResolvedValue([mockPlant])
    ;(prisma.plant.count as any).mockResolvedValue(1)

    const result = await repository.findAll({ gardenId: mockPlant.gardenId, limit: 10 })

    expect(result.plants).toHaveLength(1)
    expect(result.total).toBe(1)

    // Verify optimization: excluding careNotes
    const callArgs = (prisma.plant.findMany as any).mock.calls[0][0]
    const selectKeys = Object.keys(callArgs?.select || {})
    expect(selectKeys).not.toContain('careNotes')
    expect(selectKeys).toContain('id')
  })

  it('should find all with speciesId filter', async () => {
    ;(prisma.plant.findMany as any).mockResolvedValue([mockPlant])
    ;(prisma.plant.count as any).mockResolvedValue(1)

    const result = await repository.findAll({ speciesId: 'species-123' })

    expect(prisma.plant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { speciesId: 'species-123' },
      }),
    )
    expect(result.plants).toHaveLength(1)
  })

  it('should find all with default options', async () => {
    ;(prisma.plant.findMany as any).mockResolvedValue([mockPlant])
    ;(prisma.plant.count as any).mockResolvedValue(1)

    const result = await repository.findAll()

    expect(prisma.plant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      }),
    )
    expect(result.plants).toHaveLength(1)
  })

  it('should count by garden ID', async () => {
    ;(prisma.plant.count as any).mockResolvedValue(5)

    const count = await repository.countByGardenId(mockPlant.gardenId)

    expect(count).toBe(5)
  })

  it('should aggregate by common name', async () => {
    ;(prisma.plant.groupBy as any).mockResolvedValue([
      { commonName: 'Rose', _count: { _all: 2 } },
      { commonName: 'Tulip', _count: { _all: 1 } },
      { commonName: null, _count: { _all: 1 } },
    ])

    const stats = await repository.aggregateByCommonName(mockPlant.gardenId)

    expect(stats).toHaveLength(3)
    expect(stats.find((s) => s.name === 'Rose')?.count).toBe(2)
    expect(stats.find((s) => s.name === 'Unknown')?.count).toBe(1)
  })

  it('should map to entity without garden', async () => {
    const { garden, ...plantWithoutGarden } = mockPlant
    ;(prisma.plant.findUnique as any).mockResolvedValue(plantWithoutGarden)

    const result = await repository.findById(mockPlant.id)

    expect(result).toBeInstanceOf(Plant)
    // Verify it doesn't have garden attached
  })

  it('should handle null fields during mapping', async () => {
    const sparsePlant = {
      ...mockPlant,
      nickname: null,
      speciesId: null,
      commonName: null,
      scientificName: null,
      family: null,
      exposure: null,
      watering: null,
      soilType: null,
      flowerColor: null,
      height: null,
      plantedDate: null,
      acquiredDate: null,
      bloomingSeason: null,
      plantingSeason: null,
      careNotes: null,
      imageUrl: null,
      thumbnailUrl: null,
      use: null,
    }
    ;(prisma.plant.findUnique as any).mockResolvedValue(sparsePlant)

    const result = await repository.findById(mockPlant.id)

    expect(result?.nickname).toBeNull()
    expect(result?.commonName).toBeNull()
  })
})
