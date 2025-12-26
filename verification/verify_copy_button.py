from playwright.sync_api import sync_playwright

def verify_copy_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to a non-existent page to trigger 404
        response = page.goto("http://localhost:3000/this-page-does-not-exist")

        # Verify 404 status
        if response.status != 404:
            print(f"Expected 404, got {response.status}")

        # Verify code block content
        code_block = page.locator(".code-block")
        print(f"Code block text: {code_block.inner_text()}")

        # Verify copy button exists
        copy_btn = page.locator(".btn-copy")
        if copy_btn.is_visible():
            print("Copy button is visible")
        else:
            print("Copy button is NOT visible")

        # Take screenshot
        page.screenshot(path="verification/404_page.png")

        browser.close()

if __name__ == "__main__":
    verify_copy_button()
