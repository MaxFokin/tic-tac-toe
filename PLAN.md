# Tic Tac Coach - starting point

A sister app to Cube Coach: the same idea, the same look, the same tooling, for tic-tac-toe.
This is the hand-over from the Cube Coach sessions of 2026-11-04 to 2026-11-06, written before
anything was built. It is a starting point, not a plan: the new session brainstorms the open
decisions with Max first, then writes the design and the plan the Cube Coach way
(`docs/superpowers/specs/`, `docs/superpowers/plans/`), then builds.

Reference project: `../cube-coach` (GitHub `MaxFokin/cube-coach`, live at
https://maxfokin.github.io/cube-coach/). Its `CLAUDE.md` is the model for everything here: how
Max works, how the app is built, tested and deployed, and what its tests guarantee. Read it
whole before the first question. Its `README.md` is the model for this project's README.

## The idea, carried over

Cube Coach walks a child through solving a Rubik's cube: the child copies the cube, the app
checks it, then shows every turn on an animated cube with an arrow, in a child's words.

Tic Tac Coach plays tic-tac-toe with a child and teaches them to see the board. The coach is
the opponent and the helper: when the child is stuck, a tap shows the best square with the same
magenta highlight and says why ("Put it here, or the coach wins", "Take the middle"). After its
own move the coach can say what it saw. A game ends with the same confetti.

The same promises: one file, no server, no account, nothing leaves the phone, made for one hand
on a phone, English, Hebrew and Polish, light and dark, the phone's language until the switch is
tapped, a credits line under every screen.

## Decisions for Max before building (brainstorm these first, one at a time)

1. The name. "Tic Tac Coach" is the working title (the page title and the brand; the folder is `tic-tac-toe`).
2. Who plays: the child against the coach only, or also two children on one phone with the coach
   watching and helping whoever asks? Suggestion: the coach first, two players as the next feature.
3. How strong the coach is. A perfect player never loses, which is no fun for a child. Suggestion:
   three levels picked on the welcome screen like the 2x2 / 3x3 tiles: a coach that makes
   mistakes, one that blocks and wins when it can, one that never loses. Named in a child's words.
4. How help works: a "Help me" button that highlights a square and explains, a hint that appears
   on its own after the child waits, or both. And whether the coach explains its own moves.
5. Who goes first and which mark the child plays (X or O): a choice, or alternating per game.
6. The colors of X and O: two cube sticker colors (red and blue, say), so the coach's magenta
   stays the coach's, for highlights only.
7. Hebrew addresses the child in masculine singular, like Cube Coach. Keep, or change.
8. The home-screen icon (Cube Coach has `apple-touch-icon.png`).

## Screens (a proposal; the brainstorm settles it)

`welcome` (brand, pick the coach's level, play) -> `play` (the board, whose turn, Help me, the
coach's words under the board) -> `done` (won, lost or draw, confetti, play again). A help box on
the play screen like Cube Coach's move help. Start over in the header as today. The game in
progress is saved like the cube, so a reload lands on the same board. No error screens: there is
nothing to copy wrong. Every screen fits a 360x640 phone with the credits line, no scrolling; the
credits line cost Cube Coach's side screens 52 px, so design the play screen with it from the start.

## What to take from Cube Coach

| Cube Coach | Take | Notes |
|---|---|---|
| `build.py` | as is | change `JS_ORDER` and `CSS_ORDER` |
| `src/page.template.html` | nearly as is | the saved-theme script, the fonts link, the header (brand, Start over, theme toggle) and the credits line stay; title and brand change |
| `src/base.css` | adapt | keep the tokens (light and dark), the `.app` flex column, panel, buttons, welcome steps, confetti, the right-to-left pins and the breakpoints; drop the stage, face grids and palette |
| `src/extra.css` | adapt | keep the header tools, language switch, theme toggle and credits; the cube-choice tiles can become the level choice; drop the 3x3 grids and the camera sheet |
| `src/strings.js` | adapt | keep `LANGS`, `lang`, `useLang`, `t()` with plural sets and the rules in CLAUDE.md (Languages); new `STRINGS`; drop `MOVE_TEXT` and the per-color sets |
| `src/ui.js` | adapt | keep `app`, `save`, `restore`, `go`, `render`, the language block (`applyLang`, `setLang`, `phoneLang`, `refreshLangs`), the theme block (`isDark`, `setTheme`, `paintTheme`, `refreshChrome`) and confetti; drop the 3D stage, turns and arrows |
| `src/main.js` | as is | the start-up order: saved language -> restore -> render; Start over and theme buttons |
| `src/core2.js`, `core3.js`, `colorread.js`, `camera.js` | drop | new `src/game.js` instead: the board, win and draw, the coach's move per level, the hint and its reason. No DOM in it, like the cores |
| `tests/run.js`, `tests/load.js` | as is | list the new files |
| `tests/strings.test.js` | as is | drop the color-set checks |
| `tests/e2e/flows.py` | adapt | keep `new_page`, `check_credits`, `blocked_storage`, `theme_toggle` and `locale_pick`; a game per language instead of a solve |
| `tests/e2e/screens.py` | adapt | the walk of every screen in one language, the English text snapshot, the height limits (now: everything fits) |
| `tests/e2e/screenshots.py` | adapt | the README's three phone screenshots |
| `tests/e2e/camera.py`, `tests/e2e/fixtures.js`, `tests/vendor/` | drop | no solver, no camera |
| `README.md`, `CLAUDE.md` | same shape | rewrite the content; CLAUDE.md is the project's memory and must stay true |
| `.gitignore`, `.nojekyll` | as is | |
| `package.json` | new | no dependencies; the same scripts (`build`, `check`, `test`, `e2e`, `screens`) |
| `floorplan/` | new | `/floorplan:floorplan` once the code exists; commit the folder, keep `.cache/` out |

## Design rules that carry over

- Audience is a child: short sentences, one action per screen, no all caps, hyphens not em
  dashes, typographic apostrophes, the coach never apologizes and never scolds.
- Fredoka for display, Andika for text, Assistant for Hebrew, from Google Fonts with fallbacks.
- Colors are tokens on `:root` with dark-mode values; the theme follows the phone until the
  moon button is tapped. Big buttons with the 3D shadow, tiles for choices.
- The header never mirrors (brand top-left, tools top-right). Hebrew runs right to left; the
  board is pinned `direction: ltr` like the cube's grids, so a hint about "the left corner" is
  the same square in every language. The credits line is English everywhere.
- Every word a person reads lives in `strings.js`; the strings test fails on any gap. Max
  reviews the Hebrew and Polish in `strings.js` before they ship.
- The coach's words are the product. Each hint has a reason the child can learn from: win in
  one, block, take the middle, take a corner, make two ways to win.

## Tooling and tests that carry over

- `python3 build.py` writes `index.html`; `--check` is run at the start of every session and
  before every commit. `index.html` is committed with the sources, never edited by hand.
- `npm test`: Node tests with the tiny runner in `tests/run.js`, sources loaded without a DOM
  by `tests/load.js`. The game logic gets its tests first (bugs get a failing test first).
- Playwright in `.venv` (see the Develop section of Cube Coach's README): `npm run e2e` plays a
  game in every language and checks the credits line, the theme toggle, blocked storage and the
  phone-language pick; `npm run screens` walks every screen against the English snapshot and the
  height limits, `python3 tests/e2e/screens.py he|pl` the same in Hebrew and Polish.
- Facts the tests should guarantee, in the spirit of Cube Coach's list: the top coach never
  loses (play it against every line of play, the tree is small); the middle coach always takes
  a win in one and always blocks one; a hint is always a legal square and its reason matches
  the board; a reload mid-game lands on the same board; Start over and a reload keep the
  language and the theme.
- Browser checks and mockups happen in the cmux browser, never in Max's Chrome.

## Deployment, the same way

GitHub repo under `MaxFokin`, branch `main`, GitHub Pages "Deploy from a branch" at the root,
`.nojekyll`, live within a minute of a push. Pages needs the repo public, which is Max's call.
The clone commits as the Cube Coach clone does (local git config, see its CLAUDE.md, Deployment);
commit messages end with the Claude co-author line the session is given.

## How Max likes to work (learned on Cube Coach)

- Max decides scope and design. Nothing changes in behavior, copy or design unasked.
- Design choices come from mockups: build three to five options on the real app, show them in
  the cmux browser, let Max pick (that is how the language switch and the credits line were chosen).
- Ask before pushing unless Max asked for the push in the same conversation. Every push goes live.
- Keep `CLAUDE.md` and `README.md` true in the same commit as the change.
- Open `.md` files in cmux (`cmux markdown open`) when Max should read them.

## Suggested order for the new session

1. Read Cube Coach's `CLAUDE.md`, then brainstorm the decisions above with Max and write the
   design doc and the plan (`docs/superpowers/`).
2. The skeleton: copy and trim the files in the table, `git init` with the same identity, and
   get `build.py --check`, `npm test` and the browser harness green with an empty board.
3. `src/game.js` with its Node tests first: board, win and draw, the levels, the hints.
4. The screens in English; the `screens.py` snapshot.
5. Hebrew and Polish; Max reviews `strings.js`.
6. README with screenshots, CLAUDE.md as the project's memory, the floorplan.
7. GitHub and Pages; Max makes the repo public.

## Backlog ideas (not for the first version)

- Two children on one phone, the coach helping whoever asks.
- Bigger boards (4x4, or three in a row on 5x5).
- A lessons mode: a few set boards that teach the fork and the block.
- A photo of a paper game, the way Cube Coach reads a cube, with a hint for the next move.
