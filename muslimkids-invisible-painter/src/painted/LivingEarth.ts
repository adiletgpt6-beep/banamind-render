// Нарисованная Земля, которая оживает (PAINT → AWAKENING → ALIVE).
// Материки — акварельные лессировки в координатах lon/lat, проецируются
// ортографически на сферу. Вращение — вокруг собственной оси с запада на восток
// (детали поверхности смещаются слева направо), наклон оси ≈ 23°.
// Солнечный свет приходит с постоянного направления: одна половина освещена — ДЕНЬ,
// другая в тени — НОЧЬ. Тень — тоже пигмент (multiply), а не 3D-шейдинг.

import { deformPoly, circle, drawWash, type Pt } from "../engines/WatercolorSimulationEngine";
import type { LightQueue } from "../engines/PainterlyLightingSystem";
import { PALETTE } from "../engines/PainterlyLightingSystem";
import { clamp01, noise3 } from "../utils/noise";

type LL = [number, number];
const CONTINENTS: { id: string; pts: LL[]; tone: "green" | "dry" | "ice" }[] = [
  { id: "na", tone: "green", pts: [[-168,66],[-156,71],[-140,70],[-120,72],[-95,72],[-80,73],[-62,66],[-56,52],[-66,45],[-76,38],[-81,31],[-80,26],[-82,30],[-90,29.5],[-97,26],[-97,21],[-90,21],[-87,16],[-83,10],[-79,8],[-85,12],[-92,15],[-105,20],[-110,24],[-117,32],[-124,40],[-124,48],[-133,56],[-150,60],[-160,58],[-166,62]] },
  { id: "sa", tone: "green", pts: [[-79,8],[-72,12],[-62,10],[-52,5],[-50,0],[-44,-2],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-63,-42],[-66,-47],[-69,-52],[-72,-54],[-75,-50],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,0],[-78,4]] },
  { id: "af", tone: "dry", pts: [[-17,21],[-16,28],[-9,32],[-6,36],[10,37],[11,33],[20,31],[25,32],[32,31],[34,28],[39,20],[43,12],[51,12],[48,5],[40,-3],[40,-11],[35,-20],[33,-26],[27,-34],[20,-35],[18,-30],[12,-18],[13,-10],[9,-1],[9,4],[4,6],[-4,5],[-8,4],[-13,8],[-17,14]] },
  { id: "eu", tone: "green", pts: [[-10,36],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[10,57],[5,62],[14,67],[25,71],[40,68],[60,70],[80,73],[100,77],[120,73],[140,72],[160,70],[180,68],[178,64],[163,60],[156,51],[142,46],[140,40],[129,35],[122,31],[121,25],[110,20],[108,12],[104,9],[100,13],[98,8],[103,1],[100,6],[98,16],[92,22],[88,22],[80,15],[77,8],[73,20],[67,25],[57,25],[56,27],[50,30],[48,29],[52,24],[56,22],[59,22],[52,16],[44,13],[43,15],[38,22],[35,28],[35,33],[36,36],[30,36],[27,37],[26,40],[23,38],[22,40],[19,42],[16,38],[12,44],[8,44],[3,43],[-1,37],[-6,36]] },
  { id: "au", tone: "dry", pts: [[114,-22],[114,-30],[115,-34],[123,-34],[131,-31],[138,-35],[140,-38],[147,-38],[150,-36],[153,-30],[153,-25],[146,-18],[145,-15],[142,-11],[141,-17],[136,-12],[131,-11],[126,-14],[122,-18]] },
  { id: "gl", tone: "ice", pts: [[-73,78],[-60,82],[-30,83],[-20,77],[-22,70],[-40,65],[-50,62],[-54,67],[-58,75]] },
];
// пустыни — золотисто-коричневые пятна поверх зелени (Сахара, Аравия, Австралия)
const DESERTS: { id: string; c: LL; r: number }[] = [
  { id: "sahara", c: [10, 22], r: 13 },
  { id: "arabia", c: [46, 23], r: 7 },
  { id: "ozz", c: [130, -25], r: 9 },
  { id: "gobi", c: [100, 43], r: 8 },
];
const CLOUDS: { lat: number; lon: number; len: number; w: number; speed: number }[] = [
  { lat: 48, lon: -30, len: 50, w: 16, speed: 1.15 },
  { lat: 8, lon: 60, len: 40, w: 13, speed: 1.1 },
  { lat: -35, lon: -10, len: 55, w: 15, speed: 1.2 },
  { lat: 28, lon: 150, len: 45, w: 12, speed: 1.12 },
  { lat: -12, lon: -120, len: 40, w: 12, speed: 1.08 },
  { lat: 60, lon: 110, len: 60, w: 13, speed: 1.18 },
  { lat: -50, lon: 120, len: 50, w: 14, speed: 1.1 },
  { lat: 15, lon: -60, len: 30, w: 11, speed: 1.15 },
];
const CITIES: LL[] = [[-74,41],[-0.1,51.5],[37.6,55.7],[31,30],[77,28.6],[116,40],[139.7,35.7],[-46.6,-23.5],[3.4,6.5],[151,-34],[74.6,42.9],[-99,19.4],[28,-26],[46.7,24.7],[103.8,1.3]];

const LAYERS = 4;
const deformed = new Map<string, Pt[][]>();
const layersOf = (id: string, pts: LL[]) => {
  let d = deformed.get(id);
  if (!d) {
    const base = deformPoly(pts.map(([x, y]) => ({ x, y })), 1, 0.8, id.length * 131 + id.charCodeAt(0));
    d = Array.from({ length: LAYERS }, (_, k) => deformPoly(base, 2, 0.45, 900 + k * 17 + id.charCodeAt(1)));
    deformed.set(id, d);
  }
  return d;
};

export type EarthState = {
  x: number;
  y: number;
  r: number;
  /** центральная долгота (градусы) */
  lon: number;
  /** раскрытие пятна океана 0..1 */
  ocean: number;
  /** раскрытие материков 0..1 */
  land: number;
  clouds: number;
  /** объём, свет и тень 0..1 */
  awaken: number;
  /** направление на Солнце (экранное) */
  light: { x: number; y: number };
  alpha?: number;
  /** id-префикс (несколько Земель в фильме) */
  key: string;
  tilt?: number;
};

const VIEW_LAT = (14 * Math.PI) / 180;

export function project(s: EarthState, lon: number, lat: number) {
  const l = ((lon - s.lon) * Math.PI) / 180;
  const p = (lat * Math.PI) / 180;
  const x = Math.cos(p) * Math.sin(l);
  const y = -(Math.sin(p) * Math.cos(VIEW_LAT) - Math.cos(p) * Math.sin(VIEW_LAT) * Math.cos(l));
  const z = Math.sin(p) * Math.sin(VIEW_LAT) + Math.cos(p) * Math.cos(VIEW_LAT) * Math.cos(l);
  return { x, y, z };
}

export function drawEarth(ctx: CanvasRenderingContext2D, s: EarthState, lights: LightQueue, f: number) {
  const a = s.alpha ?? 1;
  if (a <= 0.005 || s.ocean <= 0.001) return;
  const { x: X, y: Y, r: R } = s;
  // 1. Синее пятно → диск океана
  const oceanSpec = {
    id: `${s.key}-ocean`,
    shape: circle(X, Y, R, 16),
    origin: { x: X - R * 0.25, y: Y + R * 0.1 },
    colors: ["#2F78A8", PALETTE.deep, "#4F9ED0", "#2A6E9E"],
    layers: 20,
    opacity: 0.92,
    edge: 0.9,
    deform: 0.18,
    spreadJitter: 0.75,
  };
  drawWash(ctx, oceanSpec, s.ocean, { time: f * 0.02, wobble: 0.06, alpha: a });
  // мягкая вариация воды внутри
  drawWash(ctx, { id: `${s.key}-ocean-light`, shape: circle(X - R * 0.35, Y - R * 0.3, R * 0.5, 10), colors: [PALETTE.sky], layers: 8, opacity: 0.35, edge: 0.2 }, s.ocean, { alpha: a });

  const disk = new Path2D();
  disk.arc(X, Y, R * 0.985, 0, Math.PI * 2);
  ctx.save();
  ctx.clip(disk);
  ctx.translate(X, Y);
  ctx.rotate(s.tilt ?? -0.38);
  // 2. Материки
  if (s.land > 0.001) {
    for (const c of CONTINENTS) {
      const L = layersOf(s.key + c.id, c.pts);
      L.forEach((layer, k) => {
        const reveal = clamp01(s.land * 1.6 - (k / LAYERS) * 0.6);
        if (reveal <= 0) return;
        const path = new Path2D();
        let vis = false;
        const cx = c.pts.reduce((acc, q) => acc + q[0], 0) / c.pts.length;
        const cy = c.pts.reduce((acc, q) => acc + q[1], 0) / c.pts.length;
        layer.forEach((q, i) => {
          // материк «проступает» из центра к краям
          const lon = cx + (q.x - cx) * (0.4 + 0.6 * reveal);
          const lat = cy + (q.y - cy) * (0.4 + 0.6 * reveal);
          const pr = project(s, lon, lat);
          let px = pr.x, py = pr.y;
          if (pr.z < 0) {
            const l = Math.hypot(px, py) || 1;
            px /= l;
            py /= l;
          } else vis = true;
          if (i) path.lineTo(px * R, py * R);
          else path.moveTo(px * R, py * R);
        });
        if (!vis) return;
        path.closePath();
        ctx.globalCompositeOperation = c.tone === "ice" ? "source-over" : "multiply";
        ctx.globalAlpha = (c.tone === "ice" ? 0.5 : 0.5) * reveal * a;
        ctx.fillStyle = c.tone === "ice" ? "#FFFFFF" : k === 3 ? "#B9D37A" : k === 1 ? "#6DB37F" : "#8CC48E";
        ctx.fill(path);
        if (k === 0) {
          ctx.globalAlpha = 0.35 * reveal * a;
          ctx.strokeStyle = c.tone === "ice" ? "#CFE6F2" : PALETTE.green;
          ctx.lineWidth = Math.max(1.5, R * 0.008);
          ctx.stroke(path);
        }
      });
    }
    for (const d of DESERTS) {
      const pr = project(s, d.c[0], d.c[1]);
      if (pr.z <= 0.05) continue;
      const rr = (d.r / 57) * R;
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.55 * clamp01(s.land * 1.4 - 0.4) * a * Math.sqrt(pr.z);
      const g = ctx.createRadialGradient(pr.x * R, pr.y * R, 0, pr.x * R, pr.y * R, rr);
      g.addColorStop(0, "#D9A155");
      g.addColorStop(0.6, "rgba(217,161,85,0.6)");
      g.addColorStop(1, "rgba(217,161,85,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(pr.x * R, pr.y * R, rr * (0.4 + 0.6 * pr.z) * 1.3, rr, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 3. Облака — белые полупрозрачные гуашевые мазки
  if (s.clouds > 0.001) {
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "source-over";
    for (const c of CLOUDS) {
      const n = 16;
      const show = clamp01(s.clouds);
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= n * show; i++) {
          const t = i / n;
          const lon = c.lon + (s.lon - s.lon / c.speed) * 0.25 + t * c.len;
          const lat = c.lat + Math.sin(t * 3 + c.lon) * 3 + pass * 2.2;
          const pr = project(s, lon, lat);
          if (pr.z < 0.08) { pen = false; continue; }
          if (!pen) ctx.moveTo(pr.x * R, pr.y * R);
          else ctx.lineTo(pr.x * R, pr.y * R);
          pen = true;
        }
        ctx.globalAlpha = (pass ? 0.3 : 0.42) * a;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineCap = "butt";
        ctx.lineWidth = ((c.w / 57) * R) * (pass ? 0.22 : 0.42);
        ctx.setLineDash(pass ? [R * 0.05, R * 0.03, R * 0.12, R * 0.02] : [R * 0.2, R * 0.025, R * 0.08, R * 0.03]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
  ctx.restore();

  // 4. AWAKENING — объём: терминатор, ночная лессировка, потемнение к краю
  if (s.awaken > 0.001) {
    const len = Math.hypot(s.light.x, s.light.y) || 1;
    const lx = s.light.x / len, ly = s.light.y / len;
    ctx.save();
    ctx.clip(disk);
    const night = ctx.createLinearGradient(X + lx * R, Y + ly * R, X - lx * R, Y - ly * R);
    night.addColorStop(0, "rgba(16,28,57,0)");
    night.addColorStop(0.44, "rgba(16,28,57,0)");
    night.addColorStop(0.58, "rgba(16,28,57,0.78)");
    night.addColorStop(1, "rgba(16,28,57,0.9)");
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = s.awaken * a;
    ctx.fillStyle = night;
    ctx.fillRect(X - R, Y - R, R * 2, R * 2);
    const limb = ctx.createRadialGradient(X + lx * R * 0.2, Y + ly * R * 0.2, R * 0.55, X, Y, R);
    limb.addColorStop(0, "rgba(23,74,117,0)");
    limb.addColorStop(1, "rgba(23,74,117,0.4)");
    ctx.fillStyle = limb;
    ctx.fillRect(X - R, Y - R, R * 2, R * 2);
    // блик на дневной стороне — светлая гуашь
    const hl = ctx.createRadialGradient(X + lx * R * 0.45, Y + ly * R * 0.45, 0, X + lx * R * 0.45, Y + ly * R * 0.45, R * 0.75);
    hl.addColorStop(0, "rgba(255,248,226,0.3)");
    hl.addColorStop(1, "rgba(255,248,226,0)");
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = s.awaken * a * 0.8;
    ctx.fillStyle = hl;
    ctx.fillRect(X - R, Y - R, R * 2, R * 2);
    ctx.restore();
    // атмосфера и огни городов на ночной стороне
    lights.push(ctx, { kind: "glow", x: X + lx * R * 0.55, y: Y + ly * R * 0.55, r: R * 1.35, color: "#BFE6FA", alpha: 0.32 * s.awaken * a });
    for (const [lon, lat] of CITIES) {
      const pr = project(s, lon, lat);
      if (pr.z < 0.15) continue;
      const c = Math.cos(-0.38), sn = Math.sin(-0.38);
      const px = (pr.x * c - pr.y * sn) * R, py = (pr.x * sn + pr.y * c) * R;
      const side = (px * lx + py * ly) / R; // <0 — ночная сторона
      const dark = clamp01((-side - 0.08) * 4);
      if (dark <= 0) continue;
      const tw = 0.8 + 0.2 * noise3(lon, lat, f * 0.05);
      lights.push(ctx, { kind: "glow", x: X + px, y: Y + py, r: R * 0.06, color: "#FFD58A", alpha: 0.9 * dark * s.awaken * a * tw });
    }
  }
}
