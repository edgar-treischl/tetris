// rules.js
export function collide(piece, board, offsetX=0, offsetY=0) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        let x = piece.x + c + offsetX;
        let y = piece.y + r + offsetY;
        if (y >= board.length || x < 0 || x >= board[0].length || board[y][x]) {
          return true;
        }
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
  let linesCleared = 0;
  for (let r = board.length - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1);
      board.unshift(Array(board[0].length).fill(0));
      linesCleared++;
      r++;
    }
  }
  return linesCleared;
}

export function rotate(piece, board) {
  const newShape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
  if (!collide({...piece, shape: newShape}, board)) piece.shape = newShape;
}
