# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Tic Tac Coach is the sister app of Cube Coach (`../cube-coach`, live at
https://maxfokin.github.io/cube-coach/): a one-file web app that plays tic-tac-toe with a child and
teaches them to see the board. Same look, same tooling, same promises: one file, no server, no
account, nothing leaves the phone, English, Hebrew and Polish, light and dark, a credits line under
every screen. Max (GitHub `MaxFokin`) builds it for Max's son with Claude Code.

This file is the project's memory, in the shape of Cube Coach's `CLAUDE.md`. Everything in it was
true on 2026-11-06. When a fact changes, change it here in the same commit.

## State on 2026-11-06

Nothing is built. The folder holds `PLAN.md` (the hand-over from the Cube Coach sessions: the idea,
the open decisions, what to take from Cube Coach file by file, the design and test rules that carry
over, the suggested build order) and this file. Since 2026-11-06 it is a clone of the GitHub repo, with the local identity below; the build happens on branch `build`, merged to `main` when Max says so. The GitHub repo exists:
https://github.com/MaxFokin/tic-tac-toe, public, branch `main`, created by Max on 2026-11-06 with
only GitHub's one-line `README.md`; Pages is not on. No `package.json`, no sources, no tests.
The design is written: `docs/superpowers/specs/2026-11-06-tic-tac-toe-coach-design.md`, from the
brainstorm of 2026-11-06 (seven rounds of mockups in the cmux browser), approved by Max the
same day, as is the plan: `docs/superpowers/plans/2026-11-06-tic-tac-toe-coach.md`, 13 tasks,
built subagent-driven (one fresh subagent per task in a cmux split, sonnet or opus, never Fable,
a reviewer after each) at Max's request.

## Start of every session

1. Read `PLAN.md` whole, then `../cube-coach/CLAUDE.md` whole: how Max works, how the app is built,
   tested and deployed, and what its tests guarantee.
2. There is nothing to pull, build or test yet. Once the skeleton exists this step becomes Cube
   Coach's: `git pull`, `python3 build.py --check`, `npm test`, and the browser tests when the work
   touches the UI, the strings, the template or the CSS.
3. Report, then ask Max what to work on.

## How we work together

- Max decides scope and design. Nothing changes in behavior, copy or design unasked.
- Before building: brainstorm the open decisions in `PLAN.md` with Max, one at a time, then write
  the design doc (`docs/superpowers/specs/`) and the plan (`docs/superpowers/plans/`), the Cube
  Coach way. Record each decision in this file, with its date, as Max makes it.
- Design choices come from mockups: three to five options on the real app, shown in the cmux
  browser (never Max's Chrome). Max picks.
- Bugs get a failing test first, then the smallest fix at the root cause. The game logic
  (`src/game.js`, no DOM) gets its Node tests before any screen.
- Edit `src/`, run `python3 build.py`, commit `index.html` with the sources. Never edit `index.html`
  by hand. `npm test` before every commit; browser tests before pushing a change to the UI.
- Every push to `main` goes live. Ask before pushing unless Max asked for the push in the same
  conversation.
- Keep this file and `README.md` true in the same commit as the change.
- Every word a person reads lives in `src/strings.js`. Max reviews the Hebrew and Polish there
  before they ship.
- Commit messages end with the Claude co-author line the session is given.

## Commands

None yet. The toolchain is Cube Coach's, copied and trimmed as the table in `PLAN.md` says:
`python3 build.py` (`--check` exits 1 when `index.html` is stale), `npm test` (the tiny runner in
`tests/run.js`, sources loaded without a DOM by `tests/load.js`), Playwright in `.venv` (`npm run
e2e`, `npm run screens`, `python3 tests/e2e/screens.py he|pl`), no dependencies. Record the real
commands here when they exist.

## Environment (this Mac, verified 2026-11-06)

- Node 26.6.0, npm 11.18.0, Python 3.9.6.
- Playwright 1.60.0 is installed in `../cube-coach/.venv` and its Chromium build (1223) is already in
  `~/Library/Caches/ms-playwright`; a venv here with `pip install playwright==1.60.0` reuses it.
- `gh` is logged in as `MaxFokin`. There is no global git identity: `git init` here must set the
  local one Cube Coach uses, `Max Fokin <24751127+MaxFokin@users.noreply.github.com>`.
- Deployment, when it comes: `MaxFokin/tic-tac-toe` is already public with branch `main`; turn on
  GitHub Pages "Deploy from a branch" at the root, add `.nojekyll`, and every push goes live within
  a minute. Pages only works while the repo is public; its visibility is Max's call, never Claude
  Code's. This clone has the local identity set and `origin` pointing at it.

## Decisions

Made with Max on 2026-11-06 in the first brainstorm (the questions are in `PLAN.md`):

1. The name is "Tic-Tac-Toe Coach": the page title and the brand in the header. The name under the
   home-screen icon is "Tic-Tac-Toe" (the phone cuts longer names at about 13 letters).
2. Both modes in the first version: the child against the coach, and two children on one phone
   with the coach helping whoever taps Help me.
3. Three levels, picked on the welcome screen and labeled by the player's age: 5, 8, 10 and up.
   Claude's reading, not contradicted: the 5 coach slips often, the 8 coach always wins in one and
   blocks in one but can be forked, the 10+ coach never loses.
4. Help is a "Help me" button; nothing appears on its own. Claude's call, open to veto: after its
   own move the coach says in one line what it saw.
5. Who goes first and which mark the child plays are both chosen before a game.
6. X is blue (`#1F6FEB`) and O is orange (`#FF8A1E`), drawn as strokes on paper-colored squares;
   picked from four mockups (red/blue, blue/orange, pencil, stickers). Magenta stays the coach's.
7. Hebrew addresses the child in masculine singular, like Cube Coach.
8. The icon is the grid in white on black with the middle square in the coach's magenta ("the
   coach points"), picked from four mockups; the same picture at 180x180 (`apple-touch-icon.png`),
   as the favicon and as the brand's logo in the header.
9. The welcome screen is one screen, picked from three layouts: "Who plays?" with "Single player"
   and "2 players" tiles, the coach's level tiles (Easy, Medium, Hard, with "age 5", "age 8",
   "age 10+" as small hints; the names are Claude's draft), "You are" X or O, "Who starts?" Me,
   Coach or Random, and a small Play button. The rows are remembered, so the usual path is one
   tap. "2 players" hides the coach rows and shows three how-to lines instead.
10. The header: the name on two lines ("Tic-Tac-Toe" over a small "Coach") beside the logo, so it
    shares the row with the language switch and the theme toggle at 360 px; picked from three
    variants (the full name does not fit that row at any readable size).
11. The play screen and the end of a game, approved from six mockup moments: a big "Your turn"
    (or "X's turn" / "O's turn" in the mark's color with two players), the board, the coach's one
    line in a box, a Help me button. Help me rings the best square in magenta and says why; the
    coach's own move gets the ring for a moment and one line too (Claude's call, not vetoed). A
    win rings the three squares in the mark's color with confetti; the coach winning gets one line
    about what the child could have done; a draw against the Hard coach is called as good as it
    gets. Max's additions, settled on mockups the same day: the confetti is flat squares, X's and
    O's, every piece in a random sticker color; a draw is titled "It's a draw!" with a big shaking
    handshake above the board ("a draw is a handshake to agree"); a loss is a grey day: the screen
    loses its color, the board fades, a rain cloud drifts over it, the child's X's droop, the title
    is "Oh no…", and the coach's line says what the child could have done.

## History

- 2026-11-04 to 2026-11-06: `PLAN.md` written at the end of the Cube Coach sessions, before anything
  was built.
- 2026-11-06: this file set up with `/init`; Max created the GitHub repo (`README.md` only).
- 2026-11-06: the brainstorm. Max answered the eight questions, then picked the colors, the icon,
  the welcome screen, the header and the end screens from mockups. The design doc written.
