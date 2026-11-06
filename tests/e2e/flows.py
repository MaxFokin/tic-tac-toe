"""Browser tests for the whole app, in the three languages the welcome switch offers.
Needs the Playwright venv (README): source .venv/bin/activate && npm run e2e"""
import asyncio, pathlib, re
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
URL = (ROOT / 'index.html').as_uri()
LINKS = ['https://github.com/maxfokin/', 'https://www.linkedin.com/in/maxfokin/', 'https://github.com/MaxFokin/tic-tac-toe']
VIEW = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)

async def new_page(browser, init_script=None, **ctx_opts):
    ctx = await browser.new_context(**VIEW, **ctx_opts)
    if init_script: await ctx.add_init_script(init_script)
    page = await ctx.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.route('**/fonts.g*/**', lambda r: r.abort())
    await page.goto(URL); await page.wait_for_timeout(300)
    return page, errors

async def direction(page, sel):
    return await page.evaluate(f"getComputedStyle(document.querySelector('{sel}')).direction")

async def check_credits(page, code):
    assert await page.eval_on_selector_all('.credits a', 'els => els.map((a) => a.href)') == LINKS, 'the credits line links GitHub, LinkedIn and the repo, in that order'
    texts = await page.eval_on_selector_all('.credits a', 'els => els.map((a) => a.textContent.trim())')
    assert texts == ['@maxfokin', '@maxfokin', 'Source'], f'the credits line reads the same in every language: {texts}'
    assert await direction(page, '.credits') == 'ltr', 'the credits line never mirrors'
    font = await page.evaluate("getComputedStyle(document.querySelector('.credits')).fontFamily")
    assert font.startswith('Andika'), f'the credits line keeps its font in every language: {font}'
    bottom = await page.evaluate("document.querySelector('.credits').getBoundingClientRect().bottom")
    assert bottom <= VIEW['viewport']['height'], f'the credits line sits inside the phone screen on welcome: {bottom}'

async def chrome(browser, code):
    page, errors = await new_page(browser)
    if code != 'en':
        await page.tap(f'.lang[data-lang="{code}"]'); await page.wait_for_timeout(200)
    assert await page.get_attribute('html', 'lang') == code
    assert await page.get_attribute('html', 'dir') == ('rtl' if code == 'he' else 'ltr')
    assert await page.get_attribute(f'.lang[data-lang="{code}"]', 'aria-pressed') == 'true'
    assert await page.query_selector('.top .tools .langs') and await page.query_selector('.top .tools #theme'), 'the switch and the theme toggle share the top-right group'
    assert not await page.is_visible('#restart'), 'Start over leaves the header on the welcome screen'
    assert (await page.text_content(f'.lang[data-lang="{code}"]')).strip().endswith(code.upper()), 'each segment shows its code'
    await check_credits(page, code)
    assert not errors, errors
    print(f'chrome ({code}): ok')
    await page.context.close()

async def blocked_storage(browser):
    page, errors = await new_page(browser, "Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });")
    await page.tap('.lang[data-lang="he"]'); await page.wait_for_timeout(200)
    assert await page.get_attribute('html', 'lang') == 'he'
    await page.tap('#theme'); await page.wait_for_timeout(100)
    assert await page.get_attribute('html', 'data-theme') == 'dark', 'the toggle works without storage'
    assert not errors, errors
    print('blocked storage: ok')
    await page.context.close()

async def locale_pick(browser):
    for locale, code in (('he-IL', 'he'), ('pl-PL', 'pl'), ('de-DE', 'en'), ('en-GB', 'en')):
        page, errors = await new_page(browser, locale=locale)
        assert await page.get_attribute('html', 'lang') == code, f'a phone in {locale} opens in {code}'
        assert await page.get_attribute(f'.lang[data-lang="{code}"]', 'aria-pressed') == 'true'
        assert await page.evaluate("localStorage.getItem('ttt-coach-lang')") is None, 'a guess is not saved, so the app keeps following the phone'
        assert not errors, errors
        await page.context.close()
    page, errors = await new_page(browser, locale='he-IL')
    await page.tap('.lang[data-lang="en"]'); await page.wait_for_timeout(200)
    await page.reload(); await page.wait_for_timeout(300)
    assert await page.get_attribute('html', 'lang') == 'en', 'a tapped choice beats the phone'
    assert not errors, errors
    print('locale pick: ok')
    await page.context.close()

async def theme_toggle(browser):
    page, errors = await new_page(browser)
    assert await page.get_attribute('html', 'data-theme') is None, 'without a choice the app follows the phone'
    assert await page.get_attribute('#theme', 'aria-label') == 'Dark mode'
    await page.tap('#theme'); await page.wait_for_timeout(100)
    assert await page.get_attribute('html', 'data-theme') == 'dark'
    assert await page.get_attribute('#theme', 'aria-label') == 'Light mode'
    assert await page.evaluate("getComputedStyle(document.body).backgroundColor") == 'rgb(15, 18, 24)'
    await page.reload(); await page.wait_for_timeout(300)
    assert await page.get_attribute('html', 'data-theme') == 'dark', 'a reload keeps the theme'
    await page.tap('.lang[data-lang="he"]'); await page.wait_for_timeout(200)
    assert not re.search(r'[A-Za-z]', await page.get_attribute('#theme', 'aria-label')), 'the toggle label follows the language'
    await page.tap('#theme'); await page.wait_for_timeout(100)
    assert await page.get_attribute('html', 'data-theme') == 'light'
    assert not errors, errors
    await page.context.close()
    # A phone in dark mode: the toggle starts on dark (sun icon) and one tap gives light.
    page, errors = await new_page(browser, color_scheme='dark')
    assert await page.get_attribute('html', 'data-theme') is None
    assert await page.evaluate("document.getElementById('theme').classList.contains('dark')"), 'the icon shows the way out: a sun in the dark'
    assert await page.get_attribute('#theme', 'aria-label') == 'Light mode'
    await page.tap('#theme'); await page.wait_for_timeout(100)
    assert await page.get_attribute('html', 'data-theme') == 'light'
    assert await page.evaluate("getComputedStyle(document.body).backgroundColor") == 'rgb(237, 240, 245)'
    assert not errors, errors
    print('theme toggle: ok')
    await page.context.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page, errors = await new_page(browser)
        codes = await page.eval_on_selector_all('.lang', 'els => els.map((e) => e.dataset.lang)')
        await page.context.close()
        assert codes == ['en', 'he', 'pl'], f'welcome switch offers {codes}'
        await theme_toggle(browser)
        await blocked_storage(browser)
        await locale_pick(browser)
        for code in codes:
            await chrome(browser, code)
        await browser.close()

asyncio.run(main())
