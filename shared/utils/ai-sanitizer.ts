/**
 * AI Input Sanitizer
 *
 * Utilities to sanitize user input before sending it to LLMs
 * to prevent prompt injection and token exhaustion.
 */

/**
 * Sanitizes user input for use in AI prompts.
 * - Removes non-printable control characters
 * - Normalizes whitespace (replaces newlines/tabs with single space)
 * - Enforces max length
 *
 * @param input The raw user input
 * @param maxLength Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizePromptInput(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return ''

  // 1. Remove potentially dangerous control characters that aren't whitespace
  // biome-ignore lint/suspicious/noControlCharactersInRegex: removal of non-whitespace control chars
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 2. Normalize whitespace (replace newlines/tabs with single space)
  clean = clean.replace(/\s+/g, ' ')

  // 3. Trim and limit length
  return clean.trim().slice(0, maxLength)
}
