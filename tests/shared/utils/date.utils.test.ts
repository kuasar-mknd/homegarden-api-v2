import { describe, expect, it } from 'vitest'
import {
  addDays,
  differenceInDays,
  isFuture,
  isPast,
  isSameDay,
} from '../../../shared/utils/date.utils.js'

describe('Date Utils', () => {
  describe('differenceInDays', () => {
    it('should calculate difference correctly', () => {
      const d1 = new Date('2023-01-01')
      const d2 = new Date('2023-01-02')
      expect(differenceInDays(d2, d1)).toBe(1)
      expect(differenceInDays(d1, d2)).toBe(-1)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const d1 = new Date('2023-01-01T10:00:00')
      const d2 = new Date('2023-01-01T15:00:00')
      expect(isSameDay(d1, d2)).toBe(true)
    })

    it('should return false for different days', () => {
      const d1 = new Date('2023-01-01T23:00:00')
      const d2 = new Date('2023-01-02T01:00:00')
      expect(isSameDay(d1, d2)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('should identify past dates', () => {
      const past = new Date(Date.now() - 10000)
      expect(isPast(past)).toBe(true)
    })

    it('should not identify future dates as past', () => {
      const future = new Date(Date.now() + 10000)
      expect(isPast(future)).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('should identify future dates', () => {
      const future = new Date(Date.now() + 10000)
      expect(isFuture(future)).toBe(true)
    })

    it('should not identify past dates as future', () => {
      const past = new Date(Date.now() - 10000)
      expect(isFuture(past)).toBe(false)
    })
  })

  describe('addDays', () => {
    it('should add days correctly', () => {
      const date = new Date('2023-01-01')
      const added = addDays(date, 5)
      expect(added.toISOString().startsWith('2023-01-06')).toBe(true)
    })

    it('should handle month rollovers', () => {
      const date = new Date('2023-01-31')
      const added = addDays(date, 1)
      expect(added.toISOString().startsWith('2023-02-01')).toBe(true)
    })
  })
})
