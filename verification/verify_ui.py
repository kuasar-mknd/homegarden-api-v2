
from playwright.sync_api import sync_playwright
import os

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Verify Landing Page
        landing_path = os.path.abspath("verification/landing.html")
        page.goto(f"file://{landing_path}")
        page.screenshot(path="verification/landing.png", full_page=True)
        print("Captured landing.png")

        # Verify 404 Page
        not_found_path = os.path.abspath("verification/404.html")
        page.goto(f"file://{not_found_path}")

        # Test Copy Button hover state for screenshot?
        # Maybe focus the skip link to see it?
        page.keyboard.press("Tab") # Should focus skip link
        page.screenshot(path="verification/404_skip_focus.png")
        print("Captured 404_skip_focus.png")

        # Screenshot the whole 404 page
        page.screenshot(path="verification/404.png", full_page=True)
        print("Captured 404.png")

        browser.close()

if __name__ == "__main__":
    verify_ui()
