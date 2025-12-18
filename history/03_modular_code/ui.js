// ui.js
export function drawBoard(ctx, board, blockSize) {
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c]) {
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c*blockSize, r*blockSize, blockSize, blockSize);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(c*blockSize, r*blockSize, blockSize, blockSize);
      }
    }
  }
}

export function drawPiece(ctx, piece, blockSize) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        ctx.fillStyle = piece.color;
        ctx.fillRect((piece.x + c) * blockSize, (piece.y + r) * blockSize, blockSize, blockSize);
        ctx.strokeStyle = "#111";
        ctx.strokeRect((piece.x + c) * blockSize, (piece.y + r) * blockSize, blockSize, blockSize);
      }
    });
  });
}

export function drawNextPiece(nextCtx, nextPiece) {
  const dpr = window.devicePixelRatio || 1;
  nextCtx.canvas.width = 80 * dpr;
  nextCtx.canvas.height = 80 * dpr;
  nextCtx.setTransform(dpr,0,0,dpr,0,0);
  nextCtx.clearRect(0,0,nextCtx.canvas.width,nextCtx.canvas.height);

  const nextBlockSize = 80 / 4;
  const shape = nextPiece.shape;
  const offsetX = Math.floor((4 - shape[0].length)/2);
  const offsetY = Math.floor((4 - shape.length)/2);

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        nextCtx.fillStyle = nextPiece.color;
        nextCtx.fillRect((c+offsetX)*nextBlockSize, (r+offsetY)*nextBlockSize, nextBlockSize, nextBlockSize);
        nextCtx.strokeStyle = "#111";
        nextCtx.strokeRect((c+offsetX)*nextBlockSize, (r+offsetY)*nextBlockSize, nextBlockSize, nextBlockSize);
      }
    }
  }
}
