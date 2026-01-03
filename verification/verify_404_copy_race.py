import os
import time
from playwright.sync_api import sync_playwright, expect

def test_404_copy_button_race_condition():
    # Define the output HTML file path
    html_path = os.path.abspath("verification/404_test_race.html")

    # Updated HTML content with the fix
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
  </style>
</head>
<body>
  <div class="container">
    <main id="main">
      <script>
        function copyUrl() {
          const btn = document.getElementById('copy-btn');
          if (btn.dataset.copying) return;

          const codeText = document.querySelector('.code-block').innerText;
          // Mock successful copy for visual verification
          Promise.resolve().then(() => {
            const originalContent = btn.innerHTML;
            btn.innerHTML = '✅ Copied!';
            btn.setAttribute('aria-label', 'URL Copied');
            btn.dataset.copying = 'true';

            setTimeout(() => {
              btn.innerHTML = originalContent;
              btn.setAttribute('aria-label', 'Copy URL');
              delete btn.dataset.copying;
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy:', err);
          });
        }
      </script>
      <p>Oops! The page you are looking for does not exist.</p>
      <code aria-label="Requested URL" class="code-block" title="Requested URL">/some/broken/path</code>

      <div class="btn-group">
        <button id="copy-btn" class="btn" onclick="copyUrl()" aria-label="Copy URL">
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
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"file://{html_path}")

        # Click the copy button twice rapidly
        page.click("#copy-btn")
        page.click("#copy-btn")

        # Verify it says "Copied!"
        expect(page.locator("#copy-btn")).to_contain_text("Copied!")

        # Wait for timeout to expire (2s + buffer)
        page.wait_for_timeout(2500)

        # Verify it reverted to "Copy URL"
        expect(page.locator("#copy-btn")).to_contain_text("Copy URL")
        expect(page.locator("#copy-btn")).not_to_contain_text("Copied!")

        print("Race condition test passed!")
        browser.close()

if __name__ == "__main__":
    test_404_copy_button_race_condition()
