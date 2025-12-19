import { User, type UserProps } from '../../domain/entities/user.entity.js'
import type {
  CreateUserData,
  UpdateUserData,
  UserRepository,
} from '../../domain/repositories/user.repository.js'
import { prisma } from '../database/prisma.client.js'

export class PrismaUserRepository implements UserRepository {
  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        ...data,
      },
    })
    return User.fromPersistence(user)
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    if (!user) return null
    return User.fromPersistence(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) return null
    return User.fromPersistence(user)
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    })
    return User.fromPersistence(user)
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }

  async findAll(options?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{ users: User[]; total: number }> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const skip = (page - 1) * limit

    const where = options?.search
      ? {
          OR: [
            { email: { contains: options.search, mode: 'insensitive' as const } },
            { firstName: { contains: options.search, mode: 'insensitive' as const } },
            { lastName: { contains: options.search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users: users.map(User.fromPersistence),
      total,
    }
  }

  async findByIdWithPassword(id: string): Promise<(UserProps & { password: string }) | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    return user
  }

  async findByEmailWithPassword(email: string): Promise<(UserProps & { password: string }) | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    })
    return count > 0
  }
}
