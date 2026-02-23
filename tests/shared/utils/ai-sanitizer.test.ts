import { describe, expect, it } from 'vitest'
import { sanitizePromptInput } from '../../../shared/utils/ai-sanitizer.js'

describe('sanitizePromptInput', () => {
  it('should return empty string for empty input', () => {
    expect(sanitizePromptInput('')).toBe('')
    expect(sanitizePromptInput(null as any)).toBe('')
    expect(sanitizePromptInput(undefined as any)).toBe('')
  })

  it('should remove control characters', () => {
    // \x00 is null, \x07 is bell
    const input = 'Hello\x00World\x07'
    expect(sanitizePromptInput(input)).toBe('HelloWorld')
  })

  it('should preserve newlines and tabs', () => {
    const input = 'Line1\nLine2\tTabbed'
    expect(sanitizePromptInput(input)).toBe('Line1\nLine2\tTabbed')
  })

  it('should normalize double quotes to single quotes', () => {
    const input = 'User said "hello"'
    expect(sanitizePromptInput(input)).toBe("User said 'hello'")
  })

  it('should truncate input to maxLength', () => {
    const input = '1234567890'
    expect(sanitizePromptInput(input, 5)).toBe('12345')
  })

  it('should handle combination of issues', () => {
    const input = 'Too "Long" \x00 Input'
    // Remove control char -> 'Too "Long"  Input'
    // Normalize quotes -> "Too 'Long'  Input"
    // Truncate (say 5) -> "Too '"
    expect(sanitizePromptInput(input, 5)).toBe("Too '")
  })

  it('should trim whitespace', () => {
      expect(sanitizePromptInput('  hello  ')).toBe('hello')
  })
})
