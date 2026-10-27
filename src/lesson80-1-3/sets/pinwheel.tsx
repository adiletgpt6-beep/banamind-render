// Бумажная вертушка ролика 80-1-3: квадрат с надрезами по диагоналям,
// четыре уголка загнуты к центру и приколоты бусиной-гвоздиком; деревянная
// палочка и отдельная подставка-брусок. Без лица и «волшебства».
// Единицы — как у предметов первых фильмов (5 ед. ≈ 1 см при масштабе 1).
// Всё — чистые функции пропсов: угол, скорость и поворот задаёт режиссура.
//
// Локальные координаты вертушки: (0,0) — нижний конец палочки, палочка
// идёт вверх (−y). Вращается только ротор — вокруг центра бусины PW_HUB;
// палочка и бусина не вращаются. Ротор — перед палочкой.
import React from "react";
import type { P } from "../../lesson01/rig/geom";
import { OUTLINE } from "../../lesson01/rig/looks";

const f = (n: number) => n.toFixed(2);
const rad = (d: number) => (d * Math.PI) / 180;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const PW = { stickLen: 175, stickW: 5.5, R: 52, hubR: 6.5, axle: 6, standW: 44, standH: 18, standD: 22, insert: 8 } as const;

export const PW_HUB: P = { x: 0, y: -(PW.stickLen - 7) }; // центр ротора и бусины (−168)
export const PW_GRIP: P = { x: 0, y: -60 }; // здесь палочку держит кисть
// Подставка: (0,0) — низ передней грани по центру; гнездо — центр верхней грани.
export const STAND_SOCKET: P = { x: (PW.standD * 0.55) / 2, y: -PW.standH - PW.standD / 2 };

const OL = 2.2; // контур лепестков
const OL_WOOD = 1.8; // палочка, бусина
const OL_STAND = 2.2;
const Q = 0.6; // сжатие глубины круглых отверстий на верхней грани

// ---------- цвета ----------
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
};
const PAPER_LIGHT = "#fff7e8";
// По часовой стрелке от правого лепестка: терракота, бирюза, горчица, лаванда —
// тёплый/холодный через один. Зелёного нет: вертушка стоит на фоне луга за
// окном (#86b56b), зелёный лепесток там пропадал.
export const PW_COLORS = ["#d9705a", "#4f9aa8", "#e3b64e", "#9a84bf"] as const;
const PETALS = PW_COLORS.map((face) => ({ face, fold: mix(face, PAPER_LIGHT, 0.45), shade: mix(face, OUTLINE, 0.16), crease: mix(face, OUTLINE, 0.42), trail: mix(face, PAPER_LIGHT, 0.1) }));
const WOOD = { stick: "#d8b07a", stickEdge: "#b98c58", front: "#93603a", top: "#ae7646", side: "#784c2e", grain: "#6f4529", hole: "#3f2a20" };
const BEAD = { base: "#a8402f", face: "#c94f3d", hi: "#f6d9c8" };

// ---------- геометрия лепестка ----------
// Координаты ротора: (0,0) — центр, y вниз. Базовый лепесток — правый:
// кончик (неотогнутый угол квадрата) вверху справа, прямой край — надрез по
// диагонали; нижняя часть — отогнутый к центру уголок (завиток, светлый
// оборот бумаги). Остальные — повороты на 90° по часовой стрелке. Ветер в
// завитки крутит ротор по часовой стрелке (завитки впереди, кончики сзади).
type Seg = ["M" | "L", P] | ["C", P, P, P];
const A = PW.R * Math.SQRT1_2; // полусторона квадрата
const q = (x: number, y: number): P => ({ x: x * A, y: y * A });
const O = q(0, 0);
const TIP = q(1, -1);
const F = q(1.03, 0.0); // начало завитка на краю квадрата
const B = q(0.93, 0.36); // «брюшко» завитка
const E = q(0.22, 0.25); // завиток подходит к центру чуть за соседним надрезом
// контур от кончика по краю квадрата и завитку к центру
const RIM: Seg[] = [
  ["C", q(1.015, -0.68), q(1.04, -0.33), F],
  ["C", q(1.045, 0.14), q(1.0, 0.27), B],
  ["C", q(0.84, 0.5), q(0.5, 0.42), E],
  ["C", q(0.129, 0.195), q(0.06, 0.08), O], // касательная в E — продолжение предыдущей (без излома контура)
];
const SIL: Seg[] = [["M", O], ["L", TIP], ...RIM]; // силуэт лепестка
const CURL_EDGE: Seg[] = [["M", F], ...RIM.slice(1)]; // внешний край завитка
// линия сгиба: от центра к началу завитка, прогиб в сторону завитка
const CREASE_C: Seg = ["C", q(0.36, 0.14), q(0.78, 0.18), F];
const CREASE: Seg[] = [["M", O], CREASE_C];
const FOLD: Seg[] = [...CURL_EDGE, CREASE_C]; // оборот бумаги (светлый)
// полутень под приподнятым завитком — узкий серп вдоль сгиба на грани
const SHADE: Seg[] = [["M", O], CREASE_C, ["C", q(0.74, 0.06), q(0.34, 0.03), q(0.04, 0.0)]];

type Map2 = (p: P) => P;
const pathD = (segs: Seg[], m: Map2, close = false) =>
  segs.map((s) => `${s[0]} ${s.slice(1).map((p) => { const r = m(p as P); return `${f(r.x)} ${f(r.y)}`; }).join(" ")}`).join(" ") + (close ? " Z" : "");

// Проекция ротора: поворот на ang (по часовой) вокруг центра, затем сжатие
// по горизонтали cos(yaw) — вне поворота, так лепестки сохраняют длину в
// своей плоскости. Координаты считаются сразу, поэтому толщина контура не
// искажается сжатием.
const rotorMap = (c: P, ang: number, sq: number): Map2 => {
  const cs = Math.cos(rad(ang));
  const sn = Math.sin(rad(ang));
  return (p) => ({ x: c.x + sq * (p.x * cs - p.y * sn), y: c.y + p.x * sn + p.y * cs });
};

// Ротор: сначала все силуэты, затем все завитки (завиток каждого лепестка
// лежит перед прямым краем соседнего — порядок одинаков для всех четырёх).
const Rotor: React.FC<{ c: P; angle: number; sq: number }> = ({ c, angle, sq }) => {
  const maps = PETALS.map((_, k) => rotorMap(c, angle + 90 * k, sq));
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {PETALS.map((p, k) => (
        <path key={`s${k}`} d={pathD(SIL, maps[k], true)} fill={p.face} stroke={OUTLINE} strokeWidth={OL} />
      ))}
      {PETALS.map((p, k) => (
        <g key={`f${k}`}>
          <path d={pathD(SHADE, maps[k], true)} fill={p.shade} />
          <path d={pathD(FOLD, maps[k], true)} fill={p.fold} />
          <path d={pathD(CREASE, maps[k])} fill="none" stroke={p.crease} strokeWidth={1.1} />
          <path d={pathD(CURL_EDGE, maps[k])} fill="none" stroke={OUTLINE} strokeWidth={OL} />
        </g>
      ))}
    </g>
  );
};

// ---------- след движения ----------
// Полярный профиль лепестка r(φ) — внешняя граница по лучам из центра.
// След — область, которую лепесток замёл за последние Δ градусов (объединение
// его копий на углах angle − α, 0 ≤ α ≤ Δ): плавный веер без ступенек.
const bez = (a: P, b: P, c: P, d: P, t: number): P => {
  const u = 1 - t;
  return { x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y };
};
const PROFILE = (() => {
  const pts: P[] = [TIP];
  let cur = TIP;
  for (const sg of RIM) {
    if (sg[0] !== "C") continue;
    for (let i = 1; i <= 24; i++) pts.push(bez(cur, sg[1], sg[2], sg[3], i / 24));
    cur = sg[3];
  }
  return pts.filter((p) => Math.hypot(p.x, p.y) > 0.5).map((p) => ({ a: (Math.atan2(p.y, p.x) * 180) / Math.PI, r: Math.hypot(p.x, p.y) }));
})();
// таблица r(φ) с шагом 0.5°: внешняя граница (максимум по всем пересечениям)
const A0 = Math.min(...PROFILE.map((p) => p.a)); // −45: прямой край
const A1 = Math.max(...PROFILE.map((p) => p.a));
const R_TAB = (() => {
  const n = Math.ceil((A1 - A0) * 2) + 1;
  const tab: number[] = [];
  for (let i = 0; i < n; i++) tab.push(0);
  for (let i = 1; i < PROFILE.length; i++) {
    const p = PROFILE[i - 1];
    const q2 = PROFILE[i];
    const lo = Math.min(p.a, q2.a);
    const hi = Math.max(p.a, q2.a);
    for (let j = Math.ceil((lo - A0) * 2); j <= Math.floor((hi - A0) * 2); j++) {
      const a = A0 + j / 2;
      const r = hi - lo < 1e-6 ? Math.max(p.r, q2.r) : p.r + ((q2.r - p.r) * (a - p.a)) / (q2.a - p.a);
      tab[j] = Math.max(tab[j], r);
    }
  }
  tab[0] = Math.max(tab[0], PW.R);
  return tab;
})();
const rAt = (a: number) => {
  const x = (a - A0) * 2;
  if (x < -1e-6 || x > R_TAB.length - 1) return 0;
  const i = Math.min(R_TAB.length - 2, Math.max(0, Math.floor(x)));
  const k = Math.min(1, Math.max(0, x - i));
  return R_TAB[i] + (R_TAB[i + 1] - R_TAB[i]) * k;
};
// Веер лепестка за Δ° (dir = +1 — след позади при вращении по часовой).
const sweepPts = (span: number, dir: number): P[] => {
  const out: P[] = [{ x: 0, y: 0 }];
  const lo = dir > 0 ? A0 - span : A0;
  const hi = dir > 0 ? A1 : A1 + span;
  const n = Math.ceil(hi - lo);
  const m = Math.max(1, Math.ceil(span));
  for (let i = 0; i <= n; i++) {
    const a = lo + ((hi - lo) * i) / n;
    let r = 0;
    for (let j = 0; j <= m; j++) r = Math.max(r, rAt(a + dir * ((span * j) / m)));
    out.push({ x: r * Math.cos(rad(a)), y: r * Math.sin(rad(a)) });
  }
  return out;
};
const polyD = (pts: P[], m: Map2) => `M ${pts.map((p) => { const r = m(p); return `${f(r.x)} ${f(r.y)}`; }).join(" L ")} Z`;

const RotorTrail: React.FC<{ c: P; angle: number; sq: number; span: number; dir: number; opacity: number }> = ({ c, angle, sq, span, dir, opacity }) => {
  const pts = sweepPts(span, dir);
  return (
    <g opacity={f(opacity)}>
      {PETALS.map((p, k) => (
        <path key={k} d={polyD(pts, rotorMap(c, angle + 90 * k, sq))} fill={p.trail} />
      ))}
    </g>
  );
};

// Бусина-гвоздик: круглая, с бликом от окна (слева сверху); не вращается.
const Bead: React.FC<{ c: P }> = ({ c }) => {
  const r = PW.hubR;
  return (
    <g>
      <circle cx={f(c.x)} cy={f(c.y)} r={f(r)} fill={BEAD.base} />
      <circle cx={f(c.x - r * 0.14)} cy={f(c.y - r * 0.14)} r={f(r * 0.82)} fill={BEAD.face} />
      <ellipse cx={f(c.x - r * 0.36)} cy={f(c.y - r * 0.4)} rx={f(r * 0.24)} ry={f(r * 0.18)} transform={`rotate(-35 ${f(c.x - r * 0.36)} ${f(c.y - r * 0.4)})`} fill={BEAD.hi} opacity={0.85} />
      <circle cx={f(c.x)} cy={f(c.y)} r={f(r)} fill="none" stroke={OUTLINE} strokeWidth={OL_WOOD} />
    </g>
  );
};

// Палочка от низа (0) до верха (−stickLen); cut — нижняя граница видимой
// части (срез уходит в гнездо: дуга передней кромки, без контура).
const Stick: React.FC<{ cut?: number }> = ({ cut }) => {
  const w = PW.stickW / 2;
  const top = -PW.stickLen;
  const tr = `L ${f(-w)} ${f(top + w)} A ${f(w)} ${f(w)} 0 0 1 ${f(w)} ${f(top + w)}`;
  const ry = cut === undefined ? w : Q * w; // низ: круглый торец или дуга кромки гнезда
  const yb = cut === undefined ? -w : Math.max(top + w, cut - ry);
  const fill = `M ${f(-w)} ${f(yb)} ${tr} L ${f(w)} ${f(yb)} A ${f(w)} ${f(ry)} 0 0 1 ${f(-w)} ${f(yb)} Z`;
  const line = cut === undefined ? fill : `M ${f(-w)} ${f(yb)} ${tr} L ${f(w)} ${f(yb)}`;
  return (
    <g>
      <path d={fill} fill={WOOD.stick} />
      {/* тень правой грани и светлая полоска слева */}
      <rect x={f(w * 0.25)} y={f(top + w * 0.6)} width={f(w * 0.75)} height={f(yb - top - w * 0.6)} fill={WOOD.stickEdge} opacity={0.75} />
      <rect x={f(-w * 0.62)} y={f(top + w * 1.4)} width={f(w * 0.32)} height={f(Math.max(0, yb - top - w * 2.4))} fill="#f1d9ae" opacity={0.6} />
      <path d={line} fill="none" stroke={OUTLINE} strokeWidth={OL_WOOD} strokeLinejoin="round" />
    </g>
  );
};

// Центр ротора (и бусины) с учётом поворота плоскости ротора yaw.
export const pinwheelHubAt = (yaw = 0): P => ({ x: PW_HUB.x + PW.axle * Math.sin(rad(yaw)), y: PW_HUB.y });

// Локальная точка вертушки → координаты родителя (как в <Pinwheel x y s rot>).
export const pinwheelPoint = (p: P, o: { x?: number; y?: number; s?: number; rot?: number }): P => {
  const s = o.s ?? 1;
  const cs = Math.cos(rad(o.rot ?? 0));
  const sn = Math.sin(rad(o.rot ?? 0));
  return { x: (o.x ?? 0) + s * (p.x * cs - p.y * sn), y: (o.y ?? 0) + s * (p.x * sn + p.y * cs) };
};

// Угол при линейном изменении скорости: от w0 до w1 (°/с) за dur секунд с
// момента t0, дальше скорость постоянна. angle — накопленный от t0 угол (°),
// blur — скорость в °/кадр (для пропа blur), fps по умолчанию 30.
export const spinRamp = (t: number, t0: number, dur: number, w0: number, w1: number, fps = 30) => {
  const u = Math.max(0, t - t0);
  if (dur > 0 && u < dur) {
    const w = w0 + ((w1 - w0) * u) / dur;
    return { angle: w0 * u + ((w1 - w0) * u * u) / (2 * dur), omega: w, blur: w / fps };
  }
  return { angle: ((w0 + w1) * Math.max(0, dur)) / 2 + w1 * (u - Math.max(0, dur)), omega: w1, blur: w1 / fps };
};

export const Pinwheel: React.FC<{ angle: number; yaw?: number; blur?: number; rot?: number; x?: number; y?: number; s?: number; hideBelow?: number }> = ({ angle, yaw = 0, blur = 0, rot = 0, x = 0, y = 0, s = 1, hideBelow }) => {
  const c = pinwheelHubAt(yaw);
  const sq = Math.cos(rad(yaw));
  // след: 6 вложенных вееров до 0.9·|blur| (не больше 30°) — плотность
  // плавно спадает к хвосту, без «призрачных» кромок; проявляется после
  // ~5°/кадр, у лепестка суммарно не плотнее 0.23
  const k = clamp01((Math.abs(blur) - 5) / 8);
  const step = Math.min(30, Math.abs(blur) * 0.9) / 6;
  const dir = blur >= 0 ? 1 : -1;
  const trails = k > 0 ? [6, 5, 4, 3, 2, 1].map((i) => ({ span: i * step, o: k * 0.042 })) : [];
  const ax = Math.abs(c.x - PW_HUB.x);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})`}>
      <Stick cut={hideBelow} />
      {/* ось от палочки к ротору (видна, когда ротор повёрнут) */}
      {ax > 0.5 ? <path d={`M ${f(PW_HUB.x)} ${f(PW_HUB.y)} L ${f(c.x)} ${f(c.y)}`} stroke="#8d8f96" strokeWidth={1.6} strokeLinecap="round" /> : null}
      {trails.map((g, i) => (
        <RotorTrail key={i} c={c} angle={angle} sq={sq} span={g.span} dir={dir} opacity={g.o} />
      ))}
      <Rotor c={c} angle={angle} sq={sq} />
      <Bead c={c} />
    </g>
  );
};

// Проекция окружности радиуса r на верхнюю грань (косая проекция стола).
const topCircle = (c: P, r: number, n = 32) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const u = r * Math.cos(a);
    const v = r * Math.sin(a) * Q; // глубина
    pts.push(`${f(c.x + u + v * 0.55)} ${f(c.y - v)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

// Подставка: деревянный брусок с отверстием в центре верхней грани.
export const PinwheelStand: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const W = PW.standW / 2;
  const H = PW.standH;
  const D = PW.standD;
  const dx = D * 0.55;
  const dy = -D;
  const hole = PW.stickW / 2 + 1.4;
  const sc = STAND_SOCKET;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`} strokeLinejoin="round">
      {/* мягкая контактная тень */}
      <ellipse cx={f(dx * 0.5 + 3)} cy={f(dy * 0.42)} rx={f(W * 1.38)} ry={f(D * 0.6)} fill="#3b2418" opacity={0.2} />
      <ellipse cx={f(dx * 0.35 + 1)} cy={f(dy * 0.2)} rx={f(W * 1.12)} ry={f(D * 0.34)} fill="#3b2418" opacity={0.18} />
      {/* правая грань, верх, перед */}
      <path d={`M ${f(W)} 0 L ${f(W + dx)} ${f(dy)} L ${f(W + dx)} ${f(dy - H)} L ${f(W)} ${f(-H)} Z`} fill={WOOD.side} stroke={OUTLINE} strokeWidth={OL_STAND} />
      <path d={`M ${f(-W)} ${f(-H)} L ${f(-W + dx)} ${f(dy - H)} L ${f(W + dx)} ${f(dy - H)} L ${f(W)} ${f(-H)} Z`} fill={WOOD.top} stroke={OUTLINE} strokeWidth={OL_STAND} />
      <rect x={f(-W)} y={f(-H)} width={f(2 * W)} height={f(H)} fill={WOOD.front} stroke={OUTLINE} strokeWidth={OL_STAND} />
      {/* волокна дерева */}
      <path d={`M ${f(-W + 6)} ${f(-H * 0.36)} q ${f(W * 0.5)} -2.2 ${f(W * 1.05)} 0 M ${f(-W + 14)} ${f(-H * 0.7)} q ${f(W * 0.45)} 1.6 ${f(W * 0.95)} -0.4`} fill="none" stroke={WOOD.grain} strokeOpacity={0.45} strokeWidth={1} strokeLinecap="round" />
      <path d={`M ${f(-W + 7 + dx * 0.3)} ${f(-H + dy * 0.3)} l ${f(W * 0.7)} 0 M ${f(-W + 18 + dx * 0.72)} ${f(-H + dy * 0.72)} l ${f(W * 0.8)} 0`} fill="none" stroke={WOOD.grain} strokeOpacity={0.35} strokeWidth={1} strokeLinecap="round" />
      {/* светлая кромка переднего ребра */}
      <path d={`M ${f(-W + 1.5)} ${f(-H + 1.6)} L ${f(W - 1.5)} ${f(-H + 1.6)}`} stroke="#c8915e" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      {/* гнездо: тёмное отверстие, в глубине темнее */}
      <path d={topCircle(sc, hole)} fill={WOOD.hole} stroke={OUTLINE} strokeWidth={0.9} />
      <path d={topCircle({ x: sc.x + 0.35, y: sc.y + 0.9 }, hole * 0.72)} fill="#21160f" opacity={0.55} />
    </g>
  );
};

// Вертушка в подставке: нижний конец палочки на глубине insert под гнездом,
// видимая часть палочки обрывается на передней кромке гнезда.
export const PinwheelInStand: React.FC<{ x: number; y: number; s?: number; angle: number; yaw?: number; blur?: number }> = ({ x, y, s = 1, angle, yaw = 0, blur = 0 }) => (
  <g>
    <PinwheelStand x={x} y={y} s={s} />
    <Pinwheel x={x + STAND_SOCKET.x * s} y={y + (STAND_SOCKET.y + PW.insert) * s} s={s} angle={angle} yaw={yaw} blur={blur} hideBelow={-PW.insert + Q * (PW.stickW / 2)} />
  </g>
);

// Точка вертушки, стоящей в подставке (x, y, s — как у PinwheelInStand).
export const pinwheelInStandPoint = (p: P, x: number, y: number, s = 1): P => ({ x: x + (STAND_SOCKET.x + p.x) * s, y: y + (STAND_SOCKET.y + PW.insert + p.y) * s });
// Центр ротора вертушки в подставке.
export const pinwheelInStandHub = (x: number, y: number, s = 1, yaw = 0): P => pinwheelInStandPoint(pinwheelHubAt(yaw), x, y, s);
