// --- Main canvas and next piece canvas ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas'); // NEW: canvas for next piece preview
const nextCtx = nextCanvas.getContext('2d');
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
let nextPiece = null;       // NEW: store upcoming piece
let gameInterval = null;

// --- Tetrominoes
const pieces = [
  {name:"I", color:"cyan", shape:[[1,1,1,1]]},
  {name:"O", color:"yellow", shape:[[1,1],[1,1]]},
  {name:"T", color:"purple", shape:[[0,1,0],[1,1,1]]},
  {name:"S", color:"green", shape:[[0,1,1],[1,1,0]]},
  {name:"Z", color:"red", shape:[[1,1,0],[0,1,1]]},
  {name:"J", color:"blue", shape:[[1,0,0],[1,1,1]]},
  {name:"L", color:"orange", shape:[[0,0,1],[1,1,1]]}
];

// --- Initialize board
function initBoard() {
  board = Array.from({length: ROWS}, ()=>Array(COLS).fill(0));
}

// --- Draw main board ---
function drawBoard() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(board[r][c]){
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        ctx.strokeStyle="#111";
        ctx.strokeRect(c*BLOCK_SIZE,r*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
      }
    }
  }
}

// --- Draw a piece ---
// UPDATED: accepts a context so we can use it for next piece preview
function drawPiece(piece, context=ctx) {
  piece.shape.forEach((row,r)=>{
    row.forEach((cell,c)=>{
      if(cell){
        context.fillStyle = piece.color;
        context.fillRect((piece.x+c)*BLOCK_SIZE,(piece.y+r)*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        context.strokeStyle="#111";
        context.strokeRect((piece.x+c)*BLOCK_SIZE,(piece.y+r)*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
      }
    });
  });
}

// --- Draw next piece preview
function drawNextPiece(){
  const dpr = window.devicePixelRatio || 1;
  nextCanvas.width = 80 * dpr;
  nextCanvas.height = 80 * dpr;
  nextCtx.setTransform(dpr,0,0,dpr,0,0); // scale context for sharp lines
  nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);

  const nextBlockSize = 80 / 4; // logical 4x4 grid
  const shape = nextPiece.shape;
  const offsetX = Math.floor((4 - shape[0].length)/2);
  const offsetY = Math.floor((4 - shape.length)/2);

  for(let r=0;r<shape.length;r++){
    for(let c=0;c<shape[r].length;c++){
      if(shape[r][c]){
        nextCtx.fillStyle = nextPiece.color;
        nextCtx.fillRect((c+offsetX)*nextBlockSize,(r+offsetY)*nextBlockSize,nextBlockSize,nextBlockSize);
        nextCtx.strokeStyle = "#111";
        nextCtx.strokeRect((c+offsetX)*nextBlockSize,(r+offsetY)*nextBlockSize,nextBlockSize,nextBlockSize);
      }
    }
  }
}

// --- Random piece ---
function randomPiece(){
  const index = Math.floor(Math.random()*pieces.length);
  const p = pieces[index];
  return {
    x: Math.floor(COLS/2)-Math.floor(p.shape[0].length/2),
    y:0,
    shape:p.shape,
    color:p.color
  };
}

// --- Collision ---
function collide(piece, offsetX=0, offsetY=0){
  for(let r=0;r<piece.shape.length;r++){
    for(let c=0;c<piece.shape[r].length;c++){
      if(piece.shape[r][c]){
        let x = piece.x+c+offsetX;
        let y = piece.y+r+offsetY;
        if(y>=ROWS || x<0 || x>=COLS || board[y][x]){
          return true;
        }
      }
    }
  }
  return false;
}

// --- Merge ---
function merge(piece){
  piece.shape.forEach((row,r)=>{
    row.forEach((cell,c)=>{
      if(cell){
        board[piece.y+r][piece.x+c]=piece.color;
      }
    });
  });
}

// --- Clear lines ---
function clearLines(){
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

// --- Rotate piece ---
function rotate(piece){
  const newShape = piece.shape[0].map((_,i)=>piece.shape.map(row=>row[i]).reverse());
  if(!collide({...piece, shape:newShape})){
    piece.shape = newShape;
  }
}

// --- Move piece ---
function movePiece(dx,dy){
  if(!collide(currentPiece,dx,dy)){
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  return false;
}

// --- Drop piece ---
function dropPiece(){
  if(!movePiece(0,1)){
    merge(currentPiece);
    clearLines();
    currentPiece = nextPiece;        // UPDATED: current becomes next
    nextPiece = randomPiece();       // UPDATED: generate new next piece
    drawNextPiece();                 // UPDATED: show new next piece
  }
}

// --- Update ---
function update(){
  drawBoard();
  drawPiece(currentPiece);
}

// --- Init game ---
function initGame(){
  initBoard();
  score=0;
  scoreEl.textContent = score;
  currentPiece=randomPiece();
  nextPiece=randomPiece();  // NEW: initialize next piece
  drawNextPiece();           // NEW: draw first preview
  if(gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(()=>{
    dropPiece();
    update();
  },500);
}

// --- Keyboard controls ---
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft') movePiece(-1,0);
  if(e.key==='ArrowRight') movePiece(1,0);
  if(e.key==='ArrowDown') dropPiece();
  if(e.key==='ArrowUp') rotate(currentPiece);
  update();
});

// --- Restart ---
restartBtn.addEventListener('click', initGame);

// --- Start game ---
initGame();
