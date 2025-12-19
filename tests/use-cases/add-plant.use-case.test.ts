import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddPlantUseCase } from '../../application/use-cases/garden/add-plant.use-case.js'

// Mock Prisma
// Mock Prisma
const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      garden: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      plant: {
        create: vi.fn(),
      },
    },
  }
})

vi.mock('../../infrastructure/database/prisma.client.js', () => ({
  prisma: mockPrisma,
}))

describe('AddPlantUseCase', () => {
  let useCase: AddPlantUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new AddPlantUseCase()
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

    // Mock findFirst returns null (not found)
    vi.mocked(mockPrisma.garden.findFirst).mockResolvedValueOnce(null)

    // Mock create garden
    vi.mocked(mockPrisma.garden.create).mockResolvedValueOnce({
      id: 'garden-1',
      name: 'Living Room',
      userId: 'user-1',
    } as any)

    // Mock create plant
    vi.mocked(mockPrisma.plant.create).mockResolvedValueOnce({
      id: 'plant-1',
      gardenId: 'garden-1',
      nickname: 'My Plant',
    } as any)

    await useCase.execute(input)

    // Verifications
    expect(mockPrisma.garden.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', name: 'Living Room' },
    })
    expect(mockPrisma.garden.create).toHaveBeenCalled()
  })

  it('should use existing garden if found', async () => {
    const input = { userId: 'user-1', location: 'Balcony' }

    // Mock findFirst returns existing garden
    vi.mocked(mockPrisma.garden.findFirst).mockResolvedValueOnce({
      id: 'garden-existing',
      name: 'Balcony',
      userId: 'user-1',
    } as any)

    // Mock create plant
    vi.mocked(mockPrisma.plant.create).mockResolvedValueOnce({
      id: 'plant-1',
      gardenId: 'garden-existing',
    } as any)

    await useCase.execute(input)

    // Should NOT create new garden
    expect(mockPrisma.garden.create).not.toHaveBeenCalled()

    // Should create plant linked to existing garden
    expect(mockPrisma.plant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gardenId: 'garden-existing' }),
      }),
    )
  })
})
