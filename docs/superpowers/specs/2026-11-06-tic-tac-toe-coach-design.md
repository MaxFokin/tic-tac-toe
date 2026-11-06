# Tic-Tac-Toe Coach - design

Written 2026-11-06 from the brainstorm with Max, after seven rounds of mockups in the cmux browser.
A builder who has read Cube Coach's `CLAUDE.md` and this document can plan the whole first version
from it. Decisions are Max's unless marked as the builder's or as Claude's call; Claude's calls
are open to Max's veto at any time.

## Why

Max's son, who is six, plays tic-tac-toe with his friends and with Max. Max wants him to learn how to win
against anyone: never lose, and win whenever the other player slips. Against a perfect player the
best anyone can do is a draw, so "win anyone" means knowing the handful of ideas that decide every
game: win in one, block in one, take the middle, take a corner, make two ways to win at once, and
stop the other player from doing the same.

Tic-Tac-Toe Coach is the sparring partner and the helper. It plays against the child at a strength
the child can beat sometimes, it shows the best square when asked and says why, and it says what it
saw after its own moves. Two children can also play each other on one phone with the coach helping
whoever asks. It is the sister app of Cube Coach: the same look, the same tooling, the same promises.

## Goals

- A child who plays it for a while beats the Easy and Medium coach, draws the Hard coach, and
  can name the idea behind every move: win, block, middle, corner, two ways to win.
- Every hint and every coach move comes with one short reason in a child's words. The words are
  the product.
- Two children on one phone, the coach helping whoever taps Help me.
- Cube Coach's promises: one file, no server, no account, nothing leaves the phone, made for one
  hand on a phone, English, Hebrew and Polish, light and dark, the phone's language until the
  switch is tapped, a credits line under every screen.
- Every screen fits a 360 by 640 phone with the credits line, without scrolling.

## Non-goals for the first version

Bigger boards, a lessons mode with set positions, a photo of a paper game, sound, scores or a
history across games, names for the two players, online play, a service worker or manifest.
These are the backlog, not the plan.

## Anti-goals

- A coach that scolds, apologizes, gloats, or explains at length. One line, then quiet.
- A perfect coach as the only coach. A five-year-old must be able to win.
- Hints that appear on their own. Help comes only when asked.
- Anything that leaves the phone. All caps or em dashes in anything a person reads.

## Constraints

- Built exactly like Cube Coach: `src/` concatenated by `build.py` into one `index.html`, no
  framework, no runtime dependency, Node tests through `tests/run.js` and `tests/load.js`,
  Playwright in `.venv` for the browser tests, GitHub Pages from `main` of `MaxFokin/tic-tac-toe`.
  `PLAN.md` lists what to copy from Cube Coach file by file; the builder's plan follows it.
- The game logic lives in `src/game.js` with no DOM, like Cube Coach's cores, and gets its Node
  tests before any screen.
- Every word a person reads lives in `src/strings.js`; the strings test fails on any gap. Max
  reviews the Hebrew and Polish there before they ship. Hebrew addresses the child in masculine
  singular; Polish uses imperatives and impersonal phrasing. Not translated: "Tic-Tac-Toe Coach",
  X and O, the credits line.
- Hebrew runs right to left; the header never mirrors; the board is pinned `direction: ltr`.
- Cube Coach's copy and design rules: a child is the audience, short sentences, one action per
  screen, typographic apostrophes, Fredoka for display, Andika for text, Assistant for Hebrew,
  tokens on `:root` with dark values, big buttons with the 3D shadow, tiles for choices. Magenta
  (`--coach`) belongs to the coach only: rings and hint boxes, never a mark.

## The decisions

1. **Name.** "Tic-Tac-Toe Coach" is the page title and the brand. The name under the home-screen
   icon (`apple-mobile-web-app-title`) is "Tic-Tac-Toe", because the phone cuts longer names.
2. **Modes.** Single player (the child against the coach) and 2 players (two children on one
   phone, the coach helping whoever taps Help me). Both in the first version.
3. **Levels.** Three, picked on the welcome screen, labeled Easy, Medium, Hard with "age 5",
   "age 8", "age 10+" as small hints under the names. The level names are Claude's draft; Max may
   rename them in `strings.js`. What each level does is under The coach below.
4. **Help.** A "Help me" button, nothing on its own. Claude's call: after its own move the coach
   says one line about what it did.
5. **Mark and first move.** Both chosen on the welcome screen: You are X or O; Who starts: Me,
   Coach, or Random (decided each game). The two rows are independent, so the child may be O and
   start: here a mark is a shape and a color, not a rule (Claude's call, after the builder check;
   the game state stores who started and whose turn it is). In 2 players X starts, as on paper.
6. **Colors.** X is blue (`#1F6FEB`), O is orange (`#FF8A1E`), Cube Coach's sticker values, drawn
   as thick rounded strokes on paper-colored squares. Chosen from four mockups.
7. **Hebrew** addresses the child in masculine singular, like Cube Coach.
8. **Icon.** The grid in white on black with the middle square in the coach's magenta, "the coach
   points". The same picture at 180 by 180 as `apple-touch-icon.png`, as the SVG favicon, and at
   28 px as the logo in the header. Chosen from four mockups.
9. **Welcome screen.** One screen, chosen from three layouts, then revised by Max (see Screens).
10. **Header.** The name on two lines beside the logo: "Tic-Tac-Toe" at 19 px over "Coach" at 11 px
    (letter-spaced, soft ink). The full name does not fit beside the language switch and the theme
    toggle at 360 px at any readable size. Chosen from three variants.
11. **Play and end screens** as in Screens below, approved from mockups, with Max's three additions:
    confetti of flat squares, X's and O's in random colors on a win; a handshake on a draw; a grey,
    sad screen on a loss.

## Screens

Every screen has Cube Coach's header (brand top-left, tools top-right, never mirrored) and the
credits line at the bottom (GitHub, LinkedIn, "Source" linking the new repo, English everywhere).
The tools are the language switch (welcome screen only) and the theme toggle; Start over shows on
every screen but welcome, armed on the first tap and acting on the second, as in Cube Coach.

### welcome

- Title "Who plays?", then two tiles: "Single player" (the logo as its icon) and "2 players"
  (a blue X and an orange O as its icon).
- With Single player picked, three more rows: the label "How good is the coach?" over three
  tiles, Easy / Medium / Hard with the age hint in small text; a row "You are" with a two-segment
  X | O control (X blue, O orange when selected); a row "Who starts?" with Me | Coach | Random.
  Labels sit at the left of their control, the control at the right.
- With 2 players picked, the three rows give way to three how-to lines with numbered badges in
  blue, orange and yellow: "Take turns on this phone. X starts." / "Stuck? Tap Help me. The coach
  shows you." / "Three in a row wins!"
- A small centered yellow Play button (about 170 px wide, 50 px tall), not the full-width button.
- The picked tile has a magenta border and shadow; the picked segment is filled (ink, or the
  mark's color for X and O).
- The setup (mode, level, mark, who starts) is saved under its own localStorage key the moment it
  changes, like the language and the theme, so Start over and `restore()` never touch it. The
  first time, the defaults are Single player, Easy, X, Me (Claude's call). Afterwards the usual
  path is one tap on Play.
- Measured on the mockup: 640 px with room under the Play button in both states.

### play

- Header tools: Start over and the theme toggle.
- Title and subtitle. Single player, the child's turn: "Your turn" over "You are X" (the mark in
  its color). While the coach moves: "The coach's turn" (Claude's call: the coach waits about
  700 ms before it plays, so its move is seen as a move). 2 players: "X's turn" or "O's turn",
  the mark in its color, over "Tap a square".
- The board: 3 by 3, Cube Coach's dark rounded frame, paper-colored rounded squares, about 250 px
  wide at 360 px (as wide as fits). A tap on an empty square on your turn places the mark with the
  pop animation of Cube Coach's cells. Marks are inline SVG strokes, two lines for X, a circle for
  O, about 64% of the square.
- The coach's box under the board: one line, always present. At the start of a game: "You start!"
  or "The coach starts." for Random, otherwise "Stuck? Tap Help me." After a hint: the reason, and
  the box's border turns magenta. After the coach's move: its line.
- Help me: a secondary (white) button, centered and small like Play. It rings the best square in
  pulsing magenta (Cube Coach's `flag` animation) and puts the reason in the box. The ring stays
  until the player taps a square, any square; the child may ignore the hint. Help me may be tapped
  any number of times, there is no penalty and no count. In 2 players it helps whoever's turn it
  is.
- The coach's move: its square gets the magenta ring (no pulse) and the box says its line; the
  ring goes when the child taps.
- The game is saved on every change under the progress key: board, whose turn, who started, the
  move history, the setup it was started with, and the box's line. A reload lands on the same board and turn.
  The hint ring is not saved (Claude's call); the line is.
- Start over discards the game and returns to welcome. The setup stays.

### done

The board stays on the screen as it ended, with the winning three squares ringed in the winner's
color. Under it the coach's box, then a small yellow Play again button, which starts a new game
with the same setup. Start over in the header goes to welcome.

- **A win for the child** (single player), or for either mark (2 players): "You win!" / "X wins!" /
  "O wins!". Confetti falls like Cube Coach's for about three seconds: flat rounded squares, X's
  and O's, each piece in a random one of the six sticker colors. Box: "Three in a row. Well done!"
- **A draw:** "It's a draw!" with a big handshake emoji between the title and the board, shaking
  a few times then still (still from the start under reduced motion). Box: against the Hard coach
  "Nobody beats the Hard coach. A draw is as good as it gets!"; against Easy or Medium "You both
  played well. Shake hands!"; in 2 players "Nobody wins this one. Shake hands!". This screen is the
  tallest; the builder shrinks the board or the emoji until it fits 640 px.
- **A loss** (single player only): "Oh no…". The screen turns grey: a muted set of the color tokens
  (desk, paper, ink, soft ink; light and dark variants), the board desaturated and faded, a rain
  cloud emoji drifting slowly above the board (still under reduced motion), and the child's marks
  drooping: tilted a little and faded. The coach's three are ringed in its color. Box: one line
  about what the child could have done (see The coach's words). In 2 players there is no loss
  screen: whoever won gets the win screen, both children are in the room (Claude's call).

## The coach (`src/game.js`, no DOM)

- The board is an array of nine cells, row by row from the top left, each empty, X or O. Eight
  lines. Pure functions: the winner and its line, whether the board is full, the empty squares,
  the board after a move.
- A full-tree search (minimax, the tree is tiny) gives the value of every legal move for the
  player to move: win, draw or loss with the opponent playing perfectly. From it: the set of
  optimal squares.
- **Levels.** Easy: if it can win in one, it does so half the time; else if it must block, it does
  so half the time; else a random empty square. Medium: always wins in one, always blocks, else a
  random empty square, so it never forks and can be forked. Hard: an optimal square, chosen at
  random among equals so games differ; it never loses. The two Easy probabilities are knobs the
  builder marks for tuning after Max's son has played.
- **The hint.** `advise(board, mark)` returns a square and a reason. The square is always optimal
  for Hard's standard (the player who follows every hint never loses). The reason is the first of
  these that applies to an optimal square, in this order, and it must be true of that square:
  1. win in one: the square completes three;
  2. block: the other player would complete three there;
  3. two ways to win: after the move, two lines each hold two of mine and an empty square;
  4. two in a row: after the move, one line holds two of mine and an empty square, so the other
     player must block (this is how a threatened fork is stopped; the edge reply to a corner and
     an opposite corner is this case);
  5. stop two ways: the square is where the other player could make two ways to win next move
     (4 and 5 apply only while the other player has such a square);
  6. the middle; 7. a corner;
  8. any: when every empty square is optimal (so a side is never praised when it does not matter);
  9. a side square: the only safe kind of square left.
  Reasons 6, 7 and 9 only describe the square; they are true by construction and never say more
  than that. The hint names the square only with the ring, never with words like left or right, so it
  is the same square in every language and direction.
- **The coach's own line** is the first reason in the same list that is true of the square it
  played (win, block, two ways, two in a row, stop two ways, middle, corner, side), at every level:
  an Easy coach that happens to take the middle says so. Every square is a middle, a corner or a
  side, so there is always a line.
- **The loss line** is chosen by replaying the saved history with `advise`: the child's last turn
  where a win in one was missed; else where a block was missed; else, if the coach won through two
  ways to win, that; else a general line. Order: missed win, missed block, fork, general.
- Random: `Math.random` behind one function so tests can seed it.

## The coach's words (English drafts, for `strings.js`)

| When | Line |
|---|---|
| Hint, win in one | Put it here and you win! |
| Hint, block | Put it here, or the coach wins. (2 players: or X wins / or O wins) |
| Hint, two ways to win | Put it here. Then you have two ways to win! |
| Hint, two in a row | Make two in a row. Now the coach must block. (2 players: now X / O must block) |
| Hint, stop two ways | Put it here, or the coach gets two ways to win. (2 players: or X / O gets) |
| Hint, middle | Take the middle. It's the best square. |
| Hint, corner | Take a corner. |
| Hint, side | Take a side square. |
| Hint, any | Any square is fine here. |
| Coach moved, block | I blocked you. |
| Coach moved, two ways | I made two ways to win. Can you stop me? |
| Coach moved, two in a row | Two in a row. Block me! |
| Coach moved, stop two ways | I stopped your two ways to win. |
| Coach moved, middle | I took the middle. |
| Coach moved, corner | I took a corner. |
| Coach moved, side | I took a side square. |
| Game start | Stuck? Tap Help me. / You start! / The coach starts. |
| Win | Three in a row. Well done! |
| Draw | see done above |
| Loss, missed win | You had three in a row waiting. Next time, look for it first! |
| Loss, missed block | You could have blocked me. Next time, look at my two in a row. |
| Loss, fork | I made two ways to win. Next time, stop me before that. |
| Loss, general | Next time, try the middle or a corner first. |

Every line is a key in `STRINGS` with `en`, `he`, `pl`. Hebrew and Polish are drafted by the
builder and reviewed by Max in `strings.js`. "Coach" in the brand stays English. The lines for
"two in a row", "stop two ways" and "side" were added after the builder check (Claude's call): the
first reason list could not describe every optimal move, and a hint must never say something
untrue about its square.

## Languages, theme, credits, icon

Taken from Cube Coach as `PLAN.md` says: `LANGS`, `lang`, `useLang`, `t()`, `applyLang`,
`setLang`, `phoneLang`, `refreshLangs`, the flag-over-code switch on the welcome screen, the
theme toggle with its own key and the head script, `paintTheme`, `refreshChrome`, the credits
line (with "Source" pointing at `MaxFokin/tic-tac-toe`), confetti. The favicon is the icon as an
SVG data URI in the template; `apple-touch-icon.png` is the same SVG rendered at 180 px (the
builder picks how, one time, and commits the PNG). The loss screen's grey tokens are an override
on `#app[data-mood="sad"]` in both themes.

## What the tests guarantee

Node (`npm test`):
- Every key exists in every language with matching placeholders (Cube Coach's strings test).
- The winner is found on all eight lines for both marks; a full board with no line is a draw.
- The Hard coach never loses: play it as X and as O against every line of play from the empty
  board. The Medium coach always takes a win in one and always blocks one. The Easy coach's knobs
  are honored with a seeded random.
- From every reachable position, with either mark to move and either mark having started, the
  hint is an empty square, its reason is true of it (a win square wins, a block square is where
  the other player would win, two ways really makes two, two in a row really makes one threat,
  stop two ways really takes the other player's fork square, the middle is the middle, a corner
  is a corner, a side is a side, and "any" only when every empty square is optimal), and a player
  who follows every hint never loses against the Hard coach, as X and as O, starting first or
  second.
- The loss line matches the cause on hand-made histories: a missed win, a missed block, a fork.

Browser (`npm run e2e`, `npm run screens`, `screens.py he|pl`):
- In every language: a single-player game against Hard following Help me to the end never shows
  the loss screen; a 2-player game to a win shows "X wins!" with confetti.
- A reload mid-game lands on the same board and turn; Start over and a reload keep the language,
  the theme and the setup; Random really varies who starts.
- The credits line, the theme toggle, blocked storage and the phone-language pick, as in Cube
  Coach.
- Every screen's English text equals the snapshot; every screen measures at most 640 px tall at
  360 by 640 with the web fonts; Hebrew screens hold no Latin word and Polish screens no English
  word; the board stays left to right in Hebrew.
- `screenshots.py` makes the README's three phone screenshots: welcome, a hint on the board,
  a win.

## Left to the builder

The state shape, the file split in `tests/`, the exact animation timings and the mark SVGs, how
the PNG icon is produced, the grey token values, the seeded random, the floorplan, the README in
Cube Coach's shape, and the plan itself (`docs/superpowers/plans/`). `CLAUDE.md` is the project's
memory and is kept true in the same commit as every change.

## Backlog (not in this version)

Two players with names, bigger boards, a lessons mode (set boards that teach the fork and the
block), a photo of a paper game with a hint for the next move, a replay of the lost game move by
move, a web manifest and service worker.
