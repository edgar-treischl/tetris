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
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');

// ---------- NEW: start screen elements ----------
const startScreen = document.getElementById('startScreen'); // NEW
const gameOverScreen = document.getElementById('gameOver'); // reused from previous version
const startBtn = document.getElementById('startBtn');       // NEW button for starting game
const restartBtn = document.getElementById('restartBtn');

let board, currentPiece, nextPiece;
let score = 0;
let lines = 0;
let gameInterval = null;
let gameState = "start"; // UPDATED: replaced isGameOver with a more flexible state: start | playing | gameover

/* ---------- Helpers ---------- */

function randomPiece() {
  const p = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    x: Math.floor(boardSettings.cols / 2) - Math.floor(p.shape[0].length / 2),
    y: 0,
    shape: p.shape,
    color: p.color
  };
}

// ---------- NEW: startGame() replaces initGame() ----------
function startGame() {
  board = initBoard();
  score = 0;
  lines = 0;
  gameState = "playing"; // UPDATED: now tracks playing state

  scoreEl.textContent = 0;
  linesEl.textContent = 0;
  levelEl.textContent = 1;

  // ---------- NEW: hide start screen when game begins ----------
  startScreen.classList.add('hidden'); 
  gameOverScreen.classList.add('hidden'); // hide game over screen too

  currentPiece = randomPiece();
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);

  resetInterval();
  update();
}

// ---------- endGame() updated for gameState ----------
function endGame() {
  clearInterval(gameInterval);
  gameState = "gameover";                // UPDATED: replaces isGameOver
  gameOverScreen.classList.remove('hidden'); // NEW: shows the fancy game over screen
}

/* ---------- Movement ---------- */

function move(dx, dy) {
  if (gameState !== "playing") return false; // UPDATED: uses gameState check

  if (!collide(currentPiece, board, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  return false;
}

function landPiece() {
  merge(currentPiece, board);

  const cleared = clearLines(board);
  lines += cleared;
  score += cleared * 10;

  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = getLevel(lines);

  resetInterval();

  currentPiece = nextPiece;
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);

  if (collide(currentPiece, board)) {
    endGame(); // UPDATED: uses new endGame logic
  }
}

function drop() {
  if (!move(0, 1)) landPiece();
}

/* ---------- Game Loop ---------- */

function resetInterval() {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    drop();
    update();
  }, getDropInterval(lines));
}

function update() {
  drawBoard(ctx, board, boardSettings.blockSize);
  if (gameState === "playing") {       // UPDATED: only draw current piece if playing
    drawPiece(ctx, currentPiece, boardSettings.blockSize);
  }
}

/* ---------- Input ---------- */

document.addEventListener('keydown', e => {
  if (gameState !== "playing") return; // UPDATED: block input if not playing

  if (e.key === 'ArrowLeft') move(-1, 0);
  if (e.key === 'ArrowRight') move(1, 0);
  if (e.key === 'ArrowDown') drop();
  if (e.key === 'ArrowUp') rotate(currentPiece, board);

  update();
});

/* ---------- Buttons ---------- */

// ---------- NEW: start button ----------
startBtn.addEventListener('click', startGame); 
restartBtn.addEventListener('click', startGame); // UPDATED: restart now also calls startGame()

/* ---------- Initial draw ---------- */

// ---------- NEW: initial board draw for start screen ----------
board = initBoard();
drawBoard(ctx, board, boardSettings.blockSize);
