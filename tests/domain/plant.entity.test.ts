import { describe, it, expect } from 'vitest'
import { Plant, type PlantProps } from '../../domain/entities/plant.entity.js'

describe('Plant entity', () => {
  const mockProps: PlantProps = {
    id: 'plant-123',
    nickname: 'Rosey',
    commonName: 'Rose',
    scientificName: 'Rosa',
    family: 'Rosaceae',
    gardenId: 'garden-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  describe('factories', () => {
    it('should create a plant instance using .create()', () => {
      const plant = Plant.create(mockProps)
      expect(plant).toBeInstanceOf(Plant)
      expect(plant.id).toBe('plant-123')
    })

    it('should create a plant instance using .fromPersistence()', () => {
      const plant = Plant.fromPersistence(mockProps)
      expect(plant).toBeInstanceOf(Plant)
      expect(plant.id).toBe('plant-123')
    })
  })

  describe('getters', () => {
    it('should return all basic properties', () => {
      const plant = Plant.create(mockProps)
      expect(plant.nickname).toBe(mockProps.nickname)
      expect(plant.commonName).toBe(mockProps.commonName)
      expect(plant.scientificName).toBe(mockProps.scientificName)
      expect(plant.family).toBe(mockProps.family)
      expect(plant.gardenId).toBe(mockProps.gardenId)
      expect(plant.createdAt).toEqual(mockProps.createdAt)
      expect(plant.updatedAt).toEqual(mockProps.updatedAt)
      expect(plant.plantedDate).toBeUndefined()
    })

    it('should return exposure, watering, soilType etc.', () => {
        const props: PlantProps = {
            ...mockProps,
            exposure: 'FULL_SUN',
            watering: 'Weekly',
            soilType: 'Loamy',
            flowerColor: 'Red',
            height: 50,
            use: 'ORNAMENTAL',
            speciesId: 'species-1',
            careNotes: 'Keep moist',
            imageUrl: 'http://img.com',
            thumbnailUrl: 'http://thumb.com',
            plantingSeason: 'Spring',
            bloomingSeason: 'Summer',
            acquiredDate: new Date('2023-02-01')
        }
        const plant = Plant.create(props)
        expect(plant.exposure).toBe('FULL_SUN')
        expect(plant.watering).toBe('Weekly')
        expect(plant.soilType).toBe('Loamy')
        expect(plant.flowerColor).toBe('Red')
        expect(plant.height).toBe(50)
        expect(plant.use).toBe('ORNAMENTAL')
        expect(plant.speciesId).toBe('species-1')
        expect(plant.careNotes).toBe('Keep moist')
        expect(plant.imageUrl).toBe('http://img.com')
        expect(plant.thumbnailUrl).toBe('http://thumb.com')
        expect(plant.plantingSeason).toBe('Spring')
        expect(plant.bloomingSeason).toBe('Summer')
        expect(plant.acquiredDate).toEqual(new Date('2023-02-01'))
    })
  })

  describe('business logic', () => {
    it('displayName priority: nickname > commonName > default', () => {
      const p1 = Plant.create({ ...mockProps, nickname: 'Berry', commonName: 'Straw' })
      expect(p1.displayName).toBe('Berry')

      const p2 = Plant.create({ ...mockProps, nickname: undefined, commonName: 'Straw' })
      expect(p2.displayName).toBe('Straw')

      const p3 = Plant.create({ ...mockProps, nickname: undefined, commonName: undefined })
      expect(p3.displayName).toBe('Unnamed Plant')
    })

    it('isIdentified: true if speciesId exists', () => {
        const p1 = Plant.create({ ...mockProps, speciesId: 's-1' })
        expect(p1.isIdentified).toBe(true)

        const p2 = Plant.create({ ...mockProps, speciesId: undefined })
        expect(p2.isIdentified).toBe(false)
    })

    it('age: returns null if no plantedDate', () => {
        const plant = Plant.create(mockProps)
        expect(plant.age).toBeNull()
    })

    it('age: returns correct duration if plantedDate exists', () => {
        // Mocking "now" by defining a plantedDate relative to today.
        // Actually, the implementation uses new Date(), so we should use a fixed date in the past.
        const plantedDate = new Date()
        plantedDate.setDate(plantedDate.getDate() - 400) // ~13 months ago
        
        const plant = Plant.create({ ...mockProps, plantedDate })
        const age = plant.age
        expect(age).not.toBeNull()
        expect(age?.days).toBeGreaterThanOrEqual(400)
        expect(age?.months).toBeGreaterThanOrEqual(13)
        expect(age?.years).toBe(1)
    })

    it('garden: should return garden if present', () => {
        const garden = { id: 'g-1', name: 'Paradise', userId: 'u-1', latitude: 48.8, longitude: 2.3, createdAt: new Date(), updatedAt: new Date() }
        const plant = Plant.create({ ...mockProps, garden })
        expect(plant.garden).toEqual(garden)
    })
  })

  describe('serialization', () => {
    it('toJSON should return props object', () => {
      const plant = Plant.create(mockProps)
      expect(plant.toJSON()).toEqual(mockProps)
    })
  })
})
