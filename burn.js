/**
 * Quemado de la carta: borde irregular, llamas, humo, brasas y ceniza.
 */
(function (global) {
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function easeInQuad(t) {
    return t * t;
  }

  class LetterBurn {
    constructor(letterEl) {
      this.letter = letterEl;
      this.canvas = null;
      this.ctx = null;
      this.embers = [];
      this.smoke = [];
      this.ash = [];
      this.running = false;
      this.duration = 3600;
      this.time = 0;
    }

    start(onComplete) {
      if (this.letter.classList.contains("letter--gone")) return;

      this.onComplete = onComplete;
      this.rect = this.letter.getBoundingClientRect();
      this.createCanvas();
      this.letter.classList.add("letter--burning");
      this.startTime = performance.now();
      this.running = true;
      this.time = 0;

      for (let i = 0; i < 55; i++) this.spawnEmber(true);
      for (let i = 0; i < 20; i++) this.spawnSmoke(true);

      this.tick();

      setTimeout(() => {
        this.finish();
      }, this.duration);
    }

    finish() {
      this.letter.classList.remove("letter--burning");
      this.letter.classList.add("letter--gone");
      this.letter.style.clipPath = "";
      this.letter.style.filter = "";
      this.letter.style.opacity = "";
      this.running = false;
      this.onComplete?.();
      setTimeout(() => this.cleanup(), 1100);
    }

    createCanvas() {
      const { left, top, width, height } = this.rect;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.padTop = 70;
      this.letterH = height;
      this.w = width;
      this.h = height + this.padTop;

      this.canvas = document.createElement("canvas");
      this.canvas.className = "letter-burn-canvas";
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.canvas.style.left = `${left}px`;
      this.canvas.style.top = `${top - this.padTop}px`;
      this.canvas.style.width = `${this.w}px`;
      this.canvas.style.height = `${this.h}px`;

      this.ctx = this.canvas.getContext("2d");
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      document.body.appendChild(this.canvas);
    }

    /** Borde de quemado con varias ondas (irregular). */
    burnY(x, progress) {
      const base = this.padTop + this.letterH * (1 - easeInQuad(progress));
      const t = this.time;
      const n =
        Math.sin(x * 0.045 + t * 2.2) * 14 +
        Math.sin(x * 0.09 + t * 3.1) * 9 +
        Math.sin(x * 0.018 + t * 1.4) * 18 +
        Math.sin(x * 0.14 + t * 4) * 5;
      return base + n * (0.35 + progress * 0.65);
    }

    updateLetterMask(progress) {
      const steps = Math.ceil(this.w / 3);
      const pts = [`0% 0%`, `100% 0%`];

      for (let i = steps; i >= 0; i--) {
        const x = (i / steps) * this.w;
        const yInLetter = this.burnY(x, progress) - this.padTop;
        const yPct = (yInLetter / this.letterH) * 100;
        pts.push(`${(x / this.w) * 100}% ${clamp(yPct, 0, 100)}%`);
      }

      this.letter.style.clipPath = `polygon(${pts.join(", ")})`;

      const char = progress * 0.85;
      const bright = 1 - progress * 0.45;
      this.letter.style.filter = `sepia(${char}) brightness(${bright}) contrast(${1 + progress * 0.15}) saturate(${1.2 - progress * 0.3})`;

      if (progress > 0.75) {
        this.letter.style.opacity = String(1 - (progress - 0.75) / 0.25);
      }
    }

    spawnEmber(initial) {
      const x = rand(0, this.w);
      const y = initial ? this.burnY(x, this.progress || 0.1) : this.burnY(x, this.progress || 0.5);
      this.embers.push({
        x,
        y: y + rand(-4, 8),
        vx: rand(-1.2, 1.2),
        vy: rand(-3.5, -0.8),
        life: rand(0.5, 1),
        decay: rand(0.006, 0.014),
        size: rand(1.5, 4.5),
        hue: rand(10, 42),
      });
    }

    spawnSmoke(initial) {
      const x = rand(0, this.w);
      const p = this.progress || 0.2;
      this.smoke.push({
        x,
        y: this.burnY(x, p) + rand(-6, 4),
        vx: rand(-0.5, 0.5),
        vy: rand(-1.8, -0.6),
        life: rand(0.6, 1),
        decay: rand(0.004, 0.009),
        size: rand(8, 22),
        gray: rand(55, 75),
      });
    }

    spawnAsh() {
      const x = rand(0, this.w);
      this.ash.push({
        x,
        y: this.burnY(x, this.progress || 0.4) + rand(0, 12),
        vx: rand(-0.8, 0.8),
        vy: rand(0.3, 1.2),
        life: rand(0.7, 1),
        decay: rand(0.005, 0.01),
        size: rand(1, 3),
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.08, 0.08),
      });
    }

    drawFireBase(progress) {
      const ctx = this.ctx;
      const t = this.time;

      for (let x = 0; x < this.w; x += 6) {
        const by = this.burnY(x, progress);
        const flicker = Math.sin(t * 8 + x * 0.12) * 5 + Math.sin(t * 12 + x * 0.07) * 3;
        const flameH = 28 + flicker + progress * 22;
        const flameW = 7 + flicker * 0.4;

        const g = ctx.createRadialGradient(x, by - flameH * 0.35, 0, x, by, flameH);
        g.addColorStop(0, `rgba(255, 240, 150, ${0.55 + progress * 0.2})`);
        g.addColorStop(0.25, `rgba(255, 160, 50, ${0.45 + progress * 0.15})`);
        g.addColorStop(0.55, `rgba(255, 70, 20, ${0.3})`);
        g.addColorStop(1, "rgba(120, 20, 5, 0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - flameW, by);
        ctx.quadraticCurveTo(
          x - flameW * 0.3,
          by - flameH,
          x,
          by - flameH * 1.1
        );
        ctx.quadraticCurveTo(
          x + flameW * 0.3,
          by - flameH * 0.85,
          x + flameW,
          by
        );
        ctx.closePath();
        ctx.fill();
      }

      const glowY = this.padTop + this.letterH * (1 - progress);
      const glow = ctx.createLinearGradient(0, glowY - 40, 0, this.padTop + this.letterH);
      glow.addColorStop(0, "rgba(255, 120, 40, 0)");
      glow.addColorStop(0.35, `rgba(255, 90, 30, ${0.12 + progress * 0.15})`);
      glow.addColorStop(1, `rgba(80, 25, 5, ${0.25 + progress * 0.2})`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, glowY - 20, this.w, this.padTop + this.letterH - glowY + 50);
    }

    drawCharEdge(progress) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      for (let x = 0; x < this.w; x += 4) {
        const by = this.burnY(x, progress);
        const g = ctx.createLinearGradient(x, by - 18, x, by + 8);
        g.addColorStop(0, "rgba(30, 20, 15, 0)");
        g.addColorStop(0.5, `rgba(50, 35, 25, ${0.35 + progress * 0.25})`);
        g.addColorStop(1, `rgba(20, 12, 8, ${0.5})`);
        ctx.fillStyle = g;
        ctx.fillRect(x - 2, by - 18, 4, 26);
      }
      ctx.restore();
    }

    updateParticles(progress) {
      if (Math.random() > 0.35) this.spawnEmber(false);
      if (Math.random() > 0.5) this.spawnSmoke(false);
      if (progress > 0.15 && Math.random() > 0.65) this.spawnAsh();

      const ctx = this.ctx;

      for (let i = this.smoke.length - 1; i >= 0; i--) {
        const p = this.smoke[i];
        p.x += p.vx + Math.sin(this.time * 2 + p.x * 0.02) * 0.3;
        p.y += p.vy;
        p.vy *= 0.995;
        p.size += 0.15;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.smoke.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life * 0.35;
        ctx.fillStyle = `rgba(${p.gray}, ${p.gray}, ${p.gray + 15}, 0.8)`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 0.8, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = this.embers.length - 1; i >= 0; i--) {
        const p = this.embers[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.04;
        p.life -= p.decay;

        if (p.life <= 0 || p.y < -20) {
          this.embers.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fillStyle = `hsl(${p.hue}, 95%, ${45 + p.life * 25}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = this.ash.length - 1; i >= 0; i--) {
        const p = this.ash[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.ash.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life * 0.55;
        ctx.fillStyle = "#4a4038";
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        ctx.restore();
      }
    }

    tick() {
      if (!this.ctx) return;
      if (!this.running && this.embers.length === 0 && this.smoke.length === 0 && this.ash.length === 0) {
        return;
      }

      const elapsed = performance.now() - this.startTime;
      this.time = elapsed / 1000;
      this.progress = Math.min(1, elapsed / this.duration);

      this.updateLetterMask(this.progress);

      this.ctx.clearRect(0, 0, this.w, this.h);

      if (this.running) {
        this.drawFireBase(this.progress);
        this.drawCharEdge(this.progress);
      }

      this.updateParticles(this.progress);

      if (this.running || this.embers.length || this.smoke.length || this.ash.length) {
        requestAnimationFrame(() => this.tick());
      }
    }

    cleanup() {
      if (this.canvas?.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      this.canvas = null;
      this.ctx = null;
      this.embers = [];
      this.smoke = [];
      this.ash = [];
    }
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  global.LetterBurn = LetterBurn;
})(window);
