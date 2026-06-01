/**
 * Ramo compacto: flores en racimo, tallos cortos y envoltorio elegante.
 */
(function (global) {
  const FLOWERS = [
    { type: "peony", ox: -48, oy: -18, scale: 0.92, delay: 0.42, depth: 0 },
    { type: "peony", ox: 44, oy: -14, scale: 0.86, delay: 0.58, depth: 0 },
    { type: "dahlia", ox: 0, oy: -42, scale: 0.88, delay: 0.48, depth: 1 },
    { type: "orchid", ox: -32, oy: -48, scale: 0.72, delay: 0.68, depth: 1 },
    { type: "orchid", ox: 36, oy: -40, scale: 0.7, delay: 0.82, depth: 2 },
    { type: "dahlia", ox: -62, oy: 6, scale: 0.78, delay: 0.92, depth: 0 },
    { type: "dahlia", ox: 58, oy: 4, scale: 0.76, delay: 1.02, depth: 0 },
  ];

  const FILLER = [
    { ox: -20, oy: -8, r: 3 },
    { ox: 22, oy: -6, r: 2.5 },
    { ox: -8, oy: -32, r: 2 },
    { ox: 14, oy: -28, r: 2.5 },
    { ox: 0, oy: 2, r: 2 },
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function easeOutBack(t) {
    const c1 = 1.2;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function quadPoint(t, x0, y0, cx, cy, x1, y1) {
    const u = 1 - t;
    return {
      x: u * u * x0 + 2 * u * t * cx + t * t * x1,
      y: u * u * y0 + 2 * u * t * cy + t * t * y1,
    };
  }

  const palettes = {
    orchid: [
      { light: "#faf0f8", mid: "#e8b8dc", dark: "#b878a8", center: "#f8e090", centerDark: "#d0a848" },
      { light: "#fff0f6", mid: "#f0b0cc", dark: "#c87898", center: "#fff8d0", centerDark: "#e8c868" },
    ],
    peony: [
      { light: "#fff5f8", mid: "#ffc8d8", dark: "#e090a0", center: "#fffae8", centerDark: "#f0d878" },
      { light: "#fff0f4", mid: "#ffb0c4", dark: "#d87888", center: "#fff0c8", centerDark: "#e8c060" },
    ],
    dahlia: [
      { light: "#ffe8d8", mid: "#f8a870", dark: "#d86840", center: "#3a2820", centerDark: "#1a1008" },
      { light: "#ffe8f2", mid: "#f080a0", dark: "#c84868", center: "#f8e070", centerDark: "#d0a838" },
    ],
  };

  function drawPetal(ctx, x, y, w, h, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(0, -h * 0.15, 0, 0, 0, w * 1.1);
    g.addColorStop(0, color.light);
    g.addColorStop(0.55, color.mid);
    g.addColorStop(1, color.dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCenter(ctx, x, y, r, colors, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, colors.center);
    g.addColorStop(1, colors.centerDark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPeony(ctx, x, y, scale, palette, bloom) {
    const s = scale * (0.4 + bloom * 0.6);
    const a = 0.4 + bloom * 0.55;
    const layers = [
      { n: 10, r: 18, pw: 11, ph: 15 },
      { n: 12, r: 26, pw: 13, ph: 17 },
      { n: 14, r: 34, pw: 14, ph: 18 },
    ];

    for (let L = 0; L < layers.length; L++) {
      const lb = clamp((bloom - L * 0.08) / 0.85, 0, 1);
      if (lb <= 0) continue;
      const { n, r, pw, ph } = layers[L];
      const pal = palette[L % palette.length];
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + L * 0.35;
        drawPetal(
          ctx,
          x + Math.cos(ang) * r * s * 0.32 * lb,
          y + Math.sin(ang) * r * s * 0.28 * lb,
          pw * s,
          ph * s,
          ang + Math.PI / 2,
          pal,
          a * lb
        );
      }
    }

    if (bloom > 0.25) {
      drawCenter(ctx, x, y, 10 * s * bloom, palette[0], a);
    }
  }

  function drawOrchid(ctx, x, y, scale, palette, bloom) {
    const s = scale * bloom;
    const wing = palette[0];
    const lip = palette[1] || palette[0];
    const a = 0.45 + bloom * 0.55;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.15);

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      drawPetal(ctx, side * 14 * s, -4 * s, 16 * s, 24 * s, side * 0.55 - 0.2, wing, a);
    }
    drawPetal(ctx, 0, -14 * s, 12 * s, 22 * s, -Math.PI / 2, wing, a);
    drawPetal(ctx, 0, 10 * s, 20 * s, 16 * s, Math.PI / 2 - 0.1, lip, a);
    drawPetal(ctx, -8 * s, 8 * s, 10 * s, 14 * s, 0.5, lip, a * 0.9);
    drawPetal(ctx, 8 * s, 8 * s, 10 * s, 14 * s, -0.5, lip, a * 0.9);

    if (bloom > 0.3) {
      drawCenter(ctx, 0, 4 * s, 5 * s, lip, a);
    }
    ctx.restore();
  }

  function drawDahlia(ctx, x, y, scale, palette, bloom) {
    const s = scale * (0.35 + bloom * 0.65);
    const rings = [
      { n: 8, len: 14, w: 5 },
      { n: 12, len: 20, w: 5.5 },
      { n: 16, len: 26, w: 6 },
      { n: 20, len: 32, w: 6.5 },
    ];

    for (let ring = 0; ring < rings.length; ring++) {
      const rb = clamp((bloom - ring * 0.07) / 0.8, 0, 1);
      if (rb <= 0) continue;
      const { n, len, w } = rings[ring];
      const pal = palette[ring % palette.length];
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + ring * 0.08;
        drawPetal(
          ctx,
          x + Math.cos(ang) * 4 * s,
          y + Math.sin(ang) * 4 * s,
          w * s,
          len * s * rb,
          ang + Math.PI / 2,
          pal,
          0.88 * rb
        );
      }
    }

    if (bloom > 0.35) {
      drawCenter(ctx, x, y, 7 * s, palette[0], 0.9);
    }
  }

  function drawFlower(ctx, type, x, y, scale, colors, bloom) {
    switch (type) {
      case "orchid":
        drawOrchid(ctx, x, y, scale, colors, bloom);
        break;
      case "dahlia":
        drawDahlia(ctx, x, y, scale, colors, bloom);
        break;
      default:
        drawPeony(ctx, x, y, scale, colors, bloom);
    }
  }

  function drawShortStem(ctx, x0, y0, x1, y1, progress, width, alpha) {
    if (progress <= 0) return;
    const tip = quadPoint(progress, x0, y0, (x0 + x1) / 2, (y0 + y1) / 2 - 8, x1, y1);
    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    ctx.strokeStyle = "#5d7d52";
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 6, tip.x, tip.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawBundleStem(ctx, x, y0, y1, progress, scale) {
    if (progress <= 0) return;
    const tipY = y0 + (y1 - y0) * easeOutCubic(progress);
    ctx.save();
    ctx.globalAlpha = 0.85;
    const g = ctx.createLinearGradient(x, y0, x, tipY);
    g.addColorStop(0, "#4a6642");
    g.addColorStop(1, "#6d9160");
    ctx.strokeStyle = g;
    ctx.lineWidth = 5 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.quadraticCurveTo(x - 4 * scale, (y0 + tipY) / 2, x + 2 * scale, tipY);
    ctx.stroke();
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 1, y0);
    ctx.quadraticCurveTo(x + 5 * scale, (y0 + tipY) / 2, x - 1, tipY - 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawGreenery(ctx, x, y, scale, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.fillStyle = "#6d8a5e";
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 5 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a9a6a";
    ctx.beginPath();
    ctx.ellipse(8 * scale, 2 * scale, 8 * scale, 4 * scale, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBabysBreath(ctx, x, y, scale, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.65;
    ctx.fillStyle = "#fff8f4";
    const dots = [[0, 0], [4, -3], [-3, 2], [5, 3], [-4, -2]];
    for (const [dx, dy] of dots) {
      ctx.beginPath();
      ctx.arc(x + dx * scale, y + dy * scale, (1.5 + (dx % 3)) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBouquetWrap(ctx, x, y, scale, progress) {
    if (progress <= 0) return;

    const p = easeOutCubic(progress);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * (0.75 + p * 0.25), scale * (0.75 + p * 0.25));
    ctx.globalAlpha = p;

    ctx.shadowColor = "rgba(61, 47, 53, 0.15)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    const paper = ctx.createLinearGradient(-40, 0, 40, 55);
    paper.addColorStop(0, "#faf4ec");
    paper.addColorStop(0.45, "#ebe0d0");
    paper.addColorStop(1, "#cfc0a8");

    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.moveTo(-36, 4);
    ctx.lineTo(-40, 18);
    ctx.lineTo(0, 52);
    ctx.lineTo(40, 18);
    ctx.lineTo(36, 4);
    ctx.quadraticCurveTo(0, 20, -36, 4);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(160, 130, 100, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-28, 12);
    ctx.lineTo(0, 40);
    ctx.lineTo(28, 12);
    ctx.stroke();

    const ribbon = ctx.createLinearGradient(-24, -6, 24, 10);
    ribbon.addColorStop(0, "#dfa8b4");
    ribbon.addColorStop(0.5, "#c97b8a");
    ribbon.addColorStop(1, "#a85d6e");

    ctx.fillStyle = ribbon;
    ctx.beginPath();
    ctx.ellipse(0, 6, 28, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c97b8a";
    ctx.beginPath();
    ctx.ellipse(-18, 2, 12, 8, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, 2, 12, 8, 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#b86a7a";
    ctx.beginPath();
    ctx.ellipse(0, 6, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 22);
    ctx.stroke();

    ctx.restore();
  }

  function buildFlowers() {
    return FLOWERS.map((cfg) => ({
      ...cfg,
      colors: [pick(palettes[cfg.type]), pick(palettes[cfg.type])],
      growth: 0,
      bloom: 0,
    }));
  }

  class FlowerGarden {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.running = false;
      this.active = false;
      this.startTime = 0;
      this.wrapProgress = 0;
      this.bundleGrowth = 0;
      this.centered = false;
      this.flowers = [];
      this.resize();
      window.addEventListener("resize", () => {
        this.resize();
        if (this.active) {
          this.layoutBouquet();
          this.draw();
        }
      });
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

    layoutBouquet() {
      const isNarrow = this.width < 520;
      this.bouquetScale = isNarrow ? 0.82 : 1;
      this.anchorX = this.width / 2;

      const letter = document.getElementById("letter");
      const letterVisible =
        letter && !letter.classList.contains("letter--gone");

      if (this.centered || !letterVisible) {
        this.anchorY = this.height * (isNarrow ? 0.56 : 0.52);
      } else {
        const gap = isNarrow ? 12 : 20;
        const rect = letter.getBoundingClientRect();
        this.anchorY = rect.bottom + gap;
        const maxY = this.height - (isNarrow ? 20 : 28);
        if (this.anchorY > maxY) this.anchorY = maxY;
      }

      this.headY = this.anchorY - (isNarrow ? 72 : 88) * this.bouquetScale;
      this.gatherY = this.anchorY - 14 * this.bouquetScale;
    }

    relayoutCenter() {
      this.centered = true;
      this.layoutBouquet();
      if (this.active) this.draw();
    }

    flowerPos(stem) {
      const s = this.bouquetScale;
      return {
        x: this.anchorX + stem.ox * s,
        y: this.headY + stem.oy * s,
      };
    }

    growBouquet() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.layoutBouquet();
          this.flowers = buildFlowers();
          this.wrapProgress = 0;
          this.bundleGrowth = 0;
          this.active = true;
          this.startTime = performance.now();
          if (!this.running) {
            this.running = true;
            this.tick();
          }
        });
      });
    }

    update(elapsed) {
      this.wrapProgress = clamp(elapsed / 0.5, 0, 1);
      this.bundleGrowth = clamp((elapsed - 0.15) / 0.7, 0, 1);

      for (const f of this.flowers) {
        const t = elapsed - f.delay;
        if (t < 0) {
          f.growth = 0;
          f.bloom = 0;
          continue;
        }
        f.growth = easeOutCubic(clamp(t / 0.5, 0, 1));
        const bloomT = clamp((t - 0.25) / 0.75, 0, 1);
        f.bloom = bloomT > 0 ? easeOutBack(bloomT) : 0;
        if (f.bloom > 1) f.bloom = 1;
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      if (!this.active) return;

      const s = this.bouquetScale;
      const hx = this.anchorX;
      const hy = this.headY + 10 * s;

      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 100 * s);
      glow.addColorStop(0, "rgba(201, 123, 138, 0.14)");
      glow.addColorStop(0.6, "rgba(201, 123, 138, 0.04)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, this.width, this.height);

      drawBundleStem(ctx, hx, this.anchorY, this.gatherY, this.bundleGrowth, s);

      const sorted = [...this.flowers].sort((a, b) => a.depth - b.depth);

      for (const f of sorted) {
        if (f.growth <= 0) continue;
        const pos = this.flowerPos(f);
        drawShortStem(ctx, hx, this.gatherY, pos.x, pos.y + 12 * s * f.scale, f.growth, 1.8, f.growth);
      }

      const fillerAlpha = this.wrapProgress * 0.9;
      drawGreenery(ctx, hx - 28 * s, hy + 8 * s, s, fillerAlpha);
      drawGreenery(ctx, hx + 30 * s, hy + 6 * s, s * 0.9, fillerAlpha);
      for (const dot of FILLER) {
        drawBabysBreath(ctx, hx + dot.ox * s, hy + dot.oy * s, s, fillerAlpha);
      }

      for (const f of sorted) {
        if (f.bloom <= 0 && f.growth <= 0) continue;
        const pos = this.flowerPos(f);
        const scale = f.scale * s * (0.25 + f.bloom * 0.75);

        if (f.bloom < 0.15) {
          ctx.save();
          ctx.globalAlpha = f.growth * 0.6;
          ctx.fillStyle = "#7a9a6a";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          drawFlower(ctx, f.type, pos.x, pos.y, scale / s, f.colors, f.bloom);
        }
      }

      drawBouquetWrap(ctx, hx, this.anchorY + 4 * s, s, this.wrapProgress);
    }

    tick() {
      const elapsed = (performance.now() - this.startTime) / 1000;
      this.update(elapsed);
      this.draw();

      const done = this.flowers.every((f) => f.bloom >= 1);
      if (this.active && (elapsed < 3.8 || !done)) {
        requestAnimationFrame(() => this.tick());
      } else {
        this.running = false;
        if (this.active) this.draw();
      }
    }

    clear() {
      this.active = false;
      this.centered = false;
      this.flowers = [];
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.running = false;
    }
  }

  global.FlowerGarden = FlowerGarden;
})(window);
