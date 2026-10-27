// Поле цветных точек на весь фильм: одни и те же N точек перетекают из фигуры
// в фигуру (город → весы → пещера → солнце…). Переход каждой точки слегка
// запаздывает (волна), летит по мягкой дуге; в покое точки «дышат» и мерцают.
// Ключи — абсолютное время фильма (с) и фигура (см. shapes.ts).
import React from "react";
import { Easing } from "remotion";
import { hash01, N_DOTS, shapePoints, type Pt, type ShapeSpec } from "./shapes";

export type DotKeyAbs = { t: number; shape: ShapeSpec };

const MORPH = 1.25; // длительность полёта точки, с
const STAGGER = 0.6; // разброс старта точек, с
const easeMorph = Easing.bezier(0.6, 0.02, 0.2, 1);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const BASE_R = 4.3;

const rgbCache = new Map<string, [number, number, number]>();
const rgb = (hex: string): [number, number, number] => {
  let v = rgbCache.get(hex);
  if (!v) {
    const h = hex.replace("#", "");
    v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    rgbCache.set(hex, v);
  }
  return v;
};

const DELAY = Array.from({ length: N_DOTS }, (_, i) => hash01(i, 1) * STAGGER);
const ARC = Array.from({ length: N_DOTS }, (_, i) => (hash01(i, 2) - 0.5) * 2);
const PH1 = Array.from({ length: N_DOTS }, (_, i) => hash01(i, 3) * Math.PI * 2);
const PH2 = Array.from({ length: N_DOTS }, (_, i) => hash01(i, 4) * Math.PI * 2);

type State = { x: number; y: number; c: [number, number, number]; r: number; a: number };
const DUST_SPEC: ShapeSpec = { kind: "dust" };

// вращение фигуры (spin, °/с) — для солнца, веретена и т. п.
const place = (p: Pt, spec: ShapeSpec, T: number, since: number): Pt => {
  const spin = typeof spec.spin === "number" ? (spec.spin as number) : 0;
  if (!spin || p.a < 0.4) return p;
  const cx = (spec.x as number) ?? 960;
  const cy = (spec.y as number) ?? 520;
  const a = ((T - since) * spin * Math.PI) / 180;
  const dx = p.x - cx;
  const dy = p.y - cy;
  return { ...p, x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
};

const stateOf = (keys: DotKeyAbs[], k: number, T: number, i: number, depth: number): State => {
  const spec = k >= 0 ? keys[k].shape : DUST_SPEC;
  const since = k >= 0 ? keys[k].t : 0;
  const q = place(shapePoints(spec)[i], spec, T, since);
  const target: State = { x: q.x, y: q.y, c: rgb(q.c), r: q.r, a: q.a };
  if (k < 0) return target;
  const p = clamp01((T - since - DELAY[i]) / MORPH);
  if (p >= 1) return target;
  const from = depth > 0 ? stateOf(keys, k - 1, since, i, depth - 1) : (() => {
    const s0 = k - 1 >= 0 ? keys[k - 1].shape : DUST_SPEC;
    const q0 = shapePoints(s0)[i];
    return { x: q0.x, y: q0.y, c: rgb(q0.c), r: q0.r, a: q0.a };
  })();
  const e = easeMorph(p);
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const bend = Math.sin(Math.PI * e) * ARC[i] * 0.22;
  return {
    x: from.x + dx * e - dy * bend,
    y: from.y + dy * e + dx * bend,
    c: [from.c[0] + (target.c[0] - from.c[0]) * e, from.c[1] + (target.c[1] - from.c[1]) * e, from.c[2] + (target.c[2] - from.c[2]) * e],
    r: from.r + (target.r - from.r) * e,
    a: from.a + (target.a - from.a) * e,
  };
};

export const DotField: React.FC<{ keys: DotKeyAbs[]; t: number; opacity?: number }> = ({ keys, t, opacity = 1 }) => {
  let k = -1;
  let lo = 0;
  let hi = keys.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (keys[mid].t <= t) {
      k = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  const dots: React.ReactNode[] = [];
  const halos: React.ReactNode[] = [];
  for (let i = 0; i < N_DOTS; i++) {
    const s = stateOf(keys, k, t, i, 2);
    const x = s.x + Math.sin(t * 0.55 + PH1[i]) * 2.6;
    const y = s.y + Math.cos(t * 0.47 + PH2[i]) * 2.6;
    const tw = 0.82 + 0.18 * Math.sin(t * 1.7 + PH1[i] * 3);
    const a = s.a * tw;
    if (a < 0.02) continue;
    const fill = `rgb(${s.c[0] | 0},${s.c[1] | 0},${s.c[2] | 0})`;
    const r = BASE_R * s.r;
    if (s.a > 0.5) halos.push(<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={(r * 2.7).toFixed(1)} fill={fill} opacity={(a * 0.16).toFixed(3)} />);
    dots.push(<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} fill={fill} opacity={a.toFixed(3)} />);
  }
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      <g>{halos}</g>
      <g>{dots}</g>
    </svg>
  );
};
