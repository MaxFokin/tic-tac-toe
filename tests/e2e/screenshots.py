"""Takes the README's phone screenshots (docs/screenshots/*.png): 390x844 at 2x, with the web fonts,
so it needs the internet. The welcome screen, a hint on the first move, and a 2-player win in the dark.
    source .venv/bin/activate && python3 tests/e2e/screenshots.py"""
import asyncio, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
URL = (ROOT / 'index.html').as_uri()
OUT = ROOT / 'docs' / 'screenshots'

async def tap(page, sel, wait=150):
    await page.tap(sel); await page.wait_for_timeout(wait)

async def shoot(page, name):
    await page.evaluate('document.fonts.ready'); await page.wait_for_timeout(1500)  # the fonts, and the confetti settling
    await page.screenshot(path=str(OUT / f'{name}.png'))

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        page = await ctx.new_page()
        await page.goto(URL); await page.wait_for_timeout(800)
        await shoot(page, 'welcome')
        await tap(page, '#play'); await tap(page, '#help'); await shoot(page, 'hint')
        await page.tap('#restart'); await tap(page, '#restart', 300)
        await tap(page, '#theme')
        for sel in ('#mode-two', '#play'): await tap(page, sel)
        for i in (0, 3, 1, 4, 2): await tap(page, f'.cell[data-i="{i}"]')
        await shoot(page, 'win')
        await browser.close()
    for f in sorted(OUT.glob('*.png')): print(f.relative_to(ROOT), f.stat().st_size // 1024, 'KB')

asyncio.run(main())
