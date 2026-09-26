#!/usr/bin/env python3
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.getenv("SITE_BASE_URL", "http://127.0.0.1:8000")
OUT = Path("artifacts/visual")
OUT.mkdir(parents=True, exist_ok=True)

PAGES = [("id", "/"), ("en", "/en.html")]
VIEWPORTS = [
    ("desktop", 1440, 1000),
    ("tablet", 820, 1180),
    ("mobile", 390, 844),
]

def assert_no_horizontal_overflow(page, width):
    scroll_width = page.evaluate("document.documentElement.scrollWidth")
    client_width = page.evaluate("document.documentElement.clientWidth")
    assert scroll_width <= client_width + 1, (
        f"Horizontal overflow: scrollWidth={scroll_width}, clientWidth={client_width}, viewport={width}"
    )

def smoke(page, lang, path, viewport_name, theme):
    page.goto(BASE + path, wait_until="networkidle")
    page.locator("h1").wait_for(state="visible")
    assert_no_horizontal_overflow(page, page.viewport_size["width"])

    # FAQ interaction
    faq = page.locator(".faq-question").first
    if faq.count():
        faq.click()
        assert "open" in (faq.locator("xpath=..").get_attribute("class") or "")

    # Modal interaction
    trigger = page.locator('[aria-controls="inova-pandora"]').first
    if trigger.count():
        trigger.click()
        modal = page.locator("#inova-pandora")
        assert "open" in (modal.get_attribute("class") or "")
        modal.locator(".modal-close").click()

    page.screenshot(
        path=str(OUT / f"{lang}-{viewport_name}-{theme}.png"),
        full_page=True
    )

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for lang, path in PAGES:
            for viewport_name, width, height in VIEWPORTS:
                for theme in ("light", "dark"):
                    context = browser.new_context(viewport={"width": width, "height": height})
                    context.add_init_script(
                        f"localStorage.setItem('theme', '{theme}');"
                    )
                    page = context.new_page()
                    smoke(page, lang, path, viewport_name, theme)
                    context.close()
        browser.close()
    print("Visual smoke checks passed and screenshots were generated.")

if __name__ == "__main__":
    main()
