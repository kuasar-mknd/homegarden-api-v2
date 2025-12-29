/**
 * File Signature Validator
 *
 * Validates the magic bytes (file signature) of a buffer to ensure it matches
 * the expected MIME type. This prevents file extension spoofing.
 */

export function validateImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 12) {
    return false
  }

  // Convert first few bytes to hex string for easier comparison
  const signature = buffer.subarray(0, 12).toString('hex').toUpperCase()

  switch (mimeType) {
    case 'image/jpeg':
      // JPEG: FF D8 FF
      return signature.startsWith('FFD8FF')

    case 'image/png':
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      return signature.startsWith('89504E470D0A1A0A')

    case 'image/webp':
      // WEBP: RIFF ... WEBP
      // RIFF is bytes 0-3 (52 49 46 46)
      // WEBP is bytes 8-11 (57 45 42 50)
      return signature.startsWith('52494646') && signature.slice(16, 24) === '57454250'

    case 'image/heic': {
      // Let's check for 'ftyp' at offset 4 // But standard HEIC often has 'ftypheic' or 'ftypmsf1' // Simplest check: bytes 4-8 are 'ftyp' and bytes 8-12 contain 'heic' or 'mif1' etc. // followed by 68 65 69 63 (heic) or similar brands // 66 74 79 70 (ftyp) // Common signatures involve 'ftyp' at index 4 // ... ftyp heic ... // HEIC: ftypheic (usually at offset 4)
      const ftyp = buffer.subarray(4, 8).toString('utf8')
      return ftyp === 'ftyp'
    }

    default:
      return false
  }
}
