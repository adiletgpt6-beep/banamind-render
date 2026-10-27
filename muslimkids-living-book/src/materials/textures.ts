import * as THREE from "three";
import { FONTS, PALETTE as C } from "../styles/palette";
import { rng } from "../utils/math";

// Процедурные текстуры (Canvas 2D): бумага, обложка, страницы, дерево, Земля.
// Генерируются один раз и кэшируются — кадры остаются детерминированными.

type Ctx = CanvasRenderingContext2D;
const cache = new Map<string, THREE.Texture>();

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d") as Ctx] as const;
};

const toTexture = (c: HTMLCanvasElement, srgb = true, repeat = false) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  }
  t.needsUpdate = true;
  return t;
};

const cached = (key: string, make: () => THREE.Texture) => {
  let t = cache.get(key);
  if (!t) {
    t = make();
    cache.set(key, t);
  }
  return t;
};

/** Волокна и зерно бумаги поверх уже залитого холста. */
const paperFibers = (ctx: Ctx, w: number, h: number, seed: number, strength = 1) => {
  const r = rng(seed);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 14 * strength;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.05 * strength;
  for (let i = 0; i < (w * h) / 900; i++) {
    const x = r() * w;
    const y = r() * h;
    const a = r() * Math.PI;
    const l = 4 + r() * 14;
    ctx.strokeStyle = r() > 0.5 ? "#6b5a48" : "#ffffff";
    ctx.lineWidth = 0.6 + r() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  ctx.restore();
};

/** Серое зерно для bumpMap / тонировки цветной бумаги (повторяемое). */
export const paperGrain = () =>
  cached("grain", () => {
    const [c, ctx] = canvas(512, 512);
    ctx.fillStyle = "#e9e9e9";
    ctx.fillRect(0, 0, 512, 512);
    paperFibers(ctx, 512, 512, 11, 1.6);
    return toTexture(c, false, true);
  });

/** Белая бумага с зерном — тонируется цветом материала. */
export const paperTint = () =>
  cached("tint", () => {
    const [c, ctx] = canvas(512, 512);
    ctx.fillStyle = "#f6f3ee";
    ctx.fillRect(0, 0, 512, 512);
    paperFibers(ctx, 512, 512, 21, 0.9);
    const t = toTexture(c, true, true);
    t.repeat.set(2, 2);
    return t;
  });

// ------------------------------------------------------------ стол и комната
export const woodTexture = () =>
  cached("wood", () => {
    const W = 2048;
    const H = 2048;
    const [c, ctx] = canvas(W, H);
    const r = rng(7);
    const planks = 6;
    const ph = H / planks;
    for (let p = 0; p < planks; p++) {
      const base = [128, 86, 56].map((v) => v + (r() - 0.5) * 9);
      ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
      ctx.fillRect(0, p * ph, W, ph);
      // волокна
      for (let i = 0; i < 140; i++) {
        const y0 = p * ph + r() * ph;
        const amp = 2 + r() * 8;
        const freq = 0.002 + r() * 0.004;
        const ph0 = r() * 10;
        const dark = r() > 0.45;
        ctx.strokeStyle = dark ? `rgba(70,42,24,${0.08 + r() * 0.16})` : `rgba(214,170,120,${0.05 + r() * 0.1})`;
        ctx.lineWidth = 0.8 + r() * 2.2;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 16) {
          const y = y0 + Math.sin(x * freq + ph0) * amp + Math.sin(x * freq * 3.1 + ph0) * amp * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // сучок
      if (r() > 0.4) {
        const kx = r() * W;
        const ky = p * ph + ph * (0.3 + r() * 0.4);
        for (let k = 0; k < 7; k++) {
          ctx.strokeStyle = `rgba(70,40,22,${0.18 - k * 0.02})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(kx, ky, 10 + k * 9, 5 + k * 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // шов между досками
      ctx.fillStyle = "rgba(40,24,14,0.55)";
      ctx.fillRect(0, p * ph, W, 3);
    }
    // мягкий лак
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "rgba(255,230,190,0.08)");
    g.addColorStop(1, "rgba(60,30,10,0.08)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const t = toTexture(c, true, true);
    t.repeat.set(2.2, 2.2);
    return t;
  });

/** Размытый фон тёплой комнаты (окно, полки, лампа) — «боке». */
export const roomTexture = () =>
  cached("room", () => {
    const W = 1024;
    const H = 1024;
    const [c, ctx] = canvas(W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#f1e4cf");
    g.addColorStop(0.55, "#dcc09b");
    g.addColorStop(1, "#b08760");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.filter = "blur(28px)";
    // окно с мягким светом
    ctx.fillStyle = "rgba(255,246,222,0.85)";
    ctx.fillRect(W * 0.08, H * 0.08, W * 0.32, H * 0.46);
    ctx.fillStyle = "rgba(180,140,100,0.6)";
    ctx.fillRect(W * 0.23, H * 0.06, 14, H * 0.5);
    // книжная полка
    ctx.fillStyle = "rgba(95,62,40,0.75)";
    ctx.fillRect(W * 0.55, H * 0.28, W * 0.42, 20);
    const r = rng(5);
    const bookCols = [C.emerald, C.navy, C.brown, C.goldDeep, "#9c4a3a", C.sky];
    let x = W * 0.57;
    while (x < W * 0.95) {
      const bw = 18 + r() * 22;
      const bh = 70 + r() * 60;
      ctx.fillStyle = bookCols[Math.floor(r() * bookCols.length)];
      ctx.fillRect(x, H * 0.28 - bh, bw, bh);
      x += bw + 3;
    }
    // растение
    ctx.fillStyle = "rgba(60,110,70,0.8)";
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.ellipse(W * 0.47 + (r() - 0.5) * 120, H * 0.55 - r() * 160, 30, 70, (r() - 0.5) * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    // тёплое боке
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = `rgba(255,${200 + r() * 40},${130 + r() * 50},${0.18 + r() * 0.25})`;
      ctx.beginPath();
      ctx.arc(r() * W, H * (0.1 + r() * 0.5), 18 + r() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = "none";
    return toTexture(c);
  });

// ------------------------------------------------------------ обложка
const goldOrnament = (ctx: Ctx, w: number, h: number, fill: string, mask: boolean) => {
  ctx.save();
  ctx.strokeStyle = fill;
  ctx.fillStyle = fill;
  // двойная рамка
  ctx.lineWidth = 7;
  ctx.strokeRect(54, 54, w - 108, h - 108);
  ctx.lineWidth = 3;
  ctx.strokeRect(78, 78, w - 156, h - 156);
  // угловые восьмиконечные розетки
  const star = (cx: number, cy: number, R: number) => {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8 + Math.PI / 16;
      const rr = i % 2 === 0 ? R : R * 0.55;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  for (const [cx, cy] of [
    [78, 78],
    [w - 78, 78],
    [78, h - 78],
    [w - 78, h - 78],
  ]) {
    star(cx, cy, 30);
    ctx.fill();
    if (!mask) {
      ctx.fillStyle = C.navy;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fill;
    }
  }
  // центральный геометрический медальон (8-кратная симметрия)
  const cx = w / 2;
  const cy = h * 0.6;
  ctx.lineWidth = 4;
  for (let k = 0; k < 2; k++) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + (k * Math.PI) / 4;
      const x = cx + Math.cos(a) * 150;
      const y = cy + Math.sin(a) * 150;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 104, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 168, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();
  // раскрытая книга в медальоне
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 34);
  ctx.quadraticCurveTo(cx - 40, cy + 14, cx - 74, cy + 30);
  ctx.lineTo(cx - 74, cy - 18);
  ctx.quadraticCurveTo(cx - 40, cy - 34, cx, cy - 14);
  ctx.quadraticCurveTo(cx + 40, cy - 34, cx + 74, cy - 18);
  ctx.lineTo(cx + 74, cy + 30);
  ctx.quadraticCurveTo(cx + 40, cy + 14, cx, cy + 34);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 14);
  ctx.lineTo(cx, cy + 34);
  ctx.stroke();
  // маленькие лучи над книгой — свет знаний
  for (let i = -2; i <= 2; i++) {
    const a = -Math.PI / 2 + i * 0.32;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 46, cy - 22 + Math.sin(a) * 46);
    ctx.lineTo(cx + Math.cos(a) * 72, cy - 22 + Math.sin(a) * 72);
    ctx.stroke();
  }
  // надписи
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 118px ${FONTS.serif}`;
  ctx.fillText("КНИГА", w / 2, h * 0.2);
  ctx.fillText("ОТКРЫТИЙ", w / 2, h * 0.2 + 122);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 170, h * 0.2 + 205);
  ctx.lineTo(w / 2 + 170, h * 0.2 + 205);
  ctx.stroke();
  star(w / 2, h * 0.2 + 205, 13);
  ctx.fill();
  ctx.font = `800 46px ${FONTS.sans}`;
  ctx.fillText("M U S L I M   K I D S", w / 2, h * 0.87);
  ctx.restore();
};

export const coverTextures = () => {
  const map = cached("cover-map", () => {
    const W = 1024;
    const H = 1434;
    const [c, ctx] = canvas(W, H);
    ctx.fillStyle = C.navy;
    ctx.fillRect(0, 0, W, H);
    // переплётная ткань
    const r = rng(3);
    ctx.globalAlpha = 0.07;
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = r() > 0.5 ? "#ffffff" : "#000000";
      ctx.fillRect(0, y, W, 1);
    }
    for (let x = 0; x < W; x += 3) {
      ctx.fillStyle = r() > 0.5 ? "#ffffff" : "#000000";
      ctx.fillRect(x, 0, 1, H);
    }
    ctx.globalAlpha = 1;
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.9);
    vg.addColorStop(0, "rgba(255,255,255,0.05)");
    vg.addColorStop(1, "rgba(0,0,0,0.25)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    // тиснение: тёмная тень под золотом
    ctx.save();
    ctx.translate(3, 4);
    goldOrnament(ctx, W, H, "rgba(0,0,0,0.45)", true);
    ctx.restore();
    const gg = ctx.createLinearGradient(0, 0, W, H);
    gg.addColorStop(0, C.goldLight);
    gg.addColorStop(0.5, C.gold);
    gg.addColorStop(1, C.goldDeep);
    goldOrnament(ctx, W, H, gg as unknown as string, false);
    return toTexture(c);
  });
  const metal = cached("cover-metal", () => {
    // R: не используется, G: roughness, B: metalness (как в glTF)
    const W = 512;
    const H = 717;
    const [c, ctx] = canvas(W, H);
    ctx.fillStyle = "rgb(0,235,0)";
    ctx.fillRect(0, 0, W, H);
    ctx.scale(0.5, 0.5);
    goldOrnament(ctx, 1024, 1434, "rgb(0,90,210)", true);
    return toTexture(c, false);
  });
  const bump = cached("cover-bump", () => {
    const W = 512;
    const H = 717;
    const [c, ctx] = canvas(W, H);
    ctx.fillStyle = "#777";
    ctx.fillRect(0, 0, W, H);
    ctx.scale(0.5, 0.5);
    goldOrnament(ctx, 1024, 1434, "#2a2a2a", true);
    return toTexture(c, false);
  });
  return { map, metal, bump };
};

// ------------------------------------------------------------ страницы
const PW = 1024;
const PH = 1434;

type PageSide = "l" | "r";

const pageBase = (ctx: Ctx, side: PageSide, seed: number, dark = false) => {
  ctx.fillStyle = dark ? C.navy : C.milk;
  ctx.fillRect(0, 0, PW, PH);
  if (dark) {
    const g = ctx.createRadialGradient(PW / 2, PH * 0.4, 50, PW / 2, PH * 0.4, PW);
    g.addColorStop(0, "#1d3a5a");
    g.addColorStop(1, C.navyDeep);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, PW, PH);
  }
  paperFibers(ctx, PW, PH, seed, dark ? 0.6 : 1);
};

/** Тень у корешка и лёгкое затемнение края — объём разворота. */
const pageShade = (ctx: Ctx, side: PageSide, dark = false) => {
  const gx = side === "l" ? PW : 0;
  const g = ctx.createLinearGradient(gx, 0, side === "l" ? PW - 170 : 170, 0);
  g.addColorStop(0, dark ? "rgba(0,0,0,0.45)" : "rgba(90,60,30,0.28)");
  g.addColorStop(0.35, dark ? "rgba(0,0,0,0.12)" : "rgba(90,60,30,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PW, PH);
  const e = ctx.createLinearGradient(side === "l" ? 0 : PW, 0, side === "l" ? 40 : PW - 40, 0);
  e.addColorStop(0, "rgba(90,60,30,0.10)");
  e.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = e;
  ctx.fillRect(0, 0, PW, PH);
};

const pageFrame = (ctx: Ctx, side: PageSide, color: string = C.gold) => {
  ctx.save();
  ctx.strokeStyle = color;
  const inner = side === "l" ? [64, 64, PW - 120, PH - 128] : [56, 64, PW - 120, PH - 128];
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.85;
  ctx.strokeRect(inner[0], inner[1], inner[2], inner[3]);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(inner[0] + 12, inner[1] + 12, inner[2] - 24, inner[3] - 24);
  ctx.restore();
};

const heading = (ctx: Ctx, text: string, side: PageSide, color: string = C.ink) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `600 64px ${FONTS.serif}`;
  ctx.textAlign = "center";
  ctx.fillText(text, side === "l" ? PW / 2 + 10 : PW / 2 - 10, 170);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PW / 2 - 90, 205);
  ctx.lineTo(PW / 2 + 90, 205);
  ctx.stroke();
  ctx.restore();
};

const pageNumber = (ctx: Ctx, n: number, side: PageSide, color: string = C.ink) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.font = `500 34px ${FONTS.serif}`;
  ctx.textAlign = "center";
  ctx.fillText(String(n), side === "l" ? 130 : PW - 130, PH - 100);
  ctx.restore();
};

const dashedCircle = (ctx: Ctx, x: number, y: number, r: number, color: string, w = 2.5) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const smallStars = (ctx: Ctx, seed: number, n: number, color: string, alpha = 0.6) => {
  const r = rng(seed);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = 90 + r() * (PW - 180);
    const y = 240 + r() * (PH - 380);
    const s = 2 + r() * 5;
    ctx.globalAlpha = alpha * (0.4 + r() * 0.6);
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const rr = k % 2 === 0 ? s * 2 : s * 0.6;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

/** Тонкие «печатные» строки — абстрактный текст без смысла (не цитаты). */
const textLines = (ctx: Ctx, x: number, y: number, w: number, rows: number, seed: number) => {
  const r = rng(seed);
  ctx.save();
  ctx.fillStyle = "rgba(74,59,48,0.22)";
  for (let i = 0; i < rows; i++) {
    const lw = w * (i === rows - 1 ? 0.5 : 0.85 + r() * 0.15);
    let cx = x;
    while (cx < x + lw) {
      const ww = 16 + r() * 50;
      ctx.fillRect(cx, y + i * 34, Math.min(ww, x + lw - cx), 7);
      cx += ww + 12;
    }
  }
  ctx.restore();
};

const mountainSketch = (ctx: Ctx, side: PageSide) => {
  ctx.save();
  ctx.strokeStyle = "rgba(86,103,138,0.55)";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  // Контуры гор у корешка (будущие pop-up). Горы стоят на линии y ≈ 0.55.
  const peaks =
    side === "l"
      ? [
          [PW * 0.28, PH * 0.42, PW * 0.08, PW * 0.52],
          [PW * 0.7, PH * 0.3, PW * 0.42, PW * 1.0],
        ]
      : [
          [PW * 0.25, PH * 0.3, PW * 0.0, PW * 0.6],
          [PW * 0.62, PH * 0.38, PW * 0.38, PW * 0.88],
        ];
  for (const [px, py, x0, x1] of peaks) {
    ctx.beginPath();
    ctx.moveTo(x0, PH * 0.56);
    ctx.lineTo(px, py);
    ctx.lineTo(x1, PH * 0.56);
    ctx.stroke();
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(px - (px - x0) * 0.28, py + (PH * 0.56 - py) * 0.28);
    ctx.lineTo(px - (px - x0) * 0.08, py + (PH * 0.56 - py) * 0.36);
    ctx.lineTo(px + (x1 - px) * 0.12, py + (PH * 0.56 - py) * 0.26);
    ctx.lineTo(px + (x1 - px) * 0.28, py + (PH * 0.56 - py) * 0.3);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // река
  ctx.strokeStyle = "rgba(62,140,192,0.55)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (side === "l") {
    ctx.moveTo(PW, PH * 0.58);
    ctx.bezierCurveTo(PW * 0.75, PH * 0.66, PW * 0.9, PH * 0.78, PW * 0.6, PH * 0.9);
  } else {
    ctx.moveTo(0, PH * 0.58);
    ctx.bezierCurveTo(PW * 0.2, PH * 0.6, PW * 0.1, PH * 0.75, PW * 0.3, PH * 0.9);
  }
  ctx.stroke();
  ctx.restore();
};

const seedSketch = (ctx: Ctx, side: PageSide) => {
  ctx.save();
  ctx.strokeStyle = "rgba(47,110,78,0.5)";
  ctx.fillStyle = "rgba(47,110,78,0.10)";
  ctx.lineWidth = 3;
  const r = rng(side === "l" ? 41 : 42);
  for (let i = 0; i < 5; i++) {
    const x = PW * (0.2 + r() * 0.6);
    const y = PH * (0.62 + r() * 0.24);
    const a = r() * Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-34, 0);
    ctx.quadraticCurveTo(0, -24, 34, 0);
    ctx.quadraticCurveTo(0, 24, -34, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
};

/** Мелкая карта звёздного неба и орбит на тёмных страницах. */
const skySketch = (ctx: Ctx, side: PageSide) => {
  smallStars(ctx, side === "l" ? 77 : 78, 60, C.goldLight, 0.8);
  ctx.save();
  ctx.strokeStyle = "rgba(216,175,101,0.35)";
  ctx.lineWidth = 2;
  const cx = side === "l" ? PW : 0;
  for (const rr of [260, 420, 580]) {
    ctx.beginPath();
    ctx.ellipse(cx, PH * 0.45, rr, rr * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
};

const PAGE_DRAW: Record<string, (ctx: Ctx) => void> = {
  title: (ctx) => {
    pageBase(ctx, "r", 101);
    pageFrame(ctx, "r");
    ctx.save();
    ctx.fillStyle = C.navy;
    ctx.textAlign = "center";
    ctx.font = `700 92px ${FONTS.serif}`;
    ctx.fillText("КНИГА", PW / 2 - 10, PH * 0.36);
    ctx.fillText("ОТКРЫТИЙ", PW / 2 - 10, PH * 0.36 + 100);
    ctx.fillStyle = C.goldDeep;
    ctx.font = `800 34px ${FONTS.sans}`;
    ctx.fillText("M U S L I M   K I D S", PW / 2 - 10, PH * 0.62);
    ctx.restore();
    dashedCircle(ctx, PW / 2 - 10, PH * 0.5, 40, C.gold);
    pageShade(ctx, "r");
  },
  "preface-l": (ctx) => {
    pageBase(ctx, "l", 102);
    pageFrame(ctx, "l");
    heading(ctx, "Вступление", "l");
    textLines(ctx, 150, 300, PW - 300, 14, 5);
    smallStars(ctx, 6, 10, C.gold, 0.7);
    pageNumber(ctx, 2, "l");
    pageShade(ctx, "l");
  },
  "preface-r": (ctx) => {
    pageBase(ctx, "r", 103);
    pageFrame(ctx, "r");
    textLines(ctx, 140, 260, PW - 300, 20, 9);
    pageNumber(ctx, 3, "r");
    pageShade(ctx, "r");
  },
  "map-l": (ctx) => {
    pageBase(ctx, "l", 104);
    pageFrame(ctx, "l");
    heading(ctx, "Содержание", "l");
    textLines(ctx, 150, 300, PW - 300, 7, 12);
    pageNumber(ctx, 4, "l");
    pageShade(ctx, "l");
  },
  "map-r": (ctx) => {
    pageBase(ctx, "r", 105);
    pageFrame(ctx, "r");
    dashedCircle(ctx, PW / 2, PH * 0.45, 210, C.sky);
    textLines(ctx, 140, PH * 0.72, PW - 300, 6, 13);
    pageNumber(ctx, 5, "r");
    pageShade(ctx, "r");
  },
  "earth-l": (ctx) => {
    pageBase(ctx, "l", 106);
    ctx.fillStyle = "rgba(116,187,220,0.16)";
    ctx.fillRect(0, 0, PW, PH);
    pageFrame(ctx, "l", C.sky);
    heading(ctx, "Земля", "l", C.navyInk);
    smallStars(ctx, 14, 24, C.navyInk, 0.35);
    dashedCircle(ctx, PW, PH * 0.5, 330, "rgba(28,58,87,0.35)");
    pageNumber(ctx, 6, "l");
    pageShade(ctx, "l");
  },
  "earth-r": (ctx) => {
    pageBase(ctx, "r", 107);
    ctx.fillStyle = "rgba(116,187,220,0.16)";
    ctx.fillRect(0, 0, PW, PH);
    pageFrame(ctx, "r", C.sky);
    heading(ctx, "День и ночь", "r", C.navyInk);
    dashedCircle(ctx, 0, PH * 0.5, 330, "rgba(28,58,87,0.35)");
    smallStars(ctx, 15, 14, C.goldDeep, 0.4);
    pageNumber(ctx, 7, "r");
    pageShade(ctx, "r");
  },
  "mountains-l": (ctx) => {
    pageBase(ctx, "l", 108);
    pageFrame(ctx, "l", C.mountain);
    heading(ctx, "Горы", "l", C.mountainShade);
    mountainSketch(ctx, "l");
    pageNumber(ctx, 8, "l");
    pageShade(ctx, "l");
  },
  "mountains-r": (ctx) => {
    pageBase(ctx, "r", 109);
    pageFrame(ctx, "r", C.mountain);
    heading(ctx, "Реки и облака", "r", C.mountainShade);
    mountainSketch(ctx, "r");
    pageNumber(ctx, 9, "r");
    pageShade(ctx, "r");
  },
  "seed-l": (ctx) => {
    pageBase(ctx, "l", 110);
    ctx.fillStyle = "rgba(125,187,110,0.13)";
    ctx.fillRect(0, 0, PW, PH);
    pageFrame(ctx, "l", C.emerald);
    heading(ctx, "Семечко", "l", C.leafDeep);
    seedSketch(ctx, "l");
    pageNumber(ctx, 10, "l");
    pageShade(ctx, "l");
  },
  "seed-r": (ctx) => {
    pageBase(ctx, "r", 111);
    ctx.fillStyle = "rgba(125,187,110,0.13)";
    ctx.fillRect(0, 0, PW, PH);
    pageFrame(ctx, "r", C.emerald);
    heading(ctx, "Дерево", "r", C.leafDeep);
    seedSketch(ctx, "r");
    pageNumber(ctx, 11, "r");
    pageShade(ctx, "r");
  },
  "sky-l": (ctx) => {
    pageBase(ctx, "l", 112, true);
    pageFrame(ctx, "l", C.gold);
    heading(ctx, "Небо", "l", C.goldLight);
    skySketch(ctx, "l");
    pageNumber(ctx, 12, "l", C.goldLight);
    pageShade(ctx, "l", true);
  },
  "sky-r": (ctx) => {
    pageBase(ctx, "r", 113, true);
    pageFrame(ctx, "r", C.gold);
    heading(ctx, "Размышляй", "r", C.goldLight);
    skySketch(ctx, "r");
    pageNumber(ctx, 13, "r", C.goldLight);
    pageShade(ctx, "r", true);
  },
};

export const pageTexture = (key: string) =>
  cached(`page:${key}`, () => {
    const [c, ctx] = canvas(PW, PH);
    const draw = PAGE_DRAW[key];
    if (!draw) throw new Error(`Нет страницы ${key}`);
    draw(ctx);
    return toTexture(c);
  });

/** Форзац — внутренняя сторона обложки. */
export const endpaperTexture = () =>
  cached("endpaper", () => {
    const [c, ctx] = canvas(PW, PH);
    ctx.fillStyle = "#E9DDC8";
    ctx.fillRect(0, 0, PW, PH);
    ctx.strokeStyle = "rgba(184,140,69,0.55)";
    ctx.lineWidth = 2;
    const s = 96;
    for (let y = -s; y < PH + s; y += s) {
      for (let x = -s; x < PW + s; x += s) {
        const ox = (Math.round(y / s) % 2) * (s / 2);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          ctx.lineTo(x + ox + Math.cos(a) * 26, y + Math.sin(a) * 26);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.save();
        ctx.translate(x + ox, y);
        ctx.rotate(Math.PI / 8);
        ctx.strokeRect(-14, -14, 28, 28);
        ctx.restore();
      }
    }
    paperFibers(ctx, PW, PH, 33, 0.7);
    pageShade(ctx, "l");
    return toTexture(c);
  });

/** Срез блока страниц: тонкие линии листов. */
export const pageEdgeTexture = () =>
  cached("edge", () => {
    const [c, ctx] = canvas(64, 512);
    ctx.fillStyle = "#EFE5D3";
    ctx.fillRect(0, 0, 64, 512);
    const r = rng(9);
    for (let y = 0; y < 512; y += 3) {
      ctx.fillStyle = `rgba(150,120,90,${0.12 + r() * 0.2})`;
      ctx.fillRect(0, y, 64, 1);
    }
    return toTexture(c);
  });

// ------------------------------------------------------------ Земля
type LL = [number, number][];
const CONTINENTS: { pts: LL; color: string }[] = [
  {
    color: C.emeraldLight,
    pts: [[-168,66],[-160,71],[-140,70],[-120,72],[-95,72],[-80,68],[-65,60],[-55,52],[-66,45],[-75,38],[-80,31],[-81,25],[-90,29],[-97,26],[-97,20],[-90,16],[-84,10],[-78,8],[-87,14],[-95,15],[-105,20],[-115,30],[-123,38],[-125,48],[-135,57],[-150,60],[-165,60]],
  },
  {
    color: C.leaf,
    pts: [[-80,9],[-75,11],[-62,10],[-50,0],[-35,-6],[-38,-15],[-41,-22],[-48,-27],[-58,-35],[-65,-42],[-68,-52],[-73,-50],[-75,-40],[-72,-20],[-80,-5]],
  },
  { color: C.snow, pts: [[-55,60],[-45,60],[-20,70],[-20,80],[-40,83],[-65,80],[-58,70]] },
  {
    color: C.leafLight,
    pts: [[-10,36],[-9,43],[-2,44],[-5,48],[5,52],[8,57],[5,62],[15,69],[28,71],[40,67],[60,70],[80,73],[105,78],[140,72],[170,70],[180,66],[175,62],[160,58],[155,50],[142,46],[135,35],[122,31],[120,22],[108,20],[106,10],[100,13],[98,8],[103,1],[98,15],[92,22],[88,22],[80,15],[77,8],[72,20],[66,25],[57,25],[52,28],[48,30],[44,38],[36,36],[28,36],[26,40],[18,40],[12,44],[10,38],[4,43],[-4,36]],
  },
  { color: "#D9B77A", pts: [[35,30],[43,13],[52,15],[59,22],[56,26],[50,26],[48,30]] },
  {
    color: "#D9B77A",
    pts: [[-17,15],[-17,21],[-10,30],[-6,36],[10,37],[20,32],[32,31],[35,28],[43,12],[51,12],[42,0],[40,-10],[35,-24],[28,-34],[19,-35],[15,-26],[12,-15],[13,-5],[9,4],[-8,4],[-15,10]],
  },
  { color: "#D3A867", pts: [[114,-22],[122,-17],[131,-11],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[131,-31],[115,-35]] },
  { color: C.leaf, pts: [[-5,50],[1,51],[-2,57],[-6,58],[-5,54]] },
  { color: C.leaf, pts: [[130,31],[141,36],[142,43],[140,40],[134,34]] },
  { color: C.leaf, pts: [[44,-25],[50,-15],[47,-13],[43,-22]] },
  { color: C.leaf, pts: [[95,5],[105,-6],[115,-8],[110,-2],[100,2]] },
  { color: C.leaf, pts: [[109,1],[118,7],[119,-3],[112,-3]] },
  { color: C.leaf, pts: [[131,-1],[141,-3],[150,-10],[138,-8]] },
  { color: C.leaf, pts: [[167,-46],[174,-41],[178,-38],[172,-34],[170,-42]] },
];

export const earthTexture = () =>
  cached("earth", () => {
    const W = 2048;
    const H = 1024;
    const [c, ctx] = canvas(W, H);
    const P = (lon: number, lat: number) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
    // океан: слоистая бумага разной глубины
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#5aa7d2");
    g.addColorStop(0.5, "#3a86bd");
    g.addColorStop(1, "#5aa7d2");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(170,220,240,0.35)";
    ctx.lineWidth = 3;
    for (let k = 0; k < 18; k++) {
      ctx.beginPath();
      const y0 = (k + 0.5) * (H / 18);
      for (let x = 0; x <= W; x += 16) {
        const y = y0 + Math.sin((x / W) * Math.PI * 8 + k) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const drawPoly = (pts: LL) => {
      ctx.beginPath();
      pts.forEach(([lo, la], i) => {
        const [x, y] = P(lo, la);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    };
    for (const cont of CONTINENTS) {
      // тень вырезанного слоя бумаги
      ctx.save();
      ctx.translate(5, 7);
      drawPoly(cont.pts);
      ctx.fillStyle = "rgba(10,40,70,0.35)";
      ctx.fill();
      ctx.restore();
      // мелководье
      drawPoly(cont.pts);
      ctx.strokeStyle = "rgba(160,215,235,0.7)";
      ctx.lineWidth = 22;
      ctx.lineJoin = "round";
      ctx.stroke();
      drawPoly(cont.pts);
      ctx.fillStyle = cont.color;
      ctx.fill();
      // второй слой суши внутри
      ctx.save();
      drawPoly(cont.pts);
      ctx.clip();
      drawPoly(cont.pts);
      ctx.lineWidth = 34;
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.stroke();
      ctx.restore();
      drawPoly(cont.pts);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255,252,240,0.9)";
      ctx.stroke();
    }
    // полярные шапки
    ctx.fillStyle = C.snow;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 32) ctx.lineTo(x, H * 0.9 + Math.sin(x * 0.02) * 10);
    ctx.lineTo(W, H);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= W; x += 32) ctx.lineTo(x, H * 0.05 + Math.sin(x * 0.03) * 8);
    ctx.lineTo(W, 0);
    ctx.fill();
    paperFibers(ctx, W, H, 55, 0.8);
    return toTexture(c);
  });

/** Ночное небо с проколотыми звёздами — для арки во вселенной. */
export const nightPaperTexture = () =>
  cached("night", () => {
    const [c, ctx] = canvas(1024, 512);
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#0d1d31");
    g.addColorStop(1, "#1d3d61");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 512);
    const r = rng(19);
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = `rgba(250,230,180,${0.3 + r() * 0.7})`;
      ctx.beginPath();
      ctx.arc(r() * 1024, r() * 512, 0.8 + r() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    paperFibers(ctx, 1024, 512, 20, 0.5);
    return toTexture(c);
  });
