// ui.js
// All rendering logic only (no game rules here)

/* ---------- Shared block renderer ---------- */

function drawBlock(ctx, x, y, size, color) {
  // Main fill
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);

  // Highlight (top + left)
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();

  // Shadow (right + bottom)
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
}

/* ---------- Main board ---------- */

export function drawBoard(ctx, board, blockSize) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const x = c * blockSize;
      const y = r * blockSize;

      if (board[r][c]) {
        drawBlock(ctx, x, y, blockSize, board[r][c]);
      } else {
        // Faint grid for empty cells
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.strokeRect(x, y, blockSize, blockSize);
      }
    }
  }
}

/* ---------- Falling piece ---------- */

export function drawPiece(ctx, piece, blockSize) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return;

      const x = (piece.x + c) * blockSize;
      const y = (piece.y + r) * blockSize;

      drawBlock(ctx, x, y, blockSize, piece.color);
    });
  });
}

/* ---------- Next piece preview ---------- */

let previewInitialized = false;

export function drawNextPiece(ctx, piece) {
  const PREVIEW_SIZE = Number(ctx.canvas.dataset.size || 80);
  const GRID = 4;
  const BLOCK = PREVIEW_SIZE / GRID;
  const dpr = window.devicePixelRatio || 1;

  // Initialize preview canvas ONCE
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
      if (!cell) return;

      const x = (c + offsetX) * BLOCK;
      const y = (r + offsetY) * BLOCK;

      drawBlock(ctx, x, y, BLOCK, piece.color);
    });
  });
}
