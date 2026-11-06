# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Tic-Tac-Toe Coach is a one-file web app that plays tic-tac-toe with a child and teaches them to see
the board. The child plays the coach (Easy, Medium or Hard, labeled age 5, 8 and 10+) or another
child on the same phone. Help me rings the best square in magenta and says why in one line; after
its own move the coach says what it saw; after a loss it says what the child could have done. A
win gets confetti, a draw a handshake, a loss a grey day. It speaks English, Hebrew and Polish,
opening in the phone's language, with a switch top right on the welcome screen beside a light/dark
toggle; a credits line (GitHub, LinkedIn, the repo) closes every screen. It is the sister app of
Cube Coach (`../cube-coach`, live at https://maxfokin.github.io/cube-coach/): the same look, the
same tooling, the same promises (one file, no server, no account, nothing leaves the phone). Max
(GitHub `MaxFokin`) had it built for Max's son with Claude Code on 2026-11-06, in one day: a
brainstorm with mockups in the cmux browser, a design and a 13-task plan, then the build, one fresh
subagent per task with a reviewer after each, on branch `build`.

This file is the project's memory. Everything in it is current and was verified on 2026-11-06.
When a fact here changes, change it here in the same commit.

## Live

https://maxfokin.github.io/tic-tac-toe/ once it is live: GitHub Pages is not on yet. Going live is
the last step of the plan (Task 13, Step 4), with Max: merge `build` into `main`, push, Max turns
on Pages. Until then the URL gives a 404 and the README's "Open the app" link leads there.

## Start of every session

1. `git pull` (once `main` is live; branch `build` has no upstream until the merge), then
   `python3 build.py --check` (must say index.html is up to date) and `npm test` (the strings and
   the game logic must pass; there is nothing to install).
2. If the work touches `ui.js`, `strings.js`, the template or the CSS, also run the browser tests
   and the screen walks in the three languages (see Testing).
3. Report what passed, then ask Max what to work on. Don't change behavior, copy or design on your
   own.

## How we work together

- Max decides scope and design. Nothing changes in behavior, copy or design unasked.
- Before building something new: brainstorm it with Max, one decision at a time, then write the
  design doc (`docs/superpowers/specs/`) and the plan (`docs/superpowers/plans/`), the Cube Coach
  way. Record each decision in this file, with its date, as Max makes it.
- Design choices come from mockups: three to five options on the real app, shown in the cmux
  browser (never Max's Chrome). Max picks.
- Bugs get a failing test first, then the smallest fix at the root cause. The game logic
  (`src/game.js`, no DOM) gets its Node tests before any screen.
- Edit `src/`, run `python3 build.py`, commit `index.html` with the sources. Never edit `index.html`
  by hand. `npm test` before every commit; browser tests before pushing a change to the UI.
- Every push to `main` goes live (once Pages is on). Ask before pushing unless Max asked for the
  push in the same conversation.
- Keep this file and `README.md` true in the same commit as the change. Test facts, layout numbers
  and the history live here.
- Every word a person reads lives in `src/strings.js`. Max reviews the Hebrew and Polish there
  before they ship.
- Subagents run on sonnet or opus, never Fable (Max's rule).
- Commit messages end with the Claude co-author line the session is given.

## Layout

- `index.html` - the whole app in one file, BUILT from `src/` by `build.py`; GitHub Pages will
  serve it. Never edit it by hand.
- `apple-touch-icon.png` - the icon at 180x180 (the template's SVG, rendered once with Playwright).
- `.nojekyll` - empty, so Pages serves the files as they are.
- `src/` - the sources. `build.py` puts the CSS into the template's `{{CSS}}` and the scripts into
  `{{JS}}`, inside one IIFE with `'use strict'`, in this order:
  - `page.template.html` - the head (title, the icon as an SVG data-URI favicon, the touch icon,
    `apple-mobile-web-app-title`, Google Fonts, the one-line saved-theme script), the header (logo,
    the two-line name, Start over, theme toggle), `#panel`, and the credits line.
  - `base.css` - the color tokens (light and dark), fonts, layout, header, buttons, the how-to
    badges, confetti, the right-to-left pins, the small-phone and reduced-motion blocks.
  - `extra.css` - tiles, header tools (language switch, theme toggle), the credits line, the
    welcome rows, the board and its rings, the handshake, the grey day.
  - `game.js` - the board, the full-tree search, the hint and its reason, the three coaches, why
    the child lost. No DOM.
  - `strings.js` - every word a person reads (`STRINGS`, 68 keys), `LANGS`, `lang`, `useLang`,
    `t()`. No DOM.
  - `ui.js` - state, saving and restoring, the setup, language, theme, the three screens, confetti.
  - `main.js` - start-up: Start over (armed on the first tap), the theme button, the saved or the
    phone's language, `loadSetup()`, `restore()`, the first render.
- `build.py` - `python3 build.py` writes `index.html`; `--check` exits 1 if it is stale. Reads and
  writes UTF-8 explicitly (the copy has typographic apostrophes).
- `package.json` - scripts only (`build`, `check`, `test`, `e2e`, `screens`); no dependencies.
- `tests/` - `run.js` (runs the Node tests), `load.js` (loads `game.js` and `strings.js` into Node
  without a DOM and returns the names the tests need), `strings.test.js`, `game.test.js`; `e2e/`
  with `flows.py` (the browser flows), `screens.py` (walks the eight screens in one language) and
  `screenshots.py` (the README's phone screenshots); `fixtures/en-screens.json` (the English text
  snapshot). `fixtures/generated/` is ignored by git and unused so far.
- `docs/screenshots/` - `welcome.png`, `hint.png`, `win.png` (dark mode), shown in `README.md`.
- `docs/superpowers/` - the design (`specs/2026-11-06-tic-tac-toe-coach-design.md`) and the plan
  (`plans/2026-11-06-tic-tac-toe-coach.md`).
- `PLAN.md` - the hand-over from the Cube Coach sessions, kept for history.
- `README.md` - for people: what it does, how to put it on a phone, how to develop it.
- `.gitignore` - `node_modules/`, `.venv/`, `__pycache__/`, `.DS_Store`, `.superpowers/`,
  `tests/fixtures/generated/`.
- `.venv/` - Python venv with Playwright for the browser tests (ignored by git).
- `.superpowers/` - the working files of the subagent-driven build: each task's brief, report and
  review, and the ledger (`sdd/2026-11-06-tic-tac-toe-coach/progress.md`) with every ruling and
  deferred minor finding. Ignored by git, so it lives on this Mac only.

The template and the file order in `build.py` are the only places that decide how `index.html` is
assembled. Function declarations are hoisted inside the IIFE, so `ui.js` may call `disarm` from
`main.js`, but `const` values from later files are only safe at call time.

## How the app works

### Screens and state (ui.js)

`app` holds everything: `screen` (`welcome` | `play` | `done`), `setup` (`mode` single | two,
`level` easy | medium | hard, `mark` X | O, `first` me | coach | random), and during a game `game`
(the setup the game started with), `board` (nine cells, row by row from the top left, each `''`,
`'X'` or `'O'`), `turn`, `starter`, `history` (`[{ mark, square }]` from the empty board), `line`
(the box's line, `{ key, vars }`), `hint` (the ringed square), `last` (the coach's last square) and
`result` (`{ winner, line }` at the end). `go(screen)` saves and renders. `render()` clears the
coach's timer, sets `data-screen` on `#app`, drops `data-mood`, refreshes the chrome (the language
switch and the theme toggle's label) and draws the screen. It then puts the focus back on the
control that had it (found by its id or its one `data-*` attribute; a disabled one is skipped) and
puts the old `#box` node back with the new line, so the box, the only `aria-live` region, keeps its
node and a screen reader reads each new line and nothing else.

The welcome screen's four choices are saved under `ttt-coach-setup` the moment one changes;
`loadSetup()` takes only known values. The first time: Single player, Easy, X, Me. The game is
saved under `ttt-coach-v1` on every change (screen, game, board, turn, starter, history, line,
result), so a reload lands on the same board and turn. The rings are not saved: `restore()` draws
the hint ring again when the line is a hint on the turn it was asked for (`advise` is deterministic,
so it is the same square; a hint line left in the box through the coach's wait gets no ring), and
the coach's ring is lost. This overrides the spec's "the hint ring is not saved" (2026-11-06, the
final review: a "Put it here" with no ring points nowhere). `restore()` takes a record only when the history replays from the empty board to the board,
the turn follows, the result is what the board says and the line is a known key; anything else
leaves the app on welcome. Start over (shown on every screen but welcome; the first tap arms it for
2.6 s, the second acts) drops the game and goes to welcome; the setup, the language and the theme
stay. These keys must never collide with Cube Coach's `cube-coach-*`: both apps live on
`maxfokin.github.io`.

Play (`startGame`): in 2 players X starts; in single player the starter follows Who starts (Random
is drawn each game). The box opens with "You start!" or "The coach starts." in a Random game,
"Stuck? Tap Help me." otherwise. A tap on an empty square on your turn places the mark (the `pop`
animation). On the coach's turn the title is "The coach’s turn", Help me is disabled, and the coach
waits 700 ms (`COACH_WAIT`) before it plays, so its move is seen as a move; its square keeps a
magenta ring until the child's next tap and the box says its line. Help me runs `advise` for
whoever's turn it is, rings the square in pulsing magenta (`flag`) and puts the reason in the box;
any tap takes the ring away, and there is no count. In 2 players the box goes back to "Stuck? Tap
Help me." after every move, and a hint that names the other player uses its `2` form with that
player's mark (`hintBlock2`, `hintTwoInRow2`, `hintStopFork2`). The box's border is magenta
(`.box.coach`) for a hint or a coach line. The marks are inline SVG strokes; the board is
`min(72vw, 250px)` wide and as tall (an explicit height beside `aspect-ratio`). Each square's
`aria-label` is `cellEmpty`, `cellMark` or, on the hinted square, `cellHint`.

### The coach (game.js)

Eight `LINES`; `winner(board)` gives `{ mark, line }` or `null`; `play` never mutates. `valueOf` is
plain minimax with a cache keyed by the nine cells (`.` for an empty one) plus the mark to move;
the whole tree from an empty board with X first is 5478 positions. `bestSquares` are the squares
of the top value, `threats` the squares that complete three, `forkSquares` the squares that leave
two or more threats (a square that wins outright is not a fork).

Levels (`coachMove(board, mark, level)`, which returns the square and its reason):
- Easy: takes a win in one with probability `EASY_WIN`, else blocks one with `EASY_BLOCK`, else a
  random empty square. Both are 0.5, marked `ponytail:` as knobs to tune after Max's son has played.
- Medium: always wins in one, always blocks, else a random empty square; it never forks and can be
  forked.
- Hard: a random one of the best squares; it never loses.
Easy and Medium take the lowest winning or blocking square when there are two. `random` sits
behind `useRandom(fn)` so tests can seed it; `ui.js` also uses `pick` for the Random starter and
the confetti colors.

The hint (`advise(board, mark)`) is always a best square, so a player who follows every hint never
loses. Its reason is the first in `REASONS` that is true of a best square, the lowest square on a
tie, so the hint is the same every time: `win`, `block`, `fork` (two ways to win), `twoInRow` (one
threat that forces a block, only while the other player has a fork square), `stopFork` (the other
player's fork square), `center`, `corner`, `any` (every empty square is best), `side`.
`isReason` is the one place that says what each reason means. The coach's own line is
`reasonFor`: the first true reason for the square it played, never `any`. The keys are the prefix
and the reason: `hintBlock`, `coachCenter`… There is no `coachWin`: that move ends the game, and
`sayReason` keeps the box as it is for a reason without a line. The hint names its square only with
the ring, never with words like left or right, so it is the same square in every language.

### Why the child lost

`lossReason(history, childMark)` replays the game: a child's turn where a win in one was there and
not taken is `missedWin`; else a turn where the coach had a win in one and the child did not block
is `missedBlock`; a coach move on a fork square is `fork`. The first of `missedWin`,
`missedBlock`, `fork` seen anywhere in the game wins, else `general` (also when the coach did not
win). The lines are `lossMissedWin`, `lossMissedBlock`, `lossFork`, `lossGeneral`.

### The end of a game (screenDone)

The board stays as it ended, the winning three ringed in the winner's color, every square disabled;
under it the box (always with the magenta border, as in the mockups) and a small yellow Play again,
which starts a new game from `app.game`, the setup of the game just played (not `app.setup`, which
another tab may have changed).
- A win (the child's, or either mark's in 2 players): "You win!" / "X wins!" / "O wins!", "Three in
  a row. Well done!", and confetti from `finish()`, so a reload of the done screen has none: 90 flat
  pieces (a rounded square, an X, an O in turn), each in a random sticker color, falling 2.2 to
  3.8 s, removed after 4.6 s; none under reduced motion.
- A draw: "It’s a draw!" with a 64 px handshake (🤝) shaking three times, then still (still from
  the start under reduced motion); the board under it shrinks to `min(64vw, 230px)`. The line is
  `drawHard` against Hard, `drawEasy` against Easy or Medium, `drawTwo` in 2 players.
- A loss (single player only; in 2 players there is no loss): "Oh no…" and the grey day.
  `data-mood="sad"` on `#app`; the grey tokens (desk, paper, ink, soft ink, light and dark) hang on
  `:root:has(#app[data-mood="sad"])` so the body greys too; the board is desaturated and faded, a
  rain cloud (🌧️) drifts above it (still under reduced motion), the child's marks droop (tilted
  and faded), and the coach's three are ringed in its color. The line is the loss line.
  `render()` drops the mood, so Play again or Start over brings the color back.

### Languages

As in Cube Coach. `STRINGS[key] = { en, he, pl }`, read through `t(key, vars)`: `{name}`
placeholders, plural sets (`one` … `other`, picked with `Intl.PluralRules` from `vars.n`; none is
used yet), English when a language is missing, the key when the key is unknown. A mark goes into a
line through `{mark}` (in titles as `<b class="x">X</b>`, in its color). `applyLang(code)` in
`ui.js` sets `lang` and `<html lang dir>`; `setLang(code)` (the switch) also saves it under
`ttt-coach-lang`. `main.js` applies the saved language, else the phone's (`phoneLang`: the first of
`navigator.languages` in `LANGS`, else English) without saving it. The switch is the flag-over-code
segmented control in the header's tools group, shown on the welcome screen only.

Hebrew sets `dir="rtl"`; `.top`, `.board`, `.langs` and `.credits` are pinned `direction: ltr`, so
the header and the board never mirror. Hebrew text uses Assistant (`:root[lang="he"]` overrides
`--text`). Hebrew addresses the child in masculine singular; Polish uses imperatives and impersonal
phrasing. Not translated: "Tic-Tac-Toe Coach" (it lives in the template), X and O, the credits
line. Copy rules: a child is the audience, short sentences, no all caps, hyphens not em dashes,
typographic apostrophes (’), the coach never scolds or apologizes. The English lines are the spec's,
verbatim. The Hebrew and Polish are Claude's drafts, waiting for Max's review (see Known weak
points for the lines to look at).

### Theme, credits, look

As in Cube Coach: the tokens follow `prefers-color-scheme` unless `<html data-theme>` is `light` or
`dark`; the moon/sun button (`#theme`) calls `setTheme`, saved under `ttt-coach-theme` and applied
before the first paint by the head script; `paintTheme` sets the icon (a sun in the dark) and the
label. The credits line links GitHub and LinkedIn (@maxfokin) and the repo ("Source",
`MaxFokin/tic-tac-toe`), English in every language, pinned left-to-right and to Andika; `.app` is a
flex column with `min-height: 100dvh` and `.credits` has `margin-top: auto`, so it sits at the
bottom of the phone. Fonts: Fredoka (display), Andika (text), Assistant (Hebrew), from Google Fonts
with fallbacks. X is `#1F6FEB` (`--x`), O is `#FF8A1E` (`--o`); magenta (`--coach`) is the coach's
only: the hint ring, the coach's ring, the box border and the picked tiles, never a mark. The
confetti's sticker colors are `#1FAD5C #FFD43B #D7263D #FF8A1E #1F6FEB #F6F6F1`. The icon is the
grid in white on black with the middle square in magenta.

## Testing

```
python3 build.py --check          # index.html matches src/
npm test                          # Node: strings, then game (board, search, hints, levels, loss)
python3 -m venv .venv && .venv/bin/pip install playwright==1.60.0 && .venv/bin/playwright install chromium
source .venv/bin/activate && npm run e2e   # Playwright: 21 checks, three in each language and twelve once (about 2 minutes)
npm run screens                   # the eight screens' English text against tests/fixtures/en-screens.json, and their heights
python3 tests/e2e/screens.py he   # the same walk in Hebrew (no Latin left) or Polish (pl: no English left)
python3 tests/e2e/screens.py en --write   # refresh the snapshot, only after a copy change Max asked for
python3 tests/e2e/screenshots.py  # the README's phone screenshots into docs/screenshots (needs the internet for the fonts)
```

Verified on 2026-11-06 with Node 26.6.0, npm 11.18.0, Python 3.9.6 and Playwright 1.60.0, whose
Chromium build 1223 lives in `~/Library/Caches/ms-playwright`. The flows and the walks block the
Google Fonts requests, so everything runs offline with the fallback fonts.

Facts the tests guarantee:
- Strings: 68 keys, each in English, Hebrew and Polish with the same placeholders, no em dash, no
  word of three or more capitals, plural sets with `other`; the 63 keys the screens and the coach
  need exist; `t()` fills placeholders, picks plurals, falls back to English and returns an
  unknown key as is.
- The board: a winner is found on all eight lines for both marks; a full board with no line is a
  draw, a full board with a line a win; `play` never mutates.
- The search: the empty board is a draw; only the middle answers a corner; with X on two opposite
  corners and O in the middle, X's fork squares are the two other corners and only a side saves O;
  a square that wins outright is not a fork; playing any best square never loses, as X or as O,
  whoever starts.
- The hint: from every reachable position, with either mark to move and either mark having
  started, it is a best square and its reason is true of it ("any" only when every empty square is
  best); a player who follows every hint never loses against any reply, as X and as O, first or
  second.
- The coaches: Easy takes the win and the block when the dice say so and misses both when they
  don't; Medium always wins in one and always blocks; Hard plays a best square in every reachable
  position (so it never loses) and answers a corner with the middle.
- The loss line: a missed win, a missed block and a fork on hand-made histories, and the general
  line for a game the coach did not win.
- Browser, in every language: `<html lang dir>` and the pressed segment follow the switch, the
  switch and the toggle share the header's right group, no Start over on welcome, the credits line
  (three links, the same words, order, font and direction, inside the screen on welcome); a
  2-player game where Help me shows O the block with the `2` line, a reload keeps the ring and the
  line, any tap takes the ring away, X
  wins with three ringed squares and confetti, a reload keeps the done screen, and Play again
  starts the game just played even after the saved setup changed under it; following
  Help me against Hard, as X starting and as O with the coach starting, three games each, always
  ends in the handshake, never the grey day, and Play again starts on an empty board.
- Browser, once: the welcome defaults; 2 players hides the coach rows and shows three how-to lines;
  the setup survives a reload and Start over; both welcome states fit 360x640; the toggle follows
  the phone until tapped, survives a reload, and its label follows the language; the language,
  the toggle, a level pick, Play and the coach's move work when localStorage throws; a phone in
  Hebrew or Polish opens in it, any other in English, nothing is saved until a tap, and a tapped
  choice beats the phone; Hard answers a corner with the middle, ringed, "I took the middle.", and a
  reload keeps the board and the turn and lets the coach move on its turn; a taken square and a tap
  during the coach's wait are ignored; a Coach-first game shows "The coach’s turn" with Help me
  disabled, then the coach's line and "Your turn"; Random gives both "You start!" and "The coach
  starts." in twelve games; a malformed record, or one whose history does not replay, lands on
  welcome; a saved hint line on the coach's turn comes back with no ring; a loss (X on 0, 1, 3 against Hard) shows "Oh no…", the grey body, the cloud, the
  coach's three ringed and the missed-block line, and Start over brings the color back; under
  reduced motion there is no confetti and the handshake stands still; a win throws 90 pieces in more
  than one color; with the keyboard, a welcome choice, a square (through the coach's move) and
  Help me keep the focus, `#panel` is not live and `#box` is, the box keeps its node across a move,
  and the hinted square's label says it is the coach's hint.
- The walks (`screens.py`): the English text of the eight screens equals the snapshot; Hebrew
  screens hold no Latin word but the allowed names and X and O; Polish screens hold no English word
  from the snapshot; every screen is at most 640 tall and 360 wide at 360x640, with the credits line
  and no page error.

Layout at 360x640, measured on 2026-11-06. The walk's own number is `scrollHeight`, which never
reads under the 640 viewport, so it is 640 on every screen in every language and only catches
overflow. The content's real height (`#app` without its `min-height`, credits line included), with
the web fonts:

| Screen               | en  | he  | pl  |
|----------------------|-----|-----|-----|
| welcome              | 586 | 586 | 586 |
| welcome 2 players    | 541 | 504 | 541 |
| play start           | 576 | 576 | 599 |
| play hint            | 599 | 576 | 576 |
| play after coach     | 576 | 576 | 576 |
| done win             | 551 | 551 | 551 |
| done draw            | 623 | 623 | 623 |
| done loss            | 575 | 575 | 598 |

The 23 px steps are the box's line wrapping to two lines. With the fallback fonts the walks use,
every screen is within 23 px of these (English welcome 608), and the draw is the tallest either way:
17 px of room.

## Deployment

- GitHub: `MaxFokin/tic-tac-toe`, public, created by Max on 2026-11-06. `origin/main` holds only
  GitHub's one-line `README.md` (`1aa55a1`); the local `main` is one commit ahead (`0554c59`, the
  hand-over, design and plan). The build is on the local branch `build`, not pushed, merged into
  `main` when Max says so.
- GitHub Pages is not on. The last step (Task 13, Step 4), with Max's say-so: push `main`; Max turns
  on Pages ("Deploy from a branch", `main`, `/ (root)`); check
  https://maxfokin.github.io/tic-tac-toe/ in the cmux browser at a phone viewport; record the date
  here. After that every push to `main` is live within a minute or two. No CI; the tests are the
  gate.
- Pages only works while the repo is public (the free plan). Its visibility is Max's call, never
  Claude Code's.
- The `gh` CLI on this Mac is logged in as `MaxFokin`. This clone commits as
  `Max Fokin <24751127+MaxFokin@users.noreply.github.com>` (local git config, no global identity),
  and `origin` is `https://github.com/MaxFokin/tic-tac-toe.git`.
- Phones: open the URL in Safari or Chrome, Share, Add to Home Screen; the name under the icon is
  "Tic-Tac-Toe". There is no service worker or manifest, so offline use depends on the browser
  cache; the fonts need the internet the first time, with fallbacks otherwise.

## Known weak points

- The Hebrew and Polish are Claude's drafts and wait for Max's review (Task 13, Step 2). Lines to
  look at: `drawEasy` says "we" in Hebrew and Polish ("שנינו שיחקנו יפה", "Dobrze nam poszło")
  where English says "You both played well"; the Hebrew `age10` "גיל 10+" renders as "+10 גיל"
  under right-to-left (fix the words, or isolate the hint); the Help me button's name sits
  unquoted inside `howto2` and `boxStuck` in Hebrew and Polish, so those two must follow if
  `helpMe` changes.
- The walk's heights only catch overflow (see Layout), and it runs with the fallback fonts.
- No browser test checks that the board stays left-to-right in Hebrew; only the CSS pins it.
- The browser floor: the game itself needs no more than Cube Coach does (no `Object.hasOwn`, no
  `?.`, and `.board` has an explicit height beside `aspect-ratio`, so it keeps its shape before
  Safari 15). Only the loss screen's grey mood needs CSS `:has()` (Safari 15.4, Chrome 105, both
  2022); an older browser shows the loss in normal colors. Never checked on an old device.
- After the child's move, the hint line (and the magenta border) stays in the box through the
  coach's 700 ms wait, until the coach's line replaces it. The spec is silent; for Max to notice.
- Every choice and move redraws the panel; `render()` puts the focus back, but the last move of a
  game lands on the done screen, whose squares are disabled, so the focus falls to the page there.
  The title ("Your turn", "The coach’s turn") is not live, only the box. The new `cellHint` label
  is a draft in all three languages, for Max's review. The pressed tile keeps its magenta shadow
  while pressed.
- The Easy coach's two 0.5 knobs are guesses, not yet tuned on Max's son.
- The loss line names a fork whenever the coach played one, whether or not the child could still
  have stopped it ("Next time, stop me before that" stays true).
- The `random start` flow needs both starters in twelve draws, so it fails once in 2048 runs.
- Not tested on a real iPhone or Android device; all browser testing was headless Chromium at
  390x844 and 360x640.
- Test code repeats itself: `tap`, `tap_cell` and `follow_hints` exist in both `flows.py` and
  `screens.py`. Change both copies together.

## Backlog ideas (not started)

From the spec: two players with names, bigger boards, a lessons mode (set boards that teach the
fork and the block), a photo of a paper game with a hint for the next move, a replay of the lost
game move by move, a web manifest and service worker. Left out of the first version on purpose:
sound, scores or a history across games, online play.

## Decisions

Made with Max on 2026-11-06 in the brainstorm (the questions are in `PLAN.md`; the details are in
the spec, `docs/superpowers/specs/2026-11-06-tic-tac-toe-coach-design.md`):

1. The name is "Tic-Tac-Toe Coach"; "Tic-Tac-Toe" under the home-screen icon. See the spec.
2. Both modes: the child against the coach, and two children on one phone. See the spec.
3. Three levels labeled by age (5, 8, 10+): Easy slips, Medium wins and blocks, Hard never loses.
   See the spec.
4. Help only on Help me; the coach says one line after its own move (Claude's call). See the spec.
5. Mark (X or O) and who starts (Me, Coach, Random) are both chosen before a game. See the spec.
6. X blue `#1F6FEB`, O orange `#FF8A1E`, strokes on paper squares; magenta is the coach's. See the
   spec.
7. Hebrew addresses the child in masculine singular. See the spec.
8. The icon: the grid in white on black, the middle square magenta ("the coach points"). See the
   spec.
9. One welcome screen with remembered rows, so the usual path is one tap. See the spec.
10. The header: the name on two lines beside the logo, to fit the tools at 360 px. See the spec.
11. The play and end screens from six mockup moments, with Max's confetti of X's and O's, the
    handshake on a draw and the grey day on a loss. See the spec.

## History

- 2026-11-04 to 2026-11-06: `PLAN.md` written at the end of the Cube Coach sessions, before anything
  was built.
- 2026-11-06: Max created the GitHub repo (`README.md` only); this file set up with `/init`.
- 2026-11-06: the brainstorm. Max answered the eight questions, then picked the colors, the icon,
  the welcome screen, the header and the end screens from mockups in the cmux browser. The design
  and the 13-task plan written and approved the same day.
- 2026-11-06: the build, subagent-driven on branch `build`, one commit per task:
  1. `0554c59` Hand-over, design and plan for Tic-Tac-Toe Coach (and `028641a` Keep CLAUDE.md
     true: the repo exists).
  2. `b276c6e` Skeleton from Cube Coach: build, chrome, languages, theme, test harnesses.
  3. `53bf0c1` The board: lines, moves, the winner.
  4. `f06c401` The search: every move's value, threats and forks.
  5. `d4c34f8` The hint: the best square and a true reason.
  6. `59e8799` The three coaches: easy, medium, hard.
  7. `7b4ce35` Why the child lost: a missed win, a missed block, a fork.
  8. `c88459b` Every word, in English, Hebrew and Polish.
  9. `6c3fd54` The welcome screen: who plays, the coach's level, your mark, who starts.
  10. `18e8705` The play screen: the board, the coach's moves, Help me.
  11. `44bcb04` The end of a game: the win, the handshake, the grey day.
  12. `e87becb` Every screen measured in three languages; README with phone screenshots.
  13. CLAUDE.md as the project's memory. Still to do with Max: the review of the Hebrew and
      Polish, the floorplan, going live.
