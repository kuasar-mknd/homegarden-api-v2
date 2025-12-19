/**
 * User Repository Interface (Port)
 *
 * Defines the contract for user data access.
 * Implementations are in the infrastructure layer.
 */

import type { User, UserProps, UserRole } from '../entities/user.entity.js'

export interface CreateUserData {
  email: string
  password: string // Already hashed
  firstName: string
  lastName: string
  birthDate?: Date | null
  role?: UserRole
  avatarUrl?: string | null
}

export interface UpdateUserData {
  email?: string
  firstName?: string
  lastName?: string
  birthDate?: Date | null
  avatarUrl?: string | null
}

export interface UserRepository {
  // CRUD
  create(data: CreateUserData): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>

  // Queries
  findAll(options?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{ users: User[]; total: number }>

  // Auth-related
  findByIdWithPassword(id: string): Promise<(UserProps & { password: string }) | null>
  findByEmailWithPassword(email: string): Promise<(UserProps & { password: string }) | null>

  // Existence checks
  existsByEmail(email: string): Promise<boolean>
}
