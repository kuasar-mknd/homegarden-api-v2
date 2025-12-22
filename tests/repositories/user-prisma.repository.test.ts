import crypto from 'node:crypto'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { UserPrismaRepository } from '../../infrastructure/database/repositories/user.prisma-repository.js'

// Mock Prisma client
vi.mock('../../infrastructure/database/prisma.client.js', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { prisma } from '../../infrastructure/database/prisma.client.js'

describe('UserPrismaRepository Unit Tests', () => {
  const repository = new UserPrismaRepository()
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    avatarUrl: null,
    birthDate: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a user', async () => {
    ;(prisma.user.create as any).mockResolvedValue(mockUser)

    const result = await repository.create({
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      password: mockUser.password,
    })

    expect(prisma.user.create).toHaveBeenCalled()
    expect(result.id).toBe(mockUser.id)
    expect(result.email).toBe(mockUser.email)
  })

  it('should find a user by ID', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)

    const result = await repository.findById(mockUser.id)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    })
    expect(result?.id).toBe(mockUser.id)
  })

  it('should return null if user not found by ID', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(null)

    const result = await repository.findById('non-existent')

    expect(result).toBeNull()
  })

  it('should find a user by email', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)

    const result = await repository.findByEmail(mockUser.email)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    })
    expect(result?.email).toBe(mockUser.email)
  })

  it('should return null if user not found by email', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(null)
    const result = await repository.findByEmail('non-existent@test.com')
    expect(result).toBeNull()
  })

  it('should find a user with password by ID', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)
    const result = await repository.findByIdWithPassword(mockUser.id)
    expect(result?.password).toBe(mockUser.password)
  })

  it('should return null if user not found with password by ID', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(null)
    const result = await repository.findByIdWithPassword('non-existent')
    expect(result).toBeNull()
  })

  it('should find a user with password by email', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)
    const result = await repository.findByEmailWithPassword(mockUser.email)
    expect(result?.password).toBe(mockUser.password)
  })

  it('should return null if user not found with password by email', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue(null)
    const result = await repository.findByEmailWithPassword('non-existent')
    expect(result).toBeNull()
  })

  it('should update a user', async () => {
    ;(prisma.user.update as any).mockResolvedValue({
      ...mockUser,
      firstName: 'Updated',
    })

    const result = await repository.update(mockUser.id, { firstName: 'Updated' })

    expect(prisma.user.update).toHaveBeenCalled()
    expect(result.firstName).toBe('Updated')
  })

  it('should delete a user', async () => {
    ;(prisma.user.delete as any).mockResolvedValue(mockUser)

    await repository.delete(mockUser.id)

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    })
  })

  it('should check if user exists by email', async () => {
    ;(prisma.user.count as any).mockResolvedValue(1)

    const exists = await repository.existsByEmail(mockUser.email)

    expect(exists).toBe(true)
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    })
  })

  it('should find all users with pagination', async () => {
    const mockUsers = [mockUser]
    ;(prisma.user.findMany as any).mockResolvedValue(mockUsers)
    ;(prisma.user.count as any).mockResolvedValue(10)

    const result = await repository.findAll({ page: 1, limit: 5 })

    expect(result.users).toHaveLength(1)
    expect(result.total).toBe(10)
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 5,
      }),
    )
  })

  it('should find all with default options', async () => {
    ;(prisma.user.findMany as any).mockResolvedValue([mockUser])
    ;(prisma.user.count as any).mockResolvedValue(10)

    await repository.findAll()

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      }),
    )
  })

  it('should find all with search', async () => {
    ;(prisma.user.findMany as any).mockResolvedValue([])
    ;(prisma.user.count as any).mockResolvedValue(0)

    await repository.findAll({ search: 'john' })

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: { contains: 'john' } },
      }),
    )
  })
})
