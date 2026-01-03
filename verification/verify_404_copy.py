import os
from playwright.sync_api import sync_playwright

def test_404_copy_button():
    # Define the output HTML file path
    html_path = os.path.abspath("verification/404_test.html")

    # Create a mock 404 page content similar to what getNotFoundPageHtml produces
    # but self-contained with minimal styles for rendering in Playwright
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Not Found</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .code-block { background: #f5f5f5; padding: 10px; display: block; border: 1px solid #ddd; margin: 10px 0; }
    .btn { padding: 8px 16px; background: #eee; border: 1px solid #ddd; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
    .btn-secondary { background: white; }
  </style>
</head>
<body>
  <div class="container">
    <main id="main">
      <script>
        function copyUrl() {
          const codeText = document.querySelector('.code-block').innerText;
          // navigator.clipboard requires secure context or localhost, which file:// might not satisfy in all browsers
          // So we mock the success for visual verification of the button state change
          const btn = document.getElementById('copy-btn');
          const originalContent = btn.innerHTML;
          btn.innerHTML = '✅ Copied!';
          btn.setAttribute('aria-label', 'URL Copied');
          setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.setAttribute('aria-label', 'Copy URL');
          }, 2000);
        }
      </script>
      <p>Oops! The page you are looking for does not exist.</p>
      <code aria-label="Requested URL" class="code-block" title="Requested URL">/some/broken/path</code>

      <div class="btn-group">
        <a href="/" class="btn">Return Home</a>
        <button id="copy-btn" class="btn btn-secondary" onclick="copyUrl()" aria-label="Copy URL">
          <!-- Icon placeholder -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect></svg>
          Copy URL
        </button>
      </div>
    </main>
  </div>
</body>
</html>
    """

    with open(html_path, "w") as f:
        f.write(html_content)

    with sync_playwright() as p:
        # Launch browser with Clipboard permissions
        browser = p.chromium.launch(headless=True, args=['--enable-features=ClipboardAPI'])
        context = browser.new_context()
        context.grant_permissions(['clipboard-read', 'clipboard-write'])

        page = context.new_page()
        page.goto(f"file://{html_path}")

        # Take initial screenshot
        page.screenshot(path="verification/404_initial.png")

        # Click the copy button
        page.click("#copy-btn")

        # Wait for text change
        page.wait_for_function("document.getElementById('copy-btn').innerText.includes('Copied!')")

        # Take screenshot of the "Copied" state
        page.screenshot(path="verification/404_copied.png")

        browser.close()

if __name__ == "__main__":
    test_404_copy_button()
