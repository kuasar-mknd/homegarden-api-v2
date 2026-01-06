import { validateImageSignature } from '@infrastructure/http/validators/file-signature.validator.js'
import { describe, expect, it } from 'vitest'

describe('File Signature Validator', () => {
  it('should validate JPEG files correctly', () => {
    const jpegBuffer = Buffer.from('FFD8FF000000000000000000', 'hex')
    expect(validateImageSignature(jpegBuffer, 'image/jpeg')).toBe(true)
  })

  it('should validate PNG files correctly', () => {
    const pngBuffer = Buffer.from('89504E470D0A1A0A00000000', 'hex')
    expect(validateImageSignature(pngBuffer, 'image/png')).toBe(true)
  })

  it('should validate WebP files correctly', () => {
    // RIFF .... WEBP
    const webpBuffer = Buffer.from('524946460000000057454250', 'hex')
    expect(validateImageSignature(webpBuffer, 'image/webp')).toBe(true)
  })

  it('should validate HEIC files correctly', () => {
    // HEIC structure: size (4 bytes) + ftyp (4 bytes) + brand (4 bytes)
    // 66 74 79 70 is ftyp
    // 68 65 69 63 is heic (brand)
    const heicBuffer = Buffer.from('000000186674797068656963', 'hex')

    // Check offsets:
    // 0-3: size (ignored)
    // 4-7: ftyp (checked)
    // 8-11: brand (checked)
    expect(validateImageSignature(heicBuffer, 'image/heic')).toBe(true)
  })

  it('should fail for mismatched types', () => {
    const jpegBuffer = Buffer.from('FFD8FF000000000000000000', 'hex')
    expect(validateImageSignature(jpegBuffer, 'image/png')).toBe(false)
  })

  it('should fail for invalid signatures', () => {
    const badBuffer = Buffer.from('000000000000000000000000', 'hex')
    expect(validateImageSignature(badBuffer, 'image/jpeg')).toBe(false)
  })

  it('should fail for short buffers', () => {
    const shortBuffer = Buffer.from('FFD8', 'hex')
    expect(validateImageSignature(shortBuffer, 'image/jpeg')).toBe(false)
  })
})
