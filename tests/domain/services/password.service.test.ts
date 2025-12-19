import { describe, expect, it } from 'vitest'
import { PasswordService } from '../../../domain/services/password.service.js'

describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'securePassword123'
      const hash = await PasswordService.hash(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password', async () => {
      const password = 'securePassword123'
      const hash1 = await PasswordService.hash(password)
      const hash2 = await PasswordService.hash(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verify', () => {
    it('should return true for a correct password', async () => {
      const password = 'securePassword123'
      const hash = await PasswordService.hash(password)
      const isValid = await PasswordService.verify(password, hash)

      expect(isValid).toBe(true)
    })

    it('should return false for an incorrect password', async () => {
      const password = 'securePassword123'
      const hash = await PasswordService.hash(password)
      const isValid = await PasswordService.verify('wrongPassword', hash)

      expect(isValid).toBe(false)
    })
  })
})
