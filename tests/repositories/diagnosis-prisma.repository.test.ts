import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DiagnosisPrismaRepository } from '../../infrastructure/database/repositories/diagnosis.prisma-repository.js'
import { prisma } from '../../infrastructure/database/prisma.client.js'

// Mock Prisma
vi.mock('../../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    diagnosis: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('DiagnosisPrismaRepository', () => {
  let repository: DiagnosisPrismaRepository

  beforeEach(() => {
    repository = new DiagnosisPrismaRepository()
    vi.clearAllMocks()
  })

  describe('findByUserId', () => {
    it('should exclude heavy fields in the query', async () => {
      const mockDiagnoses = [
        {
          id: '1',
          userId: 'user1',
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          imageUrl: 'http://example.com/image.jpg',
          description: 'A plant',
        },
      ]

      vi.mocked(prisma.diagnosis.findMany).mockResolvedValue(mockDiagnoses as any)
      vi.mocked(prisma.diagnosis.count).mockResolvedValue(1)

      await repository.findByUserId('user1')

      // Check general structure
      expect(prisma.diagnosis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
          select: expect.any(Object),
        })
      )

      // Detailed check for excluded fields
      const callArgs = vi.mocked(prisma.diagnosis.findMany).mock.calls[0][0]
      const selectKeys = Object.keys(callArgs?.select || {})

      expect(selectKeys).not.toContain('rawResponse')
      expect(selectKeys).not.toContain('organicTreatment')
      expect(selectKeys).not.toContain('chemicalTreatment')

      // Check included fields
      expect(selectKeys).toContain('id')
      expect(selectKeys).toContain('imageUrl')
      expect(selectKeys).toContain('status')
    })
  })

  describe('findByPlantId', () => {
    it('should exclude heavy fields in the query', async () => {
      vi.mocked(prisma.diagnosis.findMany).mockResolvedValue([])

      await repository.findByPlantId('plant1')

      const callArgs = vi.mocked(prisma.diagnosis.findMany).mock.calls[0][0]
      const selectKeys = Object.keys(callArgs?.select || {})

      expect(selectKeys).not.toContain('rawResponse')
      expect(selectKeys).not.toContain('organicTreatment')
      expect(selectKeys).not.toContain('chemicalTreatment')
      expect(selectKeys).toContain('id')
    })
  })
})
