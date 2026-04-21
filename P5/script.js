/* jshint esversion: 6 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('music-toggle');

canvas.width = 800;
canvas.height = 400;

let gameRunning = false;
let gameMode = ''; 
let score = { player: 0, bot: 0 };
let countdown = 3;
let musicPlaying = false;

const keys = {};
window.addEventListener('keydown', function(e) { keys[e.code] = true; });
window.addEventListener('keyup', function(e) { keys[e.code] = false; });

// --- CONFIGURACIÓN DE EQUIPOS ---
const teamBlue = [
    { x: 100, y: 200, r: 15, speed: 4, color: '#2196F3', isPlayer: true, role: 'player' },
    { x: 200, y: 300, r: 15, speed: 2.8, color: '#64B5F6', isPlayer: false, role: 'support' } 
];

const teamRed = [
    { x: 700, y: 100, r: 15, speed: 2.6, color: '#F44336', isPlayer: false, role: 'aggressor' },
    { x: 700, y: 300, r: 15, speed: 2.2, color: '#B71C1C', isPlayer: false, role: 'defender' }
];

const ball = { x: 400, y: 200, r: 10, dx: 0, dy: 0, friction: 0.98, color: 'white' };

// --- GESTIÓN DE MÚSICA ---
function toggleMusic() {
    if (music.paused) {
        music.play().then(function() {
            musicPlaying = true;
            musicBtn.innerText = "Música: ON";
            musicBtn.classList.add('playing');
        }).catch(function(e) { console.log("Audio bloqueado"); });
    } else {
        music.pause();
        musicPlaying = false;
        musicBtn.innerText = "Música: OFF";
        musicBtn.classList.remove('playing');
    }
}

function startMusicQuietly() {
    music.play().then(function() {
        musicPlaying = true;
        musicBtn.innerText = "Música: ON";
        musicBtn.classList.add('playing');
    }).catch(function(e) { /* Silencioso si falla */ });
}

// --- LÓGICA DE IA Y MOVIMIENTO ---
function moveTowards(bot, tx, ty, speed) {
    if (bot.x < tx - 5) bot.x += speed;
    else if (bot.x > tx + 5) bot.x -= speed;
    if (bot.y < ty - 5) bot.y += speed;
    else if (bot.y > ty + 5) bot.y -= speed;
}

function updateAI(bot, targetBall) {
    let speed = bot.speed;
    if (bot.role === 'aggressor') {
        moveTowards(bot, targetBall.x, targetBall.y, speed);
    } else if (bot.role === 'defender') {
        if (targetBall.x < 450) moveTowards(bot, 730, 200, speed);
        else moveTowards(bot, targetBall.x + 20, targetBall.y, speed);
    } else if (bot.role === 'support') {
        let distP = Math.sqrt(Math.pow(teamBlue[0].x - targetBall.x, 2) + Math.pow(teamBlue[0].y - targetBall.y, 2));
        if (distP < 120) {
            let offset = targetBall.y > 200 ? -100 : 100;
            moveTowards(bot, targetBall.x - 60, targetBall.y + offset, speed);
        } else {
            moveTowards(bot, targetBall.x, targetBall.y, speed);
        }
    }
}

// --- NÚCLEO ---
function update() {
    if (!gameRunning) return;

    const p1 = teamBlue[0];
    if (keys.ArrowUp && p1.y > p1.r) p1.y -= p1.speed;
    if (keys.ArrowDown && p1.y < canvas.height - p1.r) p1.y += p1.speed;
    if (keys.ArrowLeft && p1.x > p1.r) p1.x -= p1.speed;
    if (keys.ArrowRight && p1.x < canvas.width - p1.r) p1.x += p1.speed;

    updateAI(teamBlue[1], ball);
    teamRed.forEach(function(bot) { updateAI(bot, ball); });

    ball.x += ball.dx; ball.y += ball.dy;
    ball.dx *= ball.friction; ball.dy *= ball.friction;

    if (ball.y < ball.r || ball.y > canvas.height - ball.r) {
        ball.dy *= -1;
        ball.y = ball.y < ball.r ? ball.r : canvas.height - ball.r;
    }

    if (ball.x < ball.r) {
        if (ball.y > 150 && ball.y < 250) return handleGoal('bot');
        ball.dx *= -1; ball.x = ball.r;
    } else if (ball.x > canvas.width - ball.r) {
        if (ball.y > 150 && ball.y < 250) return handleGoal('player');
        ball.dx *= -1; ball.x = canvas.width - ball.r;
    }

    teamBlue.concat(teamRed).forEach(function(p) { checkCollision(p, ball); });
}

function checkCollision(obj, ball) {
    let dx = ball.x - obj.x, dy = ball.y - obj.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let minDistance = obj.r + ball.r;
    if (distance < minDistance) {
        let angle = Math.atan2(dy, dx);
        let overlap = minDistance - distance;
        ball.x += Math.cos(angle) * overlap;
        ball.y += Math.sin(angle) * overlap;
        ball.dx = Math.cos(angle) * 7;
        ball.dy = Math.sin(angle) * 7;
    }
}

function startGame(mode) {
    if (!musicPlaying) startMusicQuietly();
    gameMode = mode;
    score = { player: 0, bot: 0 };
    document.getElementById('score-jugador').innerText = 0;
    document.getElementById('score-bot').innerText = 0;
    document.getElementById('menu-inicial').classList.add('hidden');
    document.getElementById('menu-final').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('game-mode-text').innerText = mode === '3-goles' ? "Modo: 3 Goles" : "Modo: Gol de Oro";
    resetPositions();
    startCountdown();
}

function startCountdown() {
    gameRunning = false;
    countdown = 3;
    const ann = document.getElementById('announcer');
    const txt = document.getElementById('announcer-text');
    ann.classList.remove('hidden');
    txt.innerText = countdown;

    const interval = setInterval(function() {
        countdown--;
        txt.innerText = countdown > 0 ? countdown : "¡YA!";
        if (countdown < 0) {
            clearInterval(interval);
            ann.classList.add('hidden');
            gameRunning = true;
            requestAnimationFrame(loop);
        }
    }, 800);
}

function resetPositions() {
    teamBlue[0].x = 100; teamBlue[0].y = 200;
    teamBlue[1].x = 180; teamBlue[1].y = 300;
    teamRed[0].x = 700; teamRed[0].y = 100;
    teamRed[1].x = 650; teamRed[1].y = 300;
    ball.x = 400; ball.y = 200; ball.dx = 0; ball.dy = 0;
}

function handleGoal(scorer) {
    gameRunning = false;
    score[scorer]++;
    document.getElementById('score-jugador').innerText = score.player;
    document.getElementById('score-bot').innerText = score.bot;
    document.getElementById('announcer-text').innerText = scorer === 'player' ? "¡GOL!" : "GOL RIVAL";
    document.getElementById('announcer').classList.remove('hidden');

    if (gameMode === 'gol-oro' || (gameMode === '3-goles' && (score.player === 3 || score.bot === 3))) {
        setTimeout(endGame, 1500);
    } else {
        setTimeout(function() { resetPositions(); startCountdown(); }, 1500);
    }
}

function endGame() {
    gameRunning = false;
    document.getElementById('announcer').classList.add('hidden');
    document.getElementById('menu-final').classList.remove('hidden');
    document.getElementById('result-title').innerText = score.player > score.bot ? "¡VICTORIA!" : "DERROTA";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath(); ctx.moveTo(400, 0); ctx.lineTo(400, 400); ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 150, 10, 100); ctx.fillRect(790, 150, 10, 100);

    teamBlue.concat(teamRed).forEach(function(p) {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        if(p.isPlayer) { ctx.strokeStyle = "yellow"; ctx.lineWidth = 3; ctx.stroke(); }
    });

    ctx.fillStyle = ball.color;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
}

function loop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

function resetGame() { startGame(gameMode); }

draw();