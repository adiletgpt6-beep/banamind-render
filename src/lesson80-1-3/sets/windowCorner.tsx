// Уголок у окна (ролик 80-1-3): та же арочная рама из Room.tsx, но нижняя
// левая створка открыта наружу; лёгкая занавеска у правого края окна;
// высокий деревянный столик под левой частью окна — на нём вертушка.
// Всё рисуется поверх RoomBack (окно не сдвигается) и зависит только от t.
import React from "react";
import { WINDOW, scaleAt } from "../../lesson01/layout";
import type { P } from "../../lesson01/rig/geom";
import { OUTLINE } from "../../lesson01/rig/looks";
import { Landscape } from "../../lesson01/sets/Landscape";
import { pinwheelInStandHub } from "./pinwheel";

const f = (n: number) => n.toFixed(2);
const OL = 3;

// ---------- геометрия окна (как в ArchedWindow) ----------
const WX = WINDOW.x;
const WY = WINDOW.y;
const WW = WINDOW.w;
const WH = WINDOW.h;
const FR = 13; // половина толщины рамы (stroke 26)
const MX = WX + WW / 2; // средник
const TY = WY + WH * 0.56; // импост
const SILL = WY + WH; // подоконник
// проём нижней левой створки (внутренний край рамы)
export const OPEN_PANE = { x0: WX + FR, x1: MX - 7, y0: TY + 7, y1: SILL - FR } as const;
const R_IN = WW / 2 - FR; // внутренний радиус арки
const ARCH_IN = `M ${f(WX + FR)} ${f(SILL - FR)} L ${f(WX + FR)} ${f(WY + WW / 2)} A ${f(R_IN)} ${f(R_IN)} 0 0 1 ${f(WX + WW - FR)} ${f(WY + WW / 2)} L ${f(WX + WW - FR)} ${f(SILL - FR)} Z`;

// Пейзаж ровно в той же раскладке, что и в ArchedWindow. Картинка пейзажа
// кончается выше подоконника (y ≈ 740) — ниже продолжаем ближний луг.
const GROUND_Y = WY + (1080 - 260) * (WH / 1060);
const Meadow: React.FC = () => (
  <g>
    <rect x={WX} y={f(GROUND_Y - 1)} width={WW} height={f(SILL - GROUND_Y + 1)} fill="#86b56b" />
    <path d={`M ${WX} ${f(SILL - 52)} Q ${f(WX + WW * 0.45)} ${f(SILL - 78)} ${WX + WW} ${f(SILL - 46)} L ${WX + WW} ${SILL} L ${WX} ${SILL} Z`} fill="#7aaa60" />
  </g>
);
const WindowView: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <svg x={WX} y={WY} width={WW} height={WH} viewBox="380 260 1160 1060" preserveAspectRatio="xMidYMid slice">
      <Landscape t={t} />
    </svg>
    <Meadow />
  </g>
);

// Открытая створка: проём без стекла (пейзаж чище), сама створка отведена
// наружу на петлях левого косяка — видна узкой скошенной рамой в проёме.
export const OpenWindow: React.FC<{ t: number }> = ({ t }) => {
  const p = OPEN_PANE;
  const ph = p.y1 - p.y0;
  // створка в ракурсе: петельная сторона на косяке, свободная — дальше от нас
  const sw = 52; // видимая ширина повернутой створки
  const hingeT = p.y0 - 2;
  const hingeB = p.y1 + 2;
  const freeT = p.y0 + ph * 0.045;
  const freeB = p.y1 - ph * 0.07;
  const fx = p.x0 + sw;
  const q = (k: number, v: number): P => {
    // точка на створке: k — 0 (петли) … 1 (свободный край), v — 0 (верх) … 1 (низ)
    const top = hingeT + (freeT - hingeT) * k;
    const bot = hingeB + (freeB - hingeB) * k;
    return { x: p.x0 + sw * k, y: top + (bot - top) * v };
  };
  const quad = (a: P, b: P, c: P, d: P) => `M ${f(a.x)} ${f(a.y)} L ${f(b.x)} ${f(b.y)} L ${f(c.x)} ${f(c.y)} L ${f(d.x)} ${f(d.y)} Z`;
  const rail = 0.06; // ширина обвязки по высоте
  const glass = quad(q(0, rail), q(0.8, rail * 0.94), q(0.8, 1 - rail * 0.94), q(0, 1 - rail));
  // закрытые стёкла: лёгкий холодный тон и блики (у открытого проёма их нет)
  const closed = [
    { x: WX, y: WY, w: MX - 7 - WX, h: TY - 7 - WY },
    { x: MX + 7, y: WY, w: WX + WW - MX - 7, h: TY - 7 - WY },
    { x: MX + 7, y: TY + 7, w: WX + WW - MX - 7, h: SILL - TY - 7 },
  ];
  const streak = (x: number, y: number, len: number, wd: number) => `M ${f(x)} ${f(y)} l ${f(len * 0.42)} ${f(-len)} h ${f(wd)} l ${f(-len * 0.42)} ${f(len)} Z`;
  return (
    <g>
      <defs>
        <clipPath id="ow-in">
          <path d={ARCH_IN} />
        </clipPath>
        <clipPath id="ow-pane">
          <rect x={f(p.x0)} y={f(p.y0)} width={f(p.x1 - p.x0)} height={f(p.y1 - p.y0)} />
        </clipPath>
      </defs>
      <g clipPath="url(#ow-in)">
        {/* низ окна: луг вместо пустого края картинки (с тем же стеклом) */}
        <Meadow />
        <rect x={WX} y={f(GROUND_Y - 1)} width={WW} height={f(SILL - GROUND_Y + 1)} fill="#ffffff" opacity={0.06} />
        <line x1={MX} y1={f(GROUND_Y - 4)} x2={MX} y2={SILL} stroke="#c9a676" strokeWidth={14} />
        {closed.map((r, i) => (
          <rect key={i} x={f(r.x)} y={f(r.y)} width={f(r.w)} height={f(r.h)} fill="#e6f1f5" opacity={0.12} />
        ))}
        <g fill="#ffffff" opacity={0.18}>
          <path d={streak(MX + 60, SILL - 40, 150, 26)} />
          <path d={streak(MX + 110, SILL - 40, 110, 10)} />
          <path d={streak(MX + 40, TY - 60, 170, 24)} />
          <path d={streak(MX + 86, TY - 60, 130, 9)} />
          <path d={streak(WX + 70, TY - 60, 170, 24)} />
          <path d={streak(WX + 116, TY - 60, 130, 9)} />
        </g>
      </g>
      <g clipPath="url(#ow-pane)">
        {/* проём: тот же пейзаж без стекла */}
        <WindowView t={t} />
        <rect x={f(p.x0)} y={f(p.y0)} width={f(p.x1 - p.x0)} height={f(ph)} fill="#fffaf0" opacity={0.04} />
        {/* отведённая створка */}
        <path d={glass} fill="#dcecf2" opacity={0.4} />
        <path d={`${quad(q(0, 0), q(1, 0), q(1, 1), q(0, 1))} ${glass}`} fill="#c9a676" fillRule="evenodd" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" />
        <path d={quad(q(0.18, 0.2), q(0.42, 0.18), q(0.42, 0.42), q(0.18, 0.46))} fill="#ffffff" opacity={0.35} />
        {/* торец свободного края — чуть темнее */}
        <path d={quad(q(0.86, 0.01), q(1, 0), q(1, 1), q(0.86, 0.99))} fill="#b08d5f" />
        <line x1={f(fx)} y1={f(freeT)} x2={f(fx)} y2={f(freeB)} stroke={OUTLINE} strokeWidth={2.4} />
        {/* ручка на свободном крае */}
        <path d={`M ${f(fx - 9)} ${f((freeT + freeB) / 2 - 3)} h 7 v 18 h -7 Z`} fill="#8a6a45" stroke={OUTLINE} strokeWidth={1.4} />
      </g>
      {/* петли на левом косяке */}
      {[0.14, 0.86].map((v) => (
        <rect key={v} x={f(p.x0 - 4)} y={f(p.y0 + ph * v - 10)} width={8} height={20} rx={2} fill="#8a6a45" stroke={OUTLINE} strokeWidth={1.6} />
      ))}
    </g>
  );
};

// ---------- занавеска ----------
export const ROD = { x0: WX - 62, x1: WX + WW + 62, y: WY - 34 } as const; // карниз над аркой
export const CURTAIN = { x0: 3010, x1: 3150, top: ROD.y + 4, hem: SILL - 6 } as const;
const FOLDS = 7; // линии складок (6 полос)

// Смещение ткани вбок: верх неподвижен, низ медленно колышется.
// v — 0 (карниз) … 1 (подол), i — номер складки слева направо.
const sway = (t: number, wind: number, v: number, i: number) => {
  const ph = v * 1.2 + i * 0.14;
  const s = 9 * Math.sin(t * 0.83 - ph) + 5 * Math.sin(t * 1.47 + 1.3 - ph * 1.3) + 3 * Math.sin(t * 0.41 + 2.2);
  const free = 1 + 0.22 * (1 - i / (FOLDS - 1)); // левый край свободнее
  return wind * (s + 4) * Math.pow(v, 1.7) * free;
};

export const Curtain: React.FC<{ t: number; wind: number }> = ({ t, wind }) => {
  const c = CURTAIN;
  const N = 28;
  const cx = (c.x0 + c.x1) / 2;
  // складки: вверху собраны на карнизе, книзу чуть расходятся; шаг неровный
  const U = [0, 0.15, 0.34, 0.5, 0.67, 0.84, 1];
  const xTop = (i: number) => c.x0 + (c.x1 - c.x0) * U[i];
  const xBot = (i: number) => c.x0 - 10 + (c.x1 + 6 - (c.x0 - 10)) * U[i];
  const billow = 1 + 0.05 * wind * (0.6 + 0.4 * Math.sin(t * 0.83 - 0.9));
  const pt = (i: number, v: number): P => {
    const base = xTop(i) + (xBot(i) - xTop(i)) * Math.pow(v, 0.7);
    const wave = Math.sin(v * 9 + i * 2.1) * 1.2 * v; // мягкая неровность ткани
    const x = cx + (base - cx) * (1 + (billow - 1) * v * v) + sway(t, wind, v, i) + wave;
    // подол: складки чуть разной длины, свободный угол немного приподнят
    const lift = wind * 6 * (1 - i / (FOLDS - 1)) * (0.5 + 0.5 * Math.sin(t * 0.83 - 1.4));
    const hemY = c.hem + (i % 2 ? 4 : -2) - lift;
    return { x, y: c.top + (hemY - c.top) * v };
  };
  const L = Array.from({ length: FOLDS }, (_, i) => Array.from({ length: N + 1 }, (_, k) => pt(i, k / N)));
  const mix = (a: P[], b: P[], u: number) => a.map((q, k) => ({ x: q.x + (b[k].x - q.x) * u, y: q.y + (b[k].y - q.y) * u }));
  const pts = (a: P[]) => a.map((q) => `${f(q.x)} ${f(q.y)}`).join(" L ");
  const rev = (a: P[]) => [...a].reverse();
  // подол — волна между низами складок
  const hem = (p: P, q: P) => `Q ${f((p.x + q.x) / 2)} ${f(Math.max(p.y, q.y) + 4)} ${f(q.x)} ${f(q.y)}`;
  const hemPath = Array.from({ length: FOLDS - 1 }, (_, i) => hem(L[i][N], L[i + 1][N])).join(" ");
  const outline = `M ${pts(L[0])} ${hemPath} L ${pts(rev(L[FOLDS - 1]))} Z`;
  const strip = (a: P[], b: P[]) => `M ${pts(a)} ${hem(a[N], b[N])} L ${pts(rev(b))} Z`;
  // тень складки — левая часть каждой полосы, блик — тонкая линия правее
  const creases = Array.from({ length: FOLDS - 1 }, (_, i) => strip(L[i], mix(L[i], L[i + 1], i % 2 ? 0.5 : 0.36)));
  const lights = Array.from({ length: FOLDS - 1 }, (_, i) => mix(L[i], L[i + 1], 0.72).slice(3));
  const side = L[0].map((q) => ({ x: q.x + 7, y: q.y }));
  const head = 12; // двойная тесьма вверху
  return (
    <g>
      {/* карниз на кронштейнах */}
      {[ROD.x0 + 30, ROD.x1 - 30].map((x) => (
        <rect key={x} x={f(x - 7)} y={f(ROD.y - 17)} width={14} height={24} rx={3} fill="#8a5b36" stroke={OUTLINE} strokeWidth={1.8} />
      ))}
      <rect x={f(ROD.x0)} y={f(ROD.y - 5)} width={f(ROD.x1 - ROD.x0)} height={10} rx={5} fill="#9c6a40" stroke={OUTLINE} strokeWidth={2.4} />
      <line x1={f(ROD.x0 + 6)} y1={f(ROD.y - 2)} x2={f(ROD.x1 - 6)} y2={f(ROD.y - 2)} stroke="#c08a58" strokeWidth={2} strokeLinecap="round" />
      {[ROD.x0, ROD.x1].map((x) => (
        <circle key={x} cx={f(x)} cy={f(ROD.y)} r={10} fill="#8a5b36" stroke={OUTLINE} strokeWidth={2.4} />
      ))}
      {/* полупрозрачное полотно */}
      <g opacity={0.85}>
        <path d={outline} fill="#fbf7ee" />
        {creases.map((d, i) => (
          <path key={i} d={d} fill="#e7dcc7" opacity={0.7} />
        ))}
        {lights.map((a, i) => (
          <path key={i} d={`M ${pts(a)}`} fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
        ))}
        <path d={strip(L[0], side)} fill="#efe6d4" />
        <rect x={f(c.x0)} y={f(c.top)} width={f(c.x1 - c.x0)} height={head} fill="#efe6d4" />
        <path d={outline} fill="none" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" />
      </g>
      {/* кольца на карнизе */}
      {Array.from({ length: FOLDS }, (_, i) => (
        <ellipse key={i} cx={f(xTop(i))} cy={f(ROD.y)} rx={5} ry={8} fill="none" stroke="#7a5238" strokeWidth={2.6} />
      ))}
    </g>
  );
};

// ---------- столик у окна ----------
// Высокий узкий столик с ящиком и нижней полкой; стоит у стены под левой
// частью окна. Столешница — в той же косой проекции, что столик урока 1.
export const WT = { x: 2490, floorY: 1215, w: 300, legH: 476, topD: 56 } as const;
export const WT_S: number = scaleAt(WT.floorY);
export const WT_TOP_Y = WT.floorY - WT.legH * WT_S; // передний край столешницы
// Опора подставки вертушки: середина глубины столешницы, чуть левее центра.
export const WT_STAND: P = { x: 2484, y: WT_TOP_Y - WT.topD * WT_S * 0.5 };
// Ось ротора вертушки, стоящей в подставке на WT_STAND (≈ 2487, 846).
export const WT_HUB: P = pinwheelInStandHub(WT_STAND.x, WT_STAND.y, WT_S);
// Место учителя у столика (слева): кулак на палочке (точка захвата PW_GRIP)
// при вытянутой на ≈ 88 % руке; локоть выше столешницы и левее её угла.
export const WT_TEACHER: P = { x: 2300, y: 1244 };

export const WindowTable: React.FC = () => {
  const s = WT_S;
  const x = WT.x;
  const fy = WT.floorY;
  const hw = (WT.w * s) / 2;
  const top = WT_TOP_Y;
  const dx = WT.topD * s * 0.55;
  const dy = -WT.topD * s;
  const th = 16 * s; // толщина столешницы
  const ins = 16 * s; // свес столешницы над ножками
  const lw = 22 * s; // ножка вверху (книзу сужается)
  const apr = 58 * s; // царга с ящиком
  const kb = 0.8; // задние ножки — на этой доле глубины
  const shelf = fy - 200 * s; // передний край нижней полки (выше плинтуса стены)
  const sth = 10 * s;
  const xl = x - hw + ins;
  const xr = x + hw - ins;
  const sl = xl + lw * 0.3; // полка — между ножками (не торчит из-за сужения)
  const sr = xr - lw * 0.3;
  const leg = (x0: number, y0: number, y1: number, fill: string, key: string) => {
    const b = lw * 0.18;
    return <path key={key} d={`M ${f(x0)} ${f(y0)} h ${f(lw)} L ${f(x0 + lw - b)} ${f(y1)} h ${f(-(lw - 2 * b))} Z`} fill={fill} stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />;
  };
  const bx = dx * kb;
  const by = dy * kb;
  const par = (x0: number, y0: number, w: number, ddx: number, ddy: number) => `M ${f(x0)} ${f(y0)} L ${f(x0 + ddx)} ${f(y0 + ddy)} L ${f(x0 + w + ddx)} ${f(y0 + ddy)} L ${f(x0 + w)} ${f(y0)} Z`;
  const side = (x0: number, y0: number, h: number, ddx: number, ddy: number) => `M ${f(x0)} ${f(y0)} L ${f(x0 + ddx)} ${f(y0 + ddy)} L ${f(x0 + ddx)} ${f(y0 + ddy + h)} L ${f(x0)} ${f(y0 + h)} Z`;
  return (
    <g>
      {/* тень на ковре — под передними и задними ножками */}
      <ellipse cx={f(x + dx * 0.45)} cy={f(fy + dy * kb * 0.45)} rx={f(hw * 1.12)} ry={f(-dy * kb * 0.5 + 8 * s)} fill="#16304a" opacity={0.22} />
      {/* задние ножки */}
      {leg(xl + bx, top + th + by, fy + by, "#7d5130", "bl")}
      {leg(xr - lw + bx, top + th + by, fy + by, "#7d5130", "br")}
      {/* нижняя полка */}
      <path d={par(sl, shelf, sr - sl, bx, by)} fill="#b98252" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={side(sr, shelf, sth, bx, by)} fill="#7d5130" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <rect x={f(sl)} y={f(shelf)} width={f(sr - sl)} height={f(sth)} fill="#9c6a40" stroke={OUTLINE} strokeWidth={OL} />
      {/* боковая царга справа */}
      <path d={side(xr, top + th, apr, bx, by)} fill="#7d5130" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      {/* передние ножки */}
      {leg(xl, top + th, fy, "#9c6a40", "fl")}
      {leg(xr - lw, top + th, fy, "#9c6a40", "fr")}
      {/* передняя царга с ящиком */}
      <rect x={f(xl)} y={f(top + th)} width={f(xr - xl)} height={f(apr)} fill="#a87347" stroke={OUTLINE} strokeWidth={OL} />
      <rect x={f(xl + lw + 4 * s)} y={f(top + th + 8 * s)} width={f(xr - xl - 2 * lw - 8 * s)} height={f(apr - 16 * s)} rx={f(3 * s)} fill="#b9844f" stroke={OUTLINE} strokeWidth={2} />
      <circle cx={f(x)} cy={f(top + th + apr / 2)} r={f(6 * s)} fill="#6e4528" stroke={OUTLINE} strokeWidth={1.6} />
      <rect x={f(xl)} y={f(top + th)} width={f(xr - xl)} height={f(6 * s)} fill="#3b2418" opacity={0.18} />
      {/* столешница */}
      <path d={par(x - hw, top, 2 * hw, dx, dy)} fill="#c9925f" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
      <path d={`M ${f(x - hw + 30 * s)} ${f(top + dy * 0.3)} L ${f(x + hw - 70 * s)} ${f(top + dy * 0.3)} M ${f(x - hw + 90 * s)} ${f(top + dy * 0.68)} L ${f(x + hw - 20 * s)} ${f(top + dy * 0.68)}`} stroke="#b07a4c" strokeWidth={3 * s} opacity={0.6} strokeLinecap="round" />
      <rect x={f(x - hw)} y={f(top)} width={f(2 * hw)} height={f(th)} fill="#a87347" stroke={OUTLINE} strokeWidth={OL} />
      <path d={side(x + hw, top, th, dx, dy)} fill="#8a5b36" stroke={OUTLINE} strokeWidth={OL} strokeLinejoin="round" />
    </g>
  );
};

// Окно с открытой створкой и занавеской (столик рисуется отдельно, по глубине).
export const WindowCorner: React.FC<{ t: number; wind: number }> = ({ t, wind }) => (
  <g>
    <OpenWindow t={t} />
    <Curtain t={t} wind={wind} />
  </g>
);
