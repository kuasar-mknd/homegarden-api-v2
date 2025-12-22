import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Garden } from '../../domain/entities/garden.entity.js'
import { GardenPrismaRepository } from '../../infrastructure/database/repositories/garden.prisma-repository.js'

// Mock Prisma client
vi.mock('../../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    garden: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

import { prisma } from '../../infrastructure/database/prisma.client.js'

describe('GardenPrismaRepository Unit Tests', () => {
  const repository = new GardenPrismaRepository()
  const mockGarden = {
    id: 'garden-123',
    name: 'My Garden',
    userId: 'user-123',
    latitude: 48.8566,
    longitude: 2.3522,
    description: 'Beautiful garden',
    size: 50,
    climate: 'Temperate',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a garden', async () => {
    ;(prisma.garden.create as any).mockResolvedValue(mockGarden)

    const result = await repository.create({
      name: mockGarden.name,
      userId: mockGarden.userId,
      latitude: mockGarden.latitude,
      longitude: mockGarden.longitude,
    })

    expect(prisma.garden.create).toHaveBeenCalled()
    expect(result).toBeInstanceOf(Garden)
    expect(result.id).toBe(mockGarden.id)
  })

  it('should find a garden by ID', async () => {
    ;(prisma.garden.findUnique as any).mockResolvedValue(mockGarden)

    const result = await repository.findById(mockGarden.id)

    expect(prisma.garden.findUnique).toHaveBeenCalledWith({
      where: { id: mockGarden.id },
    })
    expect(result).toBeInstanceOf(Garden)
    expect(result?.id).toBe(mockGarden.id)
  })

  it('should find a garden with plants by ID', async () => {
    ;(prisma.garden.findUnique as any).mockResolvedValue(mockGarden)

    const result = await repository.findByIdWithPlants(mockGarden.id)

    expect(result?.id).toBe(mockGarden.id)
  })

  it('should find gardens by user ID', async () => {
    ;(prisma.garden.findMany as any).mockResolvedValue([mockGarden])

    const result = await repository.findByUserId(mockGarden.userId)

    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(Garden)
  })

  it('should update a garden', async () => {
    ;(prisma.garden.update as any).mockResolvedValue({
      ...mockGarden,
      name: 'Updated Garden',
    })

    const result = await repository.update(mockGarden.id, { name: 'Updated Garden' })

    expect(prisma.garden.update).toHaveBeenCalled()
    expect(result.name).toBe('Updated Garden')
  })

  it('should update a garden with all optional fields', async () => {
    ;(prisma.garden.update as any).mockResolvedValue(mockGarden)
    await repository.update(mockGarden.id, {
      description: 'New Desc',
      size: 100,
      climate: 'Tropical',
    })
    expect(prisma.garden.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: 'New Desc',
          size: 100,
          climate: 'Tropical',
        }),
      }),
    )
  })

  it('should delete a garden', async () => {
    ;(prisma.garden.delete as any).mockResolvedValue(mockGarden)

    await repository.delete(mockGarden.id)

    expect(prisma.garden.delete).toHaveBeenCalledWith({
      where: { id: mockGarden.id },
    })
  })

  it('should find by user and name', async () => {
    ;(prisma.garden.findFirst as any).mockResolvedValue(mockGarden)

    const result = await repository.findByUserAndName(mockGarden.userId, mockGarden.name)

    expect(prisma.garden.findFirst).toHaveBeenCalled()
    expect(result?.name).toBe(mockGarden.name)
  })

  it('should return null when not found by user and name', async () => {
    ;(prisma.garden.findFirst as any).mockResolvedValue(null)
    const result = await repository.findByUserAndName('user', 'non-existent')
    expect(result).toBeNull()
  })

  it('should find all gardens with pagination', async () => {
    ;(prisma.garden.findMany as any).mockResolvedValue([mockGarden])
    ;(prisma.garden.count as any).mockResolvedValue(1)

    const result = await repository.findAll({ page: 1, limit: 10, userId: 'user-123' })

    expect(prisma.garden.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        where: { userId: 'user-123' },
      }),
    )
    expect(result.gardens).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('should find all with search and defaults', async () => {
    ;(prisma.garden.findMany as any).mockResolvedValue([])
    ;(prisma.garden.count as any).mockResolvedValue(0)

    const result = await repository.findAll({ search: 'test' })

    expect(prisma.garden.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: 'test' },
        }),
      }),
    )
    expect(result.total).toBe(0)
  })

  it('should find all without options', async () => {
    ;(prisma.garden.findMany as any).mockResolvedValue([])
    ;(prisma.garden.count as any).mockResolvedValue(0)

    await repository.findAll()

    expect(prisma.garden.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      }),
    )
  })

  it('should find nearby gardens using raw query', async () => {
    ;(prisma.$queryRaw as any).mockResolvedValue([
      {
        ...mockGarden,
        created_at: mockGarden.createdAt,
        updated_at: mockGarden.updatedAt,
        user_id: mockGarden.userId,
      },
    ])

    const result = await repository.findNearby({
      latitude: 48.8566,
      longitude: 2.3522,
      radiusKm: 5,
    })

    expect(prisma.$queryRaw).toHaveBeenCalled()
    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(Garden)
    expect(result[0].name).toBe(mockGarden.name)
  })

  it('should return empty array for nearby search when error occurs', async () => {
    ;(prisma.$queryRaw as any).mockRejectedValue(new Error('PostGIS error'))

    const result = await repository.findNearby({
      latitude: 0,
      longitude: 0,
    })

    expect(result).toEqual([])
  })
})
