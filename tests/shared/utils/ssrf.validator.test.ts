import { describe, expect, it, vi } from 'vitest'
import { isSafeUrl } from '../../../shared/utils/ssrf.validator.js'

// Mock node:dns/promises
vi.mock('node:dns/promises', () => ({
  lookup: vi.fn(),
}))

import { lookup } from 'node:dns/promises'

describe('SSRF Validator', () => {
  it('should return false for invalid protocols', async () => {
    expect(await isSafeUrl('ftp://example.com')).toBe(false)
    expect(await isSafeUrl('file:///etc/passwd')).toBe(false)
    expect(await isSafeUrl('gopher://test')).toBe(false)
  })

  it('should return false for malformed URLs', async () => {
    expect(await isSafeUrl('not-a-url')).toBe(false)
  })

  it('should return true for public safe URLs', async () => {
    ;(lookup as any).mockResolvedValue({ address: '93.184.216.34' }) // example.com
    expect(await isSafeUrl('https://example.com')).toBe(true)
  })

  it('should return false for loopback addresses', async () => {
    ;(lookup as any).mockResolvedValue({ address: '127.0.0.1' })
    expect(await isSafeUrl('http://localhost')).toBe(false)
    
    ;(lookup as any).mockResolvedValue({ address: '127.1' })
    expect(await isSafeUrl('http://127.1')).toBe(false)
  })

  it('should return false for private IPv4 ranges', async () => {
    // 10.0.0.0/8
    ;(lookup as any).mockResolvedValue({ address: '10.0.0.1' })
    expect(await isSafeUrl('http://10.0.0.1')).toBe(false)

    // 172.16.0.0/12
    ;(lookup as any).mockResolvedValue({ address: '172.16.0.1' })
    expect(await isSafeUrl('http://172.16.0.1')).toBe(false)

    // 192.168.0.0/16
    ;(lookup as any).mockResolvedValue({ address: '192.168.1.1' })
    expect(await isSafeUrl('http://192.168.1.1')).toBe(false)

    // 169.254.0.0/16 (Link-local)
    ;(lookup as any).mockResolvedValue({ address: '169.254.169.254' })
    expect(await isSafeUrl('http://169.254.169.254')).toBe(false)
  })

  it('should return false for 0.0.0.0', async () => {
    ;(lookup as any).mockResolvedValue({ address: '0.0.0.0' })
    expect(await isSafeUrl('http://0.0.0.0')).toBe(false)
  })

  it('should return false for IPv6 loopback', async () => {
    ;(lookup as any).mockResolvedValue({ address: '::1' })
    expect(await isSafeUrl('http://[::1]')).toBe(false)
  })

  it('should return false if DNS lookup fails', async () => {
    ;(lookup as any).mockRejectedValue(new Error('DNS Error'))
    expect(await isSafeUrl('https://non-existent-domain.test')).toBe(false)
  })

  it('should return false for unparseable IPs', async () => {
    ;(lookup as any).mockResolvedValue({ address: 'not.an.ip' })
    expect(await isSafeUrl('https://example.com')).toBe(false)
  })
})
