import { describe, it, expect } from 'vitest'
import { Email } from '../../../domain/value-objects/email.vo.js'
import { isOk, isFail } from '../../../shared/types/result.type.js'

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const result = Email.create('test@example.com')
    expect(isOk(result)).toBe(true)
    if (isOk(result)) {
      expect(result.data.getValue()).toBe('test@example.com')
    }
  })

  it('should fail for empty email', () => {
    const result = Email.create('')
    expect(isFail(result)).toBe(true)
    if (isFail(result)) {
      expect(result.error).toBe('Email is required')
    }
  })

  it('should fail for invalid email format', () => {
    const invalidEmails = ['invalid', 'test@', 'test.com', '@test.com']
    invalidEmails.forEach(email => {
      const result = Email.create(email)
      expect(isFail(result)).toBe(true)
      if (isFail(result)) {
        expect(result.error).toBe('Invalid email format')
      }
    })
  })
})
