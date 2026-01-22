import { describe, expect, it } from 'vitest'
import {
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
    })

    it('should include dark mode media query', () => {
      expect(SHARED_STYLES).toContain('@media (prefers-color-scheme: dark)')
    })

    it('should include selection style', () => {
      expect(SHARED_STYLES).toContain('::selection')
      expect(SHARED_STYLES).toContain('background: var(--primary)')
    })

    it('should include focus-visible style with primary color', () => {
      expect(SHARED_STYLES).toContain(
        'outline: var(--focus-ring-width) solid var(--focus-ring-color)',
      )
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
      expect(html).toContain('dir="ltr"')
      expect(html).toContain('role="banner"')
      expect(html).toContain('tabindex="-1"')
    })

    it('should include visual affordances', () => {
      const html = getLandingPageHtml()
      expect(html).toContain('class="card-arrow"')
      expect(html).toContain('aria-hidden="true">→</span>')
    })

    it('should include dark mode theme-color meta tag', () => {
      const html = getLandingPageHtml()
      expect(html).toContain(
        '<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">',
      )
    })

    it('should use footer-links class', () => {
      const html = getLandingPageHtml()
      expect(html).toContain('<div class="footer-links no-print">')
    })
  })

  describe('getNotFoundPageHtml', () => {
    it('should escape unsafe input', () => {
      const unsafe = '<script>alert(1)</script>'
      const html = getNotFoundPageHtml(unsafe)
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
      // We check that the unsafe input is NOT present as raw HTML
      expect(html).not.toContain(unsafe)
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

    it('should use clear 404 title', () => {
      const html = getNotFoundPageHtml('/foo')
      expect(html).toContain('<title>404: Page Not Found')
    })

    it('should include client-side logic to hide back button if no history', () => {
      const html = getNotFoundPageHtml('/foo')
      expect(html).toContain('if (window.history.length > 1)')
      expect(html).toContain("backBtn.style.display = 'none'")
    })

    it('should include accessibility updates for copy button', () => {
      const html = getNotFoundPageHtml('/foo')
      expect(html).toContain("btn.setAttribute('aria-label', 'Copied successfully')")
      expect(html).toContain("if (originalLabel) btn.setAttribute('aria-label', originalLabel)")
    })
  })
})
