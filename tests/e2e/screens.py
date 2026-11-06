"""Walks every screen in one language and records its text and page height at 360x640.
English: the text of every screen must equal tests/fixtures/en-screens.json (the proof that
English copy never changes). Hebrew: no Latin word may be left. Polish: no English word may be
left. Every language: every screen fits 640 tall with the credits line, no scrolling.
    python3 tests/e2e/screens.py en --write    # refresh the snapshot, only after a copy change Max asked for
    python3 tests/e2e/screens.py en|he|pl
Needs the Playwright venv (see README)."""
import asyncio, json, pathlib, re, sys
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
URL = (ROOT / 'index.html').as_uri()
SNAP = ROOT / 'tests' / 'fixtures' / 'en-screens.json'
ALLOWED = ('Tic-Tac-Toe Coach', 'Tic-Tac-Toe', 'Coach', 'English', 'Polski', 'X', 'O')
VW, VH = 360, 640
LIMIT = 640

async def new_page(browser, lang):
    ctx = await browser.new_context(viewport={'width': VW, 'height': VH}, is_mobile=True, has_touch=True)
    page = await ctx.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.route('**/fonts.g*/**', lambda r: r.abort())
    await page.goto(URL); await page.wait_for_timeout(300)
    if lang != 'en':
        await page.tap(f'.lang[data-lang="{lang}"]'); await page.wait_for_timeout(200)
    return page, errors

async def tap(page, sel, wait=100):
    await page.tap(sel); await page.wait_for_timeout(wait)

async def tap_cell(page, i, wait=100): await tap(page, f'.cell[data-i="{i}"]', wait)

async def start_over(page): await page.tap('#restart'); await tap(page, '#restart', 200)

# Follows Help me on every turn of the child's until the game ends; the coach's turns are waited out.
async def follow_hints(page):
    while True:
        await page.wait_for_function("document.getElementById('app').dataset.screen === 'done' || !document.getElementById('help').disabled")
        if await page.get_attribute('#app', 'data-screen') == 'done': return
        await tap(page, '#help')
        await tap_cell(page, await page.get_attribute('.cell.hint', 'data-i'))

async def walk(browser, lang):
    shots = []
    async def shot(page, label):
        await page.wait_for_timeout(150)
        text = (await page.inner_text('#panel')) + '\n' + (await page.text_content('#restart'))
        h = await page.evaluate('[document.documentElement.scrollHeight, document.documentElement.scrollWidth, window.innerWidth]')
        credits = await page.evaluate("(() => { const f = document.querySelector('.credits'); return !!f && getComputedStyle(f).display !== 'none' && f.querySelectorAll('a').length === 3; })()")
        shots.append((label, text, h[0], h[1] <= VW and h[2] == VW, credits))  # content wider than the phone makes mobile Chromium zoom out
    page, errors = await new_page(browser, lang)
    await shot(page, 'welcome')
    await tap(page, '#mode-two'); await shot(page, 'welcome 2 players')
    for sel in ('#mode-single', '.level[data-level="hard"]', '#play'): await tap(page, sel)
    await shot(page, 'play start')
    await tap(page, '#help'); await shot(page, 'play hint')
    await start_over(page); await tap(page, '#play')
    await tap_cell(page, 0, 1000); await tap_cell(page, 1, 1000); await shot(page, 'play after coach')
    await start_over(page)
    for sel in ('#mode-two', '#play'): await tap(page, sel)
    for i in (0, 3, 1, 4, 2): await tap_cell(page, i)
    await shot(page, 'done win')
    await start_over(page)
    for sel in ('#mode-single', '#play'): await tap(page, sel)
    await follow_hints(page); await shot(page, 'done draw')
    await start_over(page); await tap(page, '#play')
    for i in (0, 1, 3): await tap_cell(page, i, 1000)
    await shot(page, 'done loss')
    await page.context.close()
    return shots, errors

def english_left(text, snap):
    words = set(re.findall(r'[A-Za-z]{4,}', ' '.join(v['text'] for v in snap.values())))
    return [w for w in re.findall(r'[A-Za-z]{4,}', text) if w in words and w not in ALLOWED]

def latin_left(text):
    for tok in ALLOWED: text = text.replace(tok, '')
    return re.findall(r'[A-Za-z]{2,}', text)

async def main(lang, write):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        shots, errors = await walk(browser, lang)
        await browser.close()
    snap = json.loads(SNAP.read_text(encoding='utf-8')) if SNAP.exists() else {}
    bad = 0
    for label, text, height, fits_wide, credits in shots:
        problems = []
        if height > LIMIT: problems.append(f'height {height} over {LIMIT}')
        if not fits_wide: problems.append('wider than the screen')
        if not credits: problems.append('no credits line')
        if lang == 'en' and not write and snap.get(label, {}).get('text') != text: problems.append('text differs from the snapshot')
        if lang == 'he' and latin_left(text): problems.append('Latin left: ' + ' '.join(latin_left(text)[:6]))
        if lang == 'pl' and english_left(text, snap): problems.append('English left: ' + ' '.join(english_left(text, snap)[:6]))
        print(('   ok   ' if not problems else '   FAIL ') + f'{label:22s} {height:4d}  ' + '; '.join(problems))
        bad += bool(problems)
    if lang == 'en' and not write and set(snap) != {s[0] for s in shots}:
        print('   FAIL the list of screens differs from the snapshot'); bad += 1
    if errors:
        print('   FAIL page errors:', errors); bad += 1
    if write:
        assert lang == 'en', 'only the English snapshot is written'
        SNAP.write_text(json.dumps({l: {'text': t, 'height': h} for l, t, h, _, _ in shots}, ensure_ascii=False, indent=1), encoding='utf-8')
        print('snapshot written:', SNAP.relative_to(ROOT))
    print(f'{lang}: {len(shots)} screens, {bad} problems')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else 'en', '--write' in sys.argv))
