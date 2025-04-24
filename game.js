const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const music = document.getElementById("gameMusic");
const toggleBtn = document.getElementById("musicToggle");
const restartBtn = document.getElementById("restartBtn");
const messageBox = document.getElementById("messageBox");
const cigBar = document.getElementById("cigBar");

const nameInput = document.getElementById("playerName");
const nameInputContainer = document.getElementById("nameInputContainer");
const submitBtn = document.getElementById("submitName");
const leaderboardList = document.getElementById("leaderboardList");
const leaderboardContainer = document.getElementById("leaderboardContainer");

let musicPlaying = false;
let score = 0;
let gameOver = false;

const ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 40;
let dx = 4;
let dy = -4;

const paddleHeight = 12;
const paddleWidth = 85;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
toggleBtn.addEventListener("click", toggleMusic);
restartBtn.addEventListener("click", () => location.reload());
submitBtn.addEventListener("click", submitScore);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function toggleMusic() {
  musicPlaying = !musicPlaying;
  musicPlaying ? music.play() : music.pause();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0ff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.fillStyle = "#f33";
        ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          document.getElementById("score").textContent = "Score: " + score;
          cigBar.style.width = `${100 - (score / (brickRowCount * brickColumnCount)) * 100}%`;
          if (score === brickRowCount * brickColumnCount) winGame();
        }
      }
    }
  }
}

function winGame() {
  gameOver = true;
  messageBox.className = "win";
  messageBox.textContent = "🎉 YOU BROKE THE HABIT!";
  messageBox.style.display = "block";
  nameInputContainer.classList.remove("hidden");
}

function loseGame() {
  gameOver = true;
  messageBox.className = "lose";
  messageBox.textContent = "💀 GAME OVER";
  messageBox.style.display = "block";
}

function submitScore() {
  const name = nameInput.value.trim().slice(0, 10);
  if (!name) return;

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  leaderboardList.innerHTML = leaderboard.map(e => `<li>${e.name}: ${e.score}</li>`).join("");
  leaderboardContainer.classList.remove("hidden");
  nameInputContainer.classList.add("hidden");
}

function draw() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - paddleHeight - ballRadius - 10) {
    if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
    else if (y + dy > canvas.height - ballRadius) return loseGame();
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

draw();
