// Предметы ролика 80-1-2: яблоко, его две половинки, тарелка, отдельное
// блюдце, семечко, нож и салфетка. Единицы — те же, что у предметов первого
// фильма (5 ед. ≈ 1 см при масштабе 1); на столе всё масштабируется вместе
// со столом. Все состояния одного яблока строятся из одного профиля, поэтому
// размер, цвет и форма не меняются между планами.
import React from "react";
import { OUTLINE } from "../../lesson01/rig/looks";

const f = (n: number) => n.toFixed(2);
const OL = 1.6; // контур мелких предметов (ед.)

export const APPLE = {
  w: 40, // ширина (≈ 8 см)
  h: 36, // высота от низа до впадинки у плодоножки
  red: "#c8352e",
  redLight: "#e2584a",
  redDark: "#9e2723",
  flesh: "#f6e7c4",
  fleshShade: "#ecd6a6",
  core: "#e7cf95",
  seed: "#6b3f22",
  seedLight: "#9a6440",
  stem: "#6e4a2c",
} as const;

// Профиль яблока: точки контура вокруг центра (u — поперёк, v — вверх).
// Впадинки у плодоножки (сверху) и у чашечки (снизу) — как у настоящего плода.
const profile = (n = 64): { u: number; v: number }[] => {
  const pts: { u: number; v: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const s = Math.sin(a);
    const c = Math.cos(a);
    // чуть шире в верхней части, мягкое сужение книзу
    let u = (APPLE.w / 2) * s * (1 + 0.06 * c);
    let v = (APPLE.h / 2) * c;
    const top = Math.max(0, c) ** 14; // впадинка у плодоножки
    const bot = Math.max(0, -c) ** 18; // впадинка у чашечки
    v -= top * 3.2;
    v += bot * 1.6;
    u *= 1 - 0.04 * top;
    pts.push({ u, v });
  }
  return pts;
};
const PROFILE = profile();

const pathOf = (pts: { x: number; y: number }[]) => `M ${pts.map((p) => `${f(p.x)} ${f(p.y)}`).join(" L ")} Z`;

// Силуэт целого яблока; (0,0) — точка опоры снизу.
export const appleOutline = () => pathOf(PROFILE.map((p) => ({ x: p.u, y: -APPLE.h / 2 - p.v })));

// Целое яблоко. cut — тонкая линия разреза (0…1 — докуда дошёл нож).
export const Apple: React.FC<{ x?: number; y?: number; s?: number; rot?: number; cut?: number; shadow?: boolean }> = ({ x = 0, y = 0, s = 1, rot = 0, cut = 0, shadow = false }) => {
  const d = appleOutline();
  const H = APPLE.h;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(rot)} 0 ${f(-H / 2)})`}>
      {shadow ? <ellipse cx={2} cy={-0.5} rx={APPLE.w * 0.45} ry={3.2} fill="#3b2418" opacity={0.28} /> : null}
      <path d={d} fill={APPLE.red} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      {/* мягкая тень с правой стороны и снизу (свет — из окна слева сверху) */}
      <path d={`M ${f(APPLE.w * 0.18)} ${f(-H * 0.95)} C ${f(APPLE.w * 0.52)} ${f(-H * 0.8)} ${f(APPLE.w * 0.5)} ${f(-H * 0.12)} ${f(0)} ${f(-H * 0.04)} C ${f(APPLE.w * 0.3)} ${f(-H * 0.3)} ${f(APPLE.w * 0.36)} ${f(-H * 0.7)} ${f(APPLE.w * 0.18)} ${f(-H * 0.95)} Z`} fill={APPLE.redDark} opacity={0.45} />
      {/* светлые прожилки и блик */}
      <path d={`M ${f(-APPLE.w * 0.3)} ${f(-H * 0.7)} q ${f(APPLE.w * 0.05)} ${f(H * 0.25)} ${f(APPLE.w * 0.12)} ${f(H * 0.42)}`} fill="none" stroke={APPLE.redLight} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
      <ellipse cx={-APPLE.w * 0.22} cy={-H * 0.68} rx={4.2} ry={6.4} transform={`rotate(-24 ${f(-APPLE.w * 0.22)} ${f(-H * 0.68)})`} fill="#fff4ea" opacity={0.6} />
      {/* впадинка и плодоножка */}
      <path d={`M ${f(-5)} ${f(-H + 1.8)} Q 0 ${f(-H + 4.2)} ${f(5)} ${f(-H + 1.8)}`} fill="none" stroke={APPLE.redDark} strokeWidth={1.4} strokeLinecap="round" />
      <path d={`M 0 ${f(-H + 3)} C 0.6 ${f(-H - 3)} 2.4 ${f(-H - 6)} 4.4 ${f(-H - 8.5)}`} fill="none" stroke={OUTLINE} strokeWidth={3.6} strokeLinecap="round" />
      <path d={`M 0 ${f(-H + 3)} C 0.6 ${f(-H - 3)} 2.4 ${f(-H - 6)} 4.4 ${f(-H - 8.5)}`} fill="none" stroke={APPLE.stem} strokeWidth={2} strokeLinecap="round" />
      {cut > 0 ? <line x1={0} y1={f(-H + 2)} x2={0} y2={f(-H + 2 + (H - 2) * Math.min(1, cut))} stroke={APPLE.redDark} strokeWidth={0.9} opacity={0.9} /> : null}
    </g>
  );
};

// ---------- Семечко ----------
// Каплевидное семечко ≈ 8 мм. (0,0) — центр; ang — куда смотрит острый конец
// (градусы, 0 — вправо).
export const SEED_LEN = 4.2;
export const Seed: React.FC<{ x: number; y: number; ang?: number; s?: number }> = ({ x, y, ang = 0, s = 1 }) => {
  const L = SEED_LEN;
  const W = L * 0.52;
  const d = `M ${f(L * 0.5)} 0 C ${f(L * 0.2)} ${f(-W * 0.5)} ${f(-L * 0.5)} ${f(-W * 0.62)} ${f(-L * 0.5)} 0 C ${f(-L * 0.5)} ${f(W * 0.62)} ${f(L * 0.2)} ${f(W * 0.5)} ${f(L * 0.5)} 0 Z`;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(ang)}) scale(${f(s)})`}>
      <path d={d} fill={APPLE.seed} stroke="#3a2214" strokeWidth={0.45} strokeLinejoin="round" />
      <path d={`M ${f(-L * 0.32)} ${f(-W * 0.18)} Q ${f(-L * 0.05)} ${f(-W * 0.36)} ${f(L * 0.22)} ${f(-W * 0.14)}`} fill="none" stroke={APPLE.seedLight} strokeWidth={0.5} strokeLinecap="round" />
    </g>
  );
};

// ---------- Половинка яблока ----------
// Продольный разрез через сердцевину. Половинка лежит срезом вверх: срез —
// тот же профиль, что у целого яблока, в косой проекции стола (глубина →
// вверх и вправо, как у столешницы). side: -1 — левая (плодоножка влево),
// +1 — правая. seeds — какие из двух видимых семечек ещё лежат на месте.
// (0,0) — точка опоры под центром половинки.
export const HALF_T = 13; // видимая толщина кожуры под срезом (ед.)
const SQ = 0.52; // сжатие глубины среза
const SK = 0.32; // скос глубины вправо
const facePt = (side: -1 | 1, a: number, b: number) => ({ x: side * a + b * SK, y: -HALF_T - b * SQ });

export const halfSeedPos = (side: -1 | 1, k: 0 | 1) => {
  // семечки — в гнёздах сердцевины по обе стороны оси, остриём к плодоножке
  const a = 1.6;
  const b = k === 0 ? 3.1 : -3.1;
  const p = facePt(side, a, b);
  return { ...p, ang: side > 0 ? (k === 0 ? -14 : 14) : 180 + (k === 0 ? 14 : -14) };
};

export const AppleHalf: React.FC<{ x: number; y: number; side: -1 | 1; seeds?: [boolean, boolean]; s?: number }> = ({ x, y, side, seeds = [true, true], s = 1 }) => {
  // контур среза: a — вдоль оси плода (+ к плодоножке), b — поперёк
  const face = PROFILE.map((p) => facePt(side, p.v, p.u));
  // нижняя «чаша» кожуры: срез, опущенный на толщину половинки и чуть
  // суженный книзу, плюс боковые стенки между ними (силуэт купола)
  const cx0 = face.reduce((a, p) => a + p.x, 0) / face.length;
  const low = face.map((p) => ({ x: cx0 + (p.x - cx0) * 0.8, y: p.y + HALF_T * 0.92 }));
  const iL = face.reduce((m, p, i) => (p.x < face[m].x ? i : m), 0);
  const iR = face.reduce((m, p, i) => (p.x > face[m].x ? i : m), 0);
  const sideD = (i: number, out: number) => `M ${f(face[i].x)} ${f(face[i].y)} Q ${f(face[i].x + out * 1.5)} ${f(face[i].y + HALF_T * 0.75)} ${f(low[i].x)} ${f(low[i].y)}`;
  const wallD = `${sideD(iL, -1)} L ${f(low[iR].x)} ${f(low[iR].y)} Q ${f(face[iR].x + 1.5)} ${f(face[iR].y + HALF_T * 0.75)} ${f(face[iR].x)} ${f(face[iR].y)} Z`;
  const faceD = pathOf(face);
  // сердцевина: вытянутое «сердечко» вокруг оси
  const coreD = (() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI * 2;
      const a = 9.5 * Math.cos(t) - 1.2;
      const b = 6.4 * Math.sin(t) * (0.75 + 0.25 * Math.cos(t + 0.4));
      pts.push(facePt(side, a, b));
    }
    return pathOf(pts);
  })();
  const axis = [facePt(side, -14, 0), facePt(side, 14, 0)];
  const stemA = facePt(side, 16.4, 0);
  const stemB = { x: stemA.x + side * 5.5, y: stemA.y - 1 };
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <ellipse cx={1.5} cy={-0.3} rx={APPLE.h * 0.55} ry={3} fill="#3b2418" opacity={0.22} />
      <path d={pathOf(low)} fill={APPLE.red} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={wallD} fill={APPLE.red} />
      <path d={sideD(iL, -1)} fill="none" stroke={OUTLINE} strokeWidth={OL} strokeLinecap="round" />
      <path d={sideD(iR, 1)} fill="none" stroke={OUTLINE} strokeWidth={OL} strokeLinecap="round" />
      <path d={pathOf(low)} fill={APPLE.redDark} opacity={0.3} />
      <path d={`M ${f(face[iL].x + 3)} ${f(face[iL].y + HALF_T * 0.5)} Q ${f(cx0)} ${f(face[iL].y + HALF_T * 1.1)} ${f(face[iR].x - 3)} ${f(face[iR].y + HALF_T * 0.5)}`} fill="none" stroke={APPLE.redLight} strokeWidth={1.6} opacity={0.5} strokeLinecap="round" />
      <path d={faceD} fill={APPLE.red} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      {/* мякоть: внутри тонкой красной кромки */}
      <path d={faceD} fill={APPLE.flesh} transform={`translate(${f(face.reduce((a, p) => a + p.x, 0) / face.length * 0.07)} ${f(face.reduce((a, p) => a + p.y, 0) / face.length * 0.07)}) scale(0.93)`} />
      <path d={coreD} fill={APPLE.core} stroke="#d7b673" strokeWidth={0.6} opacity={0.9} />
      {/* волокна от сердцевины к краям (сосудистые пучки) */}
      <path d={coreD} fill="none" stroke={APPLE.fleshShade} strokeWidth={0.7} transform={`translate(${f(facePt(side, -1.2, 0).x * -0.25)} ${f(facePt(side, -1.2, 0).y * -0.25)}) scale(1.25)`} opacity={0.8} />
      <line x1={f(axis[0].x)} y1={f(axis[0].y)} x2={f(axis[1].x)} y2={f(axis[1].y)} stroke={APPLE.fleshShade} strokeWidth={0.8} />
      {/* гнёзда семечек */}
      {([0, 1] as const).map((k) => {
        const p = halfSeedPos(side, k);
        return <ellipse key={`n${k}`} cx={f(p.x)} cy={f(p.y)} rx={2.8} ry={1.5} transform={`rotate(${f(p.ang)} ${f(p.x)} ${f(p.y)})`} fill="#e3c88b" />;
      })}
      {([0, 1] as const).map((k) => {
        if (!seeds[k]) return null;
        const p = halfSeedPos(side, k);
        return <Seed key={`s${k}`} x={p.x} y={p.y} ang={p.ang} />;
      })}
      {/* плодоножка на конце среза */}
      <path d={`M ${f(stemA.x)} ${f(stemA.y)} L ${f(stemB.x)} ${f(stemB.y)}`} stroke={OUTLINE} strokeWidth={3.4} strokeLinecap="round" />
      <path d={`M ${f(stemA.x)} ${f(stemA.y)} L ${f(stemB.x)} ${f(stemB.y)}`} stroke={APPLE.stem} strokeWidth={1.9} strokeLinecap="round" />
    </g>
  );
};

// Половинка во время раскрытия: поворот среза от вертикали (k=0) к «лёжа
// срезом вверх» (k=1). Используется, пока половинку держит кисть.
export const AppleHalfTurning: React.FC<{ x: number; y: number; side: -1 | 1; k: number }> = ({ x, y, side, k }) => {
  if (k >= 0.999) return <AppleHalf x={x} y={y} side={side} />;
  // половина силуэта целого яблока, поворачивается наружу вокруг нижней точки
  const H = APPLE.h;
  const halfPts = PROFILE.filter((p) => side * p.u <= 0.01).map((p) => ({ x: p.u, y: -H / 2 - p.v }));
  const ang = -side * 90 * k;
  return (
    <g transform={`translate(${f(x)} ${f(y)})`}>
      <g transform={`rotate(${f(ang)} 0 ${f(-HALF_T * 0.4)}) scale(1 ${f(1 - 0.35 * k)})`}>
        <path d={`${pathOf(halfPts)}`} fill={APPLE.red} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
        <path d={`M 0 ${f(-H + 2)} L 0 0`} stroke={APPLE.flesh} strokeWidth={1.6 + 4 * k} />
      </g>
    </g>
  );
};

// ---------- Посуда ----------
// Тарелка в косой проекции стола; (0,0) — центр опоры.
export const PLATE = { rx: 50, ry: 17 } as const;
export const Plate: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const { rx, ry } = PLATE;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <ellipse cx={3} cy={1} rx={rx * 0.96} ry={ry * 0.8} fill="#3b2418" opacity={0.22} />
      {/* ножка и борт */}
      <ellipse cx={0} cy={-1.5} rx={rx * 0.62} ry={ry * 0.5} fill="#d9d2c2" stroke={OUTLINE} strokeWidth={OL} />
      <ellipse cx={0} cy={-5} rx={rx} ry={ry} fill="#fbf8f0" stroke={OUTLINE} strokeWidth={OL} />
      <ellipse cx={0} cy={-5} rx={rx * 0.86} ry={ry * 0.84} fill="none" stroke="#d8a64a" strokeWidth={1.6} />
      <ellipse cx={0} cy={-4.4} rx={rx * 0.62} ry={ry * 0.58} fill="#f2ede1" />
      <path d={`M ${f(-rx * 0.7)} ${f(-5 - ry * 0.55)} Q ${f(-rx * 0.2)} ${f(-5 - ry * 0.98)} ${f(rx * 0.45)} ${f(-5 - ry * 0.8)}`} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.7} strokeLinecap="round" />
    </g>
  );
};

// Отдельное блюдце (меньше, с голубой каймой — не путается с тарелкой).
export const SAUCER = { rx: 31, ry: 11 } as const;
export const Saucer: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => {
  const { rx, ry } = SAUCER;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <ellipse cx={2} cy={0.6} rx={rx * 0.95} ry={ry * 0.75} fill="#3b2418" opacity={0.22} />
      <ellipse cx={0} cy={-1} rx={rx * 0.6} ry={ry * 0.5} fill="#cfd8de" stroke={OUTLINE} strokeWidth={OL} />
      <ellipse cx={0} cy={-3.6} rx={rx} ry={ry} fill="#f7fafb" stroke={OUTLINE} strokeWidth={OL} />
      <ellipse cx={0} cy={-3.6} rx={rx * 0.84} ry={ry * 0.8} fill="none" stroke="#5f93bf" strokeWidth={1.5} />
      <ellipse cx={0} cy={-3.2} rx={rx * 0.5} ry={ry * 0.46} fill="#eef3f5" />
      {children}
    </g>
  );
};
export const SAUCER_SEED = { x: 1, y: -3.6 } as const; // где лежит семечко на блюдце

// Небольшой кухонный нож. (0,0) — середина рукояти (там его держит кисть);
// лезвие направлено вправо (+x), режущая кромка снизу.
export const KNIFE = { handle: 34, blade: 44 } as const;
// flip — лезвие влево (зеркально), режущая кромка остаётся снизу.
export const Knife: React.FC<{ x?: number; y?: number; rot?: number; s?: number; flip?: boolean }> = ({ x = 0, y = 0, rot = 0, s = 1, flip = false }) => {
  const h = KNIFE.handle;
  const b = KNIFE.blade;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(flip ? -s : s)} ${f(s)})`}>
      <path d={`M ${f(h * 0.45)} -2.6 L ${f(h * 0.45 + b * 0.82)} -2.6 Q ${f(h * 0.45 + b)} -2.4 ${f(h * 0.45 + b)} -1.6 Q ${f(h * 0.45 + b * 0.72)} 3.6 ${f(h * 0.45)} 3.2 Z`} fill="#dfe5ea" stroke={OUTLINE} strokeWidth={1.1} strokeLinejoin="round" />
      <path d={`M ${f(h * 0.5)} -1.4 L ${f(h * 0.45 + b * 0.8)} -1.4`} stroke="#ffffff" strokeWidth={0.9} opacity={0.8} />
      <rect x={f(-h * 0.55)} y={-3.4} width={f(h)} height={6.8} rx={2.6} fill="#8a5b36" stroke={OUTLINE} strokeWidth={1.1} />
      <circle cx={f(-h * 0.25)} cy={0} r={0.8} fill="#d9c49c" />
      <circle cx={f(h * 0.15)} cy={0} r={0.8} fill="#d9c49c" />
    </g>
  );
};

// Сложенная салфетка у края стола, на ней лежит нож.
export const Napkin: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
    <path d="M -44 0 L -30 -14 L 48 -14 L 34 0 Z" fill="#e9e1cf" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
    <path d="M -38 -4 L 40 -4 M -33 -9 L 44 -9" stroke="#d5c9ae" strokeWidth={1} />
  </g>
);
