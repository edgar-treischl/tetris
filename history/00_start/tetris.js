// Get canvas and drawing context (our game screen)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI elements
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// Game dimensions
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

// Game state
let board = [];
let score = 0;
let currentPiece = null;

// --- Tetrominoes hardcoded instead of loading JSON ---
const pieces = [
  {name:"I", color:"cyan", shape:[[1,1,1,1]]},
  {name:"O", color:"yellow", shape:[[1,1],[1,1]]},
  {name:"T", color:"purple", shape:[[0,1,0],[1,1,1]]},
  {name:"S", color:"green", shape:[[0,1,1],[1,1,0]]},
  {name:"Z", color:"red", shape:[[1,1,0],[0,1,1]]},
  {name:"J", color:"blue", shape:[[1,0,0],[1,1,1]]},
  {name:"L", color:"orange", shape:[[0,0,1],[1,1,1]]}
];

let gameInterval = null;

// Create an empty board
function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Draw the board and placed blocks
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) {
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

// Pick a random tetromino
function randomPiece() {
  const index = Math.floor(Math.random() * pieces.length);
  const p = pieces[index];

  return {
    x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2),
    y: 0,
    shape: p.shape,
    color: p.color
  };
}

// Draw the falling piece
function drawPiece(piece) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        ctx.fillStyle = piece.color;
        ctx.fillRect(
          (piece.x + c) * BLOCK_SIZE,
          (piece.y + r) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        ctx.strokeStyle = "#111";
        ctx.strokeRect(
          (piece.x + c) * BLOCK_SIZE,
          (piece.y + r) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    });
  });
}

// Check for collisions
function collide(piece, offsetX = 0, offsetY = 0) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const x = piece.x + c + offsetX;
        const y = piece.y + r + offsetY;

        if (y >= ROWS || x < 0 || x >= COLS || board[y][x]) {
          return true;
        }
      }
    }
  }
  return false;
}

// Lock piece into the board
function merge(piece) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        board[piece.y + r][piece.x + c] = piece.color;
      }
    });
  });
}

// Clear completed lines
function clearLines() {
  let lines = 0;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      lines++;
      r++;
    }
  }

  if (lines) {
    score += lines * 10;
    scoreEl.textContent = score;
  }
}

// Move piece if possible
function movePiece(dx, dy) {
  if (!collide(currentPiece, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  return false;
}

// Drop piece automatically
function dropPiece() {
  if (!movePiece(0, 1)) {
    merge(currentPiece);
    clearLines();
    currentPiece = randomPiece();

    if (collide(currentPiece)) {
      clearInterval(gameInterval);
      alert("Game Over! Score: " + score);
    }
  }
}

// Draw current frame
function update() {
  drawBoard();
  drawPiece(currentPiece);
}

// Start or restart the game
function initGame() {
  initBoard();
  score = 0;
  scoreEl.textContent = score;
  currentPiece = randomPiece();

  if (gameInterval) clearInterval(gameInterval);

  // Automatic falling only (no player input)
  gameInterval = setInterval(() => {
    dropPiece();
    update();
  }, 500);
}

// Restart button only control
restartBtn.addEventListener('click', initGame);

// --- START GAME IMMEDIATELY ---
initGame();
