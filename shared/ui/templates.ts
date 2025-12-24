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
    --status-text: #888;
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
    }
  }
  ::selection {
    background: var(--primary);
    color: white;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg);
    background-image: radial-gradient(circle at 50% 0, rgba(76, 175, 80, 0.1), transparent 70%);
    color: var(--text);
    line-height: 1.6;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: 4px;
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
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 0 0 8px 8px;
    z-index: 100;
    transition: top 0.3s;
    text-decoration: none;
    font-weight: 600;
  }
  .skip-link:focus {
    top: 0;
    outline: 2px solid var(--secondary);
  }
  .container {
    background: var(--card-bg);
    padding: 3rem;
    border-radius: 16px;
    border: 1px solid var(--card-border);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    max-width: 600px;
    width: 90%;
    text-align: center;
  }
  header h1 { color: var(--primary); margin-bottom: 0.5rem; }
  .badge {
    display: inline-block;
    background: #e8f5e9;
    color: #2e7d32;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }
  @media (prefers-color-scheme: dark) {
    .badge {
      background: #1b5e20;
      color: #e8f5e9;
    }
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin: 2rem 0;
    list-style: none;
    padding: 0;
  }
  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  .card {
    border: 1px solid var(--card-border);
    padding: 1.5rem;
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
    box-sizing: border-box;
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
    outline: 2px solid var(--secondary);
    outline-offset: 4px;
    border-color: var(--secondary);
  }
  .card h2 { margin: 0 0 0.5rem 0; color: var(--primary); font-size: 1.3rem; }
  .card p { margin: 0; font-size: 0.9rem; color: var(--card-text); }

  .btn {
    display: inline-block;
    background: var(--primary);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 1rem;
    transition: background 0.2s;
  }
  .btn:hover {
    background: var(--secondary);
  }
  .btn:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
  }
  .btn-secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--card-border);
  }
  .btn-secondary:hover {
    background: var(--card-border);
    color: var(--text);
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
  }

  .external-icon {
    display: inline-block;
    vertical-align: middle;
    margin-left: 4px;
    margin-bottom: 2px;
    width: 0.9em;
    height: 0.9em;
  }

  footer.status {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--card-border);
    font-size: 0.85rem;
    color: var(--status-text);
  }
  footer a {
    color: var(--primary);
    text-decoration: none;
  }
  footer a:hover {
    text-decoration: underline;
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
    margin-right: 6px;
    animation: pulse 2s infinite ease-in-out;
  }
  @media (prefers-reduced-motion: reduce) {
    .card, .skip-link, .btn {
      transition: none;
    }
    .card:hover {
      transform: none;
    }
    .status-dot {
      animation: none;
    }
  }
  @media print {
    body { background: white; color: black; display: block; }
    .container { box-shadow: none; border: none; max-width: 100%; width: 100%; padding: 0; }
    .skip-link, .status-dot, .external-icon { display: none; }
    .grid { display: block; }
    .card { border: 1px solid #000; margin-bottom: 1rem; page-break-inside: avoid; box-shadow: none; }
    a { text-decoration: underline; color: black; }
    header h1 { color: black; }
    .badge { border: 1px solid #ccc; background: none; color: black; }
  }
`

const EXTERNAL_LINK_ICON = `<svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`

interface LayoutProps {
  title: string
  description?: string
  content: string
}

export function baseLayout({ title, description, content }: LayoutProps): string {
  const metaDescription =
    description ||
    'Smart Plant Management API with AI capabilities. Identify plants, diagnose diseases, and track your garden.'
  const image = 'https://placehold.co/600x400/2e7d32/ffffff?text=HomeGarden+API'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${metaDescription}">
  <meta name="theme-color" content="#2e7d32">

  <meta property="og:site_name" content="HomeGarden API">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${image}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${image}">

  <link rel="canonical" href="/">
  <title>${title}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>">
  <style>
    ${SHARED_STYLES}
  </style>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div class="container">
    ${content}
    <footer class="status" role="contentinfo">
      <div role="status">
        <span class="status-dot" aria-label="Status: Operational" title="System Operational" role="img"></span> System Operational • ${env.NODE_ENV}
      </div>
      <div style="margin-top: 0.5rem; opacity: 0.8;">
        <a href="https://github.com/homegarden/api" target="_blank" rel="noopener noreferrer" aria-label="View Source on GitHub (opens in a new tab)">View Source on GitHub${EXTERNAL_LINK_ICON}</a>
      </div>
    </footer>
  </div>
</body>
</html>
  `
}

export function getLandingPageHtml(): string {
  return baseLayout({
    title: 'HomeGarden API v2',
    content: `
    <header>
      <h1>🌱 HomeGarden API</h1>
      <div class="badge" role="status">v2.0.0 • AI-Powered</div>
    </header>

    <main id="main">
      <p>Welcome to the HomeGarden API. Connect your applications to smart plant management services.</p>

      <ul class="grid" role="list">
        <li>
          <a href="/ui" class="card" aria-describedby="desc-ui">
            <h2>📚 Documentation</h2>
            <p id="desc-ui">Interactive Swagger UI for API exploration.</p>
          </a>
        </li>
        <li>
          <a href="/doc" class="card" aria-describedby="desc-doc">
            <h2>🔍 OpenAPI Spec</h2>
            <p id="desc-doc">Raw JSON specification for integration.</p>
          </a>
        </li>
        <li>
          <a href="/ui#/PlantID" class="card" aria-describedby="desc-plantid">
            <h2>🌿 Plant ID</h2>
            <p id="desc-plantid">Identify species using AI vision (Docs).</p>
          </a>
        </li>
        <li>
          <a href="/ui#/DrPlant" class="card" aria-describedby="desc-drplant">
            <h2>🩺 Dr. Plant</h2>
            <p id="desc-drplant">Diagnose diseases and pests (Docs).</p>
          </a>
        </li>
      </ul>
    </main>
    `,
  })
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

export function getNotFoundPageHtml(path: string): string {
  const safePath = escapeHtml(path)
  return baseLayout({
    title: 'Page Not Found - HomeGarden API',
    description: 'The requested page could not be found.',
    content: `
    <header>
      <h1>🌱 404 Not Found</h1>
      <div class="badge" style="background: #ffebee; color: #c62828;">Error</div>
    </header>

    <main id="main">
      <p>Oops! The page you are looking for does not exist.</p>
      <code aria-label="Requested URL" style="display: block; background: #f5f5f5; padding: 0.5rem; border-radius: 4px; margin: 1rem 0; word-break: break-all;">${safePath}</code>
      <p>Please check the URL or go back to the homepage.</p>

      <div class="btn-group">
        <a href="/" class="btn">Return Home</a>
        <a href="/ui" class="btn btn-secondary">Read Documentation</a>
      </div>
    </main>
    `,
  })
}
