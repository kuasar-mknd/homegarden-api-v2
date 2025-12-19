import { describe, expect, it } from 'vitest'
import { CareSchedule, type CareScheduleProps } from '../../domain/entities/care-schedule.entity.js'

describe('CareSchedule entity', () => {
  const mockProps: CareScheduleProps = {
    id: 'care-123',
    taskType: 'WATER',
    frequency: 'WEEKLY',
    nextDueDate: new Date('2023-01-10'),
    isEnabled: true,
    weatherAdjust: false,
    userId: 'user-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  describe('factories', () => {
    it('should create a care schedule instance using .create()', () => {
      const schedule = CareSchedule.create(mockProps)
      expect(schedule).toBeInstanceOf(CareSchedule)
      expect(schedule.id).toBe('care-123')
    })

    it('should create a care schedule instance using .fromPersistence()', () => {
      const schedule = CareSchedule.fromPersistence(mockProps)
      expect(schedule).toBeInstanceOf(CareSchedule)
      expect(schedule.id).toBe('care-123')
    })
  })

  describe('getters', () => {
    it('should return all basic properties', () => {
      const schedule = CareSchedule.create(mockProps)
      expect(schedule.taskType).toBe('WATER')
      expect(schedule.frequency).toBe('WEEKLY')
      expect(schedule.nextDueDate).toEqual(mockProps.nextDueDate)
      expect(schedule.isEnabled).toBe(true)
      expect(schedule.userId).toBe('user-123')
    })
  })

  describe('business logic', () => {
    it('isOverdue: should return true if nextDueDate < now', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const schedule = CareSchedule.create({ ...mockProps, nextDueDate: pastDate })
      expect(schedule.isOverdue).toBe(true)
    })

    it('isOverdue: should return false if nextDueDate > now', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const schedule = CareSchedule.create({ ...mockProps, nextDueDate: futureDate })
      expect(schedule.isOverdue).toBe(false)
    })

    it('daysUntilDue: should calculate days correctly', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      const schedule = CareSchedule.create({ ...mockProps, nextDueDate: futureDate })
      expect(schedule.daysUntilDue).toBe(5)
    })

    it('isDueToday: should return true if dates match', () => {
      const today = new Date()
      const schedule = CareSchedule.create({ ...mockProps, nextDueDate: today })
      expect(schedule.isDueToday).toBe(true)
    })

    it('isDueToday: should return false if dates differ', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const schedule = CareSchedule.create({ ...mockProps, nextDueDate: tomorrow })
      expect(schedule.isDueToday).toBe(false)
    })
  })

  describe('serialization', () => {
    it('toJSON should return props object', () => {
      const schedule = CareSchedule.create(mockProps)
      expect(schedule.toJSON()).toEqual(mockProps)
    })
  })
})
