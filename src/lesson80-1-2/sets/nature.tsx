// Крупные природные планы ролика 80-1-2:
//   • лист яблони: вода (со стороны веточки), свет (снаружи), воздух (рядом
//     с поверхностью листа) и условный «питательный» акцент;
//   • ветки двух разных яблонь в цвету: пчела переносит пыльцу с цветка
//     яблони A на цветок яблони B;
//   • та же ветка яблони A: лепестки опадают → на части цветков завязи →
//     созревшие яблоки (смена времени между стадиями).
// У воды, света, воздуха, пчелы и растений нет лиц и реплик.
import React from "react";
import { OUTLINE } from "../../lesson01/rig/looks";
import { hash01 } from "../../lesson01/rig/geom";
import { AppleFlower, BranchApple, LEAF } from "./tree";

const f = (n: number) => n.toFixed(1);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// ---------- Лист ----------
// Форма листа яблони: яйцевидная пластинка с заострённой верхушкой и мелко
// пильчатым краем. Локально: черешок у (0,0), пластинка вдоль −y.
const leafOutline = (L: number, W: number, serr = true) => {
  const pts: string[] = [];
  const n = 72;
  for (let i = 0; i <= n; i++) {
    const u = i / n; // 0 — основание справа → верхушка → основание слева
    const side = u < 0.5 ? 1 : -1;
    const v = u < 0.5 ? u * 2 : (1 - u) * 2; // 0 — основание, 1 — верхушка
    const y = -L * (0.06 + 0.94 * v);
    let w = W * 0.5 * Math.sin(Math.PI * Math.pow(v, 0.8)) * (1 - 0.25 * v);
    if (serr && v > 0.08 && v < 0.97) w *= 1 + 0.025 * (i % 2 ? 1 : -1);
    pts.push(`${f(side * w)} ${f(y)}`);
  }
  return `M 0 ${f(-L * 0.06)} L ${pts.join(" L ")} Z`;
};

const SmallLeaf: React.FC<{ x: number; y: number; L: number; rot: number; tone?: number; t: number; ph: number }> = ({ x, y, L, rot, tone = 0, t, ph }) => (
  <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot + Math.sin(t * 1.3 + ph) * 2.5)})`}>
    <path d={leafOutline(L, L * 0.5)} fill={tone ? LEAF.dark : LEAF.mid} stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
    <path d={`M 0 ${f(-L * 0.06)} L 0 ${f(-L * 0.92)}`} stroke={LEAF.light} strokeWidth={3} strokeLinecap="round" />
  </g>
);

export type LeafFx = { light: number; water: number; air: number; food: number; t: number };

// Крупный план листа (кадр 1920×1080).
export const LeafPlate: React.FC<{ fx: LeafFx; u: number }> = ({ fx, u }) => {
  const { t } = fx;
  const BL = 860; // длина пластинки
  const BW = 440;
  const P = { x: 780, y: 884 }; // начало черешка на веточке
  const rot = 28; // наклон листа вправо
  const sway = Math.sin(t * 1.1) * 1.5;
  const zoom = 1 + u * 0.03;
  // путь воды: по веточке → черешок → центральная жилка
  const toWorld = (lx: number, ly: number) => {
    const a = ((rot + sway) * Math.PI) / 180;
    return { x: P.x + 0 + Math.cos(a) * lx - Math.sin(a) * (ly - 110), y: P.y + Math.sin(a) * lx + Math.cos(a) * (ly - 110) };
  };
  const waterPath = [
    { x: 120, y: 1010 },
    { x: 480, y: 930 },
    { x: P.x, y: P.y },
    toWorld(0, 0),
    toWorld(0, -BL * 0.45),
    toWorld(0, -BL * 0.85),
  ];
  const along = (pts: { x: number; y: number }[], q: number) => {
    const L: number[] = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const d = q * L[L.length - 1];
    let i = 1;
    while (i < pts.length - 1 && L[i] < d) i++;
    const k = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    return { x: lerp(pts[i - 1].x, pts[i].x, k), y: lerp(pts[i - 1].y, pts[i].y, k), ang: (Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x) * 180) / Math.PI };
  };
  const leafGreen = lerp(0, 1, clamp(fx.food));
  return (
    <svg width={1920} height={1080} viewBox={`${960 - 960 / zoom} ${540 - 540 / zoom} ${1920 / zoom} ${1080 / zoom}`}>
      <defs>
        <linearGradient id="lf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9d3ea" />
          <stop offset="0.55" stopColor="#cfe8c4" />
          <stop offset="1" stopColor="#8fbf7a" />
        </linearGradient>
        <radialGradient id="lf-sun" cx="0" cy="0" r="1">
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.95} />
          <stop offset="0.35" stopColor="#ffe08a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffe08a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="lf-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2b8" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff2b8" stopOpacity={0} />
        </linearGradient>
        <clipPath id="lf-blade">
          <path d={leafOutline(BL, BW)} transform={`translate(${P.x} ${P.y}) rotate(${f(rot + sway)}) translate(0 -110)`} />
        </clipPath>
      </defs>
      <rect x={-200} y={-200} width={2320} height={1480} fill="url(#lf-bg)" />
      {/* размытая листва сада на заднем плане */}
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={f(hash01(i * 3 + 1) * 1920)} cy={f(300 + hash01(i * 5 + 2) * 800)} r={f(60 + hash01(i * 7) * 120)} fill={i % 2 ? "#7fb57a" : "#9ccb8b"} opacity={0.35} />
      ))}
      {/* солнце и лучи — обычный солнечный свет, сверху слева */}
      <g opacity={fx.light}>
        <circle cx={60} cy={20} r={520} fill="url(#lf-sun)" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${f(40 + i * 90)} ${f(-20)} L ${f(260 + i * 150)} -20 L ${f(1150 + i * 120)} ${f(760 - i * 40)} L ${f(980 + i * 110)} ${f(820 - i * 30)} Z`} fill="url(#lf-beam)" opacity={0.5 + 0.1 * Math.sin(t * 0.8 + i)} />
        ))}
      </g>
      {/* веточка и мелкие листья */}
      <path d="M -60 1060 C 300 980 600 900 1000 860 C 1300 830 1600 860 2000 820" fill="none" stroke={OUTLINE} strokeWidth={46} strokeLinecap="round" />
      <path d="M -60 1060 C 300 980 600 900 1000 860 C 1300 830 1600 860 2000 820" fill="none" stroke="#7a5238" strokeWidth={38} strokeLinecap="round" />
      <path d="M -60 1048 C 300 968 600 888 1000 848" fill="none" stroke="#956a4b" strokeWidth={8} strokeLinecap="round" />
      <SmallLeaf x={300} y={985} L={260} rot={-60} t={t} ph={1} tone={1} />
      <SmallLeaf x={1350} y={842} L={300} rot={70} t={t} ph={2} />
      <SmallLeaf x={1600} y={850} L={240} rot={115} t={t} ph={3} tone={1} />
      {/* большой лист */}
      <g transform={`translate(${P.x} ${P.y}) rotate(${f(rot + sway)})`}>
        <path d="M 0 0 Q -6 -60 0 -112" fill="none" stroke={OUTLINE} strokeWidth={20} strokeLinecap="round" />
        <path d="M 0 0 Q -6 -60 0 -112" fill="none" stroke="#7da24f" strokeWidth={13} strokeLinecap="round" />
        <g transform="translate(0 -110)">
          <path d={leafOutline(BL, BW)} fill={leafGreen > 0 ? `rgb(${Math.round(lerp(98, 84, leafGreen))}, ${Math.round(lerp(160, 168, leafGreen))}, ${Math.round(lerp(107, 92, leafGreen))})` : LEAF.mid} stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
          <path d={leafOutline(BL * 0.92, BW * 0.62, false)} fill={LEAF.light} opacity={0.35} transform="translate(-28 -20)" />
          {/* жилки */}
          <path d={`M 0 ${f(-BL * 0.06)} L 0 ${f(-BL * 0.96)}`} stroke="#b8d98f" strokeWidth={8} strokeLinecap="round" />
          {[0.2, 0.32, 0.44, 0.56, 0.68, 0.8].map((k, i) =>
            [-1, 1].map((sd) => (
              <path key={`${i}${sd}`} d={`M 0 ${f(-BL * k)} Q ${f(sd * BW * 0.18)} ${f(-BL * (k + 0.05))} ${f(sd * BW * 0.36 * (1 - k * 0.45))} ${f(-BL * (k + 0.13))}`} fill="none" stroke="#a9cf86" strokeWidth={4} strokeLinecap="round" />
            )),
          )}
        </g>
      </g>
      {/* свет на листе — тёплый блик там, куда падают лучи */}
      <g clipPath="url(#lf-blade)" opacity={fx.light}>
        <ellipse cx={720} cy={420} rx={360} ry={240} fill="#fff6c8" opacity={0.28} />
      </g>
      {/* питание: тёплые точки идут по жилке вниз, в веточку и дальше в дерево */}
      {fx.food > 0
        ? Array.from({ length: 10 }, (_, i) => {
            const q = 1 - ((t * 0.18 + i / 10) % 1);
            const p = along(waterPath, q);
            const fade = Math.min(1, (1 - q) * 6, q * 6) * fx.food;
            return <circle key={`fd${i}`} cx={f(p.x)} cy={f(p.y + 14)} r={11} fill="#f2b84b" stroke="#a8721e" strokeWidth={3} opacity={fade} />;
          })
        : null}
      {/* вода: синие стрелки со стороны веточки к листу */}
      {fx.water > 0
        ? Array.from({ length: 6 }, (_, i) => {
            const q = (t * 0.2 + i / 6) % 1;
            const p = along(waterPath, q);
            const fade = Math.min(1, q * 6, (1 - q) * 5) * fx.water;
            return (
              <g key={`w${i}`} transform={`translate(${f(p.x)} ${f(p.y - 12)}) rotate(${f(p.ang)})`} opacity={fade}>
                <path d="M -24 -16 L 6 0 L -24 16" fill="none" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M -24 -16 L 6 0 L -24 16" fill="none" stroke="#2f86d0" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })
        : null}
      {/* воздух: спокойные светлые завитки у поверхности листа (без «молекул»),
          короткая стрелка показывает — к листу */}
      {fx.air > 0
        ? [0, 1, 2].map((i) => {
            const y = 330 + i * 140;
            const x0 = 1560 + i * 40 + Math.sin(t * 0.9 + i * 2) * 18;
            const d = `M ${f(x0)} ${f(y)} C ${f(x0 - 90)} ${f(y - 46)} ${f(x0 - 150)} ${f(y + 36)} ${f(x0 - 240)} ${f(y)}`;
            return (
              <g key={`a${i}`} opacity={fx.air * (0.75 + 0.25 * Math.sin(t * 1.3 + i))}>
                <path d={d} fill="none" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" opacity={0.75} />
                <path d={d} fill="none" stroke="#8fb3cc" strokeWidth={7} strokeLinecap="round" />
                <path d={`M ${f(x0 - 222)} ${f(y - 16)} L ${f(x0 - 246)} ${f(y)} L ${f(x0 - 222)} ${f(y + 16)}`} fill="none" stroke="#8fb3cc" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })
        : null}
    </svg>
  );
};

// ---------- Пчела ----------
// Насекомое без человеческих черт: голова, грудь, полосатое брюшко, усики,
// две пары крыльев, три видимые лапки. dir: 1 — летит вправо, −1 — влево.
// fly: 0 — сидит (крылья сложены), 1 — летит (крылья раскрыты, «размытые»).
// pollen: 0…1 — сколько пыльцы на теле и лапках.
export const Bee: React.FC<{ x: number; y: number; s: number; dir: number; tilt: number; fly: number; pollen: number; t: number; seed?: number }> = ({ x, y, s, dir, tilt, fly, pollen, t, seed = 0 }) => {
  const legMove = fly < 0.5 ? Math.sin(t * 9) * 4 : 0;
  const shimmer = 0.85 + 0.1 * Math.sin(t * 23);
  const grains = Array.from({ length: 14 }, (_, i) => ({ x: -26 + hash01(i * 3 + seed) * 46, y: -6 + hash01(i * 5 + seed + 1) * 22, k: i / 14 }));
  const wingOpen = lerp(-58, -12, fly);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s * dir)} ${f(s)}) rotate(${f(tilt * dir)})`}>
      {/* задние крылья (за телом) */}
      <g transform={`rotate(${f(wingOpen - 8)} -2 -14)`}>
        <ellipse cx={-14} cy={-34} rx={14} ry={24} fill="#e6f2fa" stroke="#9fb6c6" strokeWidth={1.6} opacity={0.75 * (fly > 0.5 ? shimmer : 1)} />
      </g>
      {/* лапки */}
      {[-12, 0, 12].map((lx, i) => (
        <path key={i} d={`M ${lx} 8 q ${f(-4 + legMove * (i % 2 ? 1 : -1))} 12 ${f(-8 + (i - 1) * 3)} 22`} fill="none" stroke="#2b2522" strokeWidth={3} strokeLinecap="round" />
      ))}
      {/* корзиночки с пыльцой на задних лапках */}
      {pollen > 0.05 ? <ellipse cx={-21} cy={24} rx={f(4 + 4 * pollen)} ry={f(3 + 3 * pollen)} fill="#efc23f" stroke="#a8862a" strokeWidth={1.4} /> : null}
      {/* брюшко с полосками */}
      <g>
        <ellipse cx={-20} cy={4} rx={26} ry={18} fill="#f3c33b" stroke={OUTLINE} strokeWidth={3} />
        <clipPath id={`bee-abd-${seed}`}>
          <ellipse cx={-20} cy={4} rx={26} ry={18} />
        </clipPath>
        <g clipPath={`url(#bee-abd-${seed})`}>
          {[-30, -16, -2].map((sx) => (
            <rect key={sx} x={sx} y={-20} width={7} height={50} fill="#3a2a20" />
          ))}
        </g>
        <path d="M -46 4 l -6 2 l 6 2" fill="#3a2a20" stroke={OUTLINE} strokeWidth={1.5} />
      </g>
      {/* грудь — пушистая */}
      <circle cx={6} cy={0} r={13} fill="#c9963a" stroke={OUTLINE} strokeWidth={3} />
      <circle cx={4} cy={-3} r={7} fill="#ddb05a" opacity={0.8} />
      {/* голова и усики */}
      <circle cx={22} cy={2} r={9} fill="#3a2a20" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={25} cy={0} rx={4} ry={5.5} fill="#1d1612" />
      <path d="M 24 -6 q 6 -12 14 -14 M 20 -7 q 2 -12 8 -16" fill="none" stroke="#2b2522" strokeWidth={2.2} strokeLinecap="round" />
      {/* зёрнышки пыльцы на теле */}
      {grains.map((g, i) => (g.k < pollen ? <circle key={i} cx={f(g.x)} cy={f(g.y)} r={2.9} fill="#f2c94c" stroke="#a8862a" strokeWidth={0.7} /> : null))}
      {/* передние крылья */}
      <g transform={`rotate(${f(wingOpen)} 2 -12)`}>
        {fly > 0.5 ? <path d="M 2 -12 L -30 -52 Q 6 -66 26 -46 Z" fill="#ffffff" opacity={0.18} /> : null}
        <ellipse cx={-6} cy={-36} rx={13} ry={27} fill="#eef7fc" stroke="#9fb6c6" strokeWidth={1.8} opacity={0.82 * (fly > 0.5 ? shimmer : 1)} />
        <path d="M -6 -14 L -8 -56" stroke="#b7cad6" strokeWidth={1.2} />
      </g>
    </g>
  );
};

// ---------- Ветки двух яблонь (опыление) и развитие плода ----------
// Кадр-мир 1920×1080: слева — ветка яблони A, справа — ветка яблони B
// (на заднем плане — их стволы, чтобы было видно, что это разные деревья).
export const FLOWERS_A: { x: number; y: number; r: number; rot: number; fruit: boolean }[] = [
  { x: 560, y: 405, r: 62, rot: 8, fruit: true },
  { x: 655, y: 470, r: 56, rot: 30, fruit: false },
  { x: 470, y: 480, r: 52, rot: -14, fruit: false },
  { x: 610, y: 560, r: 54, rot: 50, fruit: true },
  { x: 520, y: 330, r: 46, rot: 20, fruit: false },
];
export const FLOWERS_B: { x: number; y: number; r: number; rot: number }[] = [
  { x: 1400, y: 520, r: 62, rot: -10 },
  { x: 1310, y: 590, r: 54, rot: 24 },
  { x: 1480, y: 600, r: 52, rot: 40 },
  { x: 1370, y: 440, r: 46, rot: -30 },
];

const CB_A = { x: 520, y: 505 }; // основание соцветия на ветке A
const CB_B = { x: 1450, y: 575 };

export type BloomFx = {
  t: number;
  bee?: { x: number; y: number; dir: number; tilt: number; fly: number; pollen: number } | null;
  pollenB?: number; // сколько пыльцы осталось на цветке яблони B
  pollenA?: number; // пыльца на тычинках цветка A (уменьшается)
  stage?: number; // 0 — цветение … 1 — лепестки опали … 2 — завязи … 3 — созревают … 4 — спелые
  showB?: boolean;
};

const Spur: React.FC<{ d: string; w: number }> = ({ d, w }) => (
  <g>
    <path d={d} fill="none" stroke={OUTLINE} strokeWidth={w + 8} strokeLinecap="round" />
    <path d={d} fill="none" stroke="#7a5238" strokeWidth={w} strokeLinecap="round" />
  </g>
);

export const BloomWorld: React.FC<{ fx: BloomFx }> = ({ fx }) => {
  const { t } = fx;
  const stage = fx.stage ?? 0;
  const fall = clamp(stage); // лепестки опадают
  const fruitG = clamp((stage - 1) / 2); // рост завязи
  const ripe = clamp(stage - 3); // созревание
  const leafGrow = clamp(0.35 + stage * 0.22);
  const swayA = Math.sin(t * 0.9) * 1.2;
  const summer = clamp(stage / 3);
  const bg0 = summer > 0 ? mixRgb([224, 240, 246], [196, 228, 240], summer) : "rgb(224,240,246)";
  return (
    <g>
      <defs>
        <linearGradient id="bl-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg0} />
          <stop offset="1" stopColor={summer > 0.5 ? "#a9cf8f" : "#c6e3b4"} />
        </linearGradient>
      </defs>
      <rect x={-400} y={-300} width={2720} height={1680} fill="url(#bl-bg)" />
      {/* стволы двух яблонь вдали (мягко, без деталей) */}
      <g opacity={0.35}>
        <path d="M 180 1080 C 200 800 190 600 240 380" stroke="#8a6448" strokeWidth={70} fill="none" strokeLinecap="round" />
        <circle cx={260} cy={260} r={260} fill={stage < 1 ? "#f3dfe4" : "#9ccb8b"} />
        {fx.showB !== false ? (
          <g>
            <path d="M 1760 1080 C 1740 820 1760 640 1700 430" stroke="#8a6448" strokeWidth={64} fill="none" strokeLinecap="round" />
            <circle cx={1690} cy={320} r={250} fill={stage < 1 ? "#f3dfe4" : "#9ccb8b"} />
          </g>
        ) : null}
      </g>
      {Array.from({ length: 18 }, (_, i) => (
        <circle key={i} cx={f(hash01(i * 3 + 11) * 1920)} cy={f(hash01(i * 5 + 12) * 1080)} r={f(30 + hash01(i * 7 + 3) * 70)} fill={stage < 1 ? (i % 2 ? "#f6e6ea" : "#e9f3e1") : i % 2 ? "#b9dca5" : "#d5ebc6"} opacity={0.45} />
      ))}
      {/* ветка яблони A (слева) */}
      <g transform={`rotate(${f(swayA)} -100 600)`}>
        <Spur d="M -120 640 C 120 600 300 560 480 500" w={34} />
        <Spur d="M 400 520 C 470 480 520 440 560 410" w={16} />
        <Spur d="M 470 520 C 540 530 580 545 610 560" w={14} />
        {/* листья: молодые весной, крупнее летом */}
        {[
          [300, 560, -50],
          [380, 520, 110],
          [520, 420, -130],
          [700, 430, 60],
          [450, 560, 150],
          [660, 560, 100],
        ].map(([lx, ly, r], i) => (
          <g key={i} transform={`translate(${lx} ${ly}) rotate(${f(r + Math.sin(t * 1.2 + i) * 2)}) scale(${f(leafGrow)})`}>
            <path d={leafOutline(170, 86)} fill={i % 2 ? LEAF.mid : LEAF.dark} stroke={OUTLINE} strokeWidth={3} />
            <path d="M 0 -10 L 0 -155" stroke={LEAF.light} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
        {/* цветоножки от общего основания соцветия */}
        {FLOWERS_A.map((fl, i) => {
          const dropOut = fl.fruit ? 0 : clamp((stage - 1.2) / 0.6);
          if (dropOut >= 1) return null;
          const hang = fl.fruit && fruitG > 0 ? lerp(0, 70, ease(fruitG)) : 0;
          const d = `M ${CB_A.x} ${CB_A.y} Q ${f((CB_A.x + fl.x) / 2)} ${f(Math.min(CB_A.y, fl.y) - 20)} ${f(fl.x)} ${f(fl.y + hang)}`;
          return (
            <g key={`pd${i}`} opacity={1 - dropOut}>
              <path d={d} fill="none" stroke={OUTLINE} strokeWidth={9} strokeLinecap="round" />
              <path d={d} fill="none" stroke="#8aa75a" strokeWidth={5} strokeLinecap="round" />
            </g>
          );
        })}
        {/* цветки → завязи → яблоки (только у части цветков) */}
        {FLOWERS_A.map((fl, i) => {
          const dropOut = fl.fruit ? 0 : clamp((stage - 1.2) / 0.6);
          if (fruitG > 0 && fl.fruit) {
            const r = lerp(10, 92, ease(fruitG * 0.7 + ripe * 0.3));
            const hang = lerp(0, 70, ease(fruitG));
            return <BranchApple key={i} x={fl.x} y={fl.y + hang + r * 1.45} r={r} ripe={ripe} sway={Math.sin(t * 1.1 + i) * 1.5} />;
          }
          if (dropOut >= 1) return null;
          return (
            <g key={i} opacity={1 - dropOut}>
              <AppleFlower x={fl.x} y={fl.y} r={fl.r} fall={fall} rot={fl.rot} pollen={i === 0 ? (fx.pollenA ?? 1) : 1} />
            </g>
          );
        })}
      </g>
      {/* ветка яблони B (справа) */}
      {fx.showB !== false ? (
        <g transform={`rotate(${f(-swayA * 0.8)} 2020 640)`}>
          <Spur d="M 2040 700 C 1800 660 1600 620 1440 560" w={32} />
          <Spur d="M 1500 580 C 1440 520 1400 480 1370 440" w={14} />
          {[
            [1640, 620, 60],
            [1560, 600, -120],
            [1300, 520, -40],
            [1460, 660, 160],
          ].map(([lx, ly, r], i) => (
            <g key={i} transform={`translate(${lx} ${ly}) rotate(${f(r + Math.sin(t * 1.1 + i + 2) * 2)}) scale(${f(leafGrow)})`}>
              <path d={leafOutline(160, 80)} fill={i % 2 ? LEAF.dark : LEAF.mid} stroke={OUTLINE} strokeWidth={3} />
              <path d="M 0 -10 L 0 -145" stroke={LEAF.light} strokeWidth={3} strokeLinecap="round" />
            </g>
          ))}
          {FLOWERS_B.map((fl, i) => {
            const d = `M ${CB_B.x} ${CB_B.y} Q ${f((CB_B.x + fl.x) / 2)} ${f(Math.min(CB_B.y, fl.y) - 20)} ${f(fl.x)} ${f(fl.y)}`;
            return (
              <g key={`pb${i}`}>
                <path d={d} fill="none" stroke={OUTLINE} strokeWidth={9} strokeLinecap="round" />
                <path d={d} fill="none" stroke="#8aa75a" strokeWidth={5} strokeLinecap="round" />
              </g>
            );
          })}
          {FLOWERS_B.map((fl, i) => (
            <g key={i}>
              <AppleFlower x={fl.x} y={fl.y} r={fl.r} fall={fall} rot={fl.rot} />
              {i === 0 && (fx.pollenB ?? 0) > 0
                ? Array.from({ length: 7 }, (_, k) => (k / 7 < (fx.pollenB ?? 0) ? <circle key={k} cx={f(fl.x - 9 + hash01(k * 7 + 3) * 18)} cy={f(fl.y - 9 + hash01(k * 11 + 5) * 18)} r={3.4} fill="#f2c94c" stroke="#a8862a" strokeWidth={1} /> : null))
                : null}
            </g>
          ))}
        </g>
      ) : null}
      {fx.bee ? <Bee x={fx.bee.x} y={fx.bee.y} s={1.15} dir={fx.bee.dir} tilt={fx.bee.tilt} fly={fx.bee.fly} pollen={fx.bee.pollen} t={t} /> : null}
    </g>
  );
};

const mixRgb = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], clamp(k)))).join(",")})`;

// Траектория пчелы по расписанию (секунды от начала вставки).
//   0–1.8   прилёт к цветку A1, 1.8–2.6 зависание и посадка,
//   2.6–4.4 на цветке A1 (пыльца на теле), 4.4–6.6 перелёт к B1,
//   6.6–7.2 посадка, 7.2–9.0 на цветке B1 (часть пыльцы остаётся), 9.0+ улетает.
export const BEE_T = { arriveA: 2.6, leaveA: 4.4, arriveB: 7.2, leaveB: 9.0, end: 10.6 } as const;
export const beeAt = (u: number) => {
  const raw = beeRaw(u);
  const sitting = (u >= BEE_T.arriveA && u < BEE_T.leaveA) || (u >= BEE_T.arriveB && u < BEE_T.leaveB);
  // зависание: лёгкое покачивание в полёте, на цветке — едва заметное
  const wob = sitting ? { x: Math.sin(u * 3) * 3, y: 0 } : { x: Math.sin(u * 7) * 3, y: Math.sin(u * 9) * 4 };
  const ahead = beeRaw(u + 0.08);
  const dir = sitting ? 1 : ahead.x >= raw.x - 0.5 ? 1 : -1;
  const tilt = sitting ? 0 : clamp((ahead.y - raw.y) * 0.6, -16, 16);
  // крылья складываются после посадки и раскрываются перед взлётом
  const fold = (t0: number, t1: number) => clamp(1 - (u - t0) / 0.25) + clamp((u - (t1 - 0.2)) / 0.2);
  const fly = u < BEE_T.arriveA ? 1 : u < BEE_T.leaveA ? fold(BEE_T.arriveA, BEE_T.leaveA) : u < BEE_T.arriveB ? 1 : u < BEE_T.leaveB ? fold(BEE_T.arriveB, BEE_T.leaveB) : 1;
  const pollen =
    u < BEE_T.arriveA ? 0 : u < BEE_T.leaveA ? clamp(((u - BEE_T.arriveA) / (BEE_T.leaveA - BEE_T.arriveA)) * 1.2) : u < BEE_T.arriveB ? 1 : u < BEE_T.leaveB ? 1 - 0.5 * clamp(((u - BEE_T.arriveB) / (BEE_T.leaveB - BEE_T.arriveB)) * 1.3) : 0.5;
  return { x: raw.x + wob.x, y: raw.y + wob.y, dir, tilt, fly: clamp(fly), pollen };
};
// Положение без вычисления направления (для оценки скорости).
const beeRaw = (u: number) => {
  const A = FLOWERS_A[0];
  const B = FLOWERS_B[0];
  const sitA = { x: A.x + 4, y: A.y - 28 };
  const sitB = { x: B.x - 2, y: B.y - 28 };
  const bez = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, k: number) => ({ x: (1 - k) * (1 - k) * p0.x + 2 * (1 - k) * k * p1.x + k * k * p2.x, y: (1 - k) * (1 - k) * p0.y + 2 * (1 - k) * k * p1.y + k * k * p2.y });
  if (u < 1.8) return bez({ x: -120, y: 120 }, { x: 260, y: 40 }, { x: sitA.x - 40, y: sitA.y - 90 }, ease(u / 1.8));
  if (u < BEE_T.arriveA) return { x: lerp(sitA.x - 40, sitA.x, ease((u - 1.8) / 0.8)), y: lerp(sitA.y - 90, sitA.y, ease((u - 1.8) / 0.8)) };
  if (u < BEE_T.leaveA) return sitA;
  if (u < 6.6) return bez(sitA, { x: (sitA.x + sitB.x) / 2, y: 130 }, { x: sitB.x + 40, y: sitB.y - 90 }, ease((u - BEE_T.leaveA) / (6.6 - BEE_T.leaveA)));
  if (u < BEE_T.arriveB) return { x: lerp(sitB.x + 40, sitB.x, ease((u - 6.6) / (BEE_T.arriveB - 6.6))), y: lerp(sitB.y - 90, sitB.y, ease((u - 6.6) / (BEE_T.arriveB - 6.6))) };
  if (u < BEE_T.leaveB) return sitB;
  return bez(sitB, { x: sitB.x + 200, y: sitB.y - 260 }, { x: 2200, y: 60 }, ease((u - BEE_T.leaveB) / (BEE_T.end - BEE_T.leaveB)));
};

export const BloomView: React.FC<{ fx: BloomFx; cam: { cx: number; cy: number; w: number } }> = ({ fx, cam }) => {
  const h = (cam.w * 9) / 16;
  return (
    <svg width={1920} height={1080} viewBox={`${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`}>
      <BloomWorld fx={fx} />
    </svg>
  );
};
