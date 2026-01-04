// ===========================
// TETRIS VERSION 0 - DOCUMENTED
// ===========================

// --- HTML elements ---
// Get the canvas and its drawing context (our game screen)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get UI elements for score display and restart button
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// --- Game dimensions ---
// How many rows and columns in the Tetris grid
const ROWS = 20;
const COLS = 10;
// Size of each block in pixels
const BLOCK_SIZE = 20;

// --- Game state variables ---
let board = [];           // 2D array for the game board
let score = 0;            // Player score
let currentPiece = null;  // The piece currently falling
let gameInterval = null;  // Interval for automatic dropping

// --- Tetrominoes (Tetris pieces) ---
// Each piece has a name, color, and a 2D array shape
const pieces = [
  {name:"I", color:"cyan", shape:[[1,1,1,1]]},
  {name:"O", color:"yellow", shape:[[1,1],[1,1]]},
  {name:"T", color:"purple", shape:[[0,1,0],[1,1,1]]},
  {name:"S", color:"green", shape:[[0,1,1],[1,1,0]]},
  {name:"Z", color:"red", shape:[[1,1,0],[0,1,1]]},
  {name:"J", color:"blue", shape:[[1,0,0],[1,1,1]]},
  {name:"L", color:"orange", shape:[[0,0,1],[1,1,1]]}
];

// ===========================
// BOARD FUNCTIONS
// ===========================

// Create an empty board with 0s
function initBoard() {
  // Array.from creates an array with ROWS number of rows
  // Each row is an array of COLS zeros (empty cells)
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Draw the board and all placed blocks
function drawBoard() {
  // Clear the canvas for redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Loop through all rows and columns
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) {
        // Draw a colored block if the cell is not 0
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        // Draw a border around the block
        ctx.strokeStyle = "#111";
        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

// ===========================
// PIECE FUNCTIONS
// ===========================

// Pick a random tetromino from the pieces array
function randomPiece() {
  const index = Math.floor(Math.random() * pieces.length);
  const p = pieces[index];

  return {
    // Start roughly in the middle of the board horizontally
    x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2),
    y: 0,            // Start at the top
    shape: p.shape,  // 2D array for shape
    color: p.color   // Color for drawing
  };
}

// Draw the currently falling piece
function drawPiece(piece) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        // Draw colored block
        ctx.fillStyle = piece.color;
        ctx.fillRect(
          (piece.x + c) * BLOCK_SIZE,
          (piece.y + r) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        // Draw border
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

// ===========================
// COLLISION & MOVEMENT
// ===========================

// Check if the piece collides with walls or other blocks
function collide(piece, offsetX = 0, offsetY = 0) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const x = piece.x + c + offsetX;
        const y = piece.y + r + offsetY;

        // Collision if outside board or cell already filled
        if (y >= ROWS || x < 0 || x >= COLS || board[y][x]) {
          return true;
        }
      }
    }
  }
  return false;
}

// Lock piece into the board permanently
function merge(piece) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        board[piece.y + r][piece.x + c] = piece.color;
      }
    });
  });
}

// Remove full lines and update score
function clearLines() {
  let lines = 0;

  // Start from bottom row and go up
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell)) {
      // Remove full line
      board.splice(r, 1);
      // Add empty row at the top
      board.unshift(Array(COLS).fill(0));
      lines++;
      r++; // Check the same row again after shifting
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

// Automatically drop piece one row
function dropPiece() {
  if (!movePiece(0, 1)) {
    // Piece cannot move down → lock into board
    merge(currentPiece);
    clearLines();
    currentPiece = randomPiece();

    // Check if new piece collides immediately → Game Over
    if (collide(currentPiece)) {
      clearInterval(gameInterval);
      alert("Game Over! Score: " + score);
    }
  }
}

// ===========================
// GAME LOOP
// ===========================

// Draw the current frame
function update() {
  drawBoard();
  drawPiece(currentPiece);
}

// ===========================
// START / RESTART GAME
// ===========================

function initGame() {
  initBoard();            // Reset board
  score = 0;              // Reset score
  scoreEl.textContent = score;
  currentPiece = randomPiece(); // Pick new piece

  if (gameInterval) clearInterval(gameInterval);

  // Automatic falling only (no player input yet)
  gameInterval = setInterval(() => {
    dropPiece();
    update();
  }, 500);
}

// Restart button only control
restartBtn.addEventListener('click', initGame);

// --- START GAME IMMEDIATELY ---
initGame();
