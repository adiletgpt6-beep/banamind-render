// ColorDotEngine — отрисовка пула цветных точек в Canvas 2D: фон, сетка,
// пакетная заливка кругов и мягкое свечение (bloom) на тёмных фонах.
// Свечение считается в 1/4 разрешения и размывается там же — быстро и без мерцания.
import type { DotMorphEngine } from "./DotMorphEngine";
import { cameraAt, CamKey } from "./CameraController";
import { smoothstep } from "./rng";

export type BgKey = { at: number; dur: number; top: string; bottom: string };

const rgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: number[], b: number[], f: number) => a.map((v, i) => v + (b[i] - v) * f);
const css = (c: number[]) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
const lum = (c: number[]) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

export const backgroundAt = (keys: BgKey[], t: number) => {
  let top = rgb(keys[0].top), bot = rgb(keys[0].bottom);
  for (const k of keys) {
    if (t < k.at) break;
    const f = k.dur > 0 ? smoothstep(k.at, k.at + k.dur, t) : 1;
    top = mix(top, rgb(k.top), f);
    bot = mix(bot, rgb(k.bottom), f);
  }
  return { top, bot, lum: (lum(top) + lum(bot)) / 2 };
};

export class ColorDotRenderer {
  private glow: HTMLCanvasElement;
  private glowBlur: HTMLCanvasElement;
  constructor(private w: number, private h: number) {
    this.glow = document.createElement("canvas");
    this.glow.width = w / 4;
    this.glow.height = h / 4;
    this.glowBlur = document.createElement("canvas");
    this.glowBlur.width = w / 4;
    this.glowBlur.height = h / 4;
  }

  draw(ctx: CanvasRenderingContext2D, engine: DotMorphEngine, frame: number, fps: number, bgs: BgKey[], cam: CamKey[]) {
    const t = frame / fps;
    const { w, h } = this;
    const bg = backgroundAt(bgs, t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(bg.top));
    g.addColorStop(1, css(bg.bot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // тонкая сетка, как в референсе
    const dark = bg.lum < 0.5;
    ctx.strokeStyle = dark ? "rgba(255,255,255,0.035)" : "rgba(20,20,58,0.045)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 30; x < w; x += 60) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
    }
    for (let y = 0; y < h; y += 60) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
    }
    ctx.stroke();

    engine.evaluate(frame);
    const c = cameraAt(cam, t);
    const s = c.s;
    const tx = w / 2 - c.cx * s, ty = h / 2 - c.cy * s;
    const { ox, oy, or, oa, oc, n } = engine;
    const glowAmt = Math.max(0, Math.min(1, (0.55 - bg.lum) / 0.4));

    // свечение
    if (glowAmt > 0.01) {
      const gc = this.glow.getContext("2d")!;
      gc.setTransform(1, 0, 0, 1, 0, 0);
      gc.clearRect(0, 0, w / 4, h / 4);
      gc.setTransform(s / 4, 0, 0, s / 4, tx / 4, ty / 4);
      for (let i = 0; i < n; i++) {
        const a = oa[i];
        if (a < 0.02 || or[i] < 0.3) continue;
        gc.globalAlpha = a * 0.55;
        gc.fillStyle = `rgb(${oc[i * 3] | 0},${oc[i * 3 + 1] | 0},${oc[i * 3 + 2] | 0})`;
        gc.beginPath();
        gc.arc(ox[i], oy[i], or[i] * 2.4 + 2, 0, Math.PI * 2);
        gc.fill();
      }
      const bc = this.glowBlur.getContext("2d")!;
      bc.setTransform(1, 0, 0, 1, 0, 0);
      bc.clearRect(0, 0, w / 4, h / 4);
      bc.filter = "blur(5px)";
      bc.drawImage(this.glow, 0, 0);
      bc.filter = "none";
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.55 * glowAmt;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(this.glowBlur, 0, 0, w, h);
      ctx.restore();
    }

    // сами точки: круглые, чёткие, насыщенные
    ctx.setTransform(s, 0, 0, s, tx, ty);
    for (let i = 0; i < n; i++) {
      const a = oa[i];
      const r = or[i];
      if (a < 0.02 || r < 0.3) continue;
      ctx.globalAlpha = a > 1 ? 1 : a;
      ctx.fillStyle = `rgb(${oc[i * 3] | 0},${oc[i * 3 + 1] | 0},${oc[i * 3 + 2] | 0})`;
      ctx.beginPath();
      ctx.arc(ox[i], oy[i], r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return bg;
  }
}
