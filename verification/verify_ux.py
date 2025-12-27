from playwright.sync_api import sync_playwright

def verify_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify 404 Page and "Go Back" button
        print("Navigating to 404 page...")
        page.goto("http://localhost:3000/this-page-does-not-exist")

        # Check title
        if "Page Not Found" not in page.title():
            print(f"Error: Unexpected title '{page.title()}'")

        # Check "Go Back" button existence and visibility
        go_back_btn = page.get_by_role("button", name="Go Back")
        if go_back_btn.is_visible():
            print("SUCCESS: 'Go Back' button is visible")
        else:
            print("ERROR: 'Go Back' button not found")

        # Check "Return Home" link
        return_home = page.get_by_role("link", name="Return Home")
        if return_home.is_visible():
             print("SUCCESS: 'Return Home' link is visible")

        # 2. Verify "Copy" button on code block
        print("Checking copy button...")
        copy_btn = page.locator(".copy-btn")

        # Wait for script to inject the button
        try:
            copy_btn.wait_for(state="visible", timeout=2000)
            print("SUCCESS: Copy button injected and visible")
        except:
            print("ERROR: Copy button not found or not visible")

        # Take screenshot of 404 page with buttons
        page.screenshot(path="verification/ux_verification.png")
        print("Screenshot saved to verification/ux_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_ux()
