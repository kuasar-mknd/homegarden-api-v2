from playwright.sync_api import sync_playwright

def verify_template_styles():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to home
        page.goto("http://localhost:3000")

        # Check title
        print(f"Title: {page.title()}")

        # Take screenshot of home
        page.screenshot(path="verification/home.png", full_page=True)

        # Navigate to 404
        page.goto("http://localhost:3000/non-existent-page")

        # Take screenshot of 404
        page.screenshot(path="verification/404.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_template_styles()
