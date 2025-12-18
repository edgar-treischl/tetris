const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

let board = [];
let score = 0;
let currentPiece = null;
let pieces = [];
let gameInterval = null;

// Load tetrominoes from JSON
fetch('tetrominoes.json')
  .then(response => response.json())
  .then(data => {
    pieces = data.pieces;
    initGame();
  });

function initBoard() {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

function drawBoard() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(board[r][c]){
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
      }
    }
  }
}

function randomPiece() {
  const index = Math.floor(Math.random()*pieces.length);
  const p = pieces[index];
  return {
    x: Math.floor(COLS/2)-Math.floor(p.shape[0].length/2),
    y: 0,
    shape: p.shape,
    color: p.color
  };
}

function drawPiece(piece) {
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if(cell){
        ctx.fillStyle = piece.color;
        ctx.fillRect((piece.x+c)*BLOCK_SIZE, (piece.y+r)*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "#111";
        ctx.strokeRect((piece.x+c)*BLOCK_SIZE, (piece.y+r)*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function collide(piece, offsetX=0, offsetY=0) {
  for(let r=0;r<piece.shape.length;r++){
    for(let c=0;c<piece.shape[r].length;c++){
      if(piece.shape[r][c]){
        let x = piece.x + c + offsetX;
        let y = piece.y + r + offsetY;
        if(y >= ROWS || x <0 || x >= COLS || board[y][x]){
          return true;
        }
      }
    }
  }
  return false;
}

function merge(piece) {
  piece.shape.forEach((row,r) => {
    row.forEach((cell,c)=>{
      if(cell){
        board[piece.y+r][piece.x+c]=piece.color;
      }
    });
  });
}

function clearLines() {
  let lines = 0;
  for(let r=ROWS-1;r>=0;r--){
    if(board[r].every(cell=>cell)){
      board.splice(r,1);
      board.unshift(Array(COLS).fill(0));
      lines++;
      r++;
    }
  }
  if(lines){
    score += lines*10;
    scoreEl.textContent = score;
  }
}

function rotate(piece){
  const newShape = piece.shape[0].map((_,i)=>piece.shape.map(row=>row[i]).reverse());
  if(!collide({...piece, shape:newShape})){
    piece.shape = newShape;
  }
}

function movePiece(dx,dy){
  if(!collide(currentPiece, dx, dy)){
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  return false;
}

function dropPiece(){
  if(!movePiece(0,1)){
    merge(currentPiece);
    clearLines();
    currentPiece = randomPiece();
    if(collide(currentPiece)){
      clearInterval(gameInterval);
      alert("Game Over! Score: "+score);
    }
  }
}

function update(){
  drawBoard();
  drawPiece(currentPiece);
}

function initGame(){
  initBoard();
  score=0;
  scoreEl.textContent = score;
  currentPiece = randomPiece();
  if(gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(()=>{
    dropPiece();
    update();
  },500);
}

document.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft') movePiece(-1,0);
  if(e.key==='ArrowRight') movePiece(1,0);
  if(e.key==='ArrowDown') dropPiece();
  if(e.key==='ArrowUp') rotate(currentPiece);
  update();
});

restartBtn.addEventListener('click', initGame);
