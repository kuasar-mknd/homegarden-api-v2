from playwright.sync_api import sync_playwright

def verify_ui_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to home page
        page.goto("http://localhost:3000")

        # Take a screenshot of the home page
        page.screenshot(path="verification/home_page.png", full_page=True)
        print("Home page screenshot taken.")

        # Focus on a card to see the focus ring
        page.locator(".card").first.focus()
        page.screenshot(path="verification/card_focus.png")
        print("Card focus screenshot taken.")

        # Navigate to 404 page
        page.goto("http://localhost:3000/non-existent-page")

        # Focus on the return home button
        page.locator(".btn").first.focus()
        page.screenshot(path="verification/btn_focus.png")
        print("Button focus screenshot taken.")

        # Check code block focus
        page.locator(".code-block").focus()
        page.screenshot(path="verification/code_block_focus.png")
        print("Code block focus screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_ui_changes()
