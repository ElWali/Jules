from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
