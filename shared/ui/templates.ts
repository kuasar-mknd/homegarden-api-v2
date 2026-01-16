import { env } from '../../infrastructure/config/env.js'

export const SHARED_STYLES = `
  :root {
    --primary: #2e7d32;
    --secondary: #4caf50;
    --bg: #f5f9f5;
    --text: #1b1b1b;
    --card-bg: #ffffff;
    --card-border: #eee;
    --card-text: #666;
    --status-text: #5e5e5e; /* darkened from #888 for accessible contrast */
    --error: #d32f2f;

    /* Radius System */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    /* Shadow System */
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-md: 0 4px 8px rgba(0,0,0,0.15);

    /* Animation System */
    --transition-speed: 0.2s;

    /* Focus System */
    --focus-ring-color: var(--primary);
    --focus-ring-width: 2px;
    --focus-offset: 2px;

    /* Text on Primary Background */
    --on-primary: #ffffff;

    accent-color: var(--primary);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --primary: #81c784;
      --secondary: #66bb6a;
      --bg: #121212;
      --text: #e0e0e0;
      --card-bg: #1e1e1e;
      --card-border: #333;
      --card-text: #b0b0b0;
      --status-text: #aaa;
      --error: #ef5350;

      --on-primary: #121212;
    }
  }
  @media (prefers-contrast: more) {
    :root {
      --primary: #1b5e20;
      --secondary: #1b5e20;
      --text: #000000;
      --card-border: #000000;
      --status-text: #000000;
      --error: #b71c1c;
    }
    .card, .btn {
      border: 2px solid currentColor;
      box-shadow: none;
    }
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  ::selection {
    background: var(--primary);
    color: var(--on-primary);
  }
  h1, h2, h3 {
    text-wrap: balance;
  }
  p {
    text-wrap: pretty;
  }
  html {
    scroll-padding-top: 2rem;
    scrollbar-color: var(--card-border) var(--bg);
    scrollbar-gutter: stable;
  }
  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg);
    background-image: radial-gradient(circle at 50% 0, rgba(76, 175, 80, 0.1), transparent 70%);
    color: var(--text);
    line-height: 1.6;
    margin: 0;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* List Polish */
  ul, ol {
    padding-inline-start: 1.5rem;
  }
  ul ::marker, ol ::marker {
    color: var(--secondary);
  }

  /* Scrollbar for Webkit */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: var(--radius-sm);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--secondary);
  }
  .skip-link {
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: var(--on-primary);
    padding: 0.5rem 1rem;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    z-index: 100;
    transition: top var(--transition-speed);
    text-decoration: none;
    font-weight: 600;
  }
  .skip-link:focus {
    top: 0;
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-offset);
  }
  .container {
    background: var(--card-bg);
    padding: 3rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--card-border);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    max-width: 65ch;
    width: 90%;
    text-align: center;
  }
  header h1 {
    color: var(--primary);
    margin-block-end: 0.5rem;
    text-wrap: balance;
  }
  .badge {
    display: inline-block;
    background: #e8f5e9;
    color: #2e7d32;
    padding: 4px 12px;
    border-radius: var(--radius-lg);
    font-size: 0.85rem;
    font-weight: 600;
    margin-block-end: 2rem;
    cursor: default;
    user-select: text; /* Allow selecting version info */
  }
  .badge-error {
    background: #ffebee;
    color: #c62828;
  }
  @media (prefers-color-scheme: dark) {
    .badge {
      background: #1b5e20;
      color: #e8f5e9;
    }
    .badge-error {
      background: #3e2723;
      color: #ffcdd2;
    }
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-block: 2rem;
    list-style: none;
    padding: 0;
  }
  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
    header h1 {
      font-size: 1.75rem;
    }
  }
  .card {
    border: 1px solid var(--card-border);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    transition: transform var(--transition-speed), box-shadow var(--transition-speed);
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
    box-sizing: border-box;
    position: relative; /* Ensure z-index works on focus */
  }
  .card:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: var(--secondary);
  }
  .card:active {
    transform: scale(0.98);
  }
  .card:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-offset);
    border-color: var(--secondary);
    z-index: 1;
  }
  .card h2 {
    margin: 0;
    margin-block-end: 0.5rem;
    color: var(--primary);
    font-size: 1.25rem;
    transition: color var(--transition-speed);
    text-wrap: balance;
  }
  .card:hover h2 { color: var(--secondary); }
  .card p { margin: 0; font-size: 0.9rem; color: var(--card-text); }

  .card-arrow {
    display: inline-block;
    opacity: 0;
    transform: translateX(-4px);
    transition: all var(--transition-speed) ease-out;
    margin-inline-start: 0.5rem;
    color: var(--secondary);
  }
  .card:hover .card-arrow, .card:focus-visible .card-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--primary);
    color: var(--on-primary);
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    border: 1px solid transparent; /* For High Contrast Mode */
    text-decoration: none;
    font-weight: 600;
    margin-block-start: 1rem;
    transition: background var(--transition-speed), transform 0.1s, box-shadow var(--transition-speed), filter var(--transition-speed);
    box-shadow: var(--shadow-sm);
    min-height: 44px; /* Touch target size */
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
  }
  .btn:hover {
    background: var(--secondary);
    box-shadow: var(--shadow-md);
  }
  .btn:active {
    transform: scale(0.98);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    filter: brightness(0.9);
  }
  .btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-offset);
  }
  .btn-icon {
    width: 1.25em;
    height: 1.25em;
  }
  .btn-secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--status-text);
    box-shadow: none;
  }
  .btn-secondary:hover {
    background: var(--card-border);
    color: var(--text);
    border-color: var(--card-border);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .btn-secondary:active {
    box-shadow: none;
  }
  .btn-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  .btn-group .btn {
    margin-top: 0;
    margin-block-start: 0;
  }

  .external-icon {
    display: inline-block;
    vertical-align: middle;
    margin-inline-start: 4px;
    margin-block-end: 2px;
    width: 0.9em;
    height: 0.9em;
    transition: transform var(--transition-speed) cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  a:hover .external-icon {
    transform: translate(2px, -2px);
  }

  /* Support for commonly used documentation elements */
  kbd {
    background-color: var(--card-border);
    border-radius: var(--radius-sm);
    border: 1px solid var(--card-border);
    border-bottom: 2px solid var(--status-text);
    padding: 2px 4px;
    font-size: 0.85em;
    font-family: monospace;
    color: var(--text);
  }
  blockquote {
    border-inline-start: 4px solid var(--primary);
    background: rgba(127, 127, 127, 0.1);
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    color: var(--card-text);
    font-style: italic;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  footer.status {
    margin-block-start: 2rem;
    padding-block-start: 2rem;
    border-top: 1px solid var(--card-border);
    font-size: 0.85rem;
    color: var(--status-text);
  }
  footer a {
    color: var(--primary);
    text-decoration: none;
    text-underline-offset: 4px;
    text-decoration-skip-ink: auto;
    transition: color var(--transition-speed), text-decoration-color var(--transition-speed), opacity var(--transition-speed), transform 0.1s;
    padding: 0.5rem; /* Increase touch target */
    margin: -0.5rem;
    border-radius: var(--radius-sm);
    display: inline-block;
  }
  footer a:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    color: var(--secondary);
  }
  footer a:active {
    opacity: 0.7;
    transform: scale(0.98);
  }
  footer a:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-offset);
    background: rgba(0,0,0,0.05);
  }
  .copyright {
    margin-block: 0.5rem;
    opacity: 0.9;
  }
  .footer-links {
    margin-top: 0.5rem;
    opacity: 0.8;
  }
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: var(--secondary);
    border-radius: 50%;
    margin-inline-end: 6px;
    animation: pulse 2s infinite ease-in-out;
  }
  .error-code {
    font-size: 4rem;
    font-weight: 800;
    color: var(--secondary);
    margin: 0;
    line-height: 1;
  }
  .error-message {
    font-size: 1.2rem;
    color: var(--card-text);
    margin-block-end: 2rem;
  }
  .code-wrapper {
    position: relative;
    margin: 1rem 0;
  }
  .code-block {
    display: block;
    background: #f5f5f5;
    padding: 1rem;
    border-radius: var(--radius-sm);
    word-break: break-all;
    overflow-x: auto;
    user-select: all;
    border: 1px solid var(--card-border);
    line-height: 1.5;
    font-family: monospace;
    font-size: 0.9em;
  }
  .code-block:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-offset);
  }
  .copy-btn-wrapper {
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
  }
  @media (prefers-color-scheme: dark) {
    .code-block {
      background: #2d2d2d;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .card, .skip-link, .btn, .card h2, footer a, .card-arrow {
      transition: none;
    }
    .card:hover {
      transform: none;
    }
    .card-arrow {
      opacity: 1;
      transform: none;
    }
    .status-dot {
      animation: none;
    }
  }
  @media print {
    body { background: white; color: black; display: block; }
    .container { box-shadow: none; border: none; max-width: 100%; width: 100%; padding: 0; }
    .skip-link, .status-dot, .external-icon, .no-print { display: none !important; }
    .grid { display: block; }
    .card { border: 1px solid #000; margin-bottom: 1rem; break-inside: avoid; page-break-inside: avoid; box-shadow: none; }
    a { text-decoration: underline; color: black; }
    a[href^="http"]:after { content: " (" attr(href) ")"; }
    header h1 { color: black; }
    .badge { border: 1px solid #ccc; background: none; color: black; }
  }
`

const EXTERNAL_LINK_ICON = `<svg class="external-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`
const HOME_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
const DOC_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
const BACK_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>`
const COPY_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
const CHECK_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`

interface LayoutProps {
  title: string
  description?: string
  content: string
}

// Simple HTML escape function to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function baseLayout({ title, description, content }: LayoutProps): string {
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(
    description ||
      'Smart Plant Management API with AI capabilities. Identify plants, diagnose diseases, and track your garden.',
  )

  const metaDescription = safeDescription
  const image = 'https://placehold.co/600x400/2e7d32/ffffff?text=HomeGarden+API'
  const icon =
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>'
  const year = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="format-detection" content="telephone=no">
  <meta name="description" content="${metaDescription}">
  <meta name="theme-color" content="#2e7d32" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">
  <meta name="apple-mobile-web-app-title" content="HomeGarden">

  <meta property="og:site_name" content="HomeGarden API">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="HomeGarden API Banner with green branding">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${image}">

  <link rel="canonical" href="/">
  <title>${safeTitle}</title>
  <link rel="icon" href="${icon}">
  <link rel="apple-touch-icon" href="${icon}">
  <link rel="preconnect" href="https://placehold.co">
  <style>
    ${SHARED_STYLES}
  </style>
</head>
<body>
  <a href="#main" class="skip-link" title="Jump to the main content area">Skip to main content</a>
  <div class="container">
    ${content}
    <footer class="status" role="contentinfo">
      <div role="status">
        <span class="status-dot" aria-hidden="true" title="System Operational"></span> System Operational • ${env.NODE_ENV}
      </div>
      <div class="copyright">
        &copy; ${year} HomeGarden API. All rights reserved.
      </div>
      <div class="footer-links no-print">
        <a href="https://github.com/homegarden/api" target="_blank" rel="noopener noreferrer" aria-label="View Source on GitHub (opens in a new tab)">View Source on GitHub${EXTERNAL_LINK_ICON}</a>
      </div>
    </footer>
  </div>
</body>
</html>
  `
}

// Memoize the landing page HTML to avoid string concatenation on every request
// Optimization: "Static Response Caching"
const LANDING_PAGE_HTML = baseLayout({
  title: 'HomeGarden API v2',
  content: `
    <header role="banner">
      <h1>🌱 HomeGarden API</h1>
      <div class="badge">v2.0.0 • AI-Powered</div>
    </header>

    <main id="main" tabindex="-1">
      <p>Welcome to the HomeGarden API. Connect your applications to smart plant management services.</p>

      <ul class="grid" role="list">
        <li>
          <a href="/ui" class="card" aria-describedby="desc-ui">
            <h2>📚 Documentation<span class="card-arrow" aria-hidden="true">→</span></h2>
            <p id="desc-ui">Interactive Swagger UI for API exploration.</p>
          </a>
        </li>
        <li>
          <a href="/doc" class="card" aria-describedby="desc-doc">
            <h2>🔍 OpenAPI Spec<span class="card-arrow" aria-hidden="true">→</span></h2>
            <p id="desc-doc">Raw JSON specification for integration.</p>
          </a>
        </li>
        <li>
          <a href="/ui#/PlantID" class="card" aria-describedby="desc-plantid">
            <h2>🌿 Plant ID<span class="card-arrow" aria-hidden="true">→</span></h2>
            <p id="desc-plantid">Identify species using AI vision (Docs).</p>
          </a>
        </li>
        <li>
          <a href="/ui#/DrPlant" class="card" aria-describedby="desc-drplant">
            <h2>🩺 Dr. Plant<span class="card-arrow" aria-hidden="true">→</span></h2>
            <p id="desc-drplant">Diagnose diseases and pests (Docs).</p>
          </a>
        </li>
      </ul>
    </main>
    `,
})

export function getLandingPageHtml(): string {
  return LANDING_PAGE_HTML
}

export function getNotFoundPageHtml(path: string): string {
  const safePath = escapeHtml(path)
  return baseLayout({
    title: '404: Page Not Found - HomeGarden API',
    description: 'The requested page could not be found.',
    content: `
    <header role="banner">
      <h1>🌱 404 Not Found</h1>
      <div class="badge badge-error" role="status">Error</div>
    </header>

    <main id="main" tabindex="-1">
      <p>Oops! The page you are looking for does not exist.</p>

      <div class="code-wrapper">
        <code id="error-path" aria-label="Requested URL" class="code-block" title="Requested URL" tabindex="0">${safePath}</code>
        <div class="copy-btn-wrapper no-print">
            <button type="button" class="btn btn-secondary copy-btn" data-clipboard-target="#error-path" aria-label="Copy URL to clipboard">
            ${COPY_ICON} Copy Path
            </button>
        </div>
      </div>

      <p>Please check the URL or go back to the homepage.</p>

      <div class="btn-group no-print">
        <button type="button" id="go-back-btn" class="btn btn-secondary">${BACK_ICON}Go Back</button>
        <a href="/" class="btn">${HOME_ICON}Return Home</a>
        <a href="/ui" class="btn btn-secondary">${DOC_ICON}Read Documentation</a>
      </div>
    </main>
    <script>
      (function() {
        // Handle Go Back
        var backBtn = document.getElementById('go-back-btn');
        if (backBtn) {
          if (window.history.length > 1) {
            backBtn.addEventListener('click', function() {
              history.back();
            });
          } else {
            backBtn.style.display = 'none';
          }
        }

        // Handle Copy
        var btns = document.querySelectorAll('.copy-btn');
        Array.prototype.forEach.call(btns, function(btn) {
          btn.addEventListener('click', function() {
            if (btn.getAttribute('data-copying')) return;
            var targetSelector = btn.getAttribute('data-clipboard-target');
            var target = document.querySelector(targetSelector);
            if (target) {
              var text = target.innerText;
              btn.setAttribute('data-copying', 'true');
              // Modern API
              if (navigator.clipboard && navigator.clipboard.writeText) {
                 navigator.clipboard.writeText(text).then(function() {
                    var originalHtml = btn.innerHTML;
                    var originalLabel = btn.getAttribute('aria-label');
                    btn.innerHTML = '${CHECK_ICON} Copied!';
                    btn.setAttribute('aria-label', 'Copied successfully');
                    setTimeout(function() {
                        btn.innerHTML = originalHtml;
                        if (originalLabel) {
                            btn.setAttribute('aria-label', originalLabel);
                        } else {
                            btn.removeAttribute('aria-label');
                        }
                        btn.removeAttribute('data-copying');
                    }, 2000);
                 }).catch(function(err) {
                    console.error('Failed to copy', err);
                    btn.removeAttribute('data-copying');
                 });
              } else {
                 // Fallback
                 console.warn('Clipboard API not available');
                 btn.removeAttribute('data-copying');
              }
            }
          });
        });
      })();
    </script>
    `,
  })
}
