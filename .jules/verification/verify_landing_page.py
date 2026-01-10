from playwright.sync_api import sync_playwright

def verify_landing_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Test 1: Verify Landing Page (Main Route)
        page.goto("http://localhost:3000/")

        # Verify title and content
        assert "HomeGarden API v2" in page.title()

        # Take screenshot of landing page
        page.screenshot(path=".jules/verification/landing-page.png")
        print("Captured landing page screenshot")

        # Test 2: Verify 404 Page (HTML response)
        # We need to set Accept header to text/html to trigger our new feature
        page.set_extra_http_headers({"Accept": "text/html"})
        page.goto("http://localhost:3000/this-page-does-not-exist")

        # Verify 404 content
        content = page.content()
        assert "Page Not Found" in content
        assert "Go Home" in content

        # Take screenshot of 404 page
        page.screenshot(path=".jules/verification/404-page.png")
        print("Captured 404 page screenshot")

        browser.close()

if __name__ == "__main__":
    verify_landing_page()
