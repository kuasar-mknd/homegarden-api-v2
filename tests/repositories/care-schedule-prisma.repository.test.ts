import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CareSchedulePrismaRepository } from '../../infrastructure/database/repositories/care-schedule.prisma-repository.js'
import { prisma } from '../../infrastructure/database/prisma.client.js'

// Mock Prisma
vi.mock('../../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    careSchedule: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    careCompletion: {
      create: vi.fn(),
    },
    $transaction: vi.fn((ops) => Promise.all(ops)),
  },
}))

describe('CareSchedulePrismaRepository', () => {
  let repository: CareSchedulePrismaRepository

  beforeEach(() => {
    repository = new CareSchedulePrismaRepository()
    vi.clearAllMocks()
  })

  describe('findByUserId', () => {
    it('should exclude notes in list query', async () => {
      vi.mocked(prisma.careSchedule.findMany).mockResolvedValue([
        { id: '1', userId: 'u1', nextDueDate: new Date() }
      ] as any)

      await repository.findByUserId('u1')

      const callArgs = vi.mocked(prisma.careSchedule.findMany).mock.calls[0][0]
      const selectKeys = Object.keys(callArgs?.select || {})

      expect(selectKeys).not.toContain('notes')
      expect(selectKeys).toContain('id')
    })
  })

  describe('findUpcoming', () => {
    it('should exclude notes in list query', async () => {
      vi.mocked(prisma.careSchedule.findMany).mockResolvedValue([])

      await repository.findUpcoming('u1', 7)

      const callArgs = vi.mocked(prisma.careSchedule.findMany).mock.calls[0][0]
      const selectKeys = Object.keys(callArgs?.select || {})

      expect(selectKeys).not.toContain('notes')
      expect(selectKeys).toContain('id')
    })
  })
})
