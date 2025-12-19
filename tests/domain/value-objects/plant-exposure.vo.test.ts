import { describe, it, expect } from 'vitest'
import { PlantExposure } from '../../../domain/value-objects/plant-exposure.vo.js'
import { isOk, isFail } from '../../../shared/types/result.type.js'

describe('PlantExposure Value Object', () => {
  it('should create a valid plant exposure', () => {
    const exposures = ['FULL_SUN', 'PARTIAL_SHADE', 'SHADE']
    exposures.forEach(exp => {
      const result = PlantExposure.create(exp)
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.data.getValue()).toBe(exp)
      }
    })
  })

  it('should fail for invalid plant exposure', () => {
    const result = PlantExposure.create('INVALID_EXPOSURE')
    expect(isFail(result)).toBe(true)
    if (isFail(result)) {
      expect(result.error).toContain('Invalid plant exposure')
    }
  })
})
