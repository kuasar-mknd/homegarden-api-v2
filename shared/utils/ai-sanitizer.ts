/**
 * AI Input Sanitizer
 *
 * Sanitizes user input before it is inserted into AI prompts
 * to prevent prompt injection and token exhaustion attacks.
 */

/**
 * Sanitizes a string for use in an AI prompt.
 *
 * 1. Trims whitespace
 * 2. Normalizes double quotes to single quotes (to avoid JSON breaking if manual JSON is constructed, though we rely on template literals)
 * 3. Replaces newlines with spaces (prevention of delimiter injection)
 * 4. Removes control characters
 * 5. Enforces a maximum length
 */
export const sanitizePromptInput = (input: string, maxLength = 1000): string => {
  if (!input) return ''

  // 1. Trim
  let sanitized = input.trim()

  // 2. Normalize quotes (prevent breaking out of strings if used in JSON/string contexts)
  sanitized = sanitized.replace(/"/g, "'")

  // 3. Replace newlines with spaces to prevent delimiter injection
  sanitized = sanitized.replace(/[\r\n]+/g, ' ')

  // 4. Remove control characters (except tabs, as newlines are handled above)
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Required for sanitization
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 5. Length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }

  return sanitized
}
