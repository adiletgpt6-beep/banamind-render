// Живой океан. Полосы синей акварели от горизонта к зрителю:
// PAINT — полосы кладутся горизонтальными мазками слева направо;
// AWAKENING — у полос появляется рельеф: гребни, светлая грань, тень под гребнем;
// ALIVE — стилизованные объёмные волны бегут, сохраняя акварельную фактуру.

import { drawStroke, type StrokeSpec } from "../engines/BrushStrokeEngine";
import { mulberry32, noise3, smooth } from "../utils/noise";

const X0 = -700, X1 = 1800, BOTTOM = 2400;
const N = 10;

export type OceanState = {
  horizon: number;
  paint: number;
  awaken: number;
  alive: number;
  f: number;
  /** ночные блики звёзд на воде 0..1 */
  night: number;
};

const bandY = (s: OceanState, k: number) => s.horizon + (BOTTOM - 400 - s.horizon) * Math.pow(k / N, 1.55);

const wave = (x: number, k: number, t: number) => {
  const th = x * (0.011 - k * 0.0006) + t * (0.05 + k * 0.004) + k * 1.7;
  const s = (Math.sin(th) + 1) / 2;
  const peaked = Math.pow(s, 2.4) * 2 - 1; // острые гребни, пологие впадины
  return peaked * 0.75 + noise3(x * 0.004, k, t * 0.012) * 0.45;
};

let STREAKS: StrokeSpec[] | null = null;
const streaks = () => {
  if (STREAKS) return STREAKS;
  const rng = mulberry32(31);
  STREAKS = Array.from({ length: 16 }, (_, i) => {
    const y = 900 + Math.pow(rng(), 1.3) * 900;
    const x = X0 + 300 + rng() * 2000;
    const L = 160 + rng() * 360;
    return { id: `sea-streak-${i}`, pts: [{ x, y }, { x: x + L * 0.5, y: y + (rng() - 0.5) * 8 }, { x: x + L, y: y + (rng() - 0.5) * 10 }], width: 6 + rng() * 10, color: i % 3 ? "#FFFFFF" : "#BFE3F4", bristles: 6, dry: 0.55, opacity: 0.55, mode: "source-over", taper: [0.2, 0.5] };
  });
  return STREAKS;
};

export function drawOcean(ctx: CanvasRenderingContext2D, s: OceanState) {
  if (s.paint <= 0.001) return;
  const t = s.f;
  const amp = 0.12 + 0.88 * s.awaken;
  const motion = 0.25 + 0.75 * s.alive;
  // базовая заливка моря
  const base = ctx.createLinearGradient(0, s.horizon, 0, BOTTOM);
  base.addColorStop(0, "#B8E0F2");
  base.addColorStop(0.3, "#79C0E6");
  base.addColorStop(1, "#3F86BC");
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const revealX = X0 + (X1 - X0 + 400) * smooth(s.paint * 1.25);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = base;
  const sea = new Path2D();
  sea.moveTo(X0, s.horizon);
  for (let x = X0; x <= revealX; x += 40) sea.lineTo(x, s.horizon + noise3(x * 0.01, 2, 0) * 3);
  for (let y = s.horizon; y <= BOTTOM; y += 60) sea.lineTo(revealX + noise3(y * 0.01, t * 0.02, 5) * 60, y);
  sea.lineTo(X0, BOTTOM);
  sea.closePath();
  ctx.fill(sea);
  ctx.restore();

  for (let k = 1; k <= N; k++) {
    const y0 = bandY(s, k);
    const kk = k / N;
    const A = (4 + 58 * Math.pow(kk, 1.3)) * amp;
    const yNext = k < N ? bandY(s, k + 1) : BOTTOM;
    const tt = t * motion + k * 30;
    // полоса раскрывается как горизонтальный мазок, с задержкой по глубине
    const rev = smooth(s.paint * 1.6 - kk * 0.6);
    if (rev <= 0) continue;
    const xEnd = X0 + (X1 - X0) * rev;
    const top: { x: number; y: number }[] = [];
    for (let x = X0; x <= xEnd; x += 18) {
      // голова раскрывающегося мазка скруглена и опускается — без вертикального среза
      const head = rev < 1 ? smooth((x - (xEnd - 220)) / 220) : 0;
      top.push({ x, y: y0 - wave(x, k, tt) * A + head * head * 260 });
    }
    if (top.length < 2) continue;
    // полоса — от гребня до подошвы следующей волны; низ растворяется (без ступенек)
    const kn = Math.min(N, k + 1);
    const An = (4 + 58 * Math.pow(kn / N, 1.3)) * amp;
    const path = new Path2D();
    top.forEach((p, i) => (i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y)));
    const depth = (k < N ? yNext - y0 : 500) + An + 40;
    for (let i = top.length - 1; i >= 0; i--) {
      const x = top[i].x;
      path.lineTo(x, (k < N ? yNext - wave(x, kn, t * motion + kn * 30) * An : y0 + 500) + An * 0.6 + 40);
    }
    path.closePath();
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    // грань волны: светлая у гребня, глубже ниже, к подошве растворяется
    const g = ctx.createLinearGradient(0, y0 - A, 0, y0 - A + depth);
    g.addColorStop(0, "#E6F4FA");
    g.addColorStop(0.3, k % 2 ? "#8CC8E8" : "#7DBFE4");
    g.addColorStop(0.72, k % 2 ? "#3F86BC" : "#4A8FC2");
    g.addColorStop(1, "#FFFFFF");
    ctx.globalAlpha = 0.4 + 0.25 * kk * (0.4 + 0.6 * s.awaken);
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.restore();
    // AWAKENING: тень под гребнем и светлая гуашь на гребнях
    if (s.awaken > 0.01) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = "#174A75";
      ctx.globalAlpha = 0.3 * s.awaken;
      ctx.lineWidth = 3 + 12 * kk;
      ctx.beginPath();
      top.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y + 6 + 10 * kk) : ctx.moveTo(p.x, p.y + 6 + 10 * kk)));
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2 + 9 * kk;
      for (let i = 1; i < top.length - 1; i++) {
        const w = wave(top[i].x, k, tt);
        if (w < 0.35) continue;
        // гребень: короткие сухие мазки пены
        const a = smooth((w - 0.35) / 0.4) * s.awaken;
        ctx.globalAlpha = 0.6 * a * (0.6 + 0.4 * noise3(top[i].x * 0.05, k, 2));
        ctx.beginPath();
        ctx.moveTo(top[i - 1].x, top[i - 1].y + 1);
        ctx.lineTo(top[i + 1].x, top[i + 1].y + 1);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  // мазки-блики на воде: в нарисованном состоянии ярче, у живых волн мягче
  streaks().forEach((st, i) => {
    const p = smooth(s.paint * 1.4 - 0.3 - (i % 5) * 0.05);
    const drift = (s.alive * t * 0.6 + i * 50) % 120;
    drawStroke(ctx, st, p, { alpha: 0.4 + 0.6 * (1 - s.alive * 0.5), dx: drift * (i % 2 ? 1 : -1) * 0.3 });
  });
}

/** Небольшая искрящаяся дорожка — отражение света (днём Солнце, ночью звёзды). */
export function oceanSparkles(ctx: CanvasRenderingContext2D, s: OceanState, x: number, color: string, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  const rng = mulberry32(12);
  for (let i = 0; i < 46; i++) {
    const y = s.horizon + 20 + Math.pow(rng(), 1.4) * 700;
    const spread = 30 + (y - s.horizon) * 0.35;
    const xx = x + (rng() - 0.5) * spread * 2 + Math.sin(s.f * 0.05 + i) * 6;
    const L = 8 + (y - s.horizon) * 0.06 + rng() * 14;
    ctx.globalAlpha = alpha * (0.35 + 0.5 * rng()) * (0.6 + 0.4 * Math.sin(s.f * 0.1 + i * 2));
    ctx.lineWidth = 2 + (y - s.horizon) * 0.006;
    ctx.beginPath();
    ctx.moveTo(xx - L, y);
    ctx.lineTo(xx + L, y);
    ctx.stroke();
  }
  ctx.restore();
}
