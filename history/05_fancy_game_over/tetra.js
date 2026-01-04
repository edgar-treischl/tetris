import { pieces } from './pieces.js';
import { boardSettings, initBoard } from './board.js';
import {
  collide,
  merge,
  clearLines,
  rotate,
  getDropInterval,
  getLevel
} from './rules.js';
import { drawBoard, drawPiece, drawNextPiece } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCtx = document.getElementById('nextCanvas').getContext('2d');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level'); // NEW: display current level
const linesEl = document.getElementById('lines'); // NEW: display total lines
const restartBtn = document.getElementById('restartBtn');
const gameOverEl = document.getElementById('gameOver'); // NEW: element for fancy game over message

let board, currentPiece, nextPiece;
let score = 0;
let lines = 0;
let gameInterval = null;
let isGameOver = false; // NEW: game state flag

// --- Random piece ---
function randomPiece() {
  const p = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    x: Math.floor(boardSettings.cols / 2) - Math.floor(p.shape[0].length / 2),
    y: 0,
    shape: p.shape,
    color: p.color
  };
}

// --- Move piece ---
function move(dx, dy) {
  if (isGameOver) return false; // UPDATED: prevent moving after game over
  if (!collide(currentPiece, board, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  return false;
}

// --- Game over handler ---
function endGame() {
  clearInterval(gameInterval);      // stop falling pieces
  isGameOver = true;                // NEW: set game state
  gameOverEl.classList.remove('hidden'); // NEW: show fancy game over element
}

// --- Land piece ---
function landPiece() {
  merge(currentPiece, board);
  const cleared = clearLines(board);
  lines += cleared;                 // UPDATED: track total lines
  score += cleared * 10;

  scoreEl.textContent = score;
  linesEl.textContent = lines;      // UPDATED: show total lines
  levelEl.textContent = getLevel(lines); // UPDATED: show current level

  resetInterval();                   // UPDATED: adjust drop speed dynamically

  currentPiece = nextPiece;
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);

  if (collide(currentPiece, board)) {
    endGame();                       // UPDATED: call new game over handler
  }
}

// --- Drop piece ---
function drop() {
  if (!move(0, 1)) landPiece();
}

// --- Reset interval based on current level / lines ---
function resetInterval() {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    drop();
    update();
  }, getDropInterval(lines));       // UPDATED: speed now depends on lines cleared
}

// --- Draw/update board ---
function update() {
  drawBoard(ctx, board, boardSettings.blockSize);
  drawPiece(ctx, currentPiece, boardSettings.blockSize);
}

// --- Initialize game ---
function initGame() {
  board = initBoard();
  score = 0;
  lines = 0;
  isGameOver = false;               // NEW: reset game state

  scoreEl.textContent = 0;
  linesEl.textContent = 0;          // NEW: reset lines display
  levelEl.textContent = 1;          // NEW: reset level display

  gameOverEl.classList.add('hidden'); // NEW: hide game over element

  currentPiece = randomPiece();
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);

  resetInterval();
  update();
}

// --- Keyboard controls ---
document.addEventListener('keydown', e => {
  if (isGameOver) return;           // UPDATED: ignore input after game over

  if (e.key === 'ArrowLeft') move(-1, 0);
  if (e.key === 'ArrowRight') move(1, 0);
  if (e.key === 'ArrowDown') drop();
  if (e.key === 'ArrowUp') rotate(currentPiece, board);

  update();
});

// --- Restart button ---
restartBtn.addEventListener('click', initGame);

initGame();
