/**
 * User Domain Entity
 * 
 * Core business entity representing a user in the system.
 * Contains business logic and validation rules.
 */

export interface UserProps {
  id: string
  email: string
  firstName: string
  lastName: string
  birthDate?: Date | null
  role: UserRole
  avatarUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'USER' | 'ADMIN'

export class User {
  private constructor(private readonly props: UserProps) {}

  // ============================================================
  // FACTORY METHODS
  // ============================================================

  static create(props: UserProps): User {
    return new User(props)
  }

  static fromPersistence(data: UserProps): User {
    return new User(data)
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get id(): string {
    return this.props.id
  }

  get email(): string {
    return this.props.email
  }

  get firstName(): string {
    return this.props.firstName
  }

  get lastName(): string {
    return this.props.lastName
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`
  }

  get birthDate(): Date | null | undefined {
    return this.props.birthDate
  }

  get role(): UserRole {
    return this.props.role
  }

  get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  // ============================================================
  // BUSINESS METHODS
  // ============================================================

  isAdmin(): boolean {
    return this.props.role === 'ADMIN'
  }

  canManageGarden(gardenOwnerId: string): boolean {
    return this.isAdmin() || this.props.id === gardenOwnerId
  }

  // ============================================================
  // SERIALIZATION
  // ============================================================

  toJSON(): Omit<UserProps, 'password'> {
    return { ...this.props }
  }
}
