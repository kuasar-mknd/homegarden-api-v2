import { describe, expect, it } from 'vitest'
import { calculateDistance, isValidCoordinate, toRadians } from '../../../shared/utils/geo.utils.js'

describe('Geo Utils', () => {
  describe('toRadians', () => {
    it('should convert degrees to radians', () => {
      expect(toRadians(0)).toBe(0)
      expect(toRadians(180)).toBe(Math.PI)
      expect(toRadians(90)).toBe(Math.PI / 2)
    })
  })

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // New York (40.7128° N, 74.0060° W) to London (51.5074° N, 0.1278° W)
      // Distance is approximately 5570 km
      const nyLat = 40.7128
      const nyLon = -74.006
      const londonLat = 51.5074
      const londonLon = -0.1278

      const distance = calculateDistance(nyLat, nyLon, londonLat, londonLon)
      expect(distance).toBeGreaterThan(5500)
      expect(distance).toBeLessThan(5600)
    })

    it('should return 0 for same location', () => {
      expect(calculateDistance(10, 10, 10, 10)).toBe(0)
    })
  })

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate(0, 0)).toBe(true)
      expect(isValidCoordinate(90, 180)).toBe(true)
      expect(isValidCoordinate(-90, -180)).toBe(true)
    })

    it('should return false for invalid latitude', () => {
      expect(isValidCoordinate(91, 0)).toBe(false)
      expect(isValidCoordinate(-91, 0)).toBe(false)
    })

    it('should return false for invalid longitude', () => {
      expect(isValidCoordinate(0, 181)).toBe(false)
      expect(isValidCoordinate(0, -181)).toBe(false)
    })
  })
})
