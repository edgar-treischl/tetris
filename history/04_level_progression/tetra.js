// tetra.js (updated snippet)
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
const restartBtn = document.getElementById('restartBtn');

let board, currentPiece, nextPiece;
let score = 0;
let lines = 0;
let gameInterval;

function randomPiece() {
  const p = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    x: Math.floor(boardSettings.cols / 2) - Math.floor(p.shape[0].length / 2),
    y: 0,
    shape: p.shape,
    color: p.color
  };
}

function move(dx, dy) {
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
    clearInterval(gameInterval);
    alert("Game Over!");
  }
}

function drop() {
  if (!move(0, 1)) landPiece();
}

function resetInterval() {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    drop();
    update();
  }, getDropInterval(lines));
}

function update() {
  drawBoard(ctx, board, boardSettings.blockSize);
  drawPiece(ctx, currentPiece, boardSettings.blockSize);
}

function initGame() {
  board = initBoard();
  score = 0;
  lines = 0;

  scoreEl.textContent = 0;
  linesEl.textContent = 0;
  levelEl.textContent = 1;

  currentPiece = randomPiece();
  nextPiece = randomPiece();
  drawNextPiece(nextCtx, nextPiece);

  resetInterval();
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move(-1, 0);
  if (e.key === 'ArrowRight') move(1, 0);
  if (e.key === 'ArrowDown') drop();
  if (e.key === 'ArrowUp') rotate(currentPiece, board);
  update();
});

restartBtn.addEventListener('click', initGame);

initGame();
