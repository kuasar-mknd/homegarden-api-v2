from playwright.sync_api import sync_playwright

def verify_ui_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to 404 page to test Go Back button and code block
        page.goto("http://localhost:3000/some-non-existent-page")

        # Wait for content to load
        page.wait_for_selector("main#main")

        # Take screenshot of 404 page
        page.screenshot(path="verification/404_page.png")

        # Navigate to home page to check focus rings and balance text
        page.goto("http://localhost:3000/")
        page.wait_for_selector("header h1")

        # Force focus on a card to see the ring (might not be visible in static screenshot unless we capture active element state, but we can check layout)
        page.locator(".card").first.focus()
        page.screenshot(path="verification/home_page.png")

        browser.close()

if __name__ == "__main__":
    verify_ui_changes()
