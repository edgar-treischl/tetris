// rules.js
// --- Level progression rules added ---
// These define how the game speeds up as the player clears lines
export const levelRules = {
  baseInterval: 500,     // starting drop interval in ms
  linesPerLevel: 5,      // every 5 cleared lines, level increases
  speedStep: 50,         // drop interval decreases by 50ms per level
  minInterval: 100       // minimum drop interval
};

// --- New: calculate current level based on cleared lines ---
export function getLevel(lines) {
  // Level increases every `linesPerLevel` lines
  return Math.floor(lines / levelRules.linesPerLevel) + 1;
}

// --- New: calculate drop interval based on lines / level ---
// This implements the "blocks move faster after 5 lines" rule
export function getDropInterval(lines) {
  const level = getLevel(lines) - 1; // level 0 = base speed
  return Math.max(
    levelRules.baseInterval - level * levelRules.speedStep,
    levelRules.minInterval // don't go below min interval
  );
}

// --- Modularized game rules: collision detection ---
export function collide(piece, board, dx = 0, dy = 0) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;

      const x = piece.x + c + dx;
      const y = piece.y + r + dy;

      if (
        y >= board.length ||  // hit bottom
        x < 0 || x >= board[0].length || // hit sides
        board[y][x] // hit placed blocks
      ) {
        return true;
      }
    }
  }
  return false;
}

// --- Merge piece into the board ---
export function merge(piece, board) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) board[piece.y + r][piece.x + c] = piece.color;
    });
  });
}

// --- Clear full lines from the board ---
export function clearLines(board) {
  let cleared = 0;

  for (let r = board.length - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1); // remove line
      board.unshift(Array(board[0].length).fill(0)); // add empty line on top
      cleared++;
      r++; // recheck this row index
    }
  }

  return cleared; // return number of cleared lines for scoring / speed
}

// --- Rotate piece if possible ---
export function rotate(piece, board) {
  const rotated = piece.shape[0].map((_, i) =>
    piece.shape.map(row => row[i]).reverse()
  );

  if (!collide({ ...piece, shape: rotated }, board)) {
    piece.shape = rotated;
  }
}


