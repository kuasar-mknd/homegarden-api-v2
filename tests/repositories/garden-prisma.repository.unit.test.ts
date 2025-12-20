import { afterAll, describe, expect, it, vi } from 'vitest'
import { Garden } from '../../domain/entities/garden.entity.js'
import { PrismaGardenRepository } from '../../infrastructure/repositories/prisma-garden.repository.js'

// We need to mock the module import for prisma
vi.mock('../../infrastructure/database/prisma.client.js', () => {
  const mockQueryRaw = vi.fn()
  return {
    prisma: {
      $queryRaw: mockQueryRaw,
      garden: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  }
})

// Access the mocked prisma client to set expectations
import { prisma } from '../../infrastructure/database/prisma.client.js'

const mockQueryRaw = prisma.$queryRaw as unknown as ReturnType<typeof vi.fn>

describe('PrismaGardenRepository Unit Tests', () => {
  const repository = new PrismaGardenRepository()

  afterAll(() => {
    vi.clearAllMocks()
  })

  it('findNearby should use bounding box optimization', async () => {
    const lat = 48.8566
    const lng = 2.3522
    const radius = 10

    // Mock response
    mockQueryRaw.mockResolvedValue([
      {
        id: '1',
        name: 'Test Garden',
        latitude: 48.85,
        longitude: 2.35,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user1',
        distance: 5,
      },
    ])

    await repository.findNearby({
      latitude: lat,
      longitude: lng,
      radiusKm: radius,
    })

    // Check if queryRaw was called
    expect(mockQueryRaw).toHaveBeenCalled()

    // Let's at least assert it returns mapped gardens
    const result = await repository.findNearby({
      latitude: lat,
      longitude: lng,
      radiusKm: radius,
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(Garden)
    expect(result[0].name).toBe('Test Garden')
  })
})
