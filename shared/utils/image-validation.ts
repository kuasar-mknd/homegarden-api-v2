/**
 * Image Validation Utilities
 *
 * Utilities for validating image data and formats.
 */

/**
 * Validates the file signature (magic bytes) of a base64 encoded image.
 * Supports JPEG, PNG, GIF, and WEBP.
 *
 * @param base64Data The base64 encoded image string (with or without data URI prefix)
 * @returns true if the signature matches a supported image format
 */
export function validateImageSignature(base64Data: string): boolean {
  try {
    // Strip data URI prefix if present
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')

    // Decode first few bytes
    const buffer = Buffer.from(base64, 'base64')

    if (buffer.length < 4) return false

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return true
    }

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return true
    }

    // GIF: 47 49 46 38 (GIF8)
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return true
    }

    // WEBP: RIFF .... WEBP
    // 0-3: RIFF (52 49 46 46)
    // 8-11: WEBP (57 45 42 50)
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true
    }

    return false
  } catch (_error) {
    return false
  }
}
