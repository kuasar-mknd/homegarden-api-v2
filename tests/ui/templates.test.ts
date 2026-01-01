import { describe, expect, it } from 'vitest'
import {
  baseLayout,
  getErrorPageHtml,
  getLandingPageHtml,
  getNotFoundPageHtml,
  SHARED_STYLES,
} from '../../shared/ui/templates.js'

describe('UI Templates', () => {
  describe('SHARED_STYLES', () => {
    it('should include correct CSS variables', () => {
      expect(SHARED_STYLES).toContain('--primary:')
      expect(SHARED_STYLES).toContain('--secondary:')
      expect(SHARED_STYLES).toContain('--error:')
      expect(SHARED_STYLES).toContain('--focus-ring:')
    })

    it('should include dark mode media query', () => {
      expect(SHARED_STYLES).toContain('@media (prefers-color-scheme: dark)')
    })

    it('should include selection style', () => {
      expect(SHARED_STYLES).toContain('::selection')
      expect(SHARED_STYLES).toContain('background: var(--primary)')
    })

    it('should use focus-ring variable for consistency', () => {
      expect(SHARED_STYLES).toContain('outline: var(--focus-ring)')
    })

    it('should include text wrapping improvements', () => {
      expect(SHARED_STYLES).toContain('text-wrap: balance')
      expect(SHARED_STYLES).toContain('text-wrap: pretty')
    })

    it('should include new utility classes', () => {
      expect(SHARED_STYLES).toContain('.badge-error')
      expect(SHARED_STYLES).toContain('.code-block')
      expect(SHARED_STYLES).toContain('.footer-links')
      expect(SHARED_STYLES).toContain('.btn-icon')
    })

    it('should include correct dark mode error badge color', () => {
      expect(SHARED_STYLES).toContain('color: #ffcdd2')
    })

    it('should use flexbox for buttons', () => {
      expect(SHARED_STYLES).toContain('display: inline-flex')
      expect(SHARED_STYLES).toContain('align-items: center')
      expect(SHARED_STYLES).toContain('gap: 0.5rem')
    })

    it('should include print styles for expanding URLs', () => {
      expect(SHARED_STYLES).toContain('a[href^="http"]:after { content: " (" attr(href) ")"; }')
    })

    it('should disable scroll behavior in reduced motion', () => {
      expect(SHARED_STYLES).toContain('scroll-behavior: auto !important')
    })

    it('should have user-select: none for badges', () => {
      expect(SHARED_STYLES).toContain('user-select: none')
    })
  })

  describe('baseLayout', () => {
    it('should include dir="ltr"', () => {
      const html = baseLayout({ title: 'Test', content: '' })
      expect(html).toContain('dir="ltr"')
    })

    it('should include format-detection meta tag', () => {
      const html = baseLayout({ title: 'Test', content: '' })
      expect(html).toContain('<meta name="format-detection" content="telephone=no">')
    })

    it('should display environment in footer', () => {
      const html = baseLayout({ title: 'Test', content: '', environment: 'staging' })
      expect(html).toContain('System Operational • staging')
    })
  })

  describe('getLandingPageHtml', () => {
    it('should return valid HTML string', () => {
      const html = getLandingPageHtml()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en" dir="ltr">')
      expect(html).toContain('HomeGarden API')
    })

    it('should include accessibility attributes', () => {
      const html = getLandingPageHtml()
      expect(html).toContain('role="list"')
      expect(html).toContain('role="contentinfo"')
      expect(html).toContain('role="status"')
      expect(html).toContain('aria-label="Status: Operational"')
    })

    it('should include dark mode theme-color meta tag', () => {
      const html = getLandingPageHtml()
      expect(html).toContain(
        '<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">',
      )
    })

    it('should use footer-links class', () => {
      const html = getLandingPageHtml()
      expect(html).toContain('<div class="footer-links">')
    })
  })

  describe('getNotFoundPageHtml', () => {
    it('should escape unsafe input', () => {
      const unsafe = '<script>alert(1)</script>'
      const html = getNotFoundPageHtml(unsafe)
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
      expect(html).not.toContain('<script>')
    })

    it('should use .badge-error class', () => {
      const html = getNotFoundPageHtml('/foo')
      expect(html).toContain('class="badge badge-error"')
      expect(html).not.toContain('style="background: #ffebee; color: #c62828;"')
    })

    it('should use .code-block class', () => {
      const html = getNotFoundPageHtml('/foo')
      expect(html).toContain('class="code-block"')
      expect(html).not.toContain('style="display: block;')
    })

    it('should include icons in buttons', () => {
      const html = getNotFoundPageHtml('/foo')
      expect(html).toContain('<svg class="btn-icon"')
    })
  })

  describe('getErrorPageHtml', () => {
    it('should return valid HTML string', () => {
      const error = new Error('Test error')
      const html = getErrorPageHtml(error, false)
      expect(html).toContain('500 Internal Server Error')
      expect(html).toContain('Error - HomeGarden API')
    })

    it('should include request ID if provided', () => {
      const error = new Error('Test error')
      const html = getErrorPageHtml(error, false, 'req-123')
      expect(html).toContain('Request ID: <code>req-123</code>')
    })

    it('should use generic message in non-dev environment', () => {
      const error = new Error('<script>alert(1)</script>')
      const html = getErrorPageHtml(error, false)
      expect(html).toContain('An unexpected error occurred')
      expect(html).not.toContain('<script>')
    })

    it('should show error details in dev environment', () => {
      const error = new Error('<script>alert(1)</script>')
      const html = getErrorPageHtml(error, true)
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    })
  })
})
