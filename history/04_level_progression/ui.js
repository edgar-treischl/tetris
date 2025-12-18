// ui.js

export function drawBoard(ctx, board, size) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c]) {
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c * size, r * size, size, size);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(c * size, r * size, size, size);
      }
    }
  }
}

export function drawPiece(ctx, piece, size) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        ctx.fillStyle = piece.color;
        ctx.fillRect(
          (piece.x + c) * size,
          (piece.y + r) * size,
          size,
          size
        );
        ctx.strokeStyle = "#111";
        ctx.strokeRect(
          (piece.x + c) * size,
          (piece.y + r) * size,
          size,
          size
        );
      }
    });
  });
}

let previewInitialized = false;

export function drawNextPiece(ctx, piece) {
  const PREVIEW_SIZE = Number(ctx.canvas.dataset.size); // 80
  const GRID = 4;
  const BLOCK = PREVIEW_SIZE / GRID;
  const dpr = window.devicePixelRatio || 1;

  // Initialize ONCE
  if (!previewInitialized) {
    ctx.canvas.style.width = PREVIEW_SIZE + "px";
    ctx.canvas.style.height = PREVIEW_SIZE + "px";
    ctx.canvas.width = PREVIEW_SIZE * dpr;
    ctx.canvas.height = PREVIEW_SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    previewInitialized = true;
  }

  ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

  const offsetX = Math.floor((GRID - piece.shape[0].length) / 2);
  const offsetY = Math.floor((GRID - piece.shape.length) / 2);

  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        ctx.fillStyle = piece.color;
        ctx.fillRect(
          (c + offsetX) * BLOCK,
          (r + offsetY) * BLOCK,
          BLOCK,
          BLOCK
        );
        ctx.strokeStyle = "#111";
        ctx.strokeRect(
          (c + offsetX) * BLOCK,
          (r + offsetY) * BLOCK,
          BLOCK,
          BLOCK
        );
      }
    });
  });
}
