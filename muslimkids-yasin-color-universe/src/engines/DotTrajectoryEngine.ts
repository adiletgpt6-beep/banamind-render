// Типы траекторий точек между двумя силуэтами. Все пути — гладкие кривые,
// параметризованные прогрессом e (0..1) и стабильными случайными числами точки.
export type PathType = "direct" | "curve" | "spiral" | "scatter" | "wave" | "rise" | "fall";

export type PathParams = {
  curl: number; // сила изгиба (доля длины пути)
  swirl: number; // +1/−1 — общее направление потока; 0 — индивидуально
  cx: number; // центр спирали / облака
  cy: number;
  spread: number; // радиус облака (scatter)
  turns: number; // доп. обороты (spiral)
  lift: number; // высота дуги (rise/fall), амплитуда (wave)
};

const TAU = Math.PI * 2;

/** Записывает точку траектории в out[0], out[1]. */
export const pathPoint = (
  type: PathType,
  x0: number, y0: number, x1: number, y1: number,
  e: number, h1: number, h2: number, P: PathParams, out: Float32Array,
) => {
  if (type === "direct" || (x0 === x1 && y0 === y1)) {
    out[0] = x0 + (x1 - x0) * e;
    out[1] = y0 + (y1 - y0) * e;
    return;
  }
  if (type === "spiral") {
    const a0 = Math.atan2(y0 - P.cy, x0 - P.cx);
    const a1 = Math.atan2(y1 - P.cy, x1 - P.cx);
    let da = a1 - a0;
    while (da > Math.PI) da -= TAU;
    while (da < -Math.PI) da += TAU;
    const dir = P.swirl === 0 ? (h1 < 0.5 ? -1 : 1) : P.swirl;
    da += dir * P.turns * TAU * (0.75 + 0.5 * h2);
    const r0 = Math.hypot(x0 - P.cx, y0 - P.cy);
    const r1 = Math.hypot(x1 - P.cx, y1 - P.cy);
    const a = a0 + da * e;
    const rr = (r0 + (r1 - r0) * e) * (1 - 0.35 * Math.sin(Math.PI * e)) + P.spread * 0.15 * Math.sin(Math.PI * e) * h1;
    out[0] = P.cx + rr * Math.cos(a);
    out[1] = P.cy + rr * Math.sin(a);
    return;
  }
  let qx: number, qy: number;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  if (type === "scatter") {
    const ang = h1 * TAU;
    const rad = P.spread * Math.sqrt(h2);
    qx = P.cx + rad * Math.cos(ang);
    qy = P.cy + rad * 1.35 * Math.sin(ang);
  } else if (type === "rise" || type === "fall") {
    const s = type === "rise" ? -1 : 1;
    qx = mx + (h1 - 0.5) * P.lift * 0.6;
    qy = my + s * P.lift * (0.6 + 0.8 * h2);
  } else if (type === "wave") {
    const k = e * (1 - e) * 4;
    out[0] = x0 + (x1 - x0) * e + Math.cos(y0 * 0.01 + h1 * 2) * P.lift * 0.3 * k;
    out[1] = y0 + (y1 - y0) * e + Math.sin(x0 * 0.012 + e * 5 + h2) * P.lift * k;
    return;
  } else {
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    const dir = P.swirl === 0 ? (h1 < 0.5 ? -1 : 1) : P.swirl;
    const off = P.curl * len * (0.55 + 0.9 * h2) * dir;
    qx = mx + (-dy / len) * off;
    qy = my + (dx / len) * off;
  }
  const u = 1 - e;
  out[0] = u * u * x0 + 2 * u * e * qx + e * e * x1;
  out[1] = u * u * y0 + 2 * u * e * qy + e * e * y1;
};
