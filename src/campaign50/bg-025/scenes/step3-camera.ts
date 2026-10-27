// Камера шага 3 (мир ленты). Ключи плана → гладкая кривая без рывков:
// каждый параметр (x, y, ln zoom) — монотонный кубический сплайн Эрмита.
// На обычном ключе камера мягко останавливается (как smoothstep: пик
// скорости всего в 1,5 раза выше средней, у easeInOut — в 3 раза); ключ
// с pass камера проходит не останавливаясь (касательная Фрича — Карлсона,
// без перелёта). Кадры ключей защищены от «телепортации»: каждый ключ не
// раньше предыдущего + MIN_GAP, даже если после перегенерации голоса
// слова сместились.
import type { Cam } from "../kit";
import { panelTop, RIB_X } from "../ribbon";
import { clamp, lerp, smoothstep } from "../rig/motion";
import { camOnFold } from "../stage";
import { CAR_HOME, CAR_SCHOOL, carU, type Step3Plan } from "./step3-plan";

const TOP = panelTop(3);
const MIN_GAP = 8;

// ---------- Планы ----------
export const FLAT: Cam = { x: 572, y: TOP + 300, zoom: 1.08 };
// обзор диорамы: камера ведёт за слоями — дом и горы, школа, улица
const OVER_L: Cam = { x: 500, y: TOP + 150, zoom: 1.24 };
const OVER_R: Cam = { x: 640, y: TOP + 146, zoom: 1.3 };
// общий план всей диорамы: дом, мама с дочкой и школа целиком в кадре
const OVER_C: Cam = { x: 548, y: TOP + 140, zoom: 1.06 };
// у дома: мама и дочь слева, машина в центре кадра
const HOME: Cam = { x: 430, y: TOP + 124, zoom: 1.72 };
// у школы: машина слева от центра, двери школы справа
const SCHOOL: Cam = { x: 640, y: TOP + 120, zoom: 1.7 };
const NOON: Cam = { x: 622, y: TOP + 114, zoom: 1.68 };
const SCHOOL2: Cam = { x: 604, y: TOP + 118, zoom: 1.7 };
const HOME2: Cam = { x: 420, y: TOP + 122, zoom: 1.8 };
const MEET: Cam = { x: 318, y: TOP + 130, zoom: 1.9 };
// отъезд: сначала камера отходит от мамы с дочкой, затем смещается к центру
const AWAY: Cam = { x: 380, y: TOP + 182, zoom: 1.4 };
// диорама сложилась: камера проходит над плоской панелью вниз к сгибу 4
const BACK: Cam = { x: 546, y: TOP + 330, zoom: 1.08 };

type Key = { readonly at: number; readonly cam: Cam; readonly pass?: boolean };

const hermite = (p0: number, p1: number, m0: number, m1: number, h: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * h * m1;
};

// Касательная в ключе i (0 — остановка).
const slope = (ks: readonly Key[], v: readonly number[], i: number) => {
  if (!ks[i].pass || i === 0 || i === ks.length - 1) return 0;
  const h0 = ks[i].at - ks[i - 1].at;
  const h1 = ks[i + 1].at - ks[i].at;
  const d0 = (v[i] - v[i - 1]) / h0;
  const d1 = (v[i + 1] - v[i]) / h1;
  if (d0 * d1 <= 0) return 0;
  const w1 = 2 * h1 + h0;
  const w2 = h1 + 2 * h0;
  return (w1 + w2) / (w1 / d0 + w2 / d1);
};

export const camPath = (f: number, raw: readonly Key[]): Cam => {
  // защита порядка ключей
  const ks: Key[] = [];
  for (const k of raw) ks.push(ks.length ? { ...k, at: Math.max(ks[ks.length - 1].at + MIN_GAP, k.at) } : k);
  if (f <= ks[0].at) return ks[0].cam;
  const last = ks[ks.length - 1];
  if (f >= last.at) return last.cam;
  let i = 0;
  while (f > ks[i + 1].at) i++;
  const h = ks[i + 1].at - ks[i].at;
  const t = clamp((f - ks[i].at) / h);
  const comp = (get: (c: Cam) => number) => {
    const v = ks.map((k) => get(k.cam));
    return hermite(v[i], v[i + 1], slope(ks, v, i), slope(ks, v, i + 1), h, t);
  };
  return { x: comp((c) => c.x), y: comp((c) => c.y), zoom: Math.exp(comp((c) => Math.log(c.zoom))) };
};

export const camKeys3 = (P: Step3Plan): readonly Key[] => [
  { at: 0, cam: camOnFold(3) },
  { at: P.u1 + 5, cam: FLAT },
  { at: P.tiltA, cam: { ...FLAT, y: FLAT.y - 8, zoom: 1.09 }, pass: true },
  { at: P.tiltB - 4, cam: OVER_L, pass: true },
  { at: P.pop.school + 10, cam: OVER_R },
  { at: P.pop.mom + 6, cam: OVER_C },
  // общий план держится на «акысыз», затем медленный наезд к подъезду
  { at: P.zoomA, cam: { ...OVER_C, y: OVER_C.y - 4, zoom: OVER_C.zoom + 0.02 } },
  { at: P.cam1A, cam: HOME },
  // поездка к школе: один ход камеры за машиной, без остановок по пути
  { at: P.cam1B, cam: SCHOOL },
  { at: P.noonA, cam: NOON, pass: true },
  { at: P.cam2A, cam: SCHOOL2 },
  // обратная поездка — тоже один ход
  { at: P.cam2B, cam: HOME2 },
  { at: P.meetCam, cam: MEET },
  // отъезд сразу после встречи: диорама складывается, камера уходит к сгибу 4
  { at: P.awayCam, cam: AWAY, pass: true },
  { at: P.backCam, cam: BACK, pass: true },
  { at: P.camB, cam: camOnFold(4) },
];

// Поездка: камера едет за машиной — x = машина + упреждение, упреждение
// плавно меняется от плана «у старта» к плану «у финиша». Экранное
// положение машины меняется монотонно и медленно, фон — без рывков.
const follow = (f: number, a: number, b: number, c0: Cam, u0: number, c1: Cam, u1: number, P: Step3Plan) => {
  const k = smoothstep((f - a) / Math.max(1, b - a));
  return carU(f, P) + RIB_X + lerp(c0.x - (u0 + RIB_X), c1.x - (u1 + RIB_X), k);
};

export const camAt = (f: number, P: Step3Plan): Cam => {
  let cam = camPath(f, camKeys3(P));
  if (f > P.cam1A && f < P.cam1B) cam = { ...cam, x: follow(f, P.cam1A, P.cam1B, HOME, CAR_HOME, SCHOOL, CAR_SCHOOL, P) };
  if (f > P.cam2A && f < P.cam2B) cam = { ...cam, x: follow(f, P.cam2A, P.cam2B, SCHOOL2, CAR_SCHOOL, HOME2, CAR_HOME, P) };
  // лёгкий дрейф, пока камера «стоит»
  const drift = clamp((f - P.u1) / 20) * (1 - clamp((f - P.meetCam) / 14));
  return { ...cam, x: cam.x + Math.sin(f / 47) * 3 * drift, y: cam.y + Math.sin(f / 61) * 4 * drift };
};
