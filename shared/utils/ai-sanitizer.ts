/**
 * AI Input Sanitizer
 *
 * Sanitizes user input before it is sent to AI models to prevent:
 * 1. Prompt Injection (via control characters or quote manipulation)
 * 2. Token consumption exhaustion (via excessive length)
 */

export function sanitizePromptInput(input: string, maxLength = 1000): string {
  if (!input) return ''

  // 1. Truncate to maximum length
  let sanitized = input.slice(0, maxLength)

  // 2. Remove control characters (except newline \n, tab \t, carriage return \r)
  // \x00-\x08: Null to Backspace
  // \x0B-\x0C: Vertical Tab to Form Feed
  // \x0E-\x1F: Shift Out to Unit Separator
  // \x7F: Delete
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Explicitly removing control chars
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 3. Normalize quotes to single quotes
  // This helps prevent "breaking out" of JSON or delimited contexts in prompts
  sanitized = sanitized.replace(/"/g, "'")

  return sanitized.trim()
}
