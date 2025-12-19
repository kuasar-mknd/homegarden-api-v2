import { describe, expect, it } from 'vitest'
import { Garden, type GardenProps } from '../../domain/entities/garden.entity.js'

describe('Garden entity', () => {
  const mockProps: GardenProps = {
    id: 'garden-123',
    name: 'My Urban Jungle',
    latitude: 48.8566,
    longitude: 2.3522,
    userId: 'user-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  describe('factories', () => {
    it('should create a garden instance using .create()', () => {
      const garden = Garden.create(mockProps)
      expect(garden).toBeInstanceOf(Garden)
      expect(garden.id).toBe('garden-123')
    })

    it('should create a garden instance using .fromPersistence()', () => {
      const garden = Garden.fromPersistence(mockProps)
      expect(garden).toBeInstanceOf(Garden)
      expect(garden.id).toBe('garden-123')
    })
  })

  describe('getters', () => {
    it('should return all basic properties', () => {
      const garden = Garden.create(mockProps)
      expect(garden.name).toBe(mockProps.name)
      expect(garden.latitude).toBe(mockProps.latitude)
      expect(garden.longitude).toBe(mockProps.longitude)
      expect(garden.userId).toBe(mockProps.userId)
      expect(garden.createdAt).toEqual(mockProps.createdAt)
      expect(garden.updatedAt).toEqual(mockProps.updatedAt)
    })

    it('should return coordinates as [lng, lat]', () => {
      const garden = Garden.create(mockProps)
      expect(garden.coordinates).toEqual([2.3522, 48.8566])
    })

    it('should return description, size, and climate if present', () => {
      const props: GardenProps = {
        ...mockProps,
        description: 'A cozy balcony garden',
        size: 5,
        climate: 'TEMPERATE',
      }
      const garden = Garden.create(props)
      expect(garden.description).toBe('A cozy balcony garden')
      expect(garden.size).toBe(5)
      expect(garden.climate).toBe('TEMPERATE')
    })

    it('should return plants list (empty by default)', () => {
      const garden = Garden.create(mockProps)
      expect(garden.plants).toEqual([])
    })
  })

  describe('business logic', () => {
    it('isOwnedBy: true for correct userId', () => {
      const garden = Garden.create(mockProps)
      expect(garden.isOwnedBy('user-123')).toBe(true)
      expect(garden.isOwnedBy('other-user')).toBe(false)
    })

    it('distanceTo: should calculate distance in km correctly', () => {
      // Paris (mockProps) to London (~51.5074, -0.1278)
      // Distance is roughly 344 km
      const garden = Garden.create(mockProps)
      const distance = garden.distanceTo(51.5074, -0.1278)

      expect(distance).toBeGreaterThan(340)
      expect(distance).toBeLessThan(350)
    })
  })

  describe('serialization', () => {
    it('toJSON should return props object', () => {
      const garden = Garden.create(mockProps)
      expect(garden.toJSON()).toEqual(mockProps)
    })
  })
})
