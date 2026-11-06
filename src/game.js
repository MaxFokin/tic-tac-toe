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
