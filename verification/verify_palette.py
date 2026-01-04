from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Verify Landing Page
    landing_path = os.path.abspath("verification/landing.html")
    page.goto(f"file://{landing_path}")

    # Check for dir="ltr"
    html_element = page.locator("html")
    expect(html_element).to_have_attribute("dir", "ltr")

    # Check for format-detection
    format_meta = page.locator('meta[name="format-detection"]')
    expect(format_meta).to_have_attribute("content", "telephone=no")

    # Check for viewport-fit
    viewport_meta = page.locator('meta[name="viewport"]')
    expect(viewport_meta).to_have_attribute("content", "width=device-width, initial-scale=1.0, viewport-fit=cover")

    # Screenshot Landing
    page.screenshot(path="verification/landing_page.png", full_page=True)

    # Verify 404 Page
    not_found_path = os.path.abspath("verification/404.html")
    page.goto(f"file://{not_found_path}")

    # Check for tabindex on code block
    code_block = page.locator(".code-block")
    expect(code_block).to_have_attribute("tabindex", "0")

    # Screenshot 404
    page.screenshot(path="verification/404_page.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
