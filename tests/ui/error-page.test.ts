import { describe, expect, it } from 'vitest'
import { getErrorPageHtml } from '../../shared/ui/templates.js'

describe('getErrorPageHtml', () => {
  it('should generate error page HTML with status code and message', () => {
    const html = getErrorPageHtml(500, 'Internal Server Error')
    expect(html).toContain('500')
    // The actual title in the template is "Something went wrong" for 500 errors
    // and the message is "We encountered an unexpected error."
    expect(html).toContain('Something went wrong')
    expect(html).toContain('We encountered an unexpected error')
  })

  it('should generate error page for 400 errors', () => {
    const html = getErrorPageHtml(400, 'Bad Request')
    expect(html).toContain('400')
    // For 400 errors, it should show "Error" title and the message provided
    expect(html).toContain('Error')
    expect(html).toContain('Bad Request')
  })

  it('should include trace ID if provided', () => {
    const html = getErrorPageHtml(500, 'Error', 'trace-123')
    expect(html).toContain('trace-123')
  })

  it('should contain Go Back button', () => {
    const html = getErrorPageHtml(404, 'Not Found')
    expect(html).toContain('Go Back')
    expect(html).toContain('history.back()')
  })
})
