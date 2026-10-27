// Общие помощники векторного 2D-набора BG-044: точки, повороты,
// двухзвенная инверсная кинематика (локоть/колено), сглаженные контуры,
// детерминированный «шум», уникальные id для clipPath/mask и рисование
// конечностей «с контуром» в два прохода (контур → заливка), чтобы
// суставы не давали швов.
import { useId } from "react";

export type Pt = { readonly x: number; readonly y: number };
export const pt = (x: number, y: number): Pt => ({ x, y });
export const D2R = Math.PI / 180;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixPt = (a: Pt, b: Pt, t: number): Pt => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) });
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
export const len = (a: Pt) => Math.hypot(a.x, a.y);
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
// Поворот точки p на deg градусов (по часовой стрелке на экране) вокруг o.
export const rot = (p: Pt, deg: number, o: Pt = { x: 0, y: 0 }): Pt => {
  const a = deg * D2R;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = p.x - o.x;
  const dy = p.y - o.y;
  return { x: o.x + dx * c - dy * s, y: o.y + dx * s + dy * c };
};
export const angleOf = (a: Pt, b: Pt) => Math.atan2(b.y - a.y, b.x - a.x) / D2R;
export const polar = (o: Pt, deg: number, r: number): Pt => ({ x: o.x + Math.cos(deg * D2R) * r, y: o.y + Math.sin(deg * D2R) * r });

// Двухзвенная ИК: от корня a к цели t звеньями l1, l2. bend = +1 / −1 —
// с какой стороны линии a→t окажется средний сустав (на экране: +1 — по
// часовой стрелке от направления a→t). Недостижимая цель — рука/нога
// вытягивается в её сторону.
export const ik2 = (a: Pt, t: Pt, l1: number, l2: number, bend: 1 | -1) => {
  const dx = t.x - a.x;
  const dy = t.y - a.y;
  const d0 = Math.hypot(dx, dy);
  const d = Math.max(Math.abs(l1 - l2) + 0.5, Math.min((l1 + l2) * 0.999, d0));
  const ux = d0 > 1e-6 ? dx / d0 : 0;
  const uy = d0 > 1e-6 ? dy / d0 : 1;
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const base = Math.atan2(uy, ux);
  const ang = base + bend * A;
  const j = { x: a.x + Math.cos(ang) * l1, y: a.y + Math.sin(ang) * l1 };
  const e = { x: a.x + ux * d, y: a.y + uy * d };
  return { j, e };
};

// Детерминированный псевдослучайный 0…1 по числу.
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Уникальный id для clipPath/mask/gradient внутри SVG.
export const useUid = (prefix: string) => `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

const f1 = (v: number) => Math.round(v * 10) / 10;
export const P = (p: Pt) => `${f1(p.x)} ${f1(p.y)}`;

// Замкнутый (или открытый) сглаженный контур через точки (Катмулл — Ром).
export const smoothPath = (pts: readonly Pt[], closed = true, k = 1) => {
  const n = pts.length;
  if (n < 2) return "";
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${P(pts[0])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + ((p2.x - p0.x) / 6) * k, y: p1.y + ((p2.y - p0.y) / 6) * k };
    const c2 = { x: p2.x - ((p3.x - p1.x) / 6) * k, y: p2.y - ((p3.y - p1.y) / 6) * k };
    d += ` C ${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return closed ? `${d} Z` : d;
};

// Контур «таблетки» с разными радиусами концов (для пальцев, стоп и т. п.).
export const capsulePath = (a: Pt, b: Pt, ra: number, rb: number) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.max(1e-3, Math.hypot(dx, dy));
  const u = { x: dx / d, y: dy / d };
  const n = { x: -u.y, y: u.x };
  const s = Math.max(-0.95, Math.min(0.95, (ra - rb) / d));
  const c = Math.sqrt(1 - s * s);
  const vp = { x: n.x * c + u.x * s, y: n.y * c + u.y * s };
  const vm = { x: -n.x * c + u.x * s, y: -n.y * c + u.y * s };
  const a1 = add(a, mul(vp, ra));
  const b1 = add(b, mul(vp, rb));
  const b2 = add(b, mul(vm, rb));
  const a2 = add(a, mul(vm, ra));
  // Дуга у b идёт через +u, у a — через −u.
  const bigB = s < 0 ? 1 : 0;
  const bigA = s > 0 ? 1 : 0;
  return `M ${P(a1)} L ${P(b1)} A ${f1(rb)} ${f1(rb)} 0 ${bigB} 0 ${P(b2)} L ${P(a2)} A ${f1(ra)} ${f1(ra)} 0 ${bigA} 0 ${P(a1)} Z`;
};

// Цвет контура набора и толщина по умолчанию (в единицах персонажа).
export const INK = "#22335C";
export const OW = 3;

// Конечность: ломаная pts с толщиной звеньев widths. pass: "outline" —
// только контур (толще на 2·ow), "fill" — только заливка, "both" — вместе.
// Чтобы не было шва между звеньями, сначала рисуется контур всех звеньев,
// затем заливка всех.
export const Limb: React.FC<{
  readonly pts: readonly Pt[];
  readonly widths: readonly number[];
  readonly fill: string;
  readonly ink?: string;
  readonly ow?: number;
  readonly pass?: "outline" | "fill" | "both";
}> = ({ pts, widths, fill, ink = INK, ow = OW, pass = "both" }) => {
  const segs = pts.slice(0, -1).map((p, i) => ({ a: p, b: pts[i + 1], w: widths[Math.min(i, widths.length - 1)] }));
  return (
    <>
      {pass !== "fill"
        ? segs.map((s, i) => (
            <line key={`o${i}`} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={ink} strokeWidth={s.w + ow * 2} strokeLinecap="round" />
          ))
        : null}
      {pass !== "outline"
        ? segs.map((s, i) => <line key={`f${i}`} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={fill} strokeWidth={s.w} strokeLinecap="round" />)
        : null}
    </>
  );
};

// Фигура с контуром: path с заливкой и обводкой INK.
export const Shape: React.FC<{ readonly d: string; readonly fill: string; readonly ink?: string; readonly ow?: number; readonly opacity?: number }> = ({
  d,
  fill,
  ink = INK,
  ow = OW,
  opacity,
}) => <path d={d} fill={fill} stroke={ink} strokeWidth={ow} strokeLinejoin="round" opacity={opacity} />;

// Моргание: 0 — открыт, 1 — закрыт. Период ~3,5 с, сдвиг по seed.
export const blinkAt = (f: number, seed = 0) => {
  const period = 104 + Math.round(hash(seed + 3) * 30);
  const off = Math.round(hash(seed + 7) * period);
  const k = (((f + off) % period) + period) % period;
  const seq = [0.5, 1, 1, 0.5];
  // второе быстрое моргание иногда
  const twice = hash(seed + Math.floor((f + off) / period)) > 0.8;
  if (k < seq.length) return seq[k];
  if (twice && k >= 9 && k < 9 + seq.length) return seq[k - 9];
  return 0;
};
