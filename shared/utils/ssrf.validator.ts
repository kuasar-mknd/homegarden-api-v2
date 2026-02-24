import { lookup } from 'node:dns/promises'
import { URL } from 'node:url'

/**
 * SSRF Validator
 *
 * Validates URLs to prevent Server-Side Request Forgery.
 * Checks for:
 * 1. Valid protocol (HTTP/HTTPS)
 * 2. Hostname resolution
 * 3. Private/Reserved IP addresses (IPv4 and IPv6)
 */

// Private IPv4 ranges
const PRIVATE_IPV4_RANGES = [
  { start: 0x0a000000, end: 0x0affffff }, // 10.0.0.0/8
  { start: 0xac100000, end: 0xac1fffff }, // 172.16.0.0/12
  { start: 0xc0a80000, end: 0xc0a8ffff }, // 192.168.0.0/16
  { start: 0x7f000000, end: 0x7fffffff }, // 127.0.0.0/8
  { start: 0xa9fe0000, end: 0xa9feffff }, // 169.254.0.0/16
]

function ipV4ToNumber(ip: string): number | null {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null
  const [p0, p1, p2, p3] = parts as [number, number, number, number]
  // Use unsigned right shift to handle potential negative numbers from bitwise ops
  return ((p0 << 24) | (p1 << 16) | (p2 << 8) | p3) >>> 0
}

function isPrivateIPv4(ipNum: number): boolean {
  if (ipNum === 0) return true // 0.0.0.0
  for (const range of PRIVATE_IPV4_RANGES) {
    if (ipNum >= range.start && ipNum <= range.end) {
      return true
    }
  }
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase()
  // Loopback
  if (normalized === '::1') return true
  // Unspecified
  if (normalized === '::') return true
  // Link-local (fe80::/10) -> fe80 to febf
  if (/^fe[89ab]/i.test(normalized)) return true
  // Unique Local Address (fc00::/7) -> fc00 to fdff
  if (/^f[cd]/i.test(normalized)) return true
  // IPv4-mapped IPv6
  if (normalized.startsWith('::ffff:')) {
    const parts = normalized.split(':')
    const ipv4 = parts[parts.length - 1]
    if (ipv4) {
      const ipNum = ipV4ToNumber(ipv4)
      if (ipNum !== null) return isPrivateIPv4(ipNum)
    }
  }
  return false
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
    // Check all addresses (IPv4 and IPv6) to prevent dual-stack bypass
    const addresses = await lookup(url.hostname, { all: true })

    if (addresses.length === 0) return false

    for (const { address, family } of addresses) {
      if (family === 4) {
        const ipNum = ipV4ToNumber(address)
        if (ipNum === null || isPrivateIPv4(ipNum)) return false
      } else if (family === 6) {
        if (isPrivateIPv6(address)) return false
      } else {
        // Block unknown address families for safety
        return false
      }
    }

    return true
  } catch (_error) {
    // URL parse error or DNS resolution error
    return false
  }
}
