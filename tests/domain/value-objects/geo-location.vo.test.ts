import { describe, expect, it } from 'vitest'
import { GeoLocation } from '../../../domain/value-objects/geo-location.vo.js'
import { isFail, isOk } from '../../../shared/types/result.type.js'

describe('GeoLocation Value Object', () => {
  it('should create a valid geolocation', () => {
    const result = GeoLocation.create(45.5, -122.6)
    expect(isOk(result)).toBe(true)
    if (isOk(result)) {
      expect(result.data.getLatitude()).toBe(45.5)
      expect(result.data.getLongitude()).toBe(-122.6)
      expect(result.data.getCoordinates()).toEqual([-122.6, 45.5])
    }
  })

  it('should fail for invalid latitude', () => {
    const result = GeoLocation.create(91, 0)
    expect(isFail(result)).toBe(true)
    if (isFail(result)) {
      expect(result.error).toBe('Latitude must be between -90 and 90')
    }

    const result2 = GeoLocation.create(-91, 0)
    expect(isFail(result2)).toBe(true)
  })

  it('should fail for invalid longitude', () => {
    const result = GeoLocation.create(0, 181)
    expect(isFail(result)).toBe(true)
    if (isFail(result)) {
      expect(result.error).toBe('Longitude must be between -180 and 180')
    }

    const result2 = GeoLocation.create(0, -181)
    expect(isFail(result2)).toBe(true)
  })
})
