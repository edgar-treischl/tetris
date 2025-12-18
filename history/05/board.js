// board.js
export const boardSettings = {
  rows: 20,
  cols: 10,
  blockSize: 20
};

export function initBoard() {
  return Array.from(
    { length: boardSettings.rows },
    () => Array(boardSettings.cols).fill(0)
  );
}
