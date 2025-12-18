// ui.js
// ---------- Basic block drawing ----------
function drawBlock(ctx, x, y, size, color, alpha = 1) {
  ctx.globalAlpha = alpha; // Set transparency for ghost pieces or normal blocks

  // Fill the block
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);

  // Top-left highlight (simulate light)
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();

  // Bottom-right shadow (simulate depth)
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  ctx.globalAlpha = 1; // Reset alpha for next drawing
}

/* ---------- Board drawing ---------- */
export function drawBoard(ctx, board, blockSize) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const x = c * blockSize;
      const y = r * blockSize;

      if (board[r][c]) {
        drawBlock(ctx, x, y, blockSize, board[r][c]); // Draw placed blocks
      } else {
        // Draw faint grid lines for empty cells
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.strokeRect(x, y, blockSize, blockSize);
      }
    }
  }
}

/* ---------- Ghost piece ---------- */
export function drawGhostPiece(ctx, piece, blockSize) {
  // Loop through the shape array
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return; // Skip empty cells

      const x = (piece.x + c) * blockSize;
      const y = (piece.y + r) * blockSize;

      // Draw with transparency (alpha 0.25)
      drawBlock(ctx, x, y, blockSize, piece.color, 0.25);
    });
  });
}

/* ---------- Active piece ---------- */
export function drawPiece(ctx, piece, blockSize) {
  // Normal drawing for the currently falling piece
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return;

      const x = (piece.x + c) * blockSize;
      const y = (piece.y + r) * blockSize;

      drawBlock(ctx, x, y, blockSize, piece.color); // Fully opaque
    });
  });
}

/* ---------- Next piece preview ---------- */
let previewInitialized = false;

export function drawNextPiece(ctx, piece) {
  const PREVIEW_SIZE = Number(ctx.canvas.dataset.size || 80);
  const GRID = 4; // 4x4 preview grid
  const BLOCK = PREVIEW_SIZE / GRID;
  const dpr = window.devicePixelRatio || 1;

  if (!previewInitialized) {
    // Scale canvas for high-DPI screens
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

  // Draw each block in the next piece preview
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return;

      drawBlock(
        ctx,
        (c + offsetX) * BLOCK,
        (r + offsetY) * BLOCK,
        BLOCK,
        piece.color
      );
    });
  });
}

