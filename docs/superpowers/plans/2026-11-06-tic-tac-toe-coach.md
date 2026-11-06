# Tic-Tac-Toe Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Tic-Tac-Toe Coach, a one-file web app that plays tic-tac-toe with a child at three
strengths, shows the best square with a reason when asked, lets two children play on one phone,
and speaks English, Hebrew and Polish, as the sister app of Cube Coach.

**Architecture:** Cube Coach's skeleton copied and trimmed (`build.py` concatenates `src/` into
`index.html`; the strings table, language, theme, saving and chrome come from its `ui.js`), plus a
new `src/game.js` with no DOM: the board, a full-tree search, the three coach levels, the hint with
its reason, and the loss explanation. Three screens: welcome, play, done.

**Tech Stack:** Plain HTML, CSS and JavaScript in one IIFE, Python 3.9 `build.py`, Node 26 tests
with `tests/run.js` and `tests/load.js`, Playwright 1.60.0 in `.venv` (Chromium 1223 is cached on
this Mac), GitHub Pages from `main` of `MaxFokin/tic-tac-toe`.

**Spec:** `docs/superpowers/specs/2026-11-06-tic-tac-toe-coach-design.md` (read it whole first),
with `PLAN.md` (what is taken from Cube Coach, file by file) and `../cube-coach/CLAUDE.md` (how the
copied pieces work; the Cube Coach checkout is a sibling folder of this repo).

## Global Constraints

- One file: `index.html` is built by `python3 build.py` from `src/` and committed with the sources; never edited by hand; `python3 build.py --check` passes before every commit.
- No runtime dependency, no framework, no `package.json` dependencies at all.
- `src/game.js` and `src/strings.js` have no DOM (they run in Node through `tests/load.js`).
- Every word a person reads is a key in `STRINGS` with `en`, `he`, `pl`; `tests/strings.test.js` fails on any gap, em dash or shouting. Not translated: "Tic-Tac-Toe Coach", X, O, the credits line.
- Copy rules: a child is the audience, short sentences, no all caps, hyphens not em dashes, typographic apostrophes (’) in UI text, the coach never scolds or apologizes. The English lines are in the spec; keep them verbatim.
- Hebrew is `dir="rtl"`; `.top`, `.board`, `.langs`, `.credits` are pinned `direction: ltr`. Hebrew addresses the child in masculine singular; Polish uses imperatives and impersonal phrasing.
- Magenta (`--coach`) is used only for the hint ring, the coach's last-move ring, the box border and selected tiles; never for a mark.
- Colors: X `#1F6FEB` (`--x`), O `#FF8A1E` (`--o`); sticker colors for confetti `#1FAD5C #FFD43B #D7263D #FF8A1E #1F6FEB #F6F6F1`.
- Every screen fits 360 by 640 with the credits line, no scrolling (`screens.py` limit 640).
- localStorage keys: progress `ttt-coach-v1`, setup `ttt-coach-setup`, language `ttt-coach-lang`, theme `ttt-coach-theme`. They must not collide with Cube Coach's (`cube-coach-*`): both apps live on the same origin, `maxfokin.github.io`.
- Git: this clone commits as `Max Fokin <24751127+MaxFokin@users.noreply.github.com>` (local config); every commit message ends with the `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` line; never push without Max's say-so in the same conversation (every push goes live).
- `CLAUDE.md` and `README.md` are kept true in the same commit as the change they describe.

## Review Focus

- A tap on a taken square, or on any square while the coach is thinking, or after the game ended, changes nothing (Task 10).
- A reload during the coach's 700 ms wait: the coach still moves after the reload, on the same board (Task 10).
- A garbage or inconsistent progress record in localStorage (or Cube Coach's record under its own keys): the app opens on welcome with no page error (Task 10).
- "Random" start: the line in the box matches who really started, and with "Coach" first the coach moves right after Play (Task 10).
- Reduced motion: a win shows no confetti, the handshake and the cloud stand still, nothing throws (Task 11).

---

### Task 1: The repo

**Files:**
- Create: `.gitignore`, `.nojekyll`
- Existing: `CLAUDE.md`, `PLAN.md`, `docs/superpowers/specs/2026-11-06-tic-tac-toe-coach-design.md`, this plan

- [ ] **Step 1: Make the folder a clone of the GitHub repo**

```bash
cd /Users/maxim.f/Documents/claude_code_projects/tic-tac-toe
git init -b main
git config user.name "Max Fokin"
git config user.email "24751127+MaxFokin@users.noreply.github.com"
git remote add origin https://github.com/MaxFokin/tic-tac-toe.git
git pull origin main          # brings GitHub's one-line README.md
```
Expected: `git log --oneline` shows one commit; `README.md` exists; `git status` lists the untracked docs.

- [ ] **Step 2: Write `.gitignore` and `.nojekyll`**

`.gitignore`, one entry per line: `node_modules/`, `.venv/`, `__pycache__/`, `.DS_Store`, `.superpowers/`, `tests/fixtures/generated/`. `.nojekyll` is empty.

- [ ] **Step 3: Commit the hand-over, the design and the plan**

```bash
git add .gitignore .nojekyll CLAUDE.md PLAN.md docs/
git commit -m "Hand-over, design and plan for Tic-Tac-Toe Coach"
```
Expected: `git status` clean except `README.md` unchanged.

### Task 2: The skeleton from Cube Coach

The chrome only: header, language switch, theme toggle, credits line, an empty welcome panel, the
test harnesses. Nothing of the game yet. Copy from `../cube-coach` and trim; `PLAN.md`'s table
says per file what stays.

**Files:**
- Create: `build.py`, `package.json`, `apple-touch-icon.png`, `src/page.template.html`, `src/base.css`, `src/extra.css`, `src/game.js` (a header comment only), `src/strings.js`, `src/ui.js`, `src/main.js`, `tests/run.js`, `tests/load.js`, `tests/strings.test.js`, `tests/e2e/flows.py`
- Build: `index.html`

**Interfaces:**
- Produces (strings.js): `LANGS`, `lang`, `useLang(code)`, `t(key, vars)` as in Cube Coach minus the per-color sets; `STRINGS` with `language`, `darkMode`, `lightMode`, `startOver`, `startOverArmed` copied verbatim in all three languages.
- Produces (ui.js): `$`, `appEl`, `panelEl`, `restartBtn`, `themeBtn`, `reduced`, `app` (`{ screen: 'welcome' }` for now), `KEY = 'ttt-coach-v1'`, `SETUP_KEY = 'ttt-coach-setup'`, `LANG_KEY = 'ttt-coach-lang'`, `THEME_KEY = 'ttt-coach-theme'`, `save()`, `restore()` (empty bodies for now), `go(screen)`, `render(animate)` dispatching `{ welcome: screenWelcome }`, `refreshChrome()`, `applyLang`, `setLang`, `phoneLang`, `refreshLangs`, `isDark`, `setTheme`, `paintTheme`, `btn(id, label, cls)`, `on(id, fn)`, `screenWelcome()` (an `<h1>` only), `confetti()` as copied.
- Produces (main.js): Cube Coach's start-up without the resize, solver and hold-the-brand parts: restart arming, theme button, `applyLang(saved or phoneLang())`, `disarm()`, `restore()`, `render(false)`.
- Produces (template): `#app.app[data-screen]`, `header.top` with `.brand` (the logo SVG at 28 px, then `<span class="name"><b>Tic-Tac-Toe</b><small>Coach</small></span>`), `.tools` with `#restart` and `#theme`, `main.panel#panel`, `footer.credits` with the three links, "Source" at `https://github.com/MaxFokin/tic-tac-toe`.
- Produces (flows.py): `new_page(browser, init_script=None, **ctx_opts)` at 390x844 with fonts aborted, `check_credits(page)`, `theme_toggle`, `blocked_storage`, `locale_pick`, each adapted to the new keys and ids; `LINKS[2]` is the new repo.

- [ ] **Step 1: Copy and trim the build and the template**

`build.py`: `JS_ORDER = ["game.js", "strings.js", "ui.js", "main.js"]`, `CSS_ORDER = ["base.css", "extra.css"]`; nothing else changes.
`src/page.template.html`: title and `apple-mobile-web-app-title` per the spec (names decision 1); the theme script reads `ttt-coach-theme`; the favicon is this SVG as a data URI and the same SVG (without `rx`) is the logo in `.brand`:
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect width='180' height='180' rx='40' fill='#0D0E12'/><path d='M64 22v136M116 22v136M22 64h136M22 116h136' stroke='#F6F6F1' stroke-width='14' stroke-linecap='round'/><rect x='72' y='72' width='36' height='36' rx='8' fill='#E0337F'/></svg>
```
Drop the stage block. Keep the fonts link, the header, the panel, the credits (Source link changed).

- [ ] **Step 2: Render `apple-touch-icon.png` once**

```bash
python3 -m venv .venv && .venv/bin/pip install playwright==1.60.0 && .venv/bin/playwright install chromium
.venv/bin/python - <<'PY'
from playwright.sync_api import sync_playwright
SVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180' width='180' height='180'><rect width='180' height='180' fill='#0D0E12'/><path d='M64 22v136M116 22v136M22 64h136M22 116h136' stroke='#F6F6F1' stroke-width='14' stroke-linecap='round'/><rect x='72' y='72' width='36' height='36' rx='8' fill='#E0337F'/></svg>"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 180, 'height': 180})
    pg.set_content(f"<body style='margin:0'>{SVG}</body>"); pg.screenshot(path='apple-touch-icon.png'); b.close()
PY
file apple-touch-icon.png
```
Expected: `PNG image data, 180 x 180`.

- [ ] **Step 3: Copy and trim the CSS**

`src/base.css`: keep the tokens (add `--x: #1F6FEB; --o: #FF8A1E;` to `:root`, same values in dark), `:root`/`html`/`body`, `.app`, `.top`, `.brand`, `.logo`, `.restart`, `.panel`, `h1`, `.lead`, `.note`, `.actions`, `.btn`, `.textlink`, `.howto`, `.confetti`, the right-to-left pins (now `.top, .board, .langs, .credits { direction: ltr }`), the three `@media` blocks minus their stage and palette lines. Add the two-line brand: `.brand .name { display: grid; gap: 2px; text-align: left; } .brand .name b { font-size: 19px; line-height: 1; } .brand .name small { font: 600 11px/1 var(--display); letter-spacing: .08em; color: var(--ink-soft); }` and `.brand svg { width: 28px; height: 28px; border-radius: 8px; flex: none; }`. Drop everything about the stage, cubies, face grids, palette, moves, chips, progress and the key badge.
`src/extra.css`: keep `.choose`/`.tile` (drop the `.ico` grid rules), the header tools (`.top`, `.tools`, `.langs`, `.lang`, `.theme`) and `.credits`. Drop the rest.

- [ ] **Step 4: Copy and trim the scripts**

`src/game.js`: `// ===== The game: board, search, levels, hints. No DOM. =====` and nothing else yet.
`src/strings.js`: the head of Cube Coach's file with `t()` minus the `color`/`Color` branch (keep plural sets and `{name}` placeholders), no `MOVE_TEXT`, no `moveText`; `STRINGS` holds the five chrome keys from Interfaces, copied verbatim.
`src/ui.js`: the Interfaces list, each function as in Cube Coach's `ui.js` except: `go()` has no `closeCamera()`; `render()` only sets `data-screen`, calls `refreshChrome()` and dispatches the screen; `save()` and `restore()` are empty until Task 10; `screenWelcome()` renders `<h1>Tic-Tac-Toe Coach</h1>` for now.
`src/main.js`: per Interfaces.

- [ ] **Step 5: The test harnesses**

`package.json`: `{ "name": "tic-tac-toe-coach", "private": true, "scripts": { "build": "python3 build.py", "check": "python3 build.py --check", "test": "node tests/run.js", "e2e": "python3 tests/e2e/flows.py", "screens": "python3 tests/e2e/screens.py en" } }`.
`tests/run.js`: Cube Coach's with `['strings.test.js']` (Task 3 adds `game.test.js`).
`tests/load.js`: loads `game.js` then `strings.js`; returns `{ STRINGS, LANGS, t, useLang }` (Task 3 adds the game names).
`tests/strings.test.js`: Cube Coach's minus the color sets, `MOVE_TEXT`, `doneLead`, `turnedNote`, `oopsOneLead3`, `sideListName` checks; keep the per-key language, placeholder, em dash and shouting checks, the plural-set check and the `t()` probes for plurals and the fallback.
`tests/e2e/flows.py`: per Interfaces, `main()` runs `theme_toggle`, `blocked_storage`, `locale_pick` and, in each language, a `chrome(browser, code)` flow: tap the language, assert `html[lang]`, `html[dir]`, the switch in `.top .tools`, `#restart` hidden on welcome, `check_credits`. `blocked_storage` taps the language and the theme only (no game yet). Keys in assertions: `ttt-coach-lang`.

- [ ] **Step 6: Build and run everything**

```bash
python3 build.py && python3 build.py --check && npm test && source .venv/bin/activate && npm run e2e
```
Expected: `index.html is up to date`, `strings: ok (5 keys, en he pl)`, `theme toggle: ok`, `blocked storage: ok`, `locale pick: ok`, `chrome (en|he|pl): ok`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "Skeleton from Cube Coach: build, chrome, languages, theme, test harnesses"
```

### Task 3: The board (`game.js`)

**Files:**
- Modify: `src/game.js`, `tests/load.js`, `tests/run.js`
- Create: `tests/game.test.js`

**Interfaces:**
- Produces: `LINES` (the eight index triples), `CENTER = 4`, `CORNERS = [0, 2, 6, 8]`, `SIDES = [1, 3, 5, 7]`, `other(mark)`, `emptyBoard()` (nine `''`), `empties(board)` (indexes), `isFull(board)`, `play(board, i, mark)` (a new array), `winner(board)` → `{ mark, line }` or `null`. A board is an array of nine `''`, `'X'` or `'O'`, row by row from the top left.

- [ ] **Step 1: Write the failing tests**

In `tests/game.test.js` (Node `assert`, printing `game: ok (board)` at the end, like Cube Coach's tests):
```js
const { LINES, emptyBoard, empties, isFull, play, winner, other } = require('./load.js');
assert.strictEqual(winner(emptyBoard()), null);
for (const line of LINES) for (const m of ['X', 'O']) {
  const b = emptyBoard(); for (const i of line) b[i] = m;
  assert.deepStrictEqual(winner(b), { mark: m, line });
}
const DRAW = ['X','O','X','X','O','O','O','X','X'];
assert.strictEqual(winner(DRAW), null); assert(isFull(DRAW));
const b = play(emptyBoard(), 4, 'X');
assert.deepStrictEqual(empties(b), [0,1,2,3,5,6,7,8]); assert.strictEqual(emptyBoard()[4], '', 'play never mutates');
assert.deepStrictEqual(winner(['X','X','X','O','O','X','O','X','O']), { mark: 'X', line: [0,1,2] }, 'a full board with a line is a win, not a draw');
assert.strictEqual(other('X'), 'O');
```
Add `'game.test.js'` to `tests/run.js` and the names to `tests/load.js`.

- [ ] **Step 2: Run, expect failure**

Run: `npm test` Expected: FAIL, `LINES is not defined`.

- [ ] **Step 3: Implement the Interfaces in `src/game.js`**

- [ ] **Step 4: Run, expect pass**

Run: `npm test` Expected: `game: ok (board)`.

- [ ] **Step 5: Commit** `git add -A && git commit -m "The board: lines, moves, the winner"`

### Task 4: The full-tree search

**Files:**
- Modify: `src/game.js`, `tests/game.test.js`, `tests/load.js`

**Interfaces:**
- Consumes: Task 3.
- Produces: `valueOf(board, mark)` → `1` if `mark`, to move, can force a win, `0` a draw, `-1` a loss (memoized on `board.join('') + mark`); `moveValues(board, mark)` → `[{ square, value }]` for every empty square, `value` from `mark`'s view after playing it; `bestSquares(board, mark)` → the squares with the highest value, ascending; `threats(board, mark)` → empty squares where `mark` completes three; `forkSquares(board, mark)` → empty squares where playing `mark` leaves `threats(...).length >= 2`.

- [ ] **Step 1: Write the failing tests**

```js
assert.strictEqual(valueOf(emptyBoard(), 'X'), 0);
assert.deepStrictEqual(bestSquares(play(emptyBoard(), 0, 'X'), 'O'), [4], 'only the middle answers a corner');
const X08 = ['X','','','','O','','','','X'];
assert.deepStrictEqual(forkSquares(X08, 'X'), [2, 6]);
assert.deepStrictEqual(bestSquares(X08, 'O'), [1, 3, 5, 7], 'only a side stops the fork');
assert.deepStrictEqual(threats(['X','X','','','','','','',''], 'X'), [2]);
// Any best square never loses: every opponent reply, from both starts.
function neverLoses(board, me, toMove) {
  if (winner(board)) return winner(board).mark === me; if (isFull(board)) return true;
  const squares = toMove === me ? bestSquares(board, me) : empties(board);
  return squares.every((s) => neverLoses(play(board, s, toMove), me, other(toMove)));
}
for (const me of ['X', 'O']) for (const first of ['X', 'O']) assert(neverLoses(emptyBoard(), me, first), `${me} never loses when ${first} starts`);
```

- [ ] **Step 2: Run, expect failure** `npm test` → `valueOf is not defined`.

- [ ] **Step 3: Implement** the Interfaces in `src/game.js`. `valueOf` is plain minimax over `empties`, with a `Map` cache keyed by board string and mark.

- [ ] **Step 4: Run, expect pass** `npm test` → `game: ok (search)` printed after the board line.

- [ ] **Step 5: Commit** `git commit -am "The search: every move's value, threats and forks"`

### Task 5: The hint and its reason

**Files:**
- Modify: `src/game.js`, `tests/game.test.js`, `tests/load.js`

**Interfaces:**
- Consumes: Task 4.
- Produces: `REASONS = ['win', 'block', 'fork', 'twoInRow', 'stopFork', 'center', 'corner', 'any', 'side']`; `isReason(board, mark, square, reason)` → boolean, the truth of one reason for one square: `win` = square in `threats(board, mark)`; `block` = in `threats(board, other(mark))`; `fork` = in `forkSquares(board, mark)`; `twoInRow` = `forkSquares(board, other(mark))` is not empty and `threats(play(board, square, mark), mark).length === 1`; `stopFork` = in `forkSquares(board, other(mark))`; `center` = `square === 4`; `corner`, `side` by the lists; `any` = every empty square is in `bestSquares(board, mark)`. `reasonFor(board, mark, square)` → the first reason in `REASONS` true of the square, skipping `any`. `advise(board, mark)` → `{ square, reason }`: the first reason in `REASONS` that is true of some square in `bestSquares(board, mark)`, with the lowest such square; for `any`, the lowest empty square.

- [ ] **Step 1: Write the failing tests**

```js
assert.deepStrictEqual(advise(emptyBoard(), 'X'), { square: 4, reason: 'center' });
assert.deepStrictEqual(advise(['X','','O','','X','','','O',''], 'X'), { square: 8, reason: 'win' });
assert.deepStrictEqual(advise(['X','','O','','O','','','',''], 'X'), { square: 6, reason: 'block' }); // O at 2 and 4 threatens 6
assert.deepStrictEqual(advise(['X','','','','O','','','','X'], 'O').reason, 'twoInRow', 'a side that forces a block stops the fork');
assert.strictEqual(reasonFor(['X','','','','','','','',''], 'O', 4), 'center');
assert.strictEqual(reasonFor(['X','X','','','','','','',''], 'O', 2), 'block');
// Every reachable position, both marks to move, both starts: the hint is a best square, its reason is true, and following hints never loses.
const seen = new Set();
function walk(board, toMove, first) {
  const key = board.join('') + toMove; if (seen.has(key) || winner(board) || isFull(board)) return; seen.add(key);
  const { square, reason } = advise(board, toMove);
  assert(bestSquares(board, toMove).includes(square), key); assert(isReason(board, toMove, square, reason), `${key} ${reason}`);
  if (reason === 'any') assert(empties(board).every((s) => bestSquares(board, toMove).includes(s)));
  for (const s of empties(board)) walk(play(board, s, toMove), other(toMove), first);
}
for (const first of ['X', 'O']) walk(emptyBoard(), first, first);
function followNeverLoses(board, me, toMove) {
  if (winner(board)) return winner(board).mark === me; if (isFull(board)) return true;
  if (toMove === me) return followNeverLoses(play(board, advise(board, me).square, me), me, other(me));
  return empties(board).every((s) => followNeverLoses(play(board, s, toMove), me, other(toMove)));
}
for (const me of ['X', 'O']) for (const first of ['X', 'O']) assert(followNeverLoses(emptyBoard(), me, first));
```

- [ ] **Step 2: Run, expect failure** `npm test` → `advise is not defined`.

- [ ] **Step 3: Implement** per Interfaces.

- [ ] **Step 4: Run, expect pass** `npm test` → `game: ok (hints)`.

- [ ] **Step 5: Commit** `git commit -am "The hint: the best square and a true reason"`

### Task 6: The three coaches

**Files:**
- Modify: `src/game.js`, `tests/game.test.js`, `tests/load.js`

**Interfaces:**
- Consumes: Tasks 4 and 5.
- Produces: `EASY_WIN = 0.5`, `EASY_BLOCK = 0.5` (marked `// ponytail: knobs, tune after Max's son has played`); `useRandom(fn)` replaces the random source (`Math.random` by default); `coachMove(board, mark, level)` → `{ square, reason }` with `reason = reasonFor(board, mark, square)`. `easy`: a win square if `random() < EASY_WIN`, else a block square if `random() < EASY_BLOCK`, else a random empty square. `medium`: a win square, else a block square, else a random empty square. `hard`: a random one of `bestSquares`.

- [ ] **Step 1: Write the failing tests**

```js
const W = ['X','X','','O','O','','','','']; // X to move wins at 2; O to move wins at 5
const B = ['O','O','','X','','','','','']; // X to move has no win and must block 2
useRandom(() => 0); assert.strictEqual(coachMove(W, 'X', 'easy').square, 2, 'easy takes the win when the dice say so'); assert.strictEqual(coachMove(B, 'X', 'easy').square, 2, 'easy blocks when the dice say so');
useRandom(() => 0.99); assert.notStrictEqual(coachMove(W, 'X', 'easy').square, 2, 'easy misses the win when the dice say so'); assert.notStrictEqual(coachMove(B, 'X', 'easy').square, 2, 'easy misses the block when the dice say so');
useRandom(() => 0.99); assert.strictEqual(coachMove(W, 'O', 'medium').square, 5, 'medium always wins in one'); assert.strictEqual(coachMove(B, 'X', 'medium').square, 2, 'medium always blocks');
let seed = 1; useRandom(() => (seed = (seed * 48271) % 2147483647) / 2147483647);
for (const key of seen) { const board = key.slice(0, 9).split(''), m = key[9]; assert(bestSquares(board, m).includes(coachMove(board, m, 'hard').square), 'hard plays a best square'); }
assert.strictEqual(coachMove(play(emptyBoard(), 0, 'X'), 'O', 'hard').reason, 'center');
useRandom(Math.random);
```
(`seen` is the set of reachable positions from Task 5's walk.)

- [ ] **Step 2: Run, expect failure** `npm test` → `useRandom is not defined`.

- [ ] **Step 3: Implement** per Interfaces.

- [ ] **Step 4: Run, expect pass** `npm test` → `game: ok (levels)`.

- [ ] **Step 5: Commit** `git commit -am "The three coaches: easy, medium, hard"`

### Task 7: Why the child lost

**Files:**
- Modify: `src/game.js`, `tests/game.test.js`, `tests/load.js`

**Interfaces:**
- Consumes: Tasks 4 and 5.
- Produces: `lossReason(history, childMark)` → `'missedWin' | 'missedBlock' | 'fork' | 'general'`. `history` is `[{ mark, square }]` from the empty board. Replay it; on each of the child's turns note a missed win (a win square existed, another square was played) and a missed block (the coach had a win square, the child played elsewhere); on each coach turn note a fork (the square was in `forkSquares` for the coach). Precedence: `missedWin`, then `missedBlock`, then `fork`, else `general`.

- [ ] **Step 1: Write the failing tests**

```js
const H = (s) => s.split(' ').map((t, i) => ({ mark: i % 2 ? 'O' : 'X', square: +t }));
assert.strictEqual(lossReason(H('0 3 1 4 6 5'), 'X'), 'missedWin');   // X skipped 2
assert.strictEqual(lossReason(H('0 4 8 2 1 6'), 'X'), 'missedBlock'); // X skipped 6
assert.strictEqual(lossReason(H('1 4 7 0 8 6 2 3'), 'X'), 'fork');    // O's 6 made two ways
assert.strictEqual(lossReason([], 'X'), 'general');
```

- [ ] **Step 2: Run, expect failure** `npm test` → `lossReason is not defined`.

- [ ] **Step 3: Implement** per Interfaces.

- [ ] **Step 4: Run, expect pass** `npm test` → `game: ok (loss)`.

- [ ] **Step 5: Commit** `git commit -am "Why the child lost: a missed win, a missed block, a fork"`

### Task 8: Every word, in three languages

**Files:**
- Modify: `src/strings.js`, `tests/strings.test.js`

**Interfaces:**
- Produces: these keys in `STRINGS`, English verbatim from the spec, Hebrew and Polish drafted by the implementer under the spec's language rules (Max reviews them in Task 13). Placeholders: `{mark}` is X or O, `{n}` a square number.
  - Welcome: `whoPlays` "Who plays?", `single` "Single player", `two` "2 players", `coachLevel` "How good is the coach?", `easy` "Easy", `medium` "Medium", `hard` "Hard", `age5` "age 5", `age8` "age 8", `age10` "age 10+", `youAre` "You are", `whoStarts` "Who starts?", `me` "Me", `coach` "Coach", `random` "Random", `play` "Play", `howto1` "Take turns on this phone. X starts.", `howto2` "Stuck? Tap Help me. The coach shows you.", `howto3` "Three in a row wins!"
  - Play: `yourTurn` "Your turn", `youAreMark` "You are {mark}", `coachTurn` "The coach’s turn", `markTurn` "{mark}’s turn", `tapSquare` "Tap a square", `helpMe` "Help me", `cellEmpty` "Square {n}, empty", `cellMark` "Square {n}, {mark}", `boxStuck` "Stuck? Tap Help me.", `boxYouStart` "You start!", `boxCoachStarts` "The coach starts."
  - Hints: `hintWin`, `hintBlock` (coach), `hintBlock2` "Put it here, or {mark} wins.", `hintFork`, `hintTwoInRow`, `hintTwoInRow2` "Make two in a row. Now {mark} must block.", `hintStopFork`, `hintStopFork2` "Put it here, or {mark} gets two ways to win.", `hintCenter`, `hintCorner`, `hintSide`, `hintAny`.
  - The coach's lines: `coachBlock`, `coachFork`, `coachTwoInRow`, `coachStopFork`, `coachCenter`, `coachCorner`, `coachSide`.
  - Done: `youWin` "You win!", `markWins` "{mark} wins!", `drawTitle` "It’s a draw!", `lossTitle` "Oh no…", `winLine`, `drawHard`, `drawEasy`, `drawTwo`, `lossMissedWin`, `lossMissedBlock`, `lossFork`, `lossGeneral`, `playAgain` "Play again".
  - Lines not quoted here are the spec's table, verbatim.

- [ ] **Step 1: Extend the strings test**

Add to `tests/strings.test.js`: `for (const k of ['whoPlays', ..., 'playAgain']) assert(STRINGS[k], k + ' exists')` with the full list above. Keep the file's existing checks.

- [ ] **Step 2: Run, expect failure** `npm test` → `whoPlays exists`.

- [ ] **Step 3: Write the table** in `src/strings.js`, each key `{ en, he, pl }`, grouped with a comment per screen.

- [ ] **Step 4: Run, expect pass** `npm test` → `strings: ok (N keys, en he pl)` with N the number of keys; `python3 build.py --check` after `python3 build.py`.

- [ ] **Step 5: Commit** `git add -A && git commit -m "Every word, in English, Hebrew and Polish"`

### Task 9: The welcome screen

**Files:**
- Modify: `src/ui.js`, `src/extra.css`, `src/main.js`, `tests/e2e/flows.py`

**Interfaces:**
- Consumes: `t()`, `STRINGS` (Task 8); `emptyBoard`, `other` (Task 3).
- Produces (ui.js): `app.setup = { mode: 'single', level: 'easy', mark: 'X', first: 'me' }` (the defaults); `loadSetup()` (reads `SETUP_KEY`, keeps only valid values) and `saveSetup()`; `screenWelcome()`; `startGame()` (sets `app.game = { ...app.setup }`, `app.board = emptyBoard()`, `app.history = []`, `app.hint = null`, `app.result = null`, `app.starter` per `first` (`me` → the mark, `coach` → the other, `random` → one of the two by `random()`; `two` → `'X'`), `app.turn = app.starter`, `app.line = { key: ... }` with `boxYouStart`/`boxCoachStarts` when `first === 'random'`, else `boxStuck`; then `go('play')`). `screenPlay()` renders `<h1>${t('yourTurn')}</h1>` for now.
- Produces (markup): tiles `button.tile#mode-single`, `#mode-two` with `aria-pressed`; `button.tile.level[data-level="easy|medium|hard"]` in `.choose.n3` under `.label`; `.line` rows: `.label` then `.seg` with `button.mark[data-mark="X|O"]` and `button.first[data-first="me|coach|random"]`, `aria-pressed` on the chosen one; `ul.howto` with three `li` in the 2-players state; `button.btn.primary.small#play`.
- Produces (CSS): `.choose.n3`, `.tile[aria-pressed="true"]` (magenta border and shadow), `.tile .ico` (56 px), `.label`, `.line`, `.seg` and `.seg button` (pill segments, filled when pressed; `.mark[data-mark="X"][aria-pressed="true"]` filled `--x`, O `--o`), `.btn.small` (min-width 170 px, min-height 50 px, centered). Sizes from the round-4 mockup: tile `strong` 22 px.

- [ ] **Step 1: Write the failing browser test**

In `flows.py`, `welcome_setup(browser)`: on a fresh page `#mode-single[aria-pressed="true"]`, `.level[data-level="easy"][aria-pressed="true"]`, `.mark[data-mark="X"]…`, `.first[data-first="me"]…`; tap `#mode-two` → no `.level` visible, `.howto` has 3 `li`; tap `#mode-single`, `.level[data-level="hard"]`, `.mark[data-mark="O"]`, `.first[data-first="random"]`; reload → the same four pressed; `localStorage.getItem('ttt-coach-setup')` holds them; the welcome panel's `document.documentElement.scrollHeight <= 640` at a 360x640 context in both states; tap `#play` → `#app[data-screen="play"]`; `#restart` twice → welcome with the same four still pressed (Start over keeps the setup). Extend `blocked_storage`: with storage blocked, tapping `.level[data-level="hard"]` presses it and `#play` reaches the play screen. Add both to `main()`.

- [ ] **Step 2: Run, expect failure** `npm run e2e` → `welcome_setup` fails on `#mode-single`.

- [ ] **Step 3: Implement** per Interfaces; `main.js` calls `loadSetup()` before `restore()`.

- [ ] **Step 4: Build, run, expect pass** `python3 build.py && npm test && npm run e2e` → `welcome setup: ok`.

- [ ] **Step 5: Commit** `git add -A && git commit -m "The welcome screen: who plays, the coach's level, your mark, who starts"`

### Task 10: The play screen

**Files:**
- Modify: `src/ui.js`, `src/base.css`, `src/extra.css`, `tests/e2e/flows.py`

**Interfaces:**
- Consumes: `winner`, `isFull`, `play`, `other` (Task 3), `advise` (Task 5), `coachMove` (Task 6), `startGame` (Task 9).
- Produces (ui.js): `COACH_WAIT = 700`; `resetAll()` clears `board`, `history`, `turn`, `starter`, `line`, `hint`, `last`, `result` and the coach's timer, never `setup`; `coachMark()` → `other(app.game.mark)`; `isCoachTurn()` → single mode and `app.turn === coachMark()`; `tapCell(i)` (ignored when the square is taken, when `isCoachTurn()`, or when `app.screen !== 'play'`); `placeMove(i, mark)` (board, history, clears `hint` and the last-move ring, then `finish()` if `winner` or `isFull`, else flips `turn`, sets `line` to `boxStuck` in 2 players, and `scheduleCoach()` in single mode); `scheduleCoach()` (a timer of `COACH_WAIT` ms, cleared by `render()`, that plays `coachMove(app.board, coachMark(), app.game.level)`, sets `app.last = square` and `line` to the `coach…` key of its reason, then `placeMove`); `askHelp()` (`advise(app.board, app.turn)` → `app.hint`, `line` = `hint…` key, with the `2` variant and `{ mark: other(app.turn) }` in 2 players); `finish()` sets `app.result = { winner: mark | null, line }` and `go('done')`; `save()`/`restore()` per the spec's play section: saved `{ screen, game, board, turn, starter, history, line, result }`; `restore()` accepts only `screen` in `play`/`done`, a board of nine `''|X|O`, a history that replays from the empty board to that board, `turn` consistent with the counts and `starter`, a `line.key` in `STRINGS`, and `result` equal to what `winner`/`isFull` say; anything else leaves `app` on welcome. After `render()` of a restored coach turn, `scheduleCoach()` runs again.
- Produces (markup): `h1#title` (`yourTurn` / `coachTurn` / `markTurn` with `<b class="x|o">`), `.sub#sub` (`youAreMark` with the mark in color, or `tapSquare`), `.board` of nine `button.cell[data-i]` with classes `x`/`o` and the mark's SVG (`<svg viewBox="0 0 100 100"><path d="M23 23 77 77M77 23 23 77"/></svg>` for X, `<circle cx="50" cy="50" r="29"/>` for O, strokes 13, round caps), `hint` (pulsing magenta ring), `last` (plain magenta ring), aria-labels from `cellEmpty`/`cellMark`; `.box#box` (`.coach` modifier for a magenta border after a hint or a coach line); `button.btn.small#help`.
- Produces (CSS): `.board` (width `min(72vw, 250px)`, dark frame, gap 8, radius 24, the 3D shadow), `.cell` (paper, radius 13, inset shadows, `:active` scale), `.cell.x svg { stroke: var(--x) }`, `.cell.o svg { stroke: var(--o) }`, `.cell.hint` with Cube Coach's `flag` keyframes in `--coach`, `.cell.last`, `.box`, `.box.coach`, `.sub`, `.pop` on a just-placed mark.

- [ ] **Step 1: Write the failing browser tests**

In `flows.py` (each a function added to `main()`):
- `two_player_game(browser, code)`, run for every language in `main()` like Cube Coach's `flow2`: tap the language, `#mode-two`, `#play`; tap cells 0, 3, 1 (X, O, X); tap `#help` → O must block 2: `.cell.hint` is `[data-i="2"]` and, in English, `#box` text is `Put it here, or X wins.` (in Hebrew: no Latin letter but X and O; in Polish: not the English line); tap 4 (O ignores the hint), then 2 (X wins) → `#app[data-screen="done"]`, `#title` text `X wins!` in English, `.cell.win` count 3, a `.confetti` element exists.
- `coach_game_reload`: single, hard, X, me; tap 0; wait 1000 → one `.cell.o` at `[data-i="4"]` with class `last`, `#box` text `I took the middle.`; reload → the same two marks, `#title` `Your turn`; tap 1 and reload at once (no wait) → after 1200 ms `.cell.o[data-i="2"]` exists (the coach moved after the reload).
- `taken_and_busy`: on that game tap `[data-i="0"]` (taken) and, right after tapping an empty square, another empty square during the wait → the board holds exactly the expected marks (count `.cell.x` and `.cell.o`).
- `coach_first`: `.first[data-first="coach"]`, `#play` → within 1200 ms one `.cell.o`, `#box` text `The coach starts.`, `#title` `Your turn`.
- `random_start`: `.first[data-first="random"]`; 12 times `#play` then `#restart` twice; collect `#box` texts → both `You start!` and `The coach starts.` seen.
- `garbage_record`: `new_page` with an init script setting `ttt-coach-v1` to `'{"screen":"play","board":[1,2,3]}'`, then to a record whose history does not match its board → `#app[data-screen="welcome"]`, no page errors.
- In `blocked_storage`: a single-player game can be played to the first coach move.

- [ ] **Step 2: Run, expect failure** `npm run e2e` → `two_player_game` fails: no `.cell`.

- [ ] **Step 3: Implement** per Interfaces.

- [ ] **Step 4: Build, run, expect pass** `python3 build.py && npm test && npm run e2e` → all flows `ok`.

- [ ] **Step 5: Commit** `git add -A && git commit -m "The play screen: the board, the coach's moves, Help me"`

### Task 11: The end of a game

**Files:**
- Modify: `src/ui.js`, `src/base.css`, `src/extra.css`, `tests/e2e/flows.py`

**Interfaces:**
- Consumes: `lossReason` (Task 7), `app.result`, `app.history`, `startGame` (Task 9).
- Produces (ui.js): `screenDone()`: title `youWin` (single, the child's mark won), `markWins` (2 players), `drawTitle`, `lossTitle`; the board as it ended with `.cell.win` on the winning three; the box line `winLine`, `drawHard`/`drawEasy`/`drawTwo`, or `loss…` from `lossReason(app.history, app.game.mark)`; `button.btn.primary.small#again` → `startGame()`; `#app[data-mood="sad"]` on a loss (removed on every other render); `.handshake` (`🤝`) between the title and the board on a draw; `.cloud` (`🌧️`) above the board on a loss; `confetti()` on a win: 90 pieces, each an inline SVG, a rounded square, an X or an O in turn, each in a random one of the six sticker colors, falling with Cube Coach's `fall` keyframes; nothing under `reduced`.
- Produces (CSS): `.handshake` (64 px, `shake` keyframes `rotate(-8deg)`/`rotate(8deg)`, `.7s ease-in-out 3`), `#app[data-screen="done"] .board` when `.handshake` is present: `min(64vw, 230px)`; `#app[data-mood="sad"]` token overrides (light: `--desk #DFE3EA --paper #F1F3F7 --ink #3A3F4C --ink-soft #7A8294`; dark: `--desk #0C0E12 --paper #171A20 --ink #B5BAC6 --ink-soft #7A8294`), `.board { filter: saturate(.35); opacity: .85 }`, `.cloud` (56 px, absolute above the board, `drift` keyframes, 3 s), `.cell.x svg` drooping on a loss when X is the child (`opacity .45; transform: rotate(14deg) translateY(6px)`, varied per cell), the same for `.cell.o` when the child is O; `.confetti svg { width: var(--s); height: var(--s) }`; under `prefers-reduced-motion` every animation here is `none`.

- [ ] **Step 1: Write the failing browser tests**

- `hints_never_lose(browser, code)`, run for every language: six single-player games against `hard`, the child following `#help` every turn (tap `#help`, read `.cell.hint`'s `data-i`, tap it), as X with `me` first and as O with `coach` first → every game ends with `.handshake` visible and `#app` without `data-mood`; in English `#title` is `It’s a draw!` and `#box` text `Nobody beats the Hard coach. A draw is as good as it gets!`; `#again` starts a new game on the play screen with an empty board.
- `loss_screen`: single, hard, X, me; taps 0, 1, 3 with 1000 ms waits → `#title` `Oh no…`, `#app[data-mood="sad"]`, `.cloud` visible, `.cell.win` are O's three, `#box` text `You could have blocked me. Next time, look at my two in a row.`; `getComputedStyle(body).backgroundColor` is `rgb(223, 227, 234)`; `#restart` twice → welcome with `data-mood` gone and the normal background.
- `reduced_motion`: `new_page(reduced_motion='reduce')`, the 2-player win → no `.confetti`; the draw → `.handshake` has `animation-name: none`; no page errors.
- `win_confetti`: on the 2-player win, `.confetti svg` count is 90 and at least two different `stroke`/`fill` colors appear across the pieces.

- [ ] **Step 2: Run, expect failure** `npm run e2e` → `hints_never_lose` fails on `.handshake`.

- [ ] **Step 3: Implement** per Interfaces.

- [ ] **Step 4: Build, run, expect pass** `python3 build.py && npm test && npm run e2e`.

- [ ] **Step 5: Commit** `git add -A && git commit -m "The end of a game: the win, the handshake, the grey day"`

### Task 12: Every screen measured, in three languages, and the README

**Files:**
- Create: `tests/e2e/screens.py`, `tests/e2e/screenshots.py`, `tests/fixtures/en-screens.json`, `docs/screenshots/welcome.png`, `docs/screenshots/hint.png`, `docs/screenshots/win.png`
- Modify: `README.md`, `package.json` (already has `screens`)

**Interfaces:**
- Consumes: every id above.
- Produces: `screens.py` from Cube Coach's, at `VW, VH = 360, 640`, limit `640` for every screen, `FOOTER` gone; `ALLOWED = ('Tic-Tac-Toe Coach', 'Tic-Tac-Toe', 'Coach', 'English', 'Polski', 'X', 'O')`; the walk, in this order and with these labels: `welcome`, `welcome 2 players`, `play start`, `play hint` (after `#help`), `play after coach` (single, hard, X, me: tap 0, wait, tap 1, wait), `done win` (the 2-player win of Task 10), `done draw` (follow hints vs hard), `done loss` (Task 11's taps). `screenshots.py`: `welcome`, `hint` (single, after `#help` on the first move), `win` (the 2-player win, in dark mode) at 390x844, 2x, with the web fonts.

- [ ] **Step 1: Write `screens.py` and run it in English with `--write`**

```bash
source .venv/bin/activate && python3 tests/e2e/screens.py en --write && npm run screens
```
Expected: 8 screens, every line `ok`, no height over 640, `snapshot written`.

- [ ] **Step 2: Hebrew and Polish**

```bash
python3 tests/e2e/screens.py he && python3 tests/e2e/screens.py pl
```
Expected: `he: 8 screens, 0 problems` (no Latin left), `pl: 8 screens, 0 problems`. Fix any overflow in the CSS, never by shortening Max's copy without asking.

- [ ] **Step 3: Screenshots and the README**

`python3 tests/e2e/screenshots.py` (needs the internet for the fonts). `README.md` in Cube Coach's shape: icon, one line, "Open the app" link (`https://maxfokin.github.io/tic-tac-toe/`), the three screenshots, How it works (three steps), Features (the three coaches, Help me with a reason, 2 players, three languages, light and dark, made for one hand, nothing leaves the phone), Put it on a phone, Under the hood (one table: `game.js`, `strings.js`, `ui.js`), Develop (the commands of this plan), Author.

- [ ] **Step 4: Run everything once more**

```bash
python3 build.py --check && npm test && npm run e2e && npm run screens && python3 tests/e2e/screens.py he && python3 tests/e2e/screens.py pl
```
Expected: all green.

- [ ] **Step 5: Commit** `git add -A && git commit -m "Every screen measured in three languages; README with phone screenshots"`

### Task 13: Memory, review, map, live

**Files:**
- Modify: `CLAUDE.md`, `PLAN.md` (one line at the top), `src/strings.js` (Max's review)
- Create: `floorplan/` (by the Floorplan skill)

- [ ] **Step 1: Rewrite `CLAUDE.md` as the project's memory**, in Cube Coach's shape: what the app is and when it was built, the session checklist (`git pull`, `python3 build.py --check`, `npm test`; browser tests when `ui.js`, `strings.js`, the template or the CSS change), how we work, the layout of the repo, how the app works (screens and state, the coach, the hint reasons, languages, theme and credits, the end screens), testing (the commands, the versions, what the tests guarantee, the measured heights of the eight screens), deployment, known weak points, backlog, history. Add one line at the top of `PLAN.md`: it is the hand-over of 2026-11-06, kept for history; `CLAUDE.md` is current.

- [ ] **Step 2: Max reviews the Hebrew and Polish** in `src/strings.js`; apply his changes, `python3 build.py`, `npm test`, `python3 tests/e2e/screens.py he` and `pl` again. Commit `Hebrew and Polish reviewed by Max`.

- [ ] **Step 3: The floorplan**: ask Max for `/floorplan:floorplan` (a session skill, not a subagent task); commit `floorplan/` without `.cache/`.

- [ ] **Step 4: Live.** With Max's say-so: `git push -u origin main`; Max turns on GitHub Pages ("Deploy from a branch", `main`, `/ (root)`); check `https://maxfokin.github.io/tic-tac-toe/` in the cmux browser at a phone viewport; record the date in `CLAUDE.md` and commit.
