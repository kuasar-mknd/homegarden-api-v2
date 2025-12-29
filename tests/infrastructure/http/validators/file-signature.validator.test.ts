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
    // .... ftyp
    const heicBuffer = Buffer.from('000000006674797000000000', 'hex')
    // We implemented check for 'ftyp' at offset 4
    // 66 74 79 70 is ftyp
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
