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

// ----- The search -----
const { valueOf, moveValues, bestSquares, threats, forkSquares } = require('./load.js');
assert.strictEqual(valueOf(emptyBoard(), 'X'), 0);
assert.deepStrictEqual(bestSquares(play(emptyBoard(), 0, 'X'), 'O'), [4], 'only the middle answers a corner');
const X08 = ['X','','','','O','','','','X'];
assert.deepStrictEqual(forkSquares(X08, 'X'), [2, 6]);
assert.deepStrictEqual(bestSquares(X08, 'O'), [1, 3, 5, 7], 'only a side stops the fork');
assert.deepStrictEqual(threats(['X','X','','','','','','',''], 'X'), [2]);
assert.strictEqual(moveValues(X08, 'O').length, 6);
// Any best square never loses: every opponent reply, from both starts.
function neverLoses(board, me, toMove) {
  if (winner(board)) return winner(board).mark === me; if (isFull(board)) return true;
  const squares = toMove === me ? bestSquares(board, me) : empties(board);
  return squares.every((s) => neverLoses(play(board, s, toMove), me, other(toMove)));
}
for (const me of ['X', 'O']) for (const first of ['X', 'O']) assert(neverLoses(emptyBoard(), me, first), `${me} never loses when ${first} starts`);
console.log('game: ok (search)');
