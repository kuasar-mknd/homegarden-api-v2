import { describe, expect, it } from 'vitest'
import { sanitizePromptInput } from '../../shared/utils/ai-sanitizer.js'

describe('sanitizePromptInput', () => {
  it('should return empty string for null/undefined input', () => {
    expect(sanitizePromptInput(null)).toBe('')
    expect(sanitizePromptInput(undefined)).toBe('')
  })

  it('should trim whitespace', () => {
    expect(sanitizePromptInput('  hello  ')).toBe('hello')
  })

  it('should truncate input exceeding maxLength', () => {
    const longString = 'a'.repeat(20)
    expect(sanitizePromptInput(longString, 10)).toBe('aaaaaaaaaa')
  })

  it('should replace double quotes with single quotes', () => {
    expect(sanitizePromptInput('hello "world"')).toBe("hello 'world'")
  })

  it('should replace backticks with single quotes', () => {
    expect(sanitizePromptInput('hello `world`')).toBe("hello 'world'")
  })

  it('should remove control characters', () => {
    // \x00 is null, \x07 is bell
    expect(sanitizePromptInput('hello\x00world\x07')).toBe('helloworld')
  })

  it('should preserve newlines and tabs', () => {
    expect(sanitizePromptInput('hello\nworld\t!')).toBe('hello\nworld\t!')
  })
})
