import { PasswordService } from '../../../domain/services/password.service.js'
import { describe, expect, it } from 'vitest'

describe('PasswordService', () => {
  it('should hash a password', async () => {
    const password = 'password123'
    const hash = await PasswordService.hash(password)
    expect(hash).not.toBe(password)
    expect(hash).toHaveLength(60) // bcrypt hash length
  })

  it('should verify a correct password', async () => {
    const password = 'password123'
    const hash = await PasswordService.hash(password)
    const isValid = await PasswordService.verify(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject an incorrect password', async () => {
    const password = 'password123'
    const hash = await PasswordService.hash(password)
    const isValid = await PasswordService.verify('wrongPassword', hash)
    expect(isValid).toBe(false)
  })

  it('should generate different hashes for the same password', async () => {
    const password = 'password123'
    const hash1 = await PasswordService.hash(password)
    const hash2 = await PasswordService.hash(password)
    expect(hash1).not.toBe(hash2)
  })
})
