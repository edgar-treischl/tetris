// rules.js
export const levelRules = {
  baseInterval: 500,
  linesPerLevel: 5,
  speedStep: 50,
  minInterval: 100
};

export function getLevel(lines) {
  return Math.floor(lines / levelRules.linesPerLevel) + 1;
}

export function getDropInterval(lines) {
  const level = getLevel(lines) - 1;
  return Math.max(
    levelRules.baseInterval - level * levelRules.speedStep,
    levelRules.minInterval
  );
}

export function collide(piece, board, dx = 0, dy = 0) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;

      const x = piece.x + c + dx;
      const y = piece.y + r + dy;

      if (
        y >= board.length ||
        x < 0 ||
        x >= board[0].length ||
        board[y][x]
      ) {
        return true;
      }
    }
  }
  return false;
}

export function merge(piece, board) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) board[piece.y + r][piece.x + c] = piece.color;
    });
  });
}

export function clearLines(board) {
  let cleared = 0;

  for (let r = board.length - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1);
      board.unshift(Array(board[0].length).fill(0));
      cleared++;
      r++;
    }
  }
  return cleared;
}

export function rotate(piece, board) {
  const rotated = piece.shape[0].map((_, i) =>
    piece.shape.map(row => row[i]).reverse()
  );

  if (!collide({ ...piece, shape: rotated }, board)) {
    piece.shape = rotated;
  }
}


