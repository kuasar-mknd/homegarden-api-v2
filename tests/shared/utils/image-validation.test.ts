import { describe, expect, it } from 'vitest'
import { validateImageSignature } from '../../../shared/utils/image-validation.js'

describe('validateImageSignature', () => {
  it('should validate JPEG images', () => {
    // FF D8 FF
    const jpegBase64 = '/9j/AAA=' // /9j/AAA= is FF D8 FF 00 00 (5 bytes)
    expect(validateImageSignature(jpegBase64)).toBe(true)

    const fullJpeg = '/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9sAQwAGBgYGBQYJCQkGCAgICBEODw4ODhUUExMYFxgaGhgYGBoaGx0hHhodGxoaIyckIyQlKSkpGB8vMzQlMCMnKSn/2gAIAQEAAhED/wAD/9k='
    expect(validateImageSignature(fullJpeg)).toBe(true)
  })

  it('should validate PNG images', () => {
    // 89 50 4E 47
    const pngBase64 = 'iVBORw0KGgo='
    expect(validateImageSignature(pngBase64)).toBe(true)
  })

  it('should validate GIF images', () => {
    // 47 49 46 38
    const gifBase64 = 'R0lGODlh'
    expect(validateImageSignature(gifBase64)).toBe(true)
  })

  it('should validate WEBP images', () => {
    // RIFF .... WEBP
    // R0lGOD... is GIF, let's construct WEBP base64 manually or use a snippet
    // RIFF -> 52 49 46 46 -> UklGRg==
    // WEBP -> 57 45 42 50 -> V0VCUA==
    // Example: UklGRjIAAABXRUJQAQ== (RIFF 2... WEBP)
    const webpBase64 = 'UklGRjIAAABXRUJQAQ=='
    expect(validateImageSignature(webpBase64)).toBe(true)
  })

  it('should fail for invalid content', () => {
    const textBase64 = Buffer.from('Hello World').toString('base64')
    expect(validateImageSignature(textBase64)).toBe(false)
  })

  it('should fail for random garbage', () => {
    expect(validateImageSignature('abcd')).toBe(false)
  })

  it('should handle data URI prefix', () => {
    const pngDataUri = 'data:image/png;base64,iVBORw0KGgo='
    expect(validateImageSignature(pngDataUri)).toBe(true)
  })

  it('should fail for too short input', () => {
    expect(validateImageSignature('a')).toBe(false)
  })
})
