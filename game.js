const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const lengthElement = document.getElementById('length');
const meterElement = document.getElementById('score-meter');
const statusElement = document.getElementById('status-copy');
const overlay = document.getElementById('overlay');
const overlayKicker = document.getElementById('overlay-kicker');
const overlayTitle = document.getElementById('overlay-title');
const overlayCopy = document.getElementById('overlay-copy');
const overlayAction = document.getElementById('overlay-action');
const difficultyOptions = {
	easy: { label: 'Easy', speed: 190, minimum: 145, acceleration: 1, wrap: true },
	medium: { label: 'Medium', speed: 145, minimum: 95, acceleration: 2, wrap: false },
	hard: { label: 'Hard', speed: 105, minimum: 68, acceleration: 2, wrap: false },
	fast: { label: 'Fast', speed: 74, minimum: 52, acceleration: 1, wrap: false }
};
const columns = 24;
const rows = 18;
const cell = canvas.width / columns;
const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const highScoreKey = 'neon-snake-high-score';
let snake; let food; let direction; let nextDirection; let score; let highScore = Number.parseInt(localStorage.getItem(highScoreKey) || '0', 10); let running = true; let paused = false; let lastFrame = 0; let stepTimer = 0; let difficulty = 'medium';
function reset() { snake = [{ x: 7, y: 9 }, { x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }]; direction = directions.right; nextDirection = direction; score = 0; running = true; paused = false; stepTimer = 0; overlay.hidden = true; document.getElementById('pause').innerHTML = '<span>Ⅱ</span> PAUSE'; statusElement.textContent = `${difficultyOptions[difficulty].label} mode ready.`; updateHud(); placeFood(); }
function updateHud() { scoreElement.textContent = String(score).padStart(4, '0'); highScoreElement.textContent = String(highScore).padStart(4, '0'); lengthElement.textContent = `LENGTH ${String(snake.length).padStart(2, '0')}`; meterElement.style.width = `${Math.min(100, (score % 10) * 10)}%`; }
function placeFood() { const open = []; for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) if (!snake.some(part => part.x === x && part.y === y)) open.push({ x, y }); food = open[Math.floor(Math.random() * open.length)]; }
function changeDirection(name) { const candidate = directions[name]; if (!candidate || (candidate.x + direction.x === 0 && candidate.y + direction.y === 0)) return; nextDirection = candidate; if (!running) reset(); }
function step() { direction = nextDirection; const rawHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }; const settings = difficultyOptions[difficulty]; const hitWall = rawHead.x < 0 || rawHead.x >= columns || rawHead.y < 0 || rawHead.y >= rows; const head = settings.wrap ? { x: (rawHead.x + columns) % columns, y: (rawHead.y + rows) % rows } : rawHead; const ateFood = head.x === food.x && head.y === food.y; const bodyToCheck = ateFood ? snake : snake.slice(0, -1); const hitSelf = bodyToCheck.some(part => part.x === head.x && part.y === head.y); if ((!settings.wrap && hitWall) || hitSelf) { endGame(); return; } snake.unshift(head); if (ateFood) { score++; if (score > highScore) { highScore = score; localStorage.setItem(highScoreKey, String(highScore)); } placeFood(); } else snake.pop(); updateHud(); }
function endGame() { running = false; overlay.hidden = false; overlayKicker.textContent = 'RUN ENDED'; overlayTitle.textContent = score > 7 ? 'Great run.' : 'Sharp turn.'; overlayCopy.textContent = `You scored ${String(score).padStart(4, '0')} points.`; statusElement.textContent = 'The board is waiting.'; }
function togglePause() { if (!running) return; paused = !paused; document.getElementById('pause').innerHTML = paused ? '<span>▶</span> RESUME' : '<span>Ⅱ</span> PAUSE'; statusElement.textContent = paused ? 'Paused. Take a breath.' : 'The board is yours.'; }
function drawCell(x, y, color, radius = 5) { const inset = 2; const px = x * cell + inset; const py = y * cell + inset; ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(px, py, cell - inset * 2, cell - inset * 2, radius); ctx.fill(); }
function draw() { ctx.fillStyle = '#0c1211'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = 'rgba(200, 243, 74, .055)'; ctx.lineWidth = 1; for (let x = 1; x < columns; x++) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, canvas.height); ctx.stroke(); } for (let y = 1; y < rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(canvas.width, y * cell); ctx.stroke(); } drawCell(food.x, food.y, '#ff9f5c', 7); ctx.shadowColor = '#c8f34a'; ctx.shadowBlur = 12; snake.forEach((part, index) => drawCell(part.x, part.y, index === 0 ? '#e7ff77' : '#9bdc43', index === 0 ? 7 : 5)); ctx.shadowBlur = 0; const head = snake[0]; ctx.fillStyle = '#17201e'; const eyeX = direction.x === -1 ? 5 : direction.x === 1 ? 15 : 8; const eyeY = direction.y === -1 ? 5 : direction.y === 1 ? 15 : 8; ctx.fillRect(head.x * cell + eyeX, head.y * cell + eyeY, 3, 3); if (direction.x === 0) ctx.fillRect(head.x * cell + 15, head.y * cell + eyeY, 3, 3); else ctx.fillRect(head.x * cell + eyeX, head.y * cell + 15, 3, 3); }
function frame(time) { const delta = Math.min(50, time - lastFrame); lastFrame = time; if (running && !paused) { stepTimer += delta; const settings = difficultyOptions[difficulty]; const speed = Math.max(settings.minimum, settings.speed - score * settings.acceleration); while (stepTimer >= speed) { stepTimer -= speed; step(); if (!running) break; } } draw(); requestAnimationFrame(frame); }
window.addEventListener('keydown', event => { const keyMap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }; if (keyMap[event.key]) { event.preventDefault(); changeDirection(keyMap[event.key]); } if (event.key === ' ') { event.preventDefault(); togglePause(); } });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('pointerdown', () => changeDirection(button.dataset.direction)));
let swipeStart = null;
canvas.addEventListener('touchstart', event => { const touch = event.changedTouches[0]; swipeStart = { x: touch.clientX, y: touch.clientY }; }, { passive: true });
canvas.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
canvas.addEventListener('touchend', event => { if (!swipeStart) return; const touch = event.changedTouches[0]; const dx = touch.clientX - swipeStart.x; const dy = touch.clientY - swipeStart.y; swipeStart = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return; changeDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }, { passive: true });
document.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => { difficulty = button.dataset.difficulty; document.querySelectorAll('[data-difficulty]').forEach(option => option.classList.toggle('active', option === button)); reset(); }));
document.getElementById('pause').addEventListener('click', togglePause); document.getElementById('restart').addEventListener('click', reset); overlayAction.addEventListener('click', reset); document.getElementById('sound').addEventListener('click', event => { event.currentTarget.textContent = event.currentTarget.textContent === '⌁' ? '×' : '⌁'; });
document.querySelector('[data-difficulty="medium"]').classList.add('active');
reset(); requestAnimationFrame(frame);
