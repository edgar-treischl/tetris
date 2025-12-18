// tetra.js
import { pieces } from './pieces.js';
import { boardSettings, initBoard } from './board.js';
import { collide, merge, clearLines, rotate } from './rules.js';
import { drawBoard, drawPiece, drawNextPiece } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

let board, currentPiece, nextPiece, score, gameInterval;

// --- Random piece ---
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
function movePiece(dx, dy) {
  if (!collide(currentPiece, board, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  return false;
}

// --- Drop piece ---
function dropPiece() {
  if (!movePiece(0,1)) {
    merge(currentPiece, board);
    score += clearLines(board) * 10;
    scoreEl.textContent = score;
    currentPiece = nextPiece;
    nextPiece = randomPiece();
    drawNextPiece(nextCtx, nextPiece);
    if (collide(currentPiece, board)) {
      clearInterval(gameInterval);
      alert("Game Over! Score: "+score);
    }
  }
}

// --- Update ---
function update() {
  drawBoard(ctx, board, boardSettings.blockSize);
  drawPiece(ctx, currentPiece, boardSettings.blockSize);
}

// --- Init game ---
function initGame() {
  board = initBoard();
  score = 0;
  scoreEl.textContent = score;
  currentPiece = randomPiece();
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    dropPiece();
    update();
  }, 500);
}

// --- Keyboard ---
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') movePiece(-1,0);
  if (e.key === 'ArrowRight') movePiece(1,0);
  if (e.key === 'ArrowDown') dropPiece();
  if (e.key === 'ArrowUp') rotate(currentPiece, board);
  update();
});

// --- Restart ---
restartBtn.addEventListener('click', initGame);

// --- Start ---
initGame();
