import { describe, it, expect } from 'vitest'
import app from '../../index.js'

describe('UI & Content Negotiation', () => {
  it('GET / should return HTML landing page', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    const html = await res.text()
    expect(html).toContain('HomeGarden API')
    expect(html).toContain('System Operational')
    expect(html).toContain('View Source on GitHub')
  })

  it('GET /unknown with Accept: text/html should return HTML 404', async () => {
    const res = await app.request('/unknown-page', {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toContain('text/html')
    const html = await res.text()
    expect(html).toContain('404 Not Found')
    expect(html).toContain('Return Home')
    expect(html).toContain('/unknown-page')
  })

  it('GET /<script>alert(1)</script> should return escaped HTML', async () => {
    const res = await app.request('/<script>alert(1)</script>', {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(404)
    const html = await res.text()
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })

  it('GET /unknown with Accept: application/json should return JSON 404', async () => {
    const res = await app.request('/unknown-page', {
      headers: { Accept: 'application/json' },
    })
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toContain('application/json')
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toBe('Not Found')
  })

  it('GET /unknown without Accept header should return JSON 404 (default)', async () => {
    const res = await app.request('/unknown-page')
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toContain('application/json')
  })
})
