// Loads the app's source modules into Node for testing. The modules are plain top-level
// declarations (no exports), exactly as they're inlined into index.html, so they're run
// inside a function body and the names tests need are returned.
const fs = require('fs');
const path = require('path');
const src = (n) => fs.readFileSync(path.join(__dirname, '..', 'src', n), 'utf8');
const code = src('game.js') + src('strings.js') + `
return { LINES, CENTER, CORNERS, SIDES, other, emptyBoard, empties, isFull, play, winner,
  valueOf, moveValues, bestSquares, threats, forkSquares,
  REASONS, isReason, reasonFor, advise, EASY_WIN, EASY_BLOCK, useRandom, coachMove, lossReason,
  STRINGS, LANGS, t, useLang };`;
module.exports = new Function(code)();
