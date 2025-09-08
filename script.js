(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const startOverlay = document.getElementById("startOverlay");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const finalScoreEl = document.getElementById("finalScore");
  const finalBestEl = document.getElementById("finalBest");

  const startBtn = document.getElementById("startBtn");
  const retryBtn = document.getElementById("retryBtn");
  const jumpBtn = document.getElementById("jumpBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");

  let running = false, paused = false, gameOver = false;
  let time = 0, last = 0, speed = 420, score = 0;
  let best = Number(localStorage.getItem("bestScore") || 0);
  bestEl.textContent = `Best: ${best}`;

  const world = { w: 1600, h: 900, ground: 760 };

  const player = { x: 140, y: 680, w: 60, h: 80, vy: 0, onGround: true };
  let obstacles = [], spawnTimer = 0;

  function startGame() {
    running = true; paused = false; gameOver = false;
    time = 0; score = 0; speed = 420;
    player.y = 680; player.vy = 0; player.onGround = true;
    obstacles = []; spawnTimer = 0;
    startOverlay.style.display = "none";
    gameOverOverlay.style.display = "none";
    requestAnimationFrame(loop);
  }

  function endGame() {
    running = false; gameOver = true;
    best = Math.max(best, Math.floor(score));
    localStorage.setItem("bestScore", best);
    bestEl.textContent = `Best: ${best}`;
    finalScoreEl.textContent = Math.floor(score);
    finalBestEl.textContent = best;
    gameOverOverlay.style.display = "grid";
  }

  function jump() {
    if (!running) { startGame(); return; }
    if (player.onGround) {
      player.vy = -800;
      player.onGround = false;
    }
  }

  function loop(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts; if (paused) return;

    time += dt; speed += dt * 20; score += dt * (speed / 10);
    scoreEl.textContent = `Score: ${Math.floor(score)}`;

    // Player physics
    player.vy += 2000 * dt;
    player.y += player.vy * dt;
    if (player.y + player.h >= world.ground) {
      player.y = world.ground - player.h; player.vy = 0; player.onGround = true;
    }

    // Spawn obstacles
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      const h = 40 + Math.random() * 120;
      obstacles.push({ x: world.w, y: world.ground - h, w: 40 + Math.random() * 40, h });
      spawnTimer = 1;
    }
    obstacles.forEach(o => o.x -= speed * dt);
    obstacles = obstacles.filter(o => o.x + o.w > 0);

    // Collision
    for (const o of obstacles) {
      if (rectsOverlap(player, o)) { endGame(); return; }
    }

    draw();
    requestAnimationFrame(loop);
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function draw() {
    ctx.clearRect(0, 0, world.w, world.h);
    ctx.fillStyle = "#0b0f1a"; ctx.fillRect(0, 0, world.w, world.h);

    ctx.fillStyle = "#7cfeea";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "#ff6ec7";
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
  }

  // Controls
  window.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") jump();
  });
  canvas.addEventListener("pointerdown", jump);
  jumpBtn.addEventListener("click", jump);
  startBtn.addEventListener("click", startGame);
  retryBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);

})();
