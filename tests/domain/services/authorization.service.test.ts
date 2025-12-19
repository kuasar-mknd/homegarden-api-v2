import { describe, expect, it } from 'vitest'
import { Garden } from '../../../domain/entities/garden.entity.js'
import { Plant } from '../../../domain/entities/plant.entity.js'
import { User } from '../../../domain/entities/user.entity.js'
import { AuthorizationService } from '../../../domain/services/authorization.service.js'

describe('AuthorizationService', () => {
  const adminUser = User.create({
    id: 'admin-id',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const regularUser = User.create({
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const otherUser = User.create({
    id: 'other-id',
    email: 'other@example.com',
    firstName: 'Other',
    lastName: 'User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const garden = Garden.create({
    id: 'garden-id',
    name: 'My Garden',
    latitude: 0,
    longitude: 0,
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const plant = Plant.create({
    id: 'plant-id',
    gardenId: 'garden-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  describe('canManageGarden', () => {
    it('should allow admin to manage any garden', () => {
      expect(AuthorizationService.canManageGarden(adminUser, garden)).toBe(true)
    })

    it('should allow owner to manage their garden', () => {
      expect(AuthorizationService.canManageGarden(regularUser, garden)).toBe(true)
    })

    it('should not allow other users to manage the garden', () => {
      expect(AuthorizationService.canManageGarden(otherUser, garden)).toBe(false)
    })
  })

  describe('canManagePlant', () => {
    it('should allow admin to manage plant in any garden', () => {
      expect(AuthorizationService.canManagePlant(adminUser, plant, garden)).toBe(true)
    })

    it('should allow garden owner to manage plant in their garden', () => {
      expect(AuthorizationService.canManagePlant(regularUser, plant, garden)).toBe(true)
    })

    it('should not allow other users to manage the plant', () => {
      expect(AuthorizationService.canManagePlant(otherUser, plant, garden)).toBe(false)
    })

    it('should fail if plant does not belong to the garden', () => {
      const otherGarden = Garden.create({
        id: 'other-garden-id',
        name: 'Other Garden',
        latitude: 0,
        longitude: 0,
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(AuthorizationService.canManagePlant(regularUser, plant, otherGarden)).toBe(false)
    })
  })
})
