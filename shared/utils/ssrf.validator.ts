import { lookup } from 'node:dns/promises'
import { URL } from 'node:url'

/**
 * SSRF Validator
 *
 * Validates URLs to prevent Server-Side Request Forgery.
 * Checks for:
 * 1. Valid protocol (HTTP/HTTPS)
 * 2. Hostname resolution
 * 3. Private/Reserved IP addresses
 */

// Private IPv4 ranges
// 10.0.0.0/8
// 172.16.0.0/12
// 192.168.0.0/16
// 127.0.0.0/8 (Loopback)
// 169.254.0.0/16 (Link-local)
const PRIVATE_IPV4_RANGES = [
  { start: 0x0a000000, end: 0x0affffff }, // 10.0.0.0/8
  { start: 0xac100000, end: 0xac1fffff }, // 172.16.0.0/12
  { start: 0xc0a80000, end: 0xc0a8ffff }, // 192.168.0.0/16
  { start: 0x7f000000, end: 0x7fffffff }, // 127.0.0.0/8
  { start: 0xa9fe0000, end: 0xa9feffff }, // 169.254.0.0/16
]

// Helper to convert IPv4 string to number
function ipV4ToNumber(ip: string): number | null {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return null
  const [p0, p1, p2, p3] = parts
  if (p0 === undefined || p1 === undefined || p2 === undefined || p3 === undefined) return null
  return (p0 << 24) | (p1 << 16) | (p2 << 8) | p3
}

/**
 * Checks if a URL is safe to fetch (not pointing to internal network)
 */
export async function isSafeUrl(urlString: string): Promise<boolean> {
  try {
    const url = new URL(urlString)

    // 1. Check Protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }

    // 2. Resolve Hostname
    // node:dns lookup uses the OS resolver (getaddrinfo)
    const result = await lookup(url.hostname, { family: 4 })
    const ip = result.address

    // 3. Check for Private IP
    const ipNum = ipV4ToNumber(ip)

    // If we can't parse the IP, it's unsafe (or IPv6 which we'll block for now to be safe,
    // or we could implement IPv6 checks)
    if (ipNum === null) {
      // If it's an IPv6 address, we treat it as unsafe for now unless we implement full IPv6 range checks
      // Simple check for localhost in IPv6
      if (ip === '::1') return false
      return false
    }

    // Check strict equality for 0.0.0.0 (often resolves to localhost)
    if (ipNum === 0) return false

    // Check ranges
    // We use unsigned right shift to handle potential negative numbers from bitwise ops
    const unsignedIp = ipNum >>> 0

    for (const range of PRIVATE_IPV4_RANGES) {
      if (unsignedIp >= range.start && unsignedIp <= range.end) {
        return false
      }
    }

    return true
  } catch (_error) {
    // URL parse error or DNS resolution error
    return false
  }
}
