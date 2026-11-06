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
assert.deepStrictEqual(forkSquares(['X','X','','O','O','','','',''], 'X'), [], 'a winning square is not a fork');
// Any best square never loses: every opponent reply, from both starts.
function neverLoses(board, me, toMove) {
  if (winner(board)) return winner(board).mark === me; if (isFull(board)) return true;
  const squares = toMove === me ? bestSquares(board, me) : empties(board);
  return squares.every((s) => neverLoses(play(board, s, toMove), me, other(toMove)));
}
for (const me of ['X', 'O']) for (const first of ['X', 'O']) assert(neverLoses(emptyBoard(), me, first), `${me} never loses when ${first} starts`);
console.log('game: ok (search)');

// ----- The hint and its reason -----
const { advise, reasonFor, isReason } = require('./load.js');
assert.deepStrictEqual(advise(emptyBoard(), 'X'), { square: 4, reason: 'center' });
assert.deepStrictEqual(advise(['X','','O','','X','','','O',''], 'X'), { square: 8, reason: 'win' });
assert.deepStrictEqual(advise(['X','','O','','O','','','',''], 'X'), { square: 6, reason: 'block' }); // O at 2 and 4 threatens 6
assert.deepStrictEqual(advise(['X','','','','O','','','','X'], 'O').reason, 'twoInRow', 'a side that forces a block stops the fork');
assert.strictEqual(reasonFor(['X','','','','','','','',''], 'O', 4), 'center');
assert.strictEqual(reasonFor(['X','X','','','','','','',''], 'O', 2), 'block');
// Every reachable position, both marks to move, both starts: the hint is a best square, its reason is true, and following hints never loses.
const seen = new Set();
function walk(board, toMove, first) {
  const key = board.map((c) => c || '.').join('') + toMove; if (seen.has(key) || winner(board) || isFull(board)) return; seen.add(key);
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
console.log('game: ok (hints)');

// ----- The three coaches -----
const { coachMove, useRandom } = require('./load.js');
const W = ['X','X','','O','O','','','','']; // X to move wins at 2; O to move wins at 5
const B = ['O','O','','X','','','','','']; // X to move has no win and must block 2
useRandom(() => 0); assert.strictEqual(coachMove(W, 'X', 'easy').square, 2, 'easy takes the win when the dice say so'); assert.strictEqual(coachMove(B, 'X', 'easy').square, 2, 'easy blocks when the dice say so');
useRandom(() => 0.99); assert.notStrictEqual(coachMove(W, 'X', 'easy').square, 2, 'easy misses the win when the dice say so'); assert.notStrictEqual(coachMove(B, 'X', 'easy').square, 2, 'easy misses the block when the dice say so');
useRandom(() => 0.99); assert.strictEqual(coachMove(W, 'O', 'medium').square, 5, 'medium always wins in one'); assert.strictEqual(coachMove(B, 'X', 'medium').square, 2, 'medium always blocks');
let seed = 1; useRandom(() => (seed = (seed * 48271) % 2147483647) / 2147483647);
for (const key of seen) { const board = key.slice(0, 9).split('').map((c) => (c === '.' ? '' : c)), m = key[9]; assert(bestSquares(board, m).includes(coachMove(board, m, 'hard').square), 'hard plays a best square'); }
assert.strictEqual(coachMove(play(emptyBoard(), 0, 'X'), 'O', 'hard').reason, 'center');
useRandom(Math.random);
console.log('game: ok (levels)');

// ----- Why the child lost -----
const { lossReason } = require('./load.js');
const H = (s) => s.split(' ').map((t, i) => ({ mark: i % 2 ? 'O' : 'X', square: +t }));
assert.strictEqual(lossReason(H('0 3 1 4 6 5'), 'X'), 'missedWin');   // X skipped 2
assert.strictEqual(lossReason(H('0 4 8 2 1 6'), 'X'), 'missedBlock'); // X skipped 6
assert.strictEqual(lossReason(H('1 4 7 0 8 6 2 3'), 'X'), 'fork');    // O's 6 made two ways
assert.strictEqual(lossReason([], 'X'), 'general');
console.log('game: ok (loss)');
