// board.js
export const boardSettings = {
  rows: 20,
  cols: 10,
  blockSize: 20
};

export function initBoard(rows = boardSettings.rows, cols = boardSettings.cols) {
  return Array.from({length: rows}, () => Array(cols).fill(0));
}
