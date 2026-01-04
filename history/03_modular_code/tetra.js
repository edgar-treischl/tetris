// ===========================
// TETRIS MODULAR VERSION
// ===========================

// --- Module imports ---
// Instead of having everything in one file, the game logic is split into modules:
// pieces.js       → defines all Tetromino shapes and colors
// board.js        → board settings and board initialization
// rules.js        → collision, merge, line clearing, rotation
// ui.js           → drawing functions for main board, falling piece, next piece
import { pieces } from './pieces.js';
import { boardSettings, initBoard } from './board.js';
import { collide, merge, clearLines, rotate } from './rules.js';
import { drawBoard, drawPiece, drawNextPiece } from './ui.js';

// --- Canvas & UI elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// --- Game state ---
let board, currentPiece, nextPiece, score, gameInterval;

// ===========================
// GAME FUNCTIONS
// ===========================

// --- Random piece ---
// Same as before, now uses boardSettings from board module
function randomPiece() {
  const index = Math.floor(Math.random() * pieces.length);
  const p = pieces[index];
  return {
    x: Math.floor(boardSettings.cols / 2) - Math.floor(p.shape[0].length/2),
    y: 0,
    shape: p.shape,
    color: p.color
  };
}

// --- Move piece ---
// Uses collide from rules.js
function movePiece(dx, dy) {
  if (!collide(currentPiece, board, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  return false;
}

// --- Drop piece ---
// Now fully modular: merge and clearLines come from rules.js
function dropPiece() {
  if (!movePiece(0,1)) {
    merge(currentPiece, board);
    score += clearLines(board) * 10;
    scoreEl.textContent = score;
    currentPiece = nextPiece;
    nextPiece = randomPiece();
    drawNextPiece(nextCtx, nextPiece);  // uses ui.js
    if (collide(currentPiece, board)) {
      clearInterval(gameInterval);
      alert("Game Over! Score: "+score);
    }
  }
}

// --- Update / Draw ---
function update() {
  drawBoard(ctx, board, boardSettings.blockSize);   // main board
  drawPiece(ctx, currentPiece, boardSettings.blockSize); // current piece
}

// --- Initialize game ---
function initGame() {
  board = initBoard();          // from board.js
  score = 0;
  scoreEl.textContent = score;
  currentPiece = randomPiece();
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);  // first preview
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    dropPiece();
    update();
  }, 500);
}

// --- Keyboard controls ---
// Same as Version 2 but now calls modular rotate from rules.js
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') movePiece(-1,0);
  if (e.key === 'ArrowRight') movePiece(1,0);
  if (e.key === 'ArrowDown') dropPiece();
  if (e.key === 'ArrowUp') rotate(currentPiece, board); // modular
  update();
});

// --- Restart ---
restartBtn.addEventListener('click', initGame);

// --- Start game ---
initGame();
