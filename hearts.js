/**
 * Corazones cayendo suavemente por toda la página.
 */
(function (global) {
  const COLORS = ["#e8a0ad", "#d4899a", "#c97b8a", "#f0b8c4", "#b86a7a", "#f5c6d0"];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function drawHeart(ctx, x, y, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size;
    ctx.moveTo(0, s * 0.25);
    ctx.bezierCurveTo(0, -s * 0.15, -s * 0.95, -s * 0.1, -s * 0.95, s * 0.35);
    ctx.bezierCurveTo(-s * 0.95, s * 0.75, 0, s * 1.05, 0, s * 1.35);
    ctx.bezierCurveTo(0, s * 1.05, s * 0.95, s * 0.75, s * 0.95, s * 0.35);
    ctx.bezierCurveTo(s * 0.95, -s * 0.1, 0, -s * 0.15, 0, s * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  class HeartRain {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hearts = [];
      this.running = false;
      this.active = false;
      this.lastSpawn = 0;
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    spawn(count = 1) {
      for (let i = 0; i < count; i++) {
        this.hearts.push({
          x: rand(0, this.width),
          y: rand(-80, -10),
          size: rand(6, 14),
          speedY: rand(0.6, 1.8),
          speedX: rand(-0.4, 0.4),
          rot: rand(0, Math.PI * 2),
          rotSpeed: rand(-0.025, 0.025),
          color: pick(COLORS),
          alpha: rand(0.35, 0.75),
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.02, 0.05),
        });
      }
    }

    start() {
      this.active = true;
      this.spawn(18);
      if (!this.running) {
        this.running = true;
        this.tick();
      }
    }

    burst() {
      this.spawn(12);
    }

    tick() {
      const now = performance.now();
      if (this.active && now - this.lastSpawn > 280) {
        this.spawn(rand(1, 3) | 0);
        this.lastSpawn = now;
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = this.hearts.length - 1; i >= 0; i--) {
        const h = this.hearts[i];
        h.y += h.speedY;
        h.x += h.speedX + Math.sin(h.wobble) * 0.35;
        h.wobble += h.wobbleSpeed;
        h.rot += h.rotSpeed;

        if (h.y > this.height + 30) {
          if (this.active) {
            h.y = rand(-40, -10);
            h.x = rand(0, this.width);
          } else {
            this.hearts.splice(i, 1);
            continue;
          }
        }

        drawHeart(this.ctx, h.x, h.y, h.size, h.rot, h.color, h.alpha);
      }

      if (this.active || this.hearts.length > 0) {
        requestAnimationFrame(() => this.tick());
      } else {
        this.running = false;
      }
    }

    stop() {
      this.active = false;
    }

    clear() {
      this.active = false;
      this.hearts = [];
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.running = false;
    }
  }

  global.HeartRain = HeartRain;
})(window);
