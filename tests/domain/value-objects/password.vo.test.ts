import { describe, expect, it } from 'vitest'
import { Password } from '../../../domain/value-objects/password.vo.js'
import { isFail, isOk } from '../../../shared/types/result.type.js'

describe('Password Value Object', () => {
  it('should create a valid password', () => {
    const result = Password.create('password123')
    expect(isOk(result)).toBe(true)
    if (isOk(result)) {
      expect(result.data.getValue()).toBe('password123')
    }
  })

  it('should fail for empty password', () => {
    const result = Password.create('')
    expect(isFail(result)).toBe(true)
    if (isFail(result)) {
      expect(result.error).toBe('Password is required')
    }
  })

  it('should fail for short password', () => {
    const result = Password.create('short')
    expect(isFail(result)).toBe(true)
    if (isFail(result)) {
      expect(result.error).toBe('Password must be at least 8 characters long')
    }
  })
})
