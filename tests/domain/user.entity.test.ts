import { describe, it, expect } from 'vitest'
import { User, type UserProps } from '../../domain/entities/user.entity.js'

describe('User entity', () => {
  const mockProps: UserProps = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  describe('factories', () => {
    it('should create a user instance using .create()', () => {
      const user = User.create(mockProps)
      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe('user-123')
    })

    it('should create a user instance using .fromPersistence()', () => {
      const user = User.fromPersistence(mockProps)
      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe('user-123')
    })
  })

  describe('getters', () => {
    it('should return all basic properties', () => {
      const user = User.create(mockProps)
      expect(user.email).toBe(mockProps.email)
      expect(user.firstName).toBe(mockProps.firstName)
      expect(user.lastName).toBe(mockProps.lastName)
      expect(user.role).toBe(mockProps.role)
      expect(user.createdAt).toEqual(mockProps.createdAt)
      expect(user.updatedAt).toEqual(mockProps.updatedAt)
    })

    it('should return fullName', () => {
      const user = User.create(mockProps)
      expect(user.fullName).toBe('John Doe')
    })

    it('should return birthDate and avatarUrl if present', () => {
      const props: UserProps = {
        ...mockProps,
        birthDate: new Date('1990-01-01'),
        avatarUrl: 'http://avatar.test',
      }
      const user = User.create(props)
      expect(user.birthDate).toEqual(new Date('1990-01-01'))
      expect(user.avatarUrl).toBe('http://avatar.test')
    })
  })

  describe('business logic', () => {
    it('isAdmin should return true for ADMIN role', () => {
      const admin = User.create({ ...mockProps, role: 'ADMIN' })
      expect(admin.isAdmin()).toBe(true)

      const user = User.create({ ...mockProps, role: 'USER' })
      expect(user.isAdmin()).toBe(false)
    })

    it('canManageGarden: Admin can manage any garden', () => {
      const admin = User.create({ ...mockProps, role: 'ADMIN', id: 'admin-id' })
      expect(admin.canManageGarden('other-owner-id')).toBe(true)
      expect(admin.canManageGarden('admin-id')).toBe(true)
    })

    it('canManageGarden: User can manage only their own garden', () => {
      const user = User.create({ ...mockProps, role: 'USER', id: 'user-id' })
      expect(user.canManageGarden('user-id')).toBe(true)
      expect(user.canManageGarden('other-owner-id')).toBe(false)
    })
  })

  describe('serialization', () => {
    it('toJSON should return props object', () => {
      const user = User.create(mockProps)
      expect(user.toJSON()).toEqual(mockProps)
    })
  })
})
