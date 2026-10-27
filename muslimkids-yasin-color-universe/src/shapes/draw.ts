// Векторные силуэты для масок. Все функции только строят и заливают пути
// белым цветом в координатах кадра 1080×1920. Арабский текст и цитаты
// здесь НЕ рисуются — они остаются отдельным неподвижным типографским слоем.
type C = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

export const circle = (c: C, x: number, y: number, r: number) => {
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
};

export const cut = (c: C, f: () => void) => {
  c.save();
  c.globalCompositeOperation = "destination-out";
  f();
  c.restore();
};

export const glyph = (c: C, text: string, cx: number, cy: number, size: number, weight = 800, family = "Unbounded", maxW = 880) => {
  c.font = `${weight} ${size}px ${family}`;
  let m = c.measureText(text);
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  if (w > maxW) {
    c.font = `${weight} ${(size * maxW) / w}px ${family}`;
  }
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  m = c.measureText(text);
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  c.fillText(text, cx, cy + h / 2 - m.actualBoundingBoxDescent);
};

export const heart = (c: C, cx: number, cy: number, w: number) => {
  const s = w / 34;
  c.beginPath();
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * TAU;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const px = cx + x * s, py = cy - y * s - 1.5 * s;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
  c.fill();
};

/** Отпечаток стопы. mirror=−1 — левая нога. h — высота отпечатка. */
export const footprint = (c: C, cx: number, cy: number, h: number, angle = 0, mirror = 1) => {
  c.save();
  c.translate(cx, cy);
  c.rotate(angle);
  c.scale(mirror * h, h);
  c.beginPath();
  c.ellipse(0.03, -0.06, 0.25, 0.3, 0.12, 0, TAU);
  c.fill();
  c.beginPath();
  c.ellipse(-0.01, 0.3, 0.19, 0.18, 0, 0, TAU);
  c.fill();
  c.beginPath();
  c.moveTo(-0.2, -0.02);
  c.quadraticCurveTo(-0.08, 0.12, -0.18, 0.3);
  c.lineTo(0.17, 0.3);
  c.quadraticCurveTo(0.26, 0.12, 0.27, -0.02);
  c.closePath();
  c.fill();
  const toes: Array<[number, number, number]> = [
    [-0.15, -0.44, 0.105], [0.02, -0.5, 0.078], [0.15, -0.46, 0.068], [0.25, -0.39, 0.06], [0.32, -0.29, 0.052],
  ];
  toes.forEach(([x, y, r]) => circle(c, x, y, r));
  c.restore();
};

export const book = (c: C, cx: number, cy: number, w: number, h: number, lines = true) => {
  const g = w * 0.012;
  const top = cy - h / 2, bot = cy + h / 2;
  const sag = h * 0.07;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * g, top + sag);
    c.quadraticCurveTo(cx + s * w * 0.22, top - sag * 0.9, cx + s * w * 0.5, top);
    c.lineTo(cx + s * w * 0.5, bot - sag * 0.6);
    c.quadraticCurveTo(cx + s * w * 0.22, bot - sag * 1.6, cx + s * g, bot);
    c.closePath();
    c.fill();
  }
  if (lines) {
    cut(c, () => {
      c.lineWidth = h * 0.028;
      c.lineCap = "round";
      for (const s of [-1, 1]) {
        for (let k = 1; k <= 5; k++) {
          const f = k / 6.2;
          const x0 = cx + s * w * 0.09, x1 = cx + s * w * 0.42;
          const yTop = top + sag * 0.6 + (bot - top) * f;
          c.beginPath();
          c.moveTo(x0, yTop + sag * 0.1);
          c.quadraticCurveTo(cx + s * w * 0.24, yTop - sag * 0.75, x1, yTop - sag * 0.15);
          c.stroke();
        }
      }
    });
  }
  // переплёт / обложка под страницами
  c.lineWidth = h * 0.06;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(cx - w * 0.53, bot + h * 0.02 - sag * 0.5);
  c.quadraticCurveTo(cx - w * 0.24, bot + h * 0.05 - sag * 1.4, cx, bot + h * 0.1);
  c.quadraticCurveTo(cx + w * 0.24, bot + h * 0.05 - sag * 1.4, cx + w * 0.53, bot + h * 0.02 - sag * 0.5);
  c.stroke();
};

export const sunShape = (c: C, cx: number, cy: number, R: number, rays = 12) => {
  circle(c, cx, cy, R);
  c.lineWidth = R * 0.17;
  c.lineCap = "round";
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * TAU - Math.PI / 2;
    const r0 = R * 1.28, r1 = R * (i % 2 ? 1.55 : 1.72);
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    c.stroke();
  }
};

/** Фаза Луны: 0 — новолуние (контур), 0.5 — четверть, 1 — полнолуние; освещена правая сторона. */
export const moonPhase = (c: C, cx: number, cy: number, R: number, phase: number) => {
  if (phase <= 0.02) {
    c.lineWidth = R * 0.12;
    c.beginPath();
    c.arc(cx, cy, R * 0.94, 0, TAU);
    c.stroke();
    return;
  }
  if (phase >= 0.98) {
    circle(c, cx, cy, R);
    return;
  }
  c.beginPath();
  c.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2);
  c.closePath();
  c.fill();
  const rx = R * Math.abs(Math.cos(phase * Math.PI));
  const ell = () => {
    c.beginPath();
    c.ellipse(cx, cy, Math.max(0.5, rx), R * 1.002, 0, 0, TAU);
    c.fill();
  };
  if (phase < 0.5) cut(c, ell);
  else ell();
};

export const crescent = (c: C, cx: number, cy: number, R: number, dx = 0.42, dy = -0.18, rr = 0.86) => {
  circle(c, cx, cy, R);
  cut(c, () => circle(c, cx + R * dx, cy + R * dy, R * rr));
};

const bez = (p0: number[], p1: number[], p2: number[], t: number) => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};

/** Перистый лист пальмы: стержень + листочки по обе стороны. */
export const frond = (c: C, x0: number, y0: number, angle: number, L: number, s: number) => {
  const p0 = [x0, y0];
  const dir = [Math.cos(angle), Math.sin(angle)];
  const p1 = [x0 + dir[0] * L * 0.55, y0 + dir[1] * L * 0.55 - L * 0.22];
  const p2 = [x0 + dir[0] * L, y0 + dir[1] * L + L * 0.34];
  c.lineCap = "round";
  c.lineWidth = 11 * s;
  c.beginPath();
  c.moveTo(p0[0], p0[1]);
  c.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
  c.stroke();
  const N = 11;
  for (let i = 1; i <= N; i++) {
    const t = 0.1 + (i / N) * 0.86;
    const p = bez(p0, p1, p2, t);
    const q = bez(p0, p1, p2, Math.min(1, t + 0.01));
    const tx = q[0] - p[0], ty = q[1] - p[1];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl, ny = tx / tl;
    const len = L * 0.3 * Math.pow(Math.sin(Math.PI * Math.min(0.95, t)), 0.7) * (1 - t * 0.3);
    c.lineWidth = 10 * s;
    for (const sd of [-1, 1]) {
      c.beginPath();
      c.moveTo(p[0], p[1]);
      // листочки отогнуты назад и немного вниз — силуэт финиковой пальмы
      c.lineTo(p[0] + (nx * sd * 0.8 + (tx / tl) * 0.5) * len, p[1] + (ny * sd * 0.8 + (ty / tl) * 0.5) * len + len * 0.35);
      c.stroke();
    }
  }
};

export const palmTrunk = (c: C, cx: number, baseY: number, s: number) => {
  const top = [cx - 18 * s, baseY - 540 * s];
  const N = 30;
  const left: number[][] = [], right: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = bez([cx + 30 * s, baseY], [cx + 50 * s, baseY - 300 * s], top, t);
    const w = (34 - 14 * t) * s;
    left.push([p[0] - w, p[1]]);
    right.push([p[0] + w, p[1]]);
  }
  c.beginPath();
  left.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  right.reverse().forEach(([x, y]) => c.lineTo(x, y));
  c.closePath();
  c.fill();
  // кольца ствола
  cut(c, () => {
    c.lineWidth = 7 * s;
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const p = bez([cx + 30 * s, baseY], [cx + 50 * s, baseY - 300 * s], top, t);
      const w = (34 - 14 * t) * s;
      c.beginPath();
      c.moveTo(p[0] - w * 1.2, p[1] + 4 * s);
      c.lineTo(p[0] + w * 1.2, p[1] - 4 * s);
      c.stroke();
    }
  });
  return top;
};

export const palmCrown = (c: C, cx: number, cy: number, s: number) => {
  const fr: Array<[number, number]> = [
    [-178, 330], [-142, 320], [-104, 250], [-72, 260], [-36, 320], [-2, 330], [150, 210], [30, 210],
  ];
  fr.forEach(([deg, L]) => frond(c, cx, cy, (deg * Math.PI) / 180, L * s, s));
};

export const palmDates = (c: C, cx: number, cy: number, s: number) => {
  const pts: Array<[number, number]> = [
    [-40, 30], [-58, 52], [-30, 58], [-48, 80], [-18, 34], [30, 34], [48, 56], [20, 60], [40, 84], [60, 30],
  ];
  pts.forEach(([x, y]) => circle(c, cx + x * s, cy + y * s, 15 * s));
};

export const grapeBerries = (cx: number, topY: number, s: number) => {
  const rows = [5, 6, 5, 4, 3, 2, 1];
  const rb = 40 * s;
  const out: Array<[number, number, number]> = [];
  rows.forEach((n, j) => {
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * rb * 1.84 + (j % 2 ? 0 : rb * 0.12);
      const y = topY + j * rb * 1.58;
      out.push([x, y, rb * 0.9]);
    }
  });
  return out;
};

export const grapeLeafStem = (c: C, cx: number, topY: number, s: number) => {
  c.lineCap = "round";
  c.lineWidth = 16 * s;
  c.beginPath();
  c.moveTo(cx + 6 * s, topY - 30 * s);
  c.quadraticCurveTo(cx + 10 * s, topY - 110 * s, cx + 60 * s, topY - 150 * s);
  c.stroke();
  // виноградный лист: лопастной контур
  const lx = cx + 150 * s, ly = topY - 120 * s, R = 105 * s;
  c.beginPath();
  for (let i = 0; i <= 120; i++) {
    const th = (i / 120) * TAU;
    const r = R * (0.72 + 0.2 * Math.cos(5 * th) + 0.08 * Math.cos(10 * th));
    const x = lx + r * Math.cos(th - 0.6), y = ly + r * Math.sin(th - 0.6) * 0.92;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
  c.fill();
  cut(c, () => {
    c.lineWidth = 6 * s;
    for (let k = 0; k < 5; k++) {
      const th = (k / 5) * TAU - 0.6;
      c.beginPath();
      c.moveTo(lx, ly);
      c.lineTo(lx + Math.cos(th) * R * 0.6, ly + Math.sin(th) * R * 0.55);
      c.stroke();
    }
  });
};

export const leaf = (c: C, x0: number, y0: number, x1: number, y1: number, wf = 0.32) => {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const dx = x1 - x0, dy = y1 - y0;
  const nx = -dy * wf, ny = dx * wf;
  c.beginPath();
  c.moveTo(x0, y0);
  c.quadraticCurveTo(mx + nx, my + ny, x1, y1);
  c.quadraticCurveTo(mx - nx, my - ny, x0, y0);
  c.fill();
};

export const sproutShape = (c: C, cx: number, groundY: number, s: number, big = false) => {
  const topY = groundY - (big ? 360 : 240) * s;
  c.lineCap = "round";
  c.lineWidth = (big ? 24 : 20) * s;
  c.beginPath();
  c.moveTo(cx, groundY + 10 * s);
  c.quadraticCurveTo(cx - 20 * s, (groundY + topY) / 2, cx + 6 * s, topY);
  c.stroke();
  leaf(c, cx - 2 * s, topY + 40 * s, cx - 190 * s, topY - 70 * s, 0.3);
  leaf(c, cx + 6 * s, topY + 10 * s, cx + 200 * s, topY - 120 * s, 0.3);
  if (big) {
    leaf(c, cx - 8 * s, topY + 170 * s, cx - 170 * s, topY + 80 * s, 0.3);
    leaf(c, cx + 2 * s, topY + 130 * s, cx + 170 * s, topY + 50 * s, 0.3);
    leaf(c, cx + 6 * s, topY + 6 * s, cx + 30 * s, topY - 120 * s, 0.34);
  }
};

export const wheatEar = (c: C, x: number, baseY: number, s: number, lean: number) => {
  const tip = [x + lean * s, baseY - 470 * s];
  c.lineCap = "round";
  c.lineWidth = 10 * s;
  c.beginPath();
  c.moveTo(x, baseY);
  c.quadraticCurveTo(x, baseY - 250 * s, tip[0], tip[1]);
  c.stroke();
  for (let k = 0; k < 6; k++) {
    const t = 0.55 + k * 0.075;
    const p = bez([x, baseY], [x, baseY - 250 * s], tip, t);
    for (const sd of [-1, 1]) {
      c.beginPath();
      c.ellipse(p[0] + sd * 17 * s, p[1] - 6 * s, 14 * s, 30 * s, sd * 0.5, 0, TAU);
      c.fill();
    }
  }
  c.beginPath();
  c.ellipse(tip[0], tip[1] - 18 * s, 12 * s, 30 * s, 0, 0, TAU);
  c.fill();
};

export const groundBand = (c: C, cx: number, topY: number, w: number, h: number, cracks: boolean) => {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  c.beginPath();
  c.moveTo(x0, topY + 30);
  for (let i = 0; i <= 60; i++) {
    const x = x0 + (w * i) / 60;
    const y = topY + 14 * Math.sin(i * 0.45) + 8 * Math.sin(i * 1.3 + 1) + (i < 4 ? (4 - i) * 8 : 0) + (i > 56 ? (i - 56) * 8 : 0);
    c.lineTo(x, y);
  }
  c.lineTo(x1 - 30, topY + h);
  c.quadraticCurveTo(cx, topY + h + 26, x0 + 30, topY + h);
  c.closePath();
  c.fill();
  if (cracks) {
    cut(c, () => {
      c.lineWidth = 10;
      c.lineJoin = "round";
      const cr: Array<Array<[number, number]>> = [
        [[-330, 0], [-300, 50], [-340, 95], [-310, 150]],
        [[-120, 10], [-90, 60], [-130, 105], [-100, 170]],
        [[90, 0], [120, 55], [80, 100], [115, 160]],
        [[300, 10], [270, 60], [310, 110], [280, 165]],
      ];
      cr.forEach((pts) => {
        c.beginPath();
        pts.forEach(([x, y], i) => (i ? c.lineTo(cx + x, topY + y) : c.moveTo(cx + x, topY + y)));
        c.stroke();
      });
    });
  }
};

export const raindrop = (c: C, x: number, y: number, s: number) => {
  c.beginPath();
  c.moveTo(x, y - 62 * s);
  c.bezierCurveTo(x + 14 * s, y - 34 * s, x + 30 * s, y - 6 * s, x + 30 * s, y + 10 * s);
  c.arc(x, y + 10 * s, 30 * s, 0, Math.PI);
  c.bezierCurveTo(x - 30 * s, y - 6 * s, x - 14 * s, y - 34 * s, x, y - 62 * s);
  c.fill();
};

export const hand = (c: C, cx: number, cy: number, s: number) => {
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.fill();
  };
  rr(cx - 92 * s, cy - 50 * s, 184 * s, 190 * s, 56 * s);
  const fingers: Array<[number, number]> = [[-78, 150], [-34, 182], [10, 172], [54, 140]];
  fingers.forEach(([x, h]) => rr(cx + x * s, cy - 30 * s - h * s, 38 * s, h * s + 20 * s, 19 * s));
  c.save();
  c.translate(cx - 80 * s, cy + 50 * s);
  c.rotate(-0.75);
  rr(-20 * s, -150 * s, 40 * s, 150 * s, 20 * s);
  c.restore();
};

export const checkCircle = (c: C, cx: number, cy: number, R: number) => {
  c.lineWidth = R * 0.17;
  c.beginPath();
  c.arc(cx, cy, R, 0, TAU);
  c.stroke();
  c.lineWidth = R * 0.2;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(cx - R * 0.45, cy + R * 0.02);
  c.lineTo(cx - R * 0.1, cy + R * 0.36);
  c.lineTo(cx + R * 0.5, cy - R * 0.32);
  c.stroke();
};

export const earthOcean = (c: C, cx: number, cy: number, R: number) => {
  circle(c, cx, cy, R);
  cut(c, () => earthLandPaths(c, cx, cy, R));
};

const earthLandPaths = (c: C, cx: number, cy: number, R: number) => {
  // условные материки: две Америки слева, Евразия и Африка справа
  const blobs: Array<[number, number, number, number, number]> = [
    [-0.5, -0.38, 0.3, 0.2, 0.5], [-0.42, 0.22, 0.13, 0.36, 0.25], [0.28, -0.5, 0.48, 0.17, 0.12], [0.3, 0.1, 0.2, 0.34, -0.15], [0.62, -0.22, 0.14, 0.18, 0],
  ];
  blobs.forEach(([x, y, rx, ry, a]) => {
    c.beginPath();
    c.ellipse(cx + x * R, cy + y * R, rx * R, ry * R, a, 0, TAU);
    c.fill();
  });
};

export const earthLand = (c: C, cx: number, cy: number, R: number) => {
  c.save();
  c.beginPath();
  c.arc(cx, cy, R * 0.97, 0, TAU);
  c.clip();
  earthLandPaths(c, cx, cy, R);
  c.restore();
};

export const waveBand = (c: C, x0: number, x1: number, y: number, amp: number, freq: number, phase: number, width: number) => {
  c.lineWidth = width;
  c.lineCap = "round";
  c.beginPath();
  for (let i = 0; i <= 120; i++) {
    const x = x0 + ((x1 - x0) * i) / 120;
    const yy = y + amp * Math.sin((i / 120) * freq * TAU + phase);
    if (i) c.lineTo(x, yy);
    else c.moveTo(x, yy);
  }
  c.stroke();
};

// ——— генераторы явных точек ———

export const ellipsePoints = (cx: number, cy: number, rx: number, ry: number, tilt: number, spacing: number, a0 = 0, a1 = TAU) => {
  const pts: Array<[number, number]> = [];
  const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const n = Math.max(3, Math.round((per * (a1 - a0)) / TAU / spacing));
  const c = Math.cos(tilt), s = Math.sin(tilt);
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / (a1 - a0 >= TAU - 1e-6 ? n : n - 1);
    const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
    pts.push([cx + ex * c - ey * s, cy + ex * s + ey * c]);
  }
  return pts;
};

export const starPoints = (seed: number, n: number, x0: number, y0: number, x1: number, y1: number, avoid?: (x: number, y: number) => boolean) => {
  const pts: Array<[number, number]> = [];
  let k = 0;
  let a = seed >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  while (pts.length < n && k++ < n * 50) {
    const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
    if (avoid && avoid(x, y)) continue;
    if (pts.some(([px, py]) => Math.hypot(px - x, py - y) < 26)) continue;
    pts.push([x, y]);
  }
  return pts;
};
