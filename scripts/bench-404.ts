import { baseLayout, getNotFoundPageHtml } from '../shared/ui/templates.js'

// Copy from templates.ts since it's not exported or we want to test locally
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const HOME_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
const DOC_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
const BACK_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>`
const COPY_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
const CHECK_ICON = `<svg class="btn-icon" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`

// Proposed Optimization
const NOT_FOUND_CONTENT_TEMPLATE = `
    <header role="banner">
      <h1>🌱 404 Not Found</h1>
      <div class="badge badge-error" role="status">Error</div>
    </header>

    <main id="main" tabindex="-1">
      <p>Oops! The page you are looking for does not exist.</p>

      <div class="code-wrapper">
        <code id="error-path" aria-label="Requested URL" class="code-block" title="Requested URL" tabindex="0">{{PATH_PLACEHOLDER}}</code>
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
          backBtn.addEventListener('click', function() {
            history.back();
          });
        }

        // Handle Copy
        var btns = document.querySelectorAll('.copy-btn');
        Array.prototype.forEach.call(btns, function(btn) {
          btn.addEventListener('click', function() {
            var targetSelector = btn.getAttribute('data-clipboard-target');
            var target = document.querySelector(targetSelector);
            if (target) {
              var text = target.innerText;
              // Modern API
              if (navigator.clipboard && navigator.clipboard.writeText) {
                 navigator.clipboard.writeText(text).then(function() {
                    var originalHtml = btn.innerHTML;
                    btn.innerHTML = '${CHECK_ICON} Copied!';
                    setTimeout(function() { btn.innerHTML = originalHtml; }, 2000);
                 }).catch(function(err) {
                    console.error('Failed to copy', err);
                 });
              } else {
                 // Fallback
                 console.warn('Clipboard API not available');
              }
            }
          });
        });
      })();
    </script>
    `

const NOT_FOUND_TEMPLATE = baseLayout({
  title: '404: Page Not Found - HomeGarden API',
  description: 'The requested page could not be found.',
  content: NOT_FOUND_CONTENT_TEMPLATE,
})
const [NOT_FOUND_PREFIX, NOT_FOUND_SUFFIX] = NOT_FOUND_TEMPLATE.split('{{PATH_PLACEHOLDER}}')

function getNotFoundPageHtmlOptimized(path: string): string {
  const safePath = escapeHtml(path)
  return NOT_FOUND_PREFIX + safePath + NOT_FOUND_SUFFIX
}

// Benchmark
const ITERATIONS = 100000
const TEST_PATH = '/some/dangerous/<script>path'

console.log(`Running ${ITERATIONS} iterations...`)

const start1 = performance.now()
for (let i = 0; i < ITERATIONS; i++) {
  getNotFoundPageHtml(TEST_PATH)
}
const end1 = performance.now()
console.log(`Current: ${(end1 - start1).toFixed(2)}ms`)

const start2 = performance.now()
for (let i = 0; i < ITERATIONS; i++) {
  getNotFoundPageHtmlOptimized(TEST_PATH)
}
const end2 = performance.now()
console.log(`Optimized: ${(end2 - start2).toFixed(2)}ms`)

const speedup = (end1 - start1) / (end2 - start2)
console.log(`Speedup: ${speedup.toFixed(2)}x`)

// Verification
const current = getNotFoundPageHtml(TEST_PATH)
const optimized = getNotFoundPageHtmlOptimized(TEST_PATH)

if (current !== optimized) {
  console.error('MISMATCH!')
  console.log('Current length:', current.length)
  console.log('Optimized length:', optimized.length)
  // Find first mismatch index
  for (let i = 0; i < Math.max(current.length, optimized.length); i++) {
    if (current[i] !== optimized[i]) {
      console.log(`Mismatch at index ${i}`)
      console.log('Current char:', current[i], 'Code:', current.charCodeAt(i))
      console.log('Optimized char:', optimized[i], 'Code:', optimized.charCodeAt(i))
      console.log('Context Current:', current.substring(i - 20, i + 20))
      console.log('Context Optimized:', optimized.substring(i - 20, i + 20))
      break
    }
  }
  process.exit(1)
} else {
  console.log('Verification: Output matches exactly.')
}
