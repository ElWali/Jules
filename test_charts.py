
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(no_viewport=True, storage_state=None)
        page = context.new_page()

        # Listen for console events and print them
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        # Listen for page errors
        page.on("pageerror", lambda exc: print(f"Page error: {exc}"))

        page.goto("http://localhost:8000/profile.html?id=1")
        time.sleep(5)  # Wait for charts to render
        page.screenshot(path="charts_screenshot.png")

        material_chart = page.locator("#materialChart")
        period_chart = page.locator("#periodChart")

        assert material_chart.is_visible(), "Material chart is not visible"
        assert period_chart.is_visible(), "Period chart is not visible"

        print("Both charts are visible.")

        browser.close()

run()
