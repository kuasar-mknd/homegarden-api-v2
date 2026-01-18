/**
 * AI Input Sanitizer
 *
 * Sanitizes user input before sending it to LLMs to prevent
 * Prompt Injection and other attacks.
 */

/**
 * Sanitizes a string for inclusion in an AI prompt.
 *
 * - Trims whitespace
 * - Limits length
 * - Removes null bytes
 * - Normalizes quotes (replaces double quotes with single quotes)
 *
 * @param input The raw user input
 * @param maxLength Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizePromptInput(input: string | undefined | null, maxLength = 1000): string {
  if (!input) return ''

  let sanitized = input.trim()

  // Limit length to prevent token exhaustion
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }

  // Remove null bytes and control characters (except newline \n and tab \t)
  // Range: \x00-\x08, \x0B-\x1F, \x7F
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Explicitly removing control characters for security
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '')

  // Normalize quotes: Replace double quotes with single quotes to prevent
  // breaking out of double-quoted strings in prompts.
  sanitized = sanitized.replace(/"/g, "'")

  // Optional: Escape backticks if you use them for delimiters
  sanitized = sanitized.replace(/`/g, "'")

  return sanitized
}
