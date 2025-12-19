import { User, type UserProps } from '../../../domain/entities/user.entity.js'
import type {
  CreateUserData,
  UpdateUserData,
  UserRepository,
} from '../../../domain/repositories/user.repository.js'
import { prisma } from '../prisma.client.js'

export class UserPrismaRepository implements UserRepository {
  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? 'USER',
      },
    })
    return this.mapToEntity(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user ? this.mapToEntity(user) : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    return user ? this.mapToEntity(user) : null
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
      } as any, // Simple cast for now
    })
    return this.mapToEntity(user)
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }

  async findAll(options?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, search } = options || {}
    const skip = (page - 1) * limit
    const where = search ? { email: { contains: search } } : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit }),
      prisma.user.count({ where }),
    ])

    return {
      users: users.map((u: any) => this.mapToEntity(u)),
      total,
    }
  }

  async findByIdWithPassword(id: string): Promise<(UserProps & { password: string }) | null> {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return {
      ...this.mapToUserProps(user),
      password: user.password,
    }
  }

  async findByEmailWithPassword(email: string): Promise<(UserProps & { password: string }) | null> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return null
    return {
      ...this.mapToUserProps(user),
      password: user.password,
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } })
    return count > 0
  }

  private mapToEntity(prismaUser: any): User {
    const props = this.mapToUserProps(prismaUser)
    return User.fromPersistence(props)
  }

  private mapToUserProps(prismaUser: any): UserProps {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      role: prismaUser.role,
      avatarUrl: prismaUser.avatarUrl ?? null,
      birthDate: prismaUser.birthDate ?? null, // Ensure Date or null
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    }
  }
}
