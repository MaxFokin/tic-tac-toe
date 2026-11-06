"""Browser tests for the whole app, in the three languages the welcome switch offers.
Needs the Playwright venv (README): source .venv/bin/activate && npm run e2e"""
import asyncio, json, pathlib, re
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
URL = (ROOT / 'index.html').as_uri()
LINKS = ['https://github.com/maxfokin/', 'https://www.linkedin.com/in/maxfokin/', 'https://github.com/MaxFokin/tic-tac-toe']
VIEW = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)

async def new_page(browser, init_script=None, **ctx_opts):
    ctx = await browser.new_context(**{**VIEW, **ctx_opts})
    if init_script: await ctx.add_init_script(init_script)
    page = await ctx.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    await page.route('**/fonts.g*/**', lambda r: r.abort())
    await page.goto(URL); await page.wait_for_timeout(300)
    return page, errors

async def direction(page, sel):
    return await page.evaluate(f"getComputedStyle(document.querySelector('{sel}')).direction")

async def check_credits(page):
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
    await check_credits(page)
    assert not errors, errors
    print(f'chrome ({code}): ok')
    await page.context.close()

async def blocked_storage(browser):
    page, errors = await new_page(browser, "Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });")
    await page.tap('.lang[data-lang="he"]'); await page.wait_for_timeout(200)
    assert await page.get_attribute('html', 'lang') == 'he'
    await page.tap('#theme'); await page.wait_for_timeout(100)
    assert await page.get_attribute('html', 'data-theme') == 'dark', 'the toggle works without storage'
    await page.tap('.level[data-level="hard"]'); await page.wait_for_timeout(100)
    assert await pressed(page, '.level[data-level="hard"]'), 'a level can be picked without storage'
    await page.tap('#play'); await page.wait_for_timeout(200)
    assert await page.get_attribute('#app', 'data-screen') == 'play', 'Play works without storage'
    await page.tap('.cell[data-i="0"]'); await page.wait_for_timeout(1000)
    assert await page.locator('.cell.o').count() == 1, 'the coach moves without storage'
    assert not errors, errors
    print('blocked storage: ok')
    await page.context.close()

async def pressed(page, sel):
    return await page.get_attribute(sel, 'aria-pressed') == 'true'

DEFAULTS = ('#mode-single', '.level[data-level="easy"]', '.mark[data-mark="X"]', '.first[data-first="me"]')
PICKS = ('#mode-single', '.level[data-level="hard"]', '.mark[data-mark="O"]', '.first[data-first="random"]')

async def welcome_setup(browser):
    page, errors = await new_page(browser)
    for sel in DEFAULTS:
        assert await pressed(page, sel), f'{sel} is pressed on a fresh page'
    await page.tap('#mode-two'); await page.wait_for_timeout(100)
    assert await pressed(page, '#mode-two') and not await pressed(page, '#mode-single')
    assert not await page.is_visible('.level'), '2 players hides the coach rows'
    assert await page.locator('.howto li').count() == 3, '2 players shows three how-to lines'
    for sel in PICKS:
        await page.tap(sel); await page.wait_for_timeout(100)
    await page.reload(); await page.wait_for_timeout(300)
    for sel in PICKS:
        assert await pressed(page, sel), f'{sel} is remembered after a reload'
    saved = json.loads(await page.evaluate("localStorage.getItem('ttt-coach-setup')"))
    assert saved == {'mode': 'single', 'level': 'hard', 'mark': 'O', 'first': 'random'}, saved
    await page.tap('#play'); await page.wait_for_timeout(200)
    assert await page.get_attribute('#app', 'data-screen') == 'play'
    await page.tap('#restart'); await page.tap('#restart'); await page.wait_for_timeout(200)
    assert await page.get_attribute('#app', 'data-screen') == 'welcome'
    for sel in PICKS:
        assert await pressed(page, sel), f'Start over keeps the setup: {sel}'
    assert not errors, errors
    await page.context.close()
    # The smallest phone: both states fit 360 by 640 with the credits line, no scrolling.
    page, errors = await new_page(browser, viewport={'width': 360, 'height': 640})
    for mode in ('single', 'two'):
        await page.tap(f'#mode-{mode}'); await page.wait_for_timeout(100)
        height = await page.evaluate('document.documentElement.scrollHeight')
        assert height <= 640, f'the welcome screen ({mode}) fits 640: {height}'
    assert not errors, errors
    print('welcome setup: ok')
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

LATIN = re.compile(r'[A-WYZa-wyz]')  # any Latin letter but X and O
async def count(page, sel): return await page.locator(sel).count()
async def text(page, sel): return (await page.text_content(sel)).strip()
async def tap(page, sel, wait=100):
    await page.tap(sel); await page.wait_for_timeout(wait)
async def tap_cell(page, i, wait=100): await tap(page, f'.cell[data-i="{i}"]', wait)
async def single_hard_x(browser):
    page, errors = await new_page(browser)
    for sel in ('.level[data-level="hard"]', '#play'): await tap(page, sel)
    return page, errors

async def two_player_game(browser, code):
    page, errors = await new_page(browser)
    for sel in (f'.lang[data-lang="{code}"]', '#mode-two', '#play'): await tap(page, sel)
    for i in (0, 3, 1): await tap_cell(page, i)
    await tap(page, '#help')
    assert await page.get_attribute('.cell.hint', 'data-i') == '2', 'Help me shows O the block'
    box = await text(page, '#box')
    if code == 'en': assert box == 'Put it here, or X wins.', box
    if code == 'he': assert not LATIN.search(box), box
    if code == 'pl': assert box != 'Put it here, or X wins.', box
    await page.reload(); await page.wait_for_timeout(300)
    assert await page.get_attribute('.cell.hint', 'data-i') == '2' and await text(page, '#box') == box, 'a reload keeps the hint ring with its line'
    await tap_cell(page, 4)
    assert await count(page, '.cell.hint') == 0, 'a tap on any square takes the hint away'
    await tap_cell(page, 2)
    assert await page.get_attribute('#app', 'data-screen') == 'done'
    if code == 'en': assert await text(page, '#title') == 'X wins!'
    assert await count(page, '.cell.win') == 3
    assert await count(page, '.confetti') == 1
    await page.reload(); await page.wait_for_timeout(300)
    assert await page.get_attribute('#app', 'data-screen') == 'done' and await count(page, '.cell.win') == 3, 'a reload keeps the end of the game'
    assert not errors, errors
    print(f'two player game ({code}): ok')
    await page.context.close()

async def coach_game_reload(browser):
    page, errors = await single_hard_x(browser)
    await tap_cell(page, 0, 1000)
    assert await count(page, '.cell.o') == 1 and await count(page, '.cell.o.last[data-i="4"]') == 1, 'the hard coach takes the middle, ringed'
    assert await text(page, '#box') == 'I took the middle.'
    await page.reload(); await page.wait_for_timeout(300)
    assert await count(page, '.cell.x[data-i="0"]') == 1 and await count(page, '.cell.o[data-i="4"]') == 1, 'a reload keeps the board'
    assert await count(page, '.cell.x, .cell.o') == 2
    assert await text(page, '#title') == 'Your turn'
    await page.tap('.cell[data-i="1"]'); await page.reload(); await page.wait_for_timeout(1200)
    assert await count(page, '.cell.o[data-i="2"]') == 1, 'the coach moves after a reload on its turn'
    assert not errors, errors
    print('coach game reload: ok')
    await page.context.close()

async def taken_and_busy(browser):
    page, errors = await single_hard_x(browser)
    await tap_cell(page, 0, 1000)
    await tap_cell(page, 0)
    assert await count(page, '.cell.x') == 1 and await count(page, '.cell.o') == 1, 'a taken square ignores the tap'
    await page.tap('.cell[data-i="8"]'); await page.tap('.cell[data-i="6"]'); await page.wait_for_timeout(1000)
    assert await count(page, '.cell.x') == 2 and await count(page, '.cell.o') == 2, 'a tap during the coach’s wait is ignored'
    assert await count(page, '.cell.x[data-i="6"]') == 0
    assert not errors, errors
    print('taken and busy: ok')
    await page.context.close()

async def coach_first(browser):
    page, errors = await new_page(browser)
    for sel in ('.first[data-first="coach"]', '#play'): await tap(page, sel)
    assert await text(page, '#title') == 'The coach’s turn'
    assert await page.is_disabled('#help'), 'Help me waits for your turn'
    await page.wait_for_timeout(1100)
    assert await count(page, '.cell.o') == 1 and await count(page, '.cell.x') == 0
    # The spec: "The coach starts." opens a Random game only; after its move the coach says its line.
    assert await text(page, '#box') in ('I took the middle.', 'I took a corner.', 'I took a side square.'), await text(page, '#box')
    assert await text(page, '#title') == 'Your turn'
    assert not errors, errors
    print('coach first: ok')
    await page.context.close()

async def random_start(browser):
    page, errors = await new_page(browser)
    await tap(page, '.first[data-first="random"]')
    seen = set()
    for _ in range(12):
        await tap(page, '#play')
        seen.add(await text(page, '#box'))
        await page.tap('#restart'); await tap(page, '#restart')
    assert {'You start!', 'The coach starts.'} <= seen, seen
    assert not errors, errors
    print('random start: ok')
    await page.context.close()

async def garbage_record(browser):
    replay_mismatch = {'screen': 'play', 'game': {'mode': 'single', 'level': 'hard', 'mark': 'X', 'first': 'me'},
        'board': ['X', '', '', '', 'O', '', '', '', ''], 'turn': 'X', 'starter': 'X',
        'history': [{'mark': 'X', 'square': 1}, {'mark': 'O', 'square': 4}], 'line': {'key': 'boxStuck'}, 'result': None}
    for record in ('{"screen":"play","board":[1,2,3]}', json.dumps(replay_mismatch)):
        page, errors = await new_page(browser, f"localStorage.setItem('ttt-coach-v1', {json.dumps(record)})")
        assert await page.get_attribute('#app', 'data-screen') == 'welcome', record
        assert not errors, errors
        await page.context.close()
    print('garbage record: ok')

# A hint line saved during the coach's wait (the child has played since Help me) gets no ring back.
async def hint_on_coach_turn(browser):
    record = {'screen': 'play', 'game': {'mode': 'single', 'level': 'hard', 'mark': 'X', 'first': 'me'},
        'board': ['X', '', '', '', '', '', '', '', ''], 'turn': 'O', 'starter': 'X',
        'history': [{'mark': 'X', 'square': 0}], 'line': {'key': 'hintCenter'}, 'result': None}
    page, errors = await new_page(browser, f"localStorage.setItem('ttt-coach-v1', {json.dumps(json.dumps(record))})")
    assert await page.get_attribute('#app', 'data-screen') == 'play' and await count(page, '.cell.hint') == 0, 'no hint ring on the coach’s turn'
    assert not errors, errors
    print('hint on coach turn: ok')
    await page.context.close()

# Follows Help me on every turn of the child's until the game ends; the coach's turns are waited out.
async def follow_hints(page):
    while True:
        await page.wait_for_function("document.getElementById('app').dataset.screen === 'done' || !document.getElementById('help').disabled")
        if await page.get_attribute('#app', 'data-screen') == 'done': return
        await tap(page, '#help')
        await tap_cell(page, await page.get_attribute('.cell.hint', 'data-i'))

async def hints_never_lose(browser, code):
    page, errors = await new_page(browser)
    for sel in (f'.lang[data-lang="{code}"]', '.level[data-level="hard"]'): await tap(page, sel)
    for mark, first in (('X', 'me'), ('O', 'coach')):
        for sel in (f'.mark[data-mark="{mark}"]', f'.first[data-first="{first}"]', '#play'): await tap(page, sel)
        for game in range(3):
            await follow_hints(page)
            assert await page.is_visible('.handshake'), f'Help me never loses to the Hard coach ({mark}, game {game + 1})'
            assert await page.get_attribute('#app', 'data-mood') is None
            if code == 'en':
                assert await text(page, '#title') == 'It’s a draw!'
                assert await text(page, '#box') == 'Nobody beats the Hard coach. A draw is as good as it gets!'
            if game < 2:
                await tap(page, '#again')
                assert await page.get_attribute('#app', 'data-screen') == 'play', 'Play again starts a new game'
                assert await count(page, '.cell.x, .cell.o') == 0, 'Play again starts on an empty board'
        await page.tap('#restart'); await tap(page, '#restart')
    assert not errors, errors
    print(f'hints never lose ({code}): ok')
    await page.context.close()

async def loss_screen(browser):
    page, errors = await single_hard_x(browser)
    for i in (0, 1, 3): await tap_cell(page, i, 1000)
    assert await text(page, '#title') == 'Oh no…'
    assert await page.get_attribute('#app', 'data-mood') == 'sad'
    assert await page.is_visible('.cloud')
    wins = await page.eval_on_selector_all('.cell.win', 'els => els.map((e) => e.dataset.i + e.className)')
    assert [w[0] for w in wins] == ['2', '4', '6'] and all(' o ' in w + ' ' for w in wins), wins
    assert await text(page, '#box') == 'You could have blocked me. Next time, look at my two in a row.'
    assert await page.evaluate("getComputedStyle(document.body).backgroundColor") == 'rgb(223, 227, 234)', 'the grey day reaches the whole screen'
    await page.tap('#restart'); await tap(page, '#restart')
    assert await page.get_attribute('#app', 'data-screen') == 'welcome'
    assert await page.get_attribute('#app', 'data-mood') is None, 'Start over brings the color back'
    assert await page.evaluate("getComputedStyle(document.body).backgroundColor") == 'rgb(237, 240, 245)'
    assert not errors, errors
    print('loss screen: ok')
    await page.context.close()

TWO_WIN = (0, 3, 1, 4, 2)
TWO_DRAW = (0, 1, 2, 4, 3, 5, 7, 6, 8)
async def two_player_moves(page, squares):
    for i in squares: await tap_cell(page, i)
    assert await page.get_attribute('#app', 'data-screen') == 'done'

async def reduced_motion(browser):
    page, errors = await new_page(browser, reduced_motion='reduce')
    for sel in ('#mode-two', '#play'): await tap(page, sel)
    await two_player_moves(page, TWO_WIN)
    assert await count(page, '.confetti') == 0, 'no confetti under reduced motion'
    await tap(page, '#again')
    await two_player_moves(page, TWO_DRAW)
    assert await page.evaluate("getComputedStyle(document.querySelector('.handshake')).animationName") == 'none', 'the handshake stands still under reduced motion'
    assert not errors, errors
    print('reduced motion: ok')
    await page.context.close()

async def win_confetti(browser):
    page, errors = await new_page(browser)
    for sel in ('#mode-two', '#play'): await tap(page, sel)
    await two_player_moves(page, TWO_WIN)
    assert await count(page, '.confetti svg') == 90
    colors = await page.eval_on_selector_all('.confetti svg *', 'els => [...new Set(els.map((e) => e.getAttribute("fill") === "none" ? e.getAttribute("stroke") : e.getAttribute("fill")))]')
    assert len(colors) >= 2, f'the pieces come in random sticker colors: {colors}'
    assert not errors, errors
    print('win confetti: ok')
    await page.context.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page, errors = await new_page(browser)
        codes = await page.eval_on_selector_all('.lang', 'els => els.map((e) => e.dataset.lang)')
        await page.context.close()
        assert codes == ['en', 'he', 'pl'], f'welcome switch offers {codes}'
        await welcome_setup(browser)
        await theme_toggle(browser)
        await blocked_storage(browser)
        await locale_pick(browser)
        for code in codes:
            await chrome(browser, code)
            await two_player_game(browser, code)
            await hints_never_lose(browser, code)
        await coach_game_reload(browser)
        await taken_and_busy(browser)
        await coach_first(browser)
        await random_start(browser)
        await garbage_record(browser)
        await hint_on_coach_turn(browser)
        await loss_screen(browser)
        await reduced_motion(browser)
        await win_confetti(browser)
        await browser.close()

asyncio.run(main())
