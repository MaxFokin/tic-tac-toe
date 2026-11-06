// ===== The game: board, search, levels, hints. No DOM. =====

// ----- The board: nine cells, row by row from the top left; each '' or 'X' or 'O' -----
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const CENTER = 4;
const CORNERS = [0, 2, 6, 8];
const SIDES = [1, 3, 5, 7];
const other = (mark) => (mark === 'X' ? 'O' : 'X');
const emptyBoard = () => Array(9).fill('');
const empties = (board) => board.flatMap((c, i) => (c === '' ? [i] : []));
const isFull = (board) => empties(board).length === 0;
const play = (board, i, mark) => board.map((c, j) => (j === i ? mark : c));
function winner(board) {
  for (const line of LINES) {
    const m = board[line[0]];
    if (m && line.every((i) => board[i] === m)) return { mark: m, line };
  }
  return null;
}

// ----- The search: the whole tree is 5478 positions, so plain minimax with a cache -----
const valueCache = new Map();
// 1 if `mark`, to move, can force a win, 0 a draw, -1 a loss.
function valueOf(board, mark) {
  const w = winner(board);
  if (w) return w.mark === mark ? 1 : -1;
  if (isFull(board)) return 0;
  const key = board.map((c) => c || '.').join('') + mark; // '.' for empty: '' cells would make different boards collide
  if (!valueCache.has(key)) {
    valueCache.set(key, Math.max(...empties(board).map((i) => 0 - valueOf(play(board, i, mark), other(mark)))));
  }
  return valueCache.get(key);
}
// Every empty square with its value from `mark`'s view after playing it.
const moveValues = (board, mark) =>
  empties(board).map((square) => ({ square, value: 0 - valueOf(play(board, square, mark), other(mark)) }));
function bestSquares(board, mark) {
  const values = moveValues(board, mark);
  const top = Math.max(...values.map((m) => m.value));
  return values.filter((m) => m.value === top).map((m) => m.square);
}
// Empty squares where `mark` completes three.
const threats = (board, mark) => empties(board).filter((i) => winner(play(board, i, mark))?.mark === mark);
// Empty squares where playing `mark` leaves two or more threats.
const forkSquares = (board, mark) => empties(board).filter((i) => threats(play(board, i, mark), mark).length >= 2);
