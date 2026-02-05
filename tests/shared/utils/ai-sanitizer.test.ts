import { describe, expect, it } from 'vitest'
import { sanitizePromptInput } from '../../../shared/utils/ai-sanitizer.js'

describe('sanitizePromptInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizePromptInput('  hello  ')).toBe('hello')
  })

  it('should replace double quotes with single quotes', () => {
    expect(sanitizePromptInput('hello "world"')).toBe("hello 'world'")
  })

  it('should replace newlines with spaces', () => {
    expect(sanitizePromptInput('hello\nworld')).toBe('hello world')
    expect(sanitizePromptInput('hello\r\nworld')).toBe('hello world')
    expect(sanitizePromptInput('line1\nline2\nline3')).toBe('line1 line2 line3')
  })

  it('should remove control characters', () => {
    // \x00 is null, \x1B is escape
    expect(sanitizePromptInput('hello\x00world\x1B')).toBe('helloworld')
  })

  it('should preserve tabs', () => {
    expect(sanitizePromptInput('hello\tworld')).toBe('hello\tworld')
  })

  it('should enforce max length', () => {
    expect(sanitizePromptInput('hello world', 5)).toBe('hello')
  })

  it('should handle complex input', () => {
    const input = '  "Hello"\nWorld\x00!  '
    // Trim -> "Hello"\nWorld\x00!
    // Quotes -> 'Hello'\nWorld\x00!
    // Newlines -> 'Hello' World\x00!
    // Control -> 'Hello' World!
    expect(sanitizePromptInput(input)).toBe("'Hello' World!")
  })
})
