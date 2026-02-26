import { describe, expect, it } from 'vitest'
import app from '../../index.js'

describe('Security Headers - CSP', () => {
  it('should include Content-Security-Policy header with a nonce', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)

    const csp = res.headers.get('Content-Security-Policy')
    expect(csp).toBeDefined()

    // Check for nonce pattern
    // e.g., script-src 'self' 'nonce-...'
    expect(csp).toMatch(/script-src [^;]*'nonce-[\w+/=]+'/)

    // Should NOT contain unsafe-inline for scripts
    expect(csp).not.toMatch(/script-src [^;]*'unsafe-inline'/)
  })

  it('should use a different nonce for each request', async () => {
    const res1 = await app.request('/')
    const csp1 = res1.headers.get('Content-Security-Policy')
    const nonce1Match = csp1?.match(/'nonce-([\w+/=]+)'/)
    const nonce1 = nonce1Match ? nonce1Match[1] : null

    const res2 = await app.request('/')
    const csp2 = res2.headers.get('Content-Security-Policy')
    const nonce2Match = csp2?.match(/'nonce-([\w+/=]+)'/)
    const nonce2 = nonce2Match ? nonce2Match[1] : null

    expect(nonce1).toBeDefined()
    expect(nonce2).toBeDefined()
    expect(nonce1).not.toBe(nonce2)
  })
})
