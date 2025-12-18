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
import {
  drawBoard,
  drawPiece,
  drawGhostPiece,
  drawNextPiece
} from './ui.js';

/* ---------- DOM Elements ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCtx = document.getElementById('nextCanvas').getContext('2d');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

/* ---------- Audio Elements ---------- */
const bgMusic = document.getElementById('bgMusic');
const lineSound = document.getElementById('lineSound');
const dropSound = document.getElementById('dropSound');

/* ---------- Game Variables ---------- */
let board, currentPiece, nextPiece;
let score = 0;
let lines = 0;
let gameInterval = null;
let gameState = "start"; // start | playing | gameover | paused

/* ---------- Helpers ---------- */
function randomPiece() {
  const p = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    x: Math.floor(boardSettings.cols / 2) -
       Math.floor(p.shape[0].length / 2),
    y: 0,
    shape: p.shape,
    color: p.color
  };
}

function getGhostPiece(piece) {
  const ghost = {
    x: piece.x,
    y: piece.y,
    shape: piece.shape,
    color: piece.color
  };

  while (!collide(ghost, board, 0, 1)) {
    ghost.y++;
  }
  return ghost;
}

/* ---------- Game State Functions ---------- */
function startGame() {
  board = initBoard();
  score = 0;
  lines = 0;
  gameState = "playing";

  scoreEl.textContent = 0;
  linesEl.textContent = 0;
  levelEl.textContent = 1;

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');

  currentPiece = randomPiece();
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);

  resetInterval();
  update();

  // Start background music
  bgMusic.currentTime = 0;
  bgMusic.play();
}

function endGame() {
  clearInterval(gameInterval);
  gameState = "gameover";
  gameOverScreen.classList.remove('hidden');

  // Stop background music
  bgMusic.pause();
}

/* ---------- Movement Functions ---------- */
function move(dx, dy) {
  if (gameState !== "playing") return false;

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
  if (cleared > 0) {
    lineSound.currentTime = 0;
    lineSound.play();
  }

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
    endGame();
  }
}

function drop() {
  if (!move(0, 1)) landPiece();
}

function hardDrop() {
  if (gameState !== "playing") return;

  while (!collide(currentPiece, board, 0, 1)) {
    currentPiece.y++;
  }

  dropSound.currentTime = 0;
  dropSound.play();

  landPiece();
}

/* ---------- Pause / Resume ---------- */
function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
    clearInterval(gameInterval);
    bgMusic.pause();
    update(); // draw current frame
    drawPauseOverlay();
  } else if (gameState === "paused") {
    gameState = "playing";
    resetInterval();
    bgMusic.play();
  }
}

function drawPauseOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  ctx.restore();
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

  if (gameState === "playing" || gameState === "paused") {
    const ghost = getGhostPiece(currentPiece);
    drawGhostPiece(ctx, ghost, boardSettings.blockSize);
    drawPiece(ctx, currentPiece, boardSettings.blockSize);

    if (gameState === "paused") drawPauseOverlay();
  }
}

/* ---------- Input Handling ---------- */
document.addEventListener('keydown', e => {
  if (gameState === "paused" && e.key !== 'p') return;
  if (gameState === "gameover") return;

  if (e.key === 'ArrowLeft') move(-1, 0);
  if (e.key === 'ArrowRight') move(1, 0);
  if (e.key === 'ArrowDown') drop();
  if (e.key === 'ArrowUp') rotate(currentPiece, board);
  if (e.key === ' ') hardDrop();   // SPACE = hard drop
  if (e.key.toLowerCase() === 'p') togglePause();

  update();
});

/* ---------- Button Handling ---------- */
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

/* ---------- Initial Render ---------- */
board = initBoard();
drawBoard(ctx, board, boardSettings.blockSize);
