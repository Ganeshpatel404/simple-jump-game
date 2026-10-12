const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const pauseButton = document.getElementById('pause');
const restartButton = document.getElementById('restart');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayCopy = document.getElementById('overlay-copy');
const overlayAction = document.getElementById('overlay-action');

const gridSize = 20;
const tileSize = canvas.width / gridSize;
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};
const highScoreKey = 'simple-snake-high-score';

let snake;
let food;
let direction;
let nextDirection;
let score;
let highScore = Number.parseInt(localStorage.getItem(highScoreKey) || '0', 10);
let gameOver;
let paused;

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = directions.right;
  nextDirection = direction;
  score = 0;
  gameOver = false;
  paused = false;
  pauseButton.textContent = 'Pause';
  overlay.hidden = true;
  placeFood();
  updateScore();
  draw();
}

function updateScore() {
  scoreElement.textContent = String(score);
  highScoreElement.textContent = String(highScore);
}

function placeFood() {
  const openTiles = [];
  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) {
        openTiles.push({ x, y });
      }
    }
  }
  food = openTiles[Math.floor(Math.random() * openTiles.length)];
}

function setDirection(name) {
  const candidate = directions[name];
  if (!candidate || candidate.x + direction.x === 0 && candidate.y + direction.y === 0) {
    return;
  }
  nextDirection = candidate;
}

function step() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  const ateFood = head.x === food.x && head.y === food.y;
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = bodyToCheck.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);
  if (ateFood) {
    score += 1;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(highScoreKey, String(highScore));
    }
    placeFood();
  } else {
    snake.pop();
  }
  updateScore();
}

function endGame() {
  gameOver = true;
  overlayTitle.textContent = 'Game over';
  overlayCopy.textContent = `You scored ${score}.`;
  overlay.hidden = false;
}

function togglePause() {
  if (gameOver) {
    return;
  }
  paused = !paused;
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
}

function drawTile(tile, color) {
  context.fillStyle = color;
  context.fillRect(tile.x * tileSize + 1, tile.y * tileSize + 1, tileSize - 2, tileSize - 2);
}

function draw() {
  context.fillStyle = '#17202a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawTile(food, '#ffcf5c');
  snake.forEach((part, index) => drawTile(part, index === 0 ? '#7ee787' : '#3fb950'));
}

function gameLoop() {
  if (!paused && !gameOver) {
    step();
    draw();
  }
}

const keyMap = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right'
};

window.addEventListener('keydown', (event) => {
  if (keyMap[event.key]) {
    event.preventDefault();
    setDirection(keyMap[event.key]);
  } else if (event.key === ' ') {
    event.preventDefault();
    togglePause();
  }
});

document.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('click', () => setDirection(button.dataset.direction));
});

pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', reset);
overlayAction.addEventListener('click', reset);

reset();
window.setInterval(gameLoop, 120);
