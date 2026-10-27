// Геометрия карточки-напоминания (единицы карточки 300 × 200) — общая для
// хореографии (кончик карандаша), рисунка на столе / у горшка и крупного плана
// сверху. Порядок работы Билала: маленький листик одним штрихом (стебель →
// левый край → кончик → правый край → середина листа), затем надпись в две
// строки «Проверить» / «росток». Надпись набирается шрифтом с кириллицей;
// ширина строки фиксирована (textLength), поэтому кончик карандаша и граница
// проявления строки считаются из доли сделанного детерминированно.
// Зелёный цветной карандаш: листик и надпись — одним цветом.
import { TEXTS } from "./script.ts";

export const CARD_UNITS = { w: 300, h: 200 } as const;
export const CARD_FONT = 44;
export const CARD_INK = "#2E6B3C";

type Pt = { readonly x: number; readonly y: number };

// ---------- листик: ломаная из плавных кривых ----------
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, n: number): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
      y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
    };
  });
const BASE: Pt = { x: 58, y: 132 };
const TIP: Pt = { x: 78, y: 40 };
const LEAF_STROKES: readonly Pt[][] = [
  // стебель (снизу вверх) и контур листа одним движением
  [...bez({ x: 50, y: 172 }, { x: 52, y: 158 }, { x: 55, y: 144 }, BASE, 8), ...bez(BASE, { x: 18, y: 116 }, { x: 28, y: 60 }, TIP, 18).slice(1), ...bez(TIP, { x: 110, y: 64 }, { x: 98, y: 120 }, BASE, 18).slice(1)],
  // прожилка
  bez(BASE, { x: 62, y: 106 }, { x: 68, y: 80 }, { x: 72, y: 56 }, 10),
];
const segLen = (pts: readonly Pt[]) => pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
const LEAF_LENS = LEAF_STROKES.map(segLen);
export const LEAF_PATHS = LEAF_STROKES.map((pts) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" "));
export const LEAF_LENGTHS: readonly number[] = LEAF_LENS;

const pointAt = (pts: readonly Pt[], d: number): Pt => {
  let rest = Math.max(0, d);
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (rest <= l) return { x: pts[i - 1].x + ((pts[i].x - pts[i - 1].x) * rest) / l, y: pts[i - 1].y + ((pts[i].y - pts[i - 1].y) * rest) / l };
    rest -= l;
  }
  return pts[pts.length - 1];
};

// ---------- надпись ----------
const WORDS = TEXTS.card.split(" ") as unknown as readonly [string, string];
const X0 = 116;
export const CARD_LAYOUT = WORDS.map((text, i) => ({ text, n: [...text].length, x: X0, y: i === 0 ? 94 : 154, len: Math.round([...text].length * CARD_FONT * 0.5) }));

// Доли общей работы: листик (два штриха), строка 1, строка 2; между ними
// карандаш поднимается.
export const PHASES = { leaf: [0, 0.3], rib: [0.32, 0.38], line1: [0.42, 0.74], line2: [0.78, 1] } as const;
const frac = (p: number, [a, b]: readonly [number, number]) => Math.max(0, Math.min(1, (p - a) / (b - a)));

export type CardTip = { readonly x: number; readonly y: number; readonly lift: number };

// Кончик карандаша при доле сделанного p ∈ [0, 1]; lift 1 — карандаш поднят.
export const cardTip = (p: number): CardTip => {
  const u = Math.max(0, Math.min(1, p));
  const leafEnd = pointAt(LEAF_STROKES[0], LEAF_LENS[0]);
  const ribStart = LEAF_STROKES[1][0];
  const ribEnd = LEAF_STROKES[1][LEAF_STROKES[1].length - 1];
  const l1 = CARD_LAYOUT[0];
  const l2 = CARD_LAYOUT[1];
  const lerpP = (a: Pt, b: Pt, k: number): Pt => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
  const textTip = (L: (typeof CARD_LAYOUT)[number], k: number) => ({ x: L.x + L.len * k, y: L.y - CARD_FONT * 0.28 });
  const hop = (k: number) => Math.sin(Math.PI * Math.max(0, Math.min(1, k)));
  if (u <= PHASES.leaf[1]) return { ...pointAt(LEAF_STROKES[0], frac(u, PHASES.leaf) * LEAF_LENS[0]), lift: u <= 0 ? 1 : 0 };
  if (u < PHASES.rib[0]) return { ...lerpP(leafEnd, ribStart, frac(u, [PHASES.leaf[1], PHASES.rib[0]])), lift: hop(frac(u, [PHASES.leaf[1], PHASES.rib[0]])) };
  if (u <= PHASES.rib[1]) return { ...pointAt(LEAF_STROKES[1], frac(u, PHASES.rib) * LEAF_LENS[1]), lift: 0 };
  if (u < PHASES.line1[0]) return { ...lerpP(ribEnd, textTip(l1, 0), frac(u, [PHASES.rib[1], PHASES.line1[0]])), lift: hop(frac(u, [PHASES.rib[1], PHASES.line1[0]])) };
  if (u <= PHASES.line1[1]) return { ...textTip(l1, frac(u, PHASES.line1)), lift: 0 };
  if (u < PHASES.line2[0]) return { ...lerpP(textTip(l1, 1), textTip(l2, 0), frac(u, [PHASES.line1[1], PHASES.line2[0]])), lift: hop(frac(u, [PHASES.line1[1], PHASES.line2[0]])) };
  if (u < 1) return { ...textTip(l2, frac(u, PHASES.line2)), lift: 0 };
  return { ...textTip(l2, 1), lift: 1 };
};

// Сколько нарисовано: доли штрихов листика (0…1) и проявленная ширина строк.
export const cardReveal = (p: number) => ({
  leaf: frac(p, PHASES.leaf),
  rib: frac(p, PHASES.rib),
  line1: CARD_LAYOUT[0].len * frac(p, PHASES.line1),
  line2: CARD_LAYOUT[1].len * frac(p, PHASES.line2),
});
