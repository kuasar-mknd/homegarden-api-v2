/**
 * AI Input Sanitizer
 *
 * Sanitizes user input before injecting it into AI prompts to prevent
 * prompt injection attacks and token exhaustion.
 */

export function sanitizePromptInput(input: string): string {
  if (!input) return ''
  // 1. Trim whitespace
  let sanitized = input.trim()

  // 2. Remove potential prompt injection delimiters
  // Users might try to close the prompt string with quotes or newlines
  // We replace quotes with single quotes and newlines with spaces to prevent
  // the user from breaking out of the quote context in the prompt template.
  sanitized = sanitized.replace(/"/g, "'").replace(/(\r\n|\n|\r)/g, ' ')

  // 3. Limit length to prevent token exhaustion
  // 1000 characters is generous for a symptom description but prevents huge payloads
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000)
  }

  // Note: We avoid keyword blocking (e.g. "ignore previous instructions")
  // as it leads to false positives and is easily bypassed.
  // Structural sanitization above (preventing delimiter breakout) is more robust.

  return sanitized
}
