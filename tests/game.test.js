// The game logic: board, search, levels, hints. Sections are appended by later tasks.
const assert = require('assert');
const { LINES, emptyBoard, empties, isFull, play, winner, other } = require('./load.js');

// ----- The board -----
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
console.log('game: ok (board)');
