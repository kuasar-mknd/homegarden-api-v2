import { describe, it, expect } from 'vitest'
import { Species, type SpeciesProps } from '../../domain/entities/species.entity.js'

describe('Species entity', () => {
  const mockProps: SpeciesProps = {
    id: 'spec-123',
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    family: 'Solanaceae',
    nativeRegions: ['South America'],
    soilType: ['Loamy'],
    bloomingSeason: ['Summer'],
    harvestSeason: ['Late Summer'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  describe('factories', () => {
    it('should create a species instance using .create()', () => {
      const species = Species.create(mockProps)
      expect(species).toBeInstanceOf(Species)
      expect(species.id).toBe('spec-123')
    })

    it('should create a species instance using .fromPersistence()', () => {
      const species = Species.fromPersistence(mockProps)
      expect(species).toBeInstanceOf(Species)
      expect(species.id).toBe('spec-123')
    })
  })

  describe('getters', () => {
    it('should return all basic properties', () => {
      const species = Species.create(mockProps)
      expect(species.commonName).toBe('Tomato')
      expect(species.scientificName).toBe('Solanum lycopersicum')
      expect(species.family).toBe('Solanaceae')
    })

    it('should return optional properties if present', () => {
        const props: SpeciesProps = {
            ...mockProps,
            description: 'Delicious fruit',
            waterRequirement: 'MODERATE',
            lightRequirement: 'FULL_SUN',
            defaultWateringDays: 3,
            defaultFertilizeDays: 14
        }
        const species = Species.create(props)
        expect(species.description).toBe('Delicious fruit')
        expect(species.waterRequirement).toBe('MODERATE')
        expect(species.lightRequirement).toBe('FULL_SUN')
        expect(species.defaultWateringDays).toBe(3)
        expect(species.defaultFertilizeDays).toBe(14)
    })
  })

  describe('serialization', () => {
    it('toJSON should return props object', () => {
      const species = Species.create(mockProps)
      expect(species.toJSON()).toEqual(mockProps)
    })
  })
})
