const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stateEl = document.getElementById("state");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const player = {
  x: 180,
  y: HEIGHT / 2,
  radius: 22,
  color: "#2d7ff9"
};

const ball = {
  x: 300,
  y: HEIGHT / 2,
  radius: 16,
  vx: 0,
  vy: 0,
  friction: 0.992
};

const powerShot = {
  charging: false,
  power: 0,
  minPower: 4,
  maxPower: 14,
  chargeSpeed: 0.18
};

function setState(text) {
  stateEl.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function drawBackground() {
  ctx.fillStyle = "#2c8f4a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.strokeStyle = "#222222";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawBackground();
  drawBall();
  drawPlayer();
}

draw();


function startPowerShot() {
  if (powerShot.charging) {
    return;
  }

  powerShot.charging = true;
  powerShot.power = powerShot.minPower;

  setState("Cargando Power Shot...");
}

function updatePowerShot() {
  if (!powerShot.charging) {
    return;
  }

  powerShot.power += powerShot.chargeSpeed;
  powerShot.power = clamp(powerShot.power, powerShot.minPower, powerShot.maxPower);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    startPowerShot();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    releasePowerShot();
  }
});

function releasePowerShot() {
  if (!powerShot.charging) {
    return;
  }

  powerShot.charging = false;

  ball.vx = powerShot.power;
  ball.vy = 0;

  setState(`Power Shot lanzado con potencia ${powerShot.power.toFixed(1)}`);

  powerShot.power = 0;
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  ball.vx *= ball.friction;
  ball.vy *= ball.friction;

  if (Math.abs(ball.vx) < 0.03) {
    ball.vx = 0;
  }

  if (Math.abs(ball.vy) < 0.03) {
    ball.vy = 0;
  }

  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.vx *= -1;
  }

  if (ball.x + ball.radius >= WIDTH) {
    ball.x = WIDTH - ball.radius;
    ball.vx *= -1;
  }

  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  if (ball.y + ball.radius >= HEIGHT) {
    ball.y = HEIGHT - ball.radius;
    ball.vy *= -1;
  }
}


function drawPowerBar() {
  if (!powerShot.charging) {
    return;
  }

  const barWidth = 90;
  const barHeight = 10;
  const x = player.x - barWidth / 2;
  const y = player.y - player.radius - 24;

  const ratio = powerShot.power / powerShot.maxPower;

  ctx.fillStyle = "#222222";
  ctx.fillRect(x, y, barWidth, barHeight);

  ctx.fillStyle = "#ffd54a";
  ctx.fillRect(x, y, barWidth * ratio, barHeight);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);
}

function update() {
  updatePowerShot();
  updateBall();
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawBackground();
  drawBall();
  drawPlayer();
  drawPowerBar();
}

function loop() {
  update();
  draw();

  requestAnimationFrame(loop);
}

loop();

function resetScene() {
  ball.x = 300;
  ball.y = HEIGHT / 2;
  ball.vx = 0;
  ball.vy = 0;

  powerShot.charging = false;
  powerShot.power = 0;

  setState("Escena reiniciada");
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    startPowerShot();
  }

  if (event.key === "r" || event.key === "R") {
    resetScene();
  }
});