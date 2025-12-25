from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the landing page (using port 3001)
        page.goto("http://localhost:3001/")

        # Check title
        print(f"Title: {page.title()}")

        # Take a screenshot of the landing page
        page.screenshot(path="verification/landing_page_v2.png")
        print("Landing page screenshot saved.")

        # Navigate to a 404 page
        page.goto("http://localhost:3001/non-existent-page")

        # Take a screenshot of the 404 page
        page.screenshot(path="verification/404_page_v2.png")
        print("404 page screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
