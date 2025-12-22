import { describe, expect, it } from 'vitest'
import { Email } from '../../../domain/value-objects/email.vo.js'
import { isFail, isOk } from '../../../shared/types/result.type.js'

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
    invalidEmails.forEach((email) => {
      const result = Email.create(email)
      expect(isFail(result)).toBe(true)
      if (isFail(result)) {
        expect(result.error).toBe('Invalid email format')
      }
    })
  })

  it('should correctly compare emails', () => {
    const email1 = (Email.create('test@example.com') as any).data
    const email2 = (Email.create('test@example.com') as any).data
    const email3 = (Email.create('other@example.com') as any).data

    expect(email1.equals(email2)).toBe(true)
    expect(email1.equals(email3)).toBe(false)
  })
})
