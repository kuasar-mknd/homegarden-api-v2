from playwright.sync_api import sync_playwright

def verify_404_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to a non-existent page
        page.goto("http://localhost:3000/this-page-does-not-exist")

        # Verify elements
        page.get_by_role("heading", name="404 Not Found").wait_for()
        page.get_by_role("button", name="Go Back").wait_for()
        page.get_by_role("link", name="Return Home").wait_for()
        page.locator(".code-block").wait_for()

        # Take screenshot
        page.screenshot(path="verification/404_page.png")

        browser.close()

if __name__ == "__main__":
    verify_404_page()
