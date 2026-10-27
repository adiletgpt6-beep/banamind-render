// Офис директора (№31): общий план открытого пространства, кабинет
// директора спереди и со спины, переговорная. Сцены 2, 3, 4, 7c, 8.
//
// Стиль: ясные формы, аккуратный контур — тёмный оттенок своей заливки
// (≈ 3 px мира на переднем плане, тоньше в глубине), мягкие градиенты
// объёма, контактные тени; глубина — слоями (задняя стена с окнами и
// видом на Бишкек и Ала-Тоо → стеклянный кабинет → середина → стол
// помощницы → размытый передний план). Цвета — спокойные голубые и
// нейтральные; evening 0…1 — низкое тёплое солнце сквозь жалюзи (сцена 8).
//
// Общий план — перспектива с одной точкой схода: глубина задаётся
// масштабом s (1 — плоскость помощницы, 0,5 — задняя стена). Линия пола
// на глубине s: o31Y(s); рост героя там — H × s (o31Place). Мировая X
// (px при s = 1) переводится в кадр: o31X(X, s).
import { box } from "../kit";
import { clamp, easeInOut, hash01, lerp } from "../rig/motion";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";
import { LaptopFront, LaptopUser } from "../props/Laptop";

// ---------- Цвета и помощники ----------
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
export const mix = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return toHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
};
// Контур — тёмный оттенок заливки (чуть к чернилам).
export const ink = (h: string, k = 0.66) => mix(mix(h, "#000000", 1 - k), "#1E2235", 0.18);
type Pt = { readonly x: number; readonly y: number };
const pts = (p: readonly Pt[]) => p.map((q, i) => `${i ? "L" : "M"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ") + " Z";
const LW = 3; // толщина контура при s = 1 (px мира)
const lw = (s: number) => Math.max(1.3, LW * s);

const Svg: React.FC<{ readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", ...style })}>
    {children}
  </svg>
);

// Палитра офиса.
const P = {
  wall: "#E4EAF1",
  wallLow: "#D7DFE9",
  ceil: "#EEF1F5",
  floor: "#C7CFDA",
  floorNear: "#BAC3CF",
  frame: "#F6F8FA",
  glassTint: "rgba(196,218,236,0.22)",
  steel: "#8E9AAB",
  deskTop: "#F3F4F6",
  deskEdge: "#D3D8DF",
  wood: "#D9BF9A",
  leg: "#8F99A6",
  chair: "#34445F",
  plant: "#5E9E64",
  plantDeep: "#457F50",
  pot: "#F1EEE8",
  sage: "#A9BDB4",
} as const;

// ---------- Перспектива общего плана ----------
export const O31 = {
  horizon: 760, // линия горизонта (глаза камеры ≈ 2,6 м)
  floorF: 1900, // линия пола при s = 1 (плоскость помощницы)
  vpx: 600, // точка схода по x
  backS: 0.5, // задняя стена (окна)
  ceilH: 1350, // высота потолка, px при s = 1 (3 м)
  deskH: 337, // высота столешницы (0,75 м)
} as const;
export const o31Y = (s: number) => O31.horizon + (O31.floorF - O31.horizon) * s;
export const o31S = (y: number) => (y - O31.horizon) / (O31.floorF - O31.horizon);
export const o31X = (X: number, s: number) => O31.vpx + (X - O31.vpx) * s;
// Точка на высоте up (px при s = 1) над полом в (X, s).
export const o31Pt = (X: number, s: number, up = 0): Pt => ({ x: o31X(X, s), y: o31Y(s) - up * s });
const ceilY = (s: number) => o31Y(s) - O31.ceilH * s;
// Место героя на полу общего плана: x, y — точка между ступнями (кадр
// мира), рост — h × s(y). Для ходьбы по глубине двигайте (x, y).
export const o31Place = (x: number, y: number, h: number) => ({ x, y, h: h * o31S(y) });

// Мировые размеры (X при s = 1) и глубины частей общего плана.
const ROOM = { x0: 960 - 90, x1: 2100, sBack: 0.5, sFront: 0.7 }; // стеклянный кабинет
const DOOR = { x0: 960, x1: 1170, s: 0.7, h: 943 }; // раздвижная стеклянная дверь
const DDESK = { x0: 1080, x1: 1740, sF: 0.612, sB: 0.575 }; // стол директора
const DSEAT = { X: 1400, s: 0.555 };
const ADESK = { x0: 420, x1: 735, sN: 1.1, sF: 0.86 }; // стол помощницы (вид сбоку)
const ASEAT = { X: 300, s: 1 };
const MON = { X: 650, s: 0.965, w: 247, h: 144, lift: 150 }; // монитор помощницы

// Позиции для сцен (кадр мира общего плана). s — масштаб глубины: рост
// героя = H × s, высота сиденья = seatOf(H) × s.
export const O31_POS = {
  // директор за столом в кабинете (сидит лицом к камере)
  director: { x: o31X(DSEAT.X, DSEAT.s), y: o31Y(DSEAT.s), s: DSEAT.s },
  // помощница за своим столом (сидит в профиль вправо, к монитору)
  assistant: { x: o31X(ASEAT.X, ASEAT.s), y: o31Y(ASEAT.s), s: ASEAT.s },
  // столешницы: y верхнего края (передний / дальний край)
  dirDeskTop: { front: o31Y(DDESK.sF) - O31.deskH * DDESK.sF, back: o31Y(DDESK.sB) - O31.deskH * DDESK.sB, x0: o31X(DDESK.x0, DDESK.sF), x1: o31X(DDESK.x1, DDESK.sF) },
  asstDeskTop: { y: o31Y(1) - O31.deskH, x0: o31X(ADESK.x0, 1), x1: o31X(ADESK.x1, 1) }, // на глубине помощницы (s = 1)
  // клавиатура помощницы (кисти рук на ней) и центр экрана монитора
  asstKeys: o31Pt(495, 0.995, O31.deskH),
  monitor: o31Pt(MON.X, MON.s, O31.deskH + MON.lift),
  // ноутбук директора (середина шарнира), ширина
  dirLaptop: { ...o31Pt(1530, 0.59, O31.deskH), w: 150 * 0.59 },
  // дверь кабинета: середина проёма на линии пола; inside / outside —
  // где стоять у двери внутри и снаружи кабинета
  door: { x: o31X((DOOR.x0 + DOOR.x1) / 2, DOOR.s), y: o31Y(DOOR.s), s: DOOR.s, top: o31Y(DOOR.s) - DOOR.h * DOOR.s },
  doorInside: o31Pt(1065, 0.66),
  doorOutside: o31Pt(1065, 0.745),
  // путь директора к выходу (сцена 4c): от стола через дверь, мимо
  // стола помощницы (за ней), за левый край кадра
  exitPath: [o31Pt(DSEAT.X, DSEAT.s), o31Pt(1260, 0.6), o31Pt(1065, 0.66), o31Pt(1065, 0.745), o31Pt(560, 0.82), o31Pt(-200, 0.85), o31Pt(-900, 0.87)],
} as const;

// Камеры стандартных планов общего офиса (cam для Shot).
export const O31_CAM = {
  wide: { x: 700, y: 1380, zoom: 1 }, // общий: стол помощницы слева спереди, кабинет справа в глубине
  wideTight: { x: 640, y: 1430, zoom: 1.25 }, // конец мягкого наезда к помощнице
  assistant: { x: 470, y: 1460, zoom: 1.9 }, // средний: помощница и монитор
  assistantClose: { x: 520, y: 1400, zoom: 2.6 }, // ближе: лицо и экран
  door: { x: 930, y: 1250, zoom: 1.6 }, // дверь кабинета с табличкой
  director: { x: 1110, y: 1190, zoom: 3 }, // директор за стеклом (лучше — DirectorFront)
} as const;

// ---------- Вид из окна: Бишкек и Ала-Тоо ----------
// Полоса x0…x1 × y0…y1 (кадр мира) за окнами: небо, хребет со снегом,
// город (дома, тополя). base — подножие гор, k — масштаб деталей,
// evening 0…1 — закат (тёплое небо, горы розовеют, в окнах свет).
export const CityView: React.FC<{ readonly id: string; readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number; readonly base: number; readonly k?: number; readonly evening?: number; readonly blur?: number }> = ({ id, x0, x1, y0, y1, base, k = 1, evening = 0, blur = 0 }) => {
  const e = clamp(evening);
  const skyTop = mix("#B9DAF1", "#F1B27C", e);
  const skyLow = mix("#E9F2F7", "#FBE3BE", e);
  const mFar = mix("#B7C7D8", "#D4A9A2", e);
  const mNear = mix("#9FB3C7", "#B98C8C", e);
  const snow = mix("#F6F9FC", "#FCE3CF", e);
  const haze = mix("#E4EDF3", "#F8D9B5", e);
  // хребты: детерминированные вершины
  const ridge = (seed: number, step: number, hMin: number, hMax: number, off: number) => {
    const n = Math.ceil((x1 - x0) / step) + 2;
    let d = `M ${x0 - step} ${base + 4}`;
    for (let i = 0; i <= n; i++) {
      const x = x0 - step + i * step + off;
      const h = (hMin + (hMax - hMin) * hash01(seed + i * 1.37)) * k;
      const xm = x - step / 2;
      const hm = h * (0.45 + 0.25 * hash01(seed * 3 + i));
      d += ` L ${xm.toFixed(1)} ${(base - hm).toFixed(1)} L ${x.toFixed(1)} ${(base - h).toFixed(1)}`;
    }
    return `${d} L ${x1 + step} ${base + 4} Z`;
  };
  const far = ridge(11, 170 * k, 95, 175, 0);
  const near = ridge(29, 230 * k, 45, 105, 60 * k);
  // дома: детерминированные блоки
  const blocks: { x: number; w: number; h: number; c: string; row: number }[] = [];
  for (const row of [0, 1]) {
    let x = x0 - 40;
    let i = 0;
    while (x < x1 + 40) {
      const w = (60 + 70 * hash01(row * 50 + i * 2.3)) * k;
      const h = (row ? 30 + 50 * hash01(i * 4.1 + 7) : 40 + 80 * hash01(i * 3.3 + 1)) * k;
      const c = [mix("#C6D2DE", "#E9C8B4", e), mix("#B4C3D2", "#D9B3A2", e), mix("#D3DCE5", "#F0D3BE", e), mix("#A9BACB", "#CDA699", e)][Math.floor(hash01(i * 9.7 + row) * 4)];
      blocks.push({ x, w, h, c, row });
      x += w + (8 + 26 * hash01(i * 5.9 + row * 3)) * k;
      i++;
    }
  }
  const treeC = mix("#93B49C", "#A7A27E", e);
  const treeD = mix("#7FA38A", "#8F8A6A", e);
  return (
    <Svg style={blur ? { filter: `blur(${blur}px)` } : undefined}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={haze} stopOpacity={0} />
          <stop offset="1" stopColor={haze} stopOpacity={0.85} />
        </linearGradient>
        <clipPath id={`${id}-snow`}>
          <rect x={x0 - 400} y={y0 - 200} width={x1 - x0 + 800} height={base - 128 * k - y0 + 200} />
        </clipPath>
      </defs>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={`url(#${id}-sky)`} />
      {/* солнце низко (вечер) */}
      {e > 0 ? <circle cx={lerp(x0, x1, 0.18)} cy={base - 40 * k} r={70 * k} fill="#FFE2A8" opacity={0.75 * e} style={{ filter: `blur(${18 * k}px)` }} /> : null}
      <path d={far} fill={mFar} />
      <path d={far} fill={snow} clipPath={`url(#${id}-snow)`} opacity={0.95} />
      <path d={near} fill={mNear} opacity={0.9} />
      <rect x={x0} y={base - 70 * k} width={x1 - x0} height={70 * k + 10} fill={`url(#${id}-haze)`} />
      {/* дальний ряд домов и тополя */}
      {blocks
        .filter((b) => b.row === 1)
        .map((b, i) => (
          <rect key={`f${i}`} x={b.x} y={base + 18 * k - b.h} width={b.w} height={y1 - base + b.h} fill={b.c} opacity={0.75} />
        ))}
      {Array.from({ length: Math.ceil((x1 - x0) / (90 * k)) + 1 }).map((_, i) => {
        const x = x0 + i * 90 * k + 30 * k * hash01(i * 7.7);
        const h = (60 + 50 * hash01(i * 2.9)) * k;
        return <ellipse key={`t${i}`} cx={x} cy={base + 60 * k - h / 2} rx={13 * k} ry={h / 2} fill={i % 2 ? treeC : treeD} />;
      })}
      {/* ближний ряд домов с окнами */}
      {blocks
        .filter((b) => b.row === 0)
        .map((b, i) => {
          const top = base + 90 * k - b.h;
          const cols = Math.max(2, Math.floor(b.w / (18 * k)));
          const rows = Math.max(2, Math.floor(b.h / (22 * k)));
          return (
            <g key={`n${i}`}>
              <rect x={b.x} y={top} width={b.w} height={y1 - top} fill={b.c} stroke={ink(b.c, 0.85)} strokeWidth={1.2 * k} />
              <rect x={b.x} y={top} width={b.w} height={5 * k} fill={ink(b.c, 0.9)} />
              {Array.from({ length: rows }).map((__, r) =>
                Array.from({ length: cols }).map((___, c) => {
                  const lit = e > 0 && hash01(i * 31 + r * 7 + c * 3) > 0.62;
                  return <rect key={`${r}-${c}`} x={b.x + 6 * k + c * ((b.w - 12 * k) / cols)} y={top + 12 * k + r * 22 * k} width={((b.w - 12 * k) / cols) * 0.55} height={9 * k} fill={lit ? "#FFD79A" : mix(b.c, "#7F93A8", 0.35)} opacity={lit ? 0.9 * e : 0.55} />;
                }),
              )}
            </g>
          );
        })}
      {/* кроны у самого стекла снизу */}
      {Array.from({ length: Math.ceil((x1 - x0) / (130 * k)) + 1 }).map((_, i) => (
        <ellipse key={`c${i}`} cx={x0 + i * 130 * k + 50 * k * hash01(i * 3.7 + 5)} cy={y1 - 10 * k} rx={(60 + 30 * hash01(i)) * k} ry={(36 + 20 * hash01(i * 2.1)) * k} fill={i % 2 ? treeD : treeC} />
      ))}
    </Svg>
  );
};

// ---------- Окна задней стены (жалюзи, рамы) ----------
// Окна: прямоугольники [x0, x1] × [y0, y1] (кадр мира). blinds 0…1 —
// жалюзи опущены (вечером ламели, сквозь них полосы света), s — масштаб
// толщины рам.
type Win = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };
const Windows: React.FC<{ readonly wins: readonly Win[]; readonly s: number; readonly blinds?: number; readonly evening?: number }> = ({ wins, s, blinds = 0.12, evening = 0 }) => {
  const e = clamp(evening);
  const slat = mix("#F2F4F6", "#F6D9B0", e);
  return (
    <Svg>
      {wins.map((w, i) => {
        const bh = (w.y1 - w.y0) * clamp(blinds);
        const n = Math.max(1, Math.floor(bh / (14 * s)));
        return (
          <g key={i}>
            {/* жалюзи: ламели с просветами */}
            {bh > 2 ? (
              <g>
                {Array.from({ length: n }).map((_, j) => (
                  <rect key={j} x={w.x0} y={w.y0 + j * (bh / n)} width={w.x1 - w.x0} height={(bh / n) * (0.62 - 0.12 * e)} fill={slat} opacity={0.92} />
                ))}
                <rect x={w.x0} y={w.y0 + bh - 6 * s} width={w.x1 - w.x0} height={8 * s} rx={3 * s} fill={mix("#C9D2DC", "#D8B48A", e)} />
              </g>
            ) : null}
            {/* рама */}
            <rect x={w.x0} y={w.y0} width={w.x1 - w.x0} height={w.y1 - w.y0} fill="none" stroke={P.frame} strokeWidth={14 * s} />
            <rect x={w.x0 - 7 * s} y={w.y0 - 7 * s} width={w.x1 - w.x0 + 14 * s} height={w.y1 - w.y0 + 14 * s} fill="none" stroke={ink(P.frame, 0.78)} strokeWidth={lw(s)} />
            <rect x={w.x0 + 7 * s} y={w.y0 + 7 * s} width={w.x1 - w.x0 - 14 * s} height={w.y1 - w.y0 - 14 * s} fill="none" stroke={ink(P.frame, 0.85)} strokeWidth={lw(s) * 0.6} />
            {/* блик стекла */}
            <path d={pts([{ x: w.x0 + (w.x1 - w.x0) * 0.15, y: w.y1 }, { x: w.x0 + (w.x1 - w.x0) * 0.42, y: w.y1 }, { x: w.x0 + (w.x1 - w.x0) * 0.78, y: w.y0 + bh }, { x: w.x0 + (w.x1 - w.x0) * 0.51, y: w.y0 + bh }])} fill="#FFFFFF" opacity={0.12 * (1 - 0.6 * e)} />
          </g>
        );
      })}
    </Svg>
  );
};

// ---------- Общий план: оболочка (потолок, задняя стена, пол) ----------
const BACK_X = { x0: -1100, x1: 2600 }; // протяжённость задней стены (кадр мира)
const backWins = (): Win[] => {
  const s = O31.backS;
  const y0 = ceilY(s) + 40 * s * 2;
  const y1 = o31Y(s) - 90 * s * 2;
  const out: Win[] = [];
  for (let x = BACK_X.x0 + 40; x < BACK_X.x1 - 200; x += 330) out.push({ x0: x, x1: x + 290, y0, y1 });
  return out;
};

export const OfficeShell: React.FC<{ readonly evening?: number; readonly blinds?: number }> = ({ evening = 0, blinds }) => {
  const e = clamp(evening);
  const s = O31.backS;
  const yTop = ceilY(s);
  const yFloor = o31Y(s);
  const wins = backWins();
  const wall = mix(P.wall, "#EBDCCB", 0.55 * e);
  const wallLow = mix(P.wallLow, "#DCC8B4", 0.55 * e);
  const floor = mix(P.floor, "#CDBDAA", 0.45 * e);
  const floorNear = mix(P.floorNear, "#BFAE9B", 0.45 * e);
  const ceil = mix(P.ceil, "#EFE3D6", 0.5 * e);
  // стена с проёмами окон (evenodd)
  const wallPath = `M ${BACK_X.x0} ${yTop} L ${BACK_X.x1} ${yTop} L ${BACK_X.x1} ${yFloor} L ${BACK_X.x0} ${yFloor} Z ` + wins.map((w) => `M ${w.x0} ${w.y0} L ${w.x1} ${w.y0} L ${w.x1} ${w.y1} L ${w.x0} ${w.y1} Z`).join(" ");
  const floorLines = Array.from({ length: 23 }).map((_, i) => -2600 + i * 300);
  return (
    <div style={box({ left: 0, top: 0 })}>
      <CityView id="o31city" x0={BACK_X.x0} x1={BACK_X.x1} y0={yTop} y1={yFloor} base={yTop + 330} k={0.9} evening={e} />
      <Svg>
        <defs>
          <linearGradient id="o31-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={wall} />
            <stop offset="1" stopColor={wallLow} />
          </linearGradient>
          <linearGradient id="o31-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mix(floor, "#E3E8EE", 0.3)} />
            <stop offset="0.35" stopColor={floor} />
            <stop offset="1" stopColor={floorNear} />
          </linearGradient>
          <linearGradient id="o31-ceil" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={mix(ceil, "#D9E0E8", 0.5)} />
            <stop offset="1" stopColor={ceil} />
          </linearGradient>
        </defs>
        {/* потолок */}
        <rect x={BACK_X.x0 - 2000} y={-1200} width={8000} height={yTop + 1200} fill="url(#o31-ceil)" />
        {floorLines.map((X) => (
          <line key={`c${X}`} x1={o31X(X, s)} y1={yTop} x2={o31X(X, 4)} y2={ceilY(4)} stroke={ink(ceil, 0.9)} strokeWidth={1.4} opacity={0.5} />
        ))}
        {/* стена с окнами */}
        <path d={wallPath} fill="url(#o31-wall)" fillRule="evenodd" />
        <line x1={BACK_X.x0} y1={yTop} x2={BACK_X.x1} y2={yTop} stroke={ink(wall, 0.8)} strokeWidth={lw(s)} />
        {/* пол: швы к точке схода и плинтус */}
        <rect x={BACK_X.x0 - 3000} y={yFloor} width={9000} height={3000} fill="url(#o31-floor)" />
        {floorLines.map((X) => (
          <line key={`f${X}`} x1={o31X(X, s)} y1={yFloor} x2={o31X(X, 2.4)} y2={o31Y(2.4)} stroke={ink(floor, 0.92)} strokeWidth={1.6} opacity={0.45} />
        ))}
        {[0.62, 0.78, 0.98, 1.25].map((sv) => (
          <line key={`h${sv}`} x1={BACK_X.x0 - 3000} y1={o31Y(sv)} x2={BACK_X.x1 + 3000} y2={o31Y(sv)} stroke={ink(floor, 0.92)} strokeWidth={1.4} opacity={0.35} />
        ))}
        <rect x={BACK_X.x0} y={yFloor - 12 * s * 2} width={BACK_X.x1 - BACK_X.x0} height={12 * s * 2} fill={mix(wallLow, "#9AA6B6", 0.35)} />
        {/* отражение окон на полу */}
        {wins.map((w, i) => (
          <path key={`r${i}`} d={pts([{ x: w.x0 + 20, y: yFloor + 4 }, { x: w.x1 - 20, y: yFloor + 4 }, { x: o31X(O31.vpx + (w.x1 - 20 - O31.vpx) / s, 0.68), y: o31Y(0.68) }, { x: o31X(O31.vpx + (w.x0 + 20 - O31.vpx) / s, 0.68), y: o31Y(0.68) }])} fill="#FFFFFF" opacity={0.1 * (1 - e)} />
        ))}
      </Svg>
      <Windows wins={wins} s={s} blinds={blinds ?? lerp(0.12, 0.62, e)} evening={e} />
      {/* светильники: линейные подвесы над открытым пространством */}
      <Svg>
        {[0.6, 0.82].map((sv) => {
          const y = ceilY(sv) + 112 * sv;
          const xa = o31X(-500, sv);
          const xb = o31X(760, sv);
          return (
            <g key={sv}>
              {[xa + 60 * sv, xb - 60 * sv].map((cx) => (
                <line key={cx} x1={cx} y1={ceilY(sv)} x2={cx} y2={y} stroke="#8D97A5" strokeWidth={lw(sv) * 0.6} />
              ))}
              <rect x={xa} y={y} width={xb - xa} height={22 * sv} rx={8 * sv} fill="#F8F9FB" stroke={ink("#F8F9FB", 0.7)} strokeWidth={lw(sv)} />
              <rect x={xa + 8 * sv} y={y + 16 * sv} width={xb - xa - 16 * sv} height={6 * sv} rx={3 * sv} fill={mix("#FFFFFF", "#FFE7C2", e)} />
            </g>
          );
        })}
      </Svg>
    </div>
  );
};

// ---------- Кабинет директора в глубине (за стеклом) ----------
// Интерьер: пол, низкий шкаф с папками у окна, растение, спинка кресла.
export const DirRoomBack: React.FC<{ readonly evening?: number }> = ({ evening = 0 }) => {
  const e = clamp(evening);
  const sB = ROOM.sBack;
  const fl = mix("#D4D2CE", "#D9C4AC", 0.5 * e);
  const cab = { x0: 1560, x1: 2060, s: 0.515, h: 300 };
  const c0 = o31Pt(cab.x0, cab.s);
  const c1 = o31Pt(cab.x1, cab.s);
  const ch = cab.h * cab.s;
  const chair = o31Pt(DSEAT.X, 0.535);
  const cs = 0.535;
  return (
    <Svg>
      {/* ковролин кабинета */}
      <path d={pts([o31Pt(ROOM.x0, sB), o31Pt(ROOM.x1, sB), o31Pt(ROOM.x1, ROOM.sFront), o31Pt(ROOM.x0, ROOM.sFront)])} fill={fl} />
      <path d={pts([o31Pt(DDESK.x0 - 80, 0.53), o31Pt(DDESK.x1 + 60, 0.53), o31Pt(DDESK.x1 + 60, 0.64), o31Pt(DDESK.x0 - 80, 0.64)])} fill={mix("#B9C4D2", "#C9B39A", 0.4 * e)} opacity={0.7} />
      {/* шкаф с папками */}
      <rect x={c0.x} y={c0.y - ch} width={c1.x - c0.x} height={ch} fill={P.deskTop} stroke={ink(P.deskTop, 0.72)} strokeWidth={lw(cab.s)} />
      <rect x={c0.x} y={c0.y - ch} width={c1.x - c0.x} height={10 * cab.s} fill={P.wood} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={c0.x + 20 * cab.s + i * 34 * cab.s} y={c0.y - ch - 120 * cab.s} width={26 * cab.s} height={120 * cab.s} fill={[C.blue, "#5E9A93", C.navySoft, "#C9D3F2", C.blue, "#E0775C"][i]} stroke={ink([C.blue, "#5E9A93", C.navySoft, "#C9D3F2", C.blue, "#E0775C"][i], 0.7)} strokeWidth={lw(cab.s) * 0.7} />
      ))}
      {/* растение в углу */}
      <rect x={c1.x - 70 * cab.s} y={c0.y - ch - 100 * cab.s} width={60 * cab.s} height={100 * cab.s} rx={8 * cab.s} fill={P.pot} stroke={ink(P.pot, 0.7)} strokeWidth={lw(cab.s) * 0.7} />
      {[-40, -15, 10, 35].map((a, i) => (
        <ellipse key={a} cx={c1.x - 40 * cab.s} cy={c0.y - ch - 170 * cab.s} rx={18 * cab.s} ry={80 * cab.s} fill={i % 2 ? P.plant : P.plantDeep} transform={`rotate(${a} ${c1.x - 40 * cab.s} ${c0.y - ch - 100 * cab.s})`} />
      ))}
      {/* спинка кресла директора (за ним) */}
      <rect x={chair.x - 150 * cs} y={chair.y - 580 * cs} width={300 * cs} height={380 * cs} rx={70 * cs} fill={P.chair} stroke={ink(P.chair, 0.72)} strokeWidth={lw(cs)} />
      <rect x={chair.x - 120 * cs} y={chair.y - 560 * cs} width={240 * cs} height={40 * cs} rx={20 * cs} fill={mix(P.chair, "#FFFFFF", 0.12)} />
    </Svg>
  );
};

// Стол директора (общий план, мелко): столешница, передняя панель,
// ноутбук — наружной крышкой к зрителю (камера с его стороны не стоит).
export const DirDeskWide: React.FC<{ readonly lid?: number; readonly keys?: boolean }> = ({ lid = 1, keys = true }) => {
  const d = DDESK;
  const H = O31.deskH;
  const fl = o31Pt(d.x0, d.sF, H);
  const fr = o31Pt(d.x1, d.sF, H);
  const bl = o31Pt(d.x0, d.sB, H);
  const br = o31Pt(d.x1, d.sB, H);
  const s = d.sF;
  const L = O31_POS.dirLaptop;
  const kp = o31Pt(1190, 0.6, H);
  return (
    <div style={box({ left: 0, top: 0 })}>
      <Svg>
        {/* контактная тень */}
        <ellipse cx={(fl.x + fr.x) / 2} cy={o31Y(d.sF) - 4} rx={(fr.x - fl.x) * 0.55} ry={12 * s} fill="rgba(30,40,60,0.18)" />
        {/* передняя панель */}
        <path d={pts([fl, fr, { x: fr.x, y: o31Y(d.sF) - 14 * s }, { x: fl.x, y: o31Y(d.sF) - 14 * s }])} fill={mix(P.deskTop, "#C8D0DA", 0.35)} stroke={ink(P.deskTop, 0.7)} strokeWidth={lw(s)} />
        <rect x={fl.x + 20 * s} y={fl.y + 40 * s} width={fr.x - fl.x - 40 * s} height={8 * s} fill={P.wood} opacity={0.8} />
        {/* столешница (светлое дерево) */}
        <path d={pts([bl, br, fr, fl])} fill={P.wood} stroke={ink(P.wood, 0.7)} strokeWidth={lw(s)} />
        <path d={pts([fl, fr, { x: fr.x, y: fr.y + 10 * s }, { x: fl.x, y: fl.y + 10 * s }])} fill={ink(P.wood, 0.85)} />
        {/* бумаги, ключи */}
        <path d={pts([o31Pt(1270, 0.6, H), o31Pt(1370, 0.6, H), o31Pt(1370, 0.585, H), o31Pt(1270, 0.585, H)])} fill="#FFFFFF" stroke="#CFC8BA" strokeWidth={1} />
        {keys ? <ellipse cx={kp.x} cy={kp.y} rx={12 * s} ry={5 * s} fill="#3A3F4A" /> : null}
      </Svg>
      <LaptopFront x={L.x} y={L.y} w={L.w} open={lid} />
    </div>
  );
};

// Стеклянные стены кабинета (перед интерьером): фронтальная со
// сдвижной дверью (door 0…1 — открыта) и табличкой «Директор»,
// боковая — к открытому пространству. Блики, тонировка, профили.
export const GlassFront: React.FC<{ readonly door?: number; readonly evening?: number }> = ({ door = 0, evening = 0 }) => {
  const e = clamp(evening);
  const sF = ROOM.sFront;
  const sB = ROOM.sBack;
  const top = (X: number, s: number) => ({ x: o31X(X, s), y: ceilY(s) });
  const bot = (X: number, s: number) => o31Pt(X, s);
  const prof = mix("#7D8B9C", "#8A7B6E", 0.3 * e);
  const pw = lw(sF);
  // дверь: створка уезжает вправо за неподвижное стекло
  const dOpen = easeInOut(clamp(door)) * (DOOR.x1 - DOOR.x0 - 10);
  const dx0 = DOOR.x0 + dOpen;
  const dx1 = DOOR.x1 + dOpen;
  const doorTop = o31Y(sF) - DOOR.h * sF;
  const glass = (a: Pt, b: Pt, c: Pt, d: Pt, k: string) => <path key={k} d={pts([a, b, c, d])} fill={P.glassTint} />;
  const streak = (X0: number, w: number, k: string) => (
    <path key={k} d={pts([{ x: o31X(X0, sF), y: o31Y(sF) - 40 * sF }, { x: o31X(X0 + w, sF), y: o31Y(sF) - 40 * sF }, { x: o31X(X0 + w + 260, sF), y: ceilY(sF) + 60 * sF }, { x: o31X(X0 + 260, sF), y: ceilY(sF) + 60 * sF }])} fill="#FFFFFF" opacity={0.16} />
  );
  const sign = { x: o31X((DOOR.x0 + DOOR.x1) / 2, sF), y: doorTop - 66 };
  return (
    <div style={box({ left: 0, top: 0 })}>
      <Svg>
        {/* боковая стеклянная стена */}
        {glass(top(ROOM.x0, sB), top(ROOM.x0, sF), bot(ROOM.x0, sF), bot(ROOM.x0, sB), "side")}
        <path d={pts([top(ROOM.x0, sB), top(ROOM.x0, sF), bot(ROOM.x0, sF), bot(ROOM.x0, sB)])} fill="#FFFFFF" opacity={0.08} />
        {/* фронтальная стена: неподвижные стёкла */}
        {glass(top(ROOM.x0, sF), top(DOOR.x0, sF), bot(DOOR.x0, sF), bot(ROOM.x0, sF), "f0")}
        {glass(top(DOOR.x1, sF), top(ROOM.x1, sF), bot(ROOM.x1, sF), bot(DOOR.x1, sF), "f1")}
        {glass(top(DOOR.x0, sF), top(DOOR.x1, sF), { x: o31X(DOOR.x1, sF), y: doorTop }, { x: o31X(DOOR.x0, sF), y: doorTop }, "f2")}
        {streak(1250, 70, "s1")}
        {streak(1360, 26, "s2")}
        {streak(1720, 90, "s3")}
        {/* створка двери */}
        <path d={pts([{ x: o31X(dx0, sF), y: doorTop }, { x: o31X(dx1, sF), y: doorTop }, bot(dx1, sF), bot(dx0, sF)])} fill="rgba(205,224,240,0.32)" stroke={prof} strokeWidth={pw} />
        <rect x={o31X(dx0 + 22, sF)} y={o31Y(sF) - 560 * sF} width={9 * sF} height={300 * sF} rx={4 * sF} fill="#B9C2CD" stroke={ink("#B9C2CD", 0.7)} strokeWidth={pw * 0.6} />
        {/* профили: потолочный, напольный, стойки */}
        <path d={`M ${top(ROOM.x0, sB).x} ${top(ROOM.x0, sB).y} L ${top(ROOM.x0, sF).x} ${top(ROOM.x0, sF).y} L ${top(ROOM.x1, sF).x} ${top(ROOM.x1, sF).y}`} stroke={prof} strokeWidth={pw * 2.2} fill="none" />
        <path d={`M ${bot(ROOM.x0, sB).x} ${bot(ROOM.x0, sB).y} L ${bot(ROOM.x0, sF).x} ${bot(ROOM.x0, sF).y} L ${bot(ROOM.x1, sF).x} ${bot(ROOM.x1, sF).y}`} stroke={prof} strokeWidth={pw * 2.6} fill="none" />
        {[ROOM.x0, DOOR.x0, DOOR.x1, 1600].map((X) => (
          <line key={X} x1={o31X(X, sF)} y1={ceilY(sF)} x2={o31X(X, sF)} y2={o31Y(sF)} stroke={prof} strokeWidth={pw * (X === ROOM.x0 ? 2.4 : 1.6)} />
        ))}
        <line x1={o31X(DOOR.x0, sF)} y1={doorTop} x2={o31X(DOOR.x1, sF)} y2={doorTop} stroke={prof} strokeWidth={pw * 1.6} />
        <line x1={top(ROOM.x0, sB).x} y1={top(ROOM.x0, sB).y} x2={bot(ROOM.x0, sB).x} y2={bot(ROOM.x0, sB).y} stroke={prof} strokeWidth={pw * 1.2} />
        {/* матовая полоса-маркировка на стекле (ниже глаз сидящего) */}
        <path d={pts([{ x: o31X(DOOR.x1, sF), y: o31Y(sF) - 470 * sF }, { x: o31X(ROOM.x1, sF), y: o31Y(sF) - 470 * sF }, { x: o31X(ROOM.x1, sF), y: o31Y(sF) - 448 * sF }, { x: o31X(DOOR.x1, sF), y: o31Y(sF) - 448 * sF }])} fill="#FFFFFF" opacity={0.35} />
      </Svg>
      {/* табличка «Директор» над дверью */}
      <div style={box({ left: sign.x - 140, top: sign.y - 36, width: 280, height: 74, borderRadius: 14, backgroundColor: "#FFFFFF", border: `3px solid ${ink("#FFFFFF", 0.72)}`, boxSizing: "border-box", boxShadow: "0 6px 12px rgba(23,42,70,0.14)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 })}>
        <div style={{ width: 10, height: 40, borderRadius: 5, backgroundColor: C.yellow }} />
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 46, color: C.navy, lineHeight: 1 }}>{M13_TEXT.office.door}</div>
      </div>
    </div>
  );
};

// Середина: группа столов слева (пустые кресла — обед), растение.
export const MidPlane: React.FC<{ readonly evening?: number }> = ({ evening = 0 }) => {
  const e = clamp(evening);
  const s = 0.74;
  const H = O31.deskH;
  const desks = [
    { x0: -1450, x1: -760 },
    { x0: -740, x1: -50 },
  ];
  const plant = o31Pt(-1700, 0.62);
  const ps = 0.62;
  return (
    <Svg>
      {/* перегородка за мониторами */}
      <path d={pts([o31Pt(-1450, 0.71, H), o31Pt(-50, 0.71, H), o31Pt(-50, 0.71, 560), o31Pt(-1450, 0.71, 560)])} fill={mix(P.sage, "#C7B79A", 0.3 * e)} stroke={ink(P.sage, 0.72)} strokeWidth={lw(0.71)} />
      {desks.map((d, i) => {
        const fl = o31Pt(d.x0, s, H);
        const fr = o31Pt(d.x1, s, H);
        const bl = o31Pt(d.x0, 0.7, H);
        const br = o31Pt(d.x1, 0.7, H);
        const m = o31Pt((d.x0 + d.x1) / 2, 0.715, H);
        const ch = o31Pt((d.x0 + d.x1) / 2, 0.68);
        return (
          <g key={i}>
            {/* кресло (спинка видна над столом) */}
            <rect x={ch.x - 120 * s} y={ch.y - 560 * 0.68} width={240 * s} height={250 * s} rx={50 * s} fill={P.chair} stroke={ink(P.chair, 0.72)} strokeWidth={lw(s)} />
            {/* монитор (экран к камере) */}
            <rect x={m.x - 130 * s} y={m.y - 210 * s} width={260 * s} height={150 * s} rx={8 * s} fill="#2B3039" stroke={ink("#2B3039", 0.6)} strokeWidth={lw(s)} />
            <rect x={m.x - 120 * s} y={m.y - 200 * s} width={240 * s} height={130 * s} rx={4 * s} fill={mix("#DCE6F2", "#F3DCC2", 0.4 * e)} />
            <rect x={m.x - 110 * s} y={m.y - 188 * s} width={90 * s} height={14 * s} rx={7 * s} fill={C.blueSoft} />
            <rect x={m.x - 8 * s} y={m.y - 60 * s} width={16 * s} height={60 * s} fill="#8C95A2" />
            {/* столешница и панель */}
            <path d={pts([bl, br, fr, fl])} fill={P.deskTop} stroke={ink(P.deskTop, 0.72)} strokeWidth={lw(s)} />
            <path d={pts([fl, fr, { x: fr.x, y: o31Y(s) - 16 * s }, { x: fl.x, y: o31Y(s) - 16 * s }])} fill={mix(P.deskTop, "#C3CCD7", 0.45)} stroke={ink(P.deskTop, 0.72)} strokeWidth={lw(s)} />
            <ellipse cx={(fl.x + fr.x) / 2} cy={o31Y(s) - 6} rx={(fr.x - fl.x) * 0.5} ry={10 * s} fill="rgba(30,40,60,0.14)" />
          </g>
        );
      })}
      {/* высокое растение у стены */}
      <ellipse cx={plant.x} cy={plant.y - 4} rx={70 * ps} ry={12 * ps} fill="rgba(30,40,60,0.16)" />
      {[-34, -18, -4, 10, 24, 38].map((a, i) => (
        <ellipse key={a} cx={plant.x} cy={plant.y - 380 * ps} rx={34 * ps} ry={220 * ps} fill={i % 2 ? P.plant : P.plantDeep} stroke={ink(P.plantDeep, 0.7)} strokeWidth={lw(ps) * 0.6} transform={`rotate(${a} ${plant.x} ${plant.y - 170 * ps})`} />
      ))}
      <path d={`M ${plant.x - 60 * ps} ${plant.y - 190 * ps} L ${plant.x + 60 * ps} ${plant.y - 190 * ps} L ${plant.x + 48 * ps} ${plant.y} L ${plant.x - 48 * ps} ${plant.y} Z`} fill={P.pot} stroke={ink(P.pot, 0.7)} strokeWidth={lw(ps)} />
    </Svg>
  );
};

// ---------- Стол помощницы (вид сбоку) ----------
// Кресло (за ней): спинка слева, сиденье, газлифт, крестовина.
export const AsstChair: React.FC = () => {
  const p = O31_POS.assistant;
  const s = 1;
  const seat = 0.27 * 765;
  const col = P.chair;
  return (
    <Svg>
      <ellipse cx={p.x + 10} cy={p.y - 4} rx={150} ry={16} fill="rgba(30,40,60,0.2)" />
      {/* крестовина и колёсики */}
      <path d={`M ${p.x - 130} ${p.y - 30} L ${p.x + 140} ${p.y - 30}`} stroke="#3B4351" strokeWidth={16} strokeLinecap="round" />
      {[-130, 0, 140].map((dx) => (
        <circle key={dx} cx={p.x + dx} cy={p.y - 14} r={14} fill="#2A303B" />
      ))}
      <rect x={p.x - 9} y={p.y - seat + 30} width={18} height={seat - 60} fill="#6E7886" stroke={ink("#6E7886", 0.7)} strokeWidth={lw(s)} />
      {/* спинка (сзади, слева) */}
      <path d={`M ${p.x - 120} ${p.y - seat - 6} L ${p.x - 150} ${p.y - seat - 330} Q ${p.x - 152} ${p.y - seat - 380} ${p.x - 110} ${p.y - seat - 384} L ${p.x - 90} ${p.y - seat - 380} Q ${p.x - 60} ${p.y - seat - 372} ${p.x - 66} ${p.y - seat - 330} L ${p.x - 74} ${p.y - seat - 6} Z`} fill={col} stroke={ink(col, 0.7)} strokeWidth={lw(s)} />
      <path d={`M ${p.x - 120} ${p.y - seat - 10} Q ${p.x - 60} ${p.y - seat - 40} ${p.x - 40} ${p.y - seat - 14}`} stroke={ink(col, 0.7)} strokeWidth={10} fill="none" />
      {/* сиденье */}
      <rect x={p.x - 130} y={p.y - seat - 6} width={250} height={40} rx={18} fill={col} stroke={ink(col, 0.7)} strokeWidth={lw(s)} />
    </Svg>
  );
};

// Монитор помощницы в три четверти: экран повернут к ней (влево) и
// немного к камере; на экране — та же неделя (мелко, без текста).
const AsstMonitor: React.FC<{ readonly evening?: number; readonly hi?: number }> = ({ evening = 0, hi = 0 }) => {
  const s = MON.s;
  const base = o31Pt(MON.X, s, O31.deskH);
  const c = O31_POS.monitor;
  const w = MON.w * s * 0.42; // видимая ширина (поворот ≈ 65°)
  const h = MON.h * s;
  const skew = 22 * s; // правый край ближе — чуть выше и ниже
  const L = { x: c.x - w / 2, y0: c.y - h / 2 + skew * 0.4, y1: c.y + h / 2 - skew * 0.4 };
  const R = { x: c.x + w / 2, y0: c.y - h / 2 - skew * 0.4, y1: c.y + h / 2 + skew * 0.4 };
  const map = (u: number, v: number): Pt => ({ x: lerp(L.x, R.x, u), y: lerp(lerp(L.y0, R.y0, u), lerp(L.y1, R.y1, u), v) });
  const quad = (u0: number, v0: number, u1: number, v1: number) => pts([map(u0, v0), map(u1, v0), map(u1, v1), map(u0, v1)]);
  const bez = 0.06;
  const scr = mix("#EEF2F7", "#F6E5CF", 0.4 * clamp(evening));
  const kinds = ["#3F6FD8", "#2E9C8C", "#E0775C", "#7B63CC", "#3F6FD8"];
  return (
    <Svg>
      {/* ножка и подставка */}
      <path d={pts([{ x: base.x - 40 * s, y: base.y - 4 }, { x: base.x + 50 * s, y: base.y - 4 }, { x: base.x + 40 * s, y: base.y + 8 * s }, { x: base.x - 46 * s, y: base.y + 8 * s }])} fill="#8D96A3" stroke={ink("#8D96A3", 0.7)} strokeWidth={lw(s)} />
      <rect x={base.x + 4 * s} y={c.y} width={14 * s} height={base.y - c.y} fill="#7F8896" stroke={ink("#7F8896", 0.7)} strokeWidth={lw(s) * 0.8} />
      {/* задняя грань корпуса (толщина справа) */}
      <path d={pts([{ x: R.x, y: R.y0 }, { x: R.x + 16 * s, y: R.y0 + 6 * s }, { x: R.x + 16 * s, y: R.y1 - 6 * s }, { x: R.x, y: R.y1 }])} fill="#1E222A" />
      {/* рамка и экран */}
      <path d={quad(0, 0, 1, 1)} fill="#262A33" stroke={ink("#262A33", 0.6)} strokeWidth={lw(s)} strokeLinejoin="round" />
      <path d={quad(bez, bez * 1.6, 1 - bez, 1 - bez * 1.6)} fill={scr} />
      {/* неделя: колонки, жёлтая строка 13:20 */}
      {kinds.map((k, i) => {
        const u0 = 0.12 + i * 0.165;
        return (
          <g key={i}>
            <path d={quad(u0, 0.2, u0 + 0.13, 0.32)} fill={k} opacity={0.55} />
            <path d={quad(u0, 0.36 + (i % 2) * 0.06, u0 + 0.13, 0.46 + (i % 2) * 0.06)} fill={kinds[(i + 2) % 5]} opacity={0.45} />
            <path d={quad(u0, 0.56, u0 + 0.13, 0.68)} fill={C.yellow} opacity={0.95} />
            <path d={quad(u0, 0.76, u0 + 0.13, 0.86)} fill={kinds[(i + 1) % 5]} opacity={0.4} />
          </g>
        );
      })}
      {hi > 0 ? <path d={quad(0.1, 0.54, 0.92, 0.7)} fill="none" stroke={C.yellowDeep} strokeWidth={3 * s} opacity={hi} /> : null}
      <path d={quad(bez, bez * 1.6, 1 - bez, 0.16)} fill="#FFFFFF" opacity={0.5} />
      {/* блик */}
      <path d={pts([map(0.55, bez * 2), map(0.75, bez * 2), map(0.4, 0.94), map(0.2, 0.94)])} fill="#FFFFFF" opacity={0.12} />
    </Svg>
  );
};

// Стол помощницы: дальние ножки, тумба, столешница, монитор, клавиатура,
// кружка, блокнот, растение. Рисуется ПОСЛЕ тела помощницы (layer
// "body") и ДО её рук (layer "arms"). hi 0…1 — подсветка строки 13:20 на
// мониторе.
export const AsstDesk: React.FC<{ readonly evening?: number; readonly hi?: number }> = ({ evening = 0, hi = 0 }) => {
  const d = ADESK;
  const H = O31.deskH;
  const nl = o31Pt(d.x0, d.sN, H);
  const nr = o31Pt(d.x1, d.sN, H);
  const fl = o31Pt(d.x0, d.sF, H);
  const fr = o31Pt(d.x1, d.sF, H);
  const s = 1;
  const th = 26; // толщина столешницы
  const top = mix("#F4F5F7", "#F5E7D6", 0.4 * clamp(evening));
  const leg = (X: number, sv: number, k: string) => {
    const a = o31Pt(X, sv, H);
    const b = o31Pt(X, sv);
    return <rect key={k} x={a.x - 9 * sv} y={a.y} width={18 * sv} height={b.y - a.y} fill={P.leg} stroke={ink(P.leg, 0.7)} strokeWidth={lw(sv) * 0.8} />;
  };
  // тумба под правой частью
  const tb = { x0: 600, x1: d.x1 - 10, s0: 1.04, s1: 0.9 };
  const t0 = o31Pt(tb.x0, tb.s0, H - th);
  const t1 = o31Pt(tb.x1, tb.s0, H - th);
  const tf = o31Pt(tb.x1, tb.s0);
  const t0f = o31Pt(tb.x0, tb.s0);
  const ts = o31Pt(tb.x1, tb.s1, H - th);
  const tsf = o31Pt(tb.x1, tb.s1);
  const kb = [o31Pt(445, 1.035, H), o31Pt(545, 1.035, H), o31Pt(545, 0.955, H), o31Pt(445, 0.955, H)];
  const mug = o31Pt(480, 0.9, H);
  const pl = o31Pt(700, 0.88, H);
  return (
    <div style={box({ left: 0, top: 0 })}>
      <Svg>
        <ellipse cx={(nl.x + nr.x) / 2 + 20} cy={o31Y(1.0)} rx={260} ry={22} fill="rgba(30,40,60,0.16)" />
        {leg(d.x0 + 15, d.sF + 0.02, "lf")}
        {leg(d.x1 - 15, d.sF + 0.02, "rf")}
        {/* тумба с ящиками */}
        <path d={pts([t1, ts, tsf, tf])} fill={mix(P.deskTop, "#AEB8C5", 0.45)} stroke={ink(P.deskTop, 0.7)} strokeWidth={lw(s)} />
        <path d={pts([t0, t1, tf, t0f])} fill={mix(P.deskTop, "#C9D1DB", 0.3)} stroke={ink(P.deskTop, 0.7)} strokeWidth={lw(s)} />
        {[0.28, 0.6].map((v) => (
          <g key={v}>
            <line x1={t0.x + 8} y1={lerp(t0.y, t0f.y, v)} x2={t1.x - 8} y2={lerp(t1.y, tf.y, v)} stroke={ink(P.deskTop, 0.75)} strokeWidth={lw(s) * 0.8} />
            <rect x={(t0.x + t1.x) / 2 - 22} y={lerp(t0.y, t0f.y, v - 0.14)} width={44} height={8} rx={4} fill="#9AA4B1" />
          </g>
        ))}
        {/* столешница: верх и торцы */}
        <path d={pts([fl, fr, nr, nl])} fill={top} stroke={ink(top, 0.7)} strokeWidth={lw(s)} />
        <path d={pts([nl, nr, { x: nr.x, y: nr.y + th }, { x: nl.x, y: nl.y + th }])} fill={mix(top, "#B9C3CF", 0.5)} stroke={ink(top, 0.7)} strokeWidth={lw(s)} />
        <path d={pts([nr, fr, { x: fr.x, y: fr.y + th * 0.86 }, { x: nr.x, y: nr.y + th }])} fill={mix(top, "#A9B4C2", 0.55)} stroke={ink(top, 0.7)} strokeWidth={lw(s)} />
        {/* клавиатура и мышь */}
        <path d={pts(kb)} fill="#C9CFD7" stroke={ink("#C9CFD7", 0.7)} strokeWidth={lw(s) * 0.8} />
        {[0.2, 0.4, 0.6, 0.8].map((v) => (
          <line key={v} x1={lerp(kb[0].x, kb[3].x, v) + 6} y1={lerp(kb[0].y, kb[3].y, v)} x2={lerp(kb[1].x, kb[2].x, v) - 6} y2={lerp(kb[1].y, kb[2].y, v)} stroke="#6F7885" strokeWidth={4} strokeDasharray="7 4" />
        ))}
        <ellipse cx={o31X(575, 1.0)} cy={o31Y(1.0) - H - 2} rx={13} ry={8} fill="#E7EAEE" stroke={ink("#E7EAEE", 0.7)} strokeWidth={2} />
        {/* блокнот */}
        <path d={pts([o31Pt(605, 1.07, H), o31Pt(700, 1.07, H), o31Pt(700, 1.0, H), o31Pt(605, 1.0, H)])} fill={C.navySoft} stroke={ink(C.navySoft, 0.7)} strokeWidth={2} />
        {/* кружка */}
        <ellipse cx={mug.x} cy={mug.y} rx={20} ry={7} fill="rgba(30,40,60,0.18)" />
        <rect x={mug.x - 17} y={mug.y - 44} width={34} height={44} rx={6} fill={C.orange} stroke={ink(C.orange, 0.7)} strokeWidth={2.4} />
        <ellipse cx={mug.x} cy={mug.y - 44} rx={17} ry={6} fill={ink(C.orange, 0.8)} />
        <path d={`M ${mug.x + 16} ${mug.y - 34} q 16 4 0 22`} stroke={ink(C.orange, 0.7)} strokeWidth={5} fill="none" />
        {/* маленькое растение */}
        <rect x={pl.x - 18} y={pl.y - 40} width={36} height={40} rx={6} fill={P.pot} stroke={ink(P.pot, 0.7)} strokeWidth={2.4} />
        {[-30, 0, 30].map((a) => (
          <ellipse key={a} cx={pl.x} cy={pl.y - 70} rx={11} ry={34} fill={P.plant} stroke={ink(P.plant, 0.7)} strokeWidth={2} transform={`rotate(${a} ${pl.x} ${pl.y - 40})`} />
        ))}
      </Svg>
      <AsstMonitor evening={evening} hi={hi} />
    </div>
  );
};

// Ближняя ножка стола (перед коленями помощницы) — после её тела.
export const AsstDeskNearLeg: React.FC = () => {
  const a = o31Pt(ADESK.x0 + 15, ADESK.sN - 0.02, O31.deskH - 26);
  const b = o31Pt(ADESK.x0 + 15, ADESK.sN - 0.02);
  const s = ADESK.sN;
  return (
    <Svg>
      <rect x={a.x - 9 * s} y={a.y} width={18 * s} height={b.y - a.y} fill={P.leg} stroke={ink(P.leg, 0.7)} strokeWidth={lw(s) * 0.8} />
    </Svg>
  );
};

// ---------- Передний план (размыт) ----------
export const OfficeForeground: React.FC<{ readonly blur?: number }> = ({ blur = 3 }) => {
  const s = 1.5;
  const p = o31Pt(1080, s);
  const d = { x0: -900, x1: 180 };
  const top = o31Pt(d.x1, 1.42, O31.deskH);
  return (
    <Svg style={{ filter: `blur(${blur}px)` }}>
      {/* угол соседнего стола слева внизу */}
      <path d={pts([o31Pt(d.x0, 1.42, O31.deskH), top, o31Pt(d.x1, 1.62, O31.deskH), o31Pt(d.x0, 1.62, O31.deskH)])} fill={P.deskTop} stroke={ink(P.deskTop, 0.7)} strokeWidth={lw(s)} />
      <path d={pts([o31Pt(d.x1, 1.42, O31.deskH), o31Pt(d.x1, 1.62, O31.deskH), o31Pt(d.x1, 1.62, O31.deskH - 40), o31Pt(d.x1, 1.42, O31.deskH - 40)])} fill={mix(P.deskTop, "#AEB8C5", 0.5)} />
      {/* большое растение справа внизу */}
      {[-58, -36, -16, 6, 30].map((a, i) => (
        <ellipse key={a} cx={p.x} cy={p.y - 620} rx={52} ry={260} fill={i % 2 ? P.plant : P.plantDeep} stroke={ink(P.plantDeep, 0.7)} strokeWidth={lw(s)} transform={`rotate(${a} ${p.x} ${p.y - 380})`} />
      ))}
      <path d={`M ${p.x - 130} ${p.y - 400} L ${p.x + 130} ${p.y - 400} L ${p.x + 105} ${p.y} L ${p.x - 105} ${p.y} Z`} fill={P.pot} stroke={ink(P.pot, 0.7)} strokeWidth={lw(s)} />
    </Svg>
  );
};

// ---------- Свет ----------
// Вечер: тёплый тон и полосы низкого солнца сквозь жалюзи на полу и
// стене (поверх всего, включая героев). day — лёгкий прохладный тон.
export const OfficeLight: React.FC<{ readonly evening?: number }> = ({ evening = 0 }) => {
  const e = clamp(evening);
  const wins = backWins();
  const s = O31.backS;
  return (
    <div style={box({ left: 0, top: 0 })}>
      {e > 0 ? (
        <Svg style={{ mixBlendMode: "soft-light" }}>
          {wins.map((w, i) =>
            [0, 1, 2, 3, 4].map((j) => {
              // полоса света: от низа окна к камере, со сдвигом вправо (солнце слева)
              const X0 = O31.vpx + (w.x0 + 30 - O31.vpx) / s;
              const X1 = O31.vpx + (w.x1 - 30 - O31.vpx) / s;
              const sv0 = 0.52 + j * 0.06;
              const sv1 = sv0 + 0.035;
              const sh = (sv: number) => (sv - 0.5) * 2600;
              return <path key={`${i}-${j}`} d={pts([o31Pt(X0 + sh(sv0), sv0), o31Pt(X1 + sh(sv0), sv0), o31Pt(X1 + sh(sv1), sv1), o31Pt(X0 + sh(sv1), sv1)])} fill="#FFB867" opacity={0.75 * e} />;
            }),
          )}
        </Svg>
      ) : null}
      <div style={box({ left: -3000, top: -3000, width: 9000, height: 9000, backgroundColor: e > 0 ? `rgba(255,176,96,${0.16 * e})` : "rgba(150,175,215,0.05)" })} />
    </div>
  );
};

// ---------- Общий план офиса целиком ----------
// Слоты для героев (в порядке глубины):
//   director / directorArms — директор за столом (тело до столешницы,
//     руки после), за стеклом кабинета;
//   inRoom — кто-то внутри кабинета (за стеклом), напр. директор идёт к двери;
//   mid — проход между кабинетом и столом помощницы (директор к выходу,
//     помощница идёт к двери): перед стеклом, за помощницей;
//   assistant / assistantArms — помощница (тело до стола, руки после).
export type OfficeSlots = {
  readonly director?: React.ReactNode;
  readonly directorArms?: React.ReactNode;
  readonly inRoom?: React.ReactNode;
  readonly mid?: React.ReactNode;
  readonly assistant?: React.ReactNode;
  readonly assistantArms?: React.ReactNode;
};
export const OfficeWide: React.FC<OfficeSlots & { readonly evening?: number; readonly door?: number; readonly lid?: number; readonly keys?: boolean; readonly monitorHi?: number; readonly foreground?: boolean }> = ({
  evening = 0,
  door = 0,
  lid = 1,
  keys = true,
  monitorHi = 0,
  foreground = true,
  director,
  directorArms,
  inRoom,
  mid,
  assistant,
  assistantArms,
}) => (
  <>
    <OfficeShell evening={evening} />
    <DirRoomBack evening={evening} />
    {director}
    <DirDeskWide lid={lid} keys={keys} />
    {directorArms}
    {inRoom}
    <GlassFront door={door} evening={evening} />
    <MidPlane evening={evening} />
    {mid}
    <AsstChair />
    {assistant}
    <AsstDesk evening={evening} hi={monitorHi} />
    <AsstDeskNearLeg />
    {assistantArms}
    {foreground ? <OfficeForeground /> : null}
    <OfficeLight evening={evening} />
  </>
);

// =====================================================================
// Кабинет директора — СРЕДНИЙ ПЛАН СПЕРЕДИ (сцены 3c, 4a, 8c)
// Камера у двери (точка помощницы): директор за столом лицом к нам,
// за ним окна (Бишкек, Ала-Тоо), слева — стеклянная стена в открытое
// пространство (размыто). Ноутбук — наружной крышкой к нам. Масштаб 1:
// рост директора H.dad.
// =====================================================================
export const DIRF = {
  horizon: 1040, // глаза стоящей у двери помощницы
  floor: 1720, // ступни директора (сидит), s = 1
  vpx: 540,
  seat: { x: 520, y: 1720 }, // место директора: place = { x, y, h: H.dad }
  backS: 0.78, // задняя стена (окна)
  deskS: { back: 1.05, front: 1.35 }, // глубина краёв столешницы
  deskBack: 1400, // y дальнего края столешницы (у директора)
  deskFront: 1503, // y ближнего края
  deskFloor: 1958, // низ передней панели (пол у стола)
  laptop: { x: 728, y: 1435, w: 172 }, // шарнир ноутбука (LaptopFront)
  clock: { x: 200, y: 1340, scale: 0.28 }, // DigitalClock (левый верх, масштаб)
  keys: { x: 440, y: 1470 }, // ключи на столе (мелко)
  cup: { x: 930, y: 1452 },
} as const;
// Камеры: medium — по пояс (диалог), close — лицо, clock — настольные часы
// 13:19 → 13:20 во весь кадр (тот же DigitalClock).
export const DIRF_CAM = {
  medium: { x: 560, y: 1260, zoom: 1.45 },
  close: { x: 540, y: 1200, zoom: 2.2 },
  wide: { x: 560, y: 1200, zoom: 1 },
  clock: { x: DIRF.clock.x + 90, y: DIRF.clock.y + 52, zoom: 4.9 },
} as const;
const dfY = (s: number) => DIRF.horizon + (DIRF.floor - DIRF.horizon) * s;
const dfPt = (X: number, s: number, up = 0): Pt => ({ x: DIRF.vpx + (X - DIRF.vpx) * s, y: dfY(s) - up * s });

// Размытое открытое пространство за стеклом (общая заставка для обоих
// планов кабинета). x0…x1 — полоса, floorY — линия пола, k — масштаб.
const OpenSpaceBlur: React.FC<{ readonly x0: number; readonly x1: number; readonly top: number; readonly floorY: number; readonly k: number; readonly evening?: number; readonly blur?: number; readonly asstDesk?: number }> = ({ x0, x1, top, floorY, k, evening = 0, blur = 3, asstDesk = -1 }) => {
  const e = clamp(evening);
  const wall = mix("#E1E7EE", "#EAD6C2", 0.5 * e);
  const n = Math.ceil((x1 - x0) / (300 * k)) + 1;
  return (
    <Svg style={{ filter: `blur(${blur}px)` }}>
      <rect x={x0} y={top} width={x1 - x0} height={floorY - top} fill={wall} />
      {/* дальние окна */}
      {Array.from({ length: n }).map((_, i) => (
        <rect key={`w${i}`} x={x0 + 40 * k + i * 300 * k} y={top + 60 * k} width={230 * k} height={(floorY - top) * 0.62} fill={mix("#CFE3F2", "#F6D2A6", e)} stroke="#F4F6F8" strokeWidth={10 * k} />
      ))}
      <rect x={x0} y={floorY} width={x1 - x0} height={260 * k} fill={mix("#C9D1DB", "#CDBCA8", 0.5 * e)} />
      {/* столы с мониторами и креслами */}
      {Array.from({ length: n }).map((_, i) => {
        const cx = x0 + 150 * k + i * 300 * k;
        if (i === asstDesk) return null;
        return (
          <g key={`d${i}`}>
            <rect x={cx - 26 * k} y={floorY - 300 * k} width={110 * k} height={200 * k} rx={30 * k} fill={P.chair} />
            <rect x={cx - 120 * k} y={floorY - 160 * k} width={240 * k} height={16 * k} fill={P.deskTop} />
            <rect x={cx - 110 * k} y={floorY - 144 * k} width={220 * k} height={144 * k} fill={mix(P.deskTop, "#C3CCD7", 0.4)} />
            <rect x={cx - 60 * k} y={floorY - 250 * k} width={120 * k} height={80 * k} rx={6 * k} fill="#2B3039" />
          </g>
        );
      })}
      {/* растения */}
      {[0.15, 0.7].map((u) => {
        const cx = lerp(x0, x1, u);
        return (
          <g key={u}>
            {[-30, -10, 10, 30].map((a, i) => (
              <ellipse key={a} cx={cx} cy={floorY - 230 * k} rx={22 * k} ry={130 * k} fill={i % 2 ? P.plant : P.plantDeep} transform={`rotate(${a} ${cx} ${floorY - 100 * k})`} />
            ))}
            <rect x={cx - 40 * k} y={floorY - 110 * k} width={80 * k} height={110 * k} rx={10 * k} fill={P.pot} />
          </g>
        );
      })}
    </Svg>
  );
};

export const DirFrontBack: React.FC<{ readonly evening?: number; readonly blinds?: number }> = ({ evening = 0, blinds }) => {
  const e = clamp(evening);
  const s = DIRF.backS;
  const fy = dfY(s);
  const top = fy - O31.ceilH * s;
  const corner = 140; // угол: стеклянная стена слева
  const wins: Win[] = [
    { x0: 180, x1: 470, y0: top + 52, y1: fy - 70 },
    { x0: 510, x1: 890, y0: top + 52, y1: fy - 70 },
    { x0: 930, x1: 1220, y0: top + 52, y1: fy - 70 },
  ];
  const wall = mix(P.wall, "#EBDCCB", 0.55 * e);
  const wallPath = `M ${corner} ${top} L 1400 ${top} L 1400 ${fy} L ${corner} ${fy} Z ` + wins.map((w) => `M ${w.x0} ${w.y0} L ${w.x1} ${w.y0} L ${w.x1} ${w.y1} L ${w.x0} ${w.y1} Z`).join(" ");
  const plant = { x: 1020, y: fy };
  return (
    <div style={box({ left: 0, top: 0 })}>
      <CityView id="dfcity" x0={corner} x1={1400} y0={top} y1={fy} base={top + 470} k={1.25} evening={e} />
      <Svg>
        <rect x={-600} y={-800} width={2400} height={top + 800} fill={mix(P.ceil, "#EFE3D6", 0.5 * e)} />
        <path d={wallPath} fill={wall} fillRule="evenodd" />
        <rect x={-600} y={fy} width={2400} height={900} fill={mix("#D4D2CE", "#D9C4AC", 0.5 * e)} />
        <rect x={corner} y={fy - 18} width={1400 - corner} height={18} fill={mix(P.wallLow, "#9AA6B6", 0.35)} />
      </Svg>
      <Windows wins={wins} s={1.2} blinds={blinds ?? lerp(0.14, 0.6, e)} evening={e} />
      {/* стеклянная стена слева: открытое пространство за ней */}
      <div style={box({ left: 0, top: 0, clipPath: `polygon(-600px -800px, ${corner}px ${top}px, ${corner}px ${fy}px, -600px 2600px)` })}>
        <OpenSpaceBlur x0={-700} x1={corner} top={top - 200} floorY={fy + 60} k={0.9} evening={e} />
      </div>
      <Svg>
        <path d={`M ${corner} ${top} L -600 -800 M ${corner} ${fy} L -600 2600`} stroke="#7D8B9C" strokeWidth={10} />
        <line x1={corner} y1={top} x2={corner} y2={fy} stroke="#7D8B9C" strokeWidth={8} />
        <path d={`M ${corner - 40} ${top - 30} L ${corner - 110} ${top - 90} L ${corner - 110} ${fy + 120} L ${corner - 40} ${fy + 50} Z`} fill="#FFFFFF" opacity={0.14} />
        {/* растение у окна справа */}
        {[-34, -16, 2, 20, 38].map((a, i) => (
          <ellipse key={a} cx={plant.x} cy={plant.y - 330} rx={30} ry={170} fill={i % 2 ? P.plant : P.plantDeep} stroke={ink(P.plantDeep, 0.7)} strokeWidth={2.4} transform={`rotate(${a} ${plant.x} ${plant.y - 150})`} />
        ))}
        <path d={`M ${plant.x - 60} ${plant.y - 160} L ${plant.x + 60} ${plant.y - 160} L ${plant.x + 48} ${plant.y} L ${plant.x - 48} ${plant.y} Z`} fill={P.pot} stroke={ink(P.pot, 0.7)} strokeWidth={2.4} />
      </Svg>
    </div>
  );
};

// Кресло директора (спинка за ним, выше плеч).
export const DirChairBack: React.FC<{ readonly x?: number }> = ({ x = DIRF.seat.x }) => (
  <Svg>
    <path d={`M ${x - 168} 1440 L ${x - 180} 1130 Q ${x - 178} 1050 ${x - 100} 1046 L ${x + 100} 1046 Q ${x + 178} 1050 ${x + 180} 1130 L ${x + 168} 1440 Z`} fill={P.chair} stroke={ink(P.chair, 0.7)} strokeWidth={LW} strokeLinejoin="round" />
    <path d={`M ${x - 130} 1080 Q ${x} 1064 ${x + 130} 1080`} stroke={mix(P.chair, "#FFFFFF", 0.2)} strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d={`M ${x - 148} 1300 L ${x - 154} 1140 M ${x + 148} 1300 L ${x + 154} 1140`} stroke={ink(P.chair, 0.82)} strokeWidth={4} />
  </Svg>
);

// Ключи на столе (мелко, вид спереди-сверху): кольцо и брелок без логотипа.
const KeysSmall: React.FC<{ readonly x: number; readonly y: number; readonly k?: number }> = ({ x, y, k = 1 }) => (
  <g>
    <ellipse cx={x + 6 * k} cy={y + 4 * k} rx={34 * k} ry={8 * k} fill="rgba(30,40,60,0.2)" />
    <ellipse cx={x - 14 * k} cy={y} rx={13 * k} ry={5 * k} fill="none" stroke="#AEB5BF" strokeWidth={3 * k} />
    <rect x={x - 4 * k} y={y - 7 * k} width={36 * k} height={13 * k} rx={6 * k} fill="#2E333B" stroke="#1C2026" strokeWidth={1.5 * k} />
    <rect x={x - 30 * k} y={y - 2 * k} width={18 * k} height={5 * k} rx={2 * k} fill="#C7CCD3" />
  </g>
);

// Стол директора спереди: столешница (дерево), передняя панель, ключи,
// бумаги, кружка; затем руки (arms — кисти на клавиатуре прячутся за
// крышкой, как и должно быть), настольные часы, ноутбук крышкой к
// зрителю и armsFront (рука перед крышкой — напр. закрывает ноутбук).
// Рисуется после тела директора.
export const DirFrontDesk: React.FC<{ readonly lid?: number; readonly keys?: boolean; readonly clock?: React.ReactNode; readonly evening?: number; readonly arms?: React.ReactNode; readonly armsFront?: React.ReactNode }> = ({ lid = 1, keys = true, clock, evening = 0, arms, armsFront }) => {
  const d = DIRF;
  const H = O31.deskH;
  const top = mix(P.wood, "#E3B98A", 0.3 * clamp(evening));
  const panel = mix("#EEF0F3", "#EADCCB", 0.4 * clamp(evening));
  const X0 = -40;
  const X1 = 1120;
  const sb = d.deskS.back;
  const sf = d.deskS.front;
  const bl = dfPt(X0, sb, H);
  const br = dfPt(X1, sb, H);
  const fl = dfPt(X0, sf, H);
  const fr = dfPt(X1, sf, H);
  const th = 24;
  const on = (X: number, sv: number) => dfPt(X, sv, H);
  return (
    <div style={box({ left: 0, top: 0 })}>
      <Svg>
        {/* передняя панель */}
        <path d={pts([{ x: fl.x, y: fl.y + th }, { x: fr.x, y: fr.y + th }, { x: fr.x, y: d.deskFloor }, { x: fl.x, y: d.deskFloor }])} fill={panel} stroke={ink(panel, 0.7)} strokeWidth={LW} strokeLinejoin="round" />
        <path d={pts([{ x: fl.x, y: fl.y + th }, { x: fr.x, y: fr.y + th }, { x: fr.x, y: fr.y + th + 50 }, { x: fl.x, y: fl.y + th + 50 }])} fill="rgba(30,40,60,0.1)" />
        <rect x={fl.x + 60} y={fl.y + th + 90} width={fr.x - fl.x - 120} height={12} rx={6} fill={top} opacity={0.9} />
        {[-0.5, 0.5].map((u) => (
          <rect key={u} x={540 + u * 560 - 230} y={fl.y + th + 140} width={460} height={d.deskFloor - fl.y - th - 190} rx={10} fill="none" stroke={ink(panel, 0.86)} strokeWidth={3} />
        ))}
        <rect x={fl.x} y={d.deskFloor - 60} width={fr.x - fl.x} height={60} fill="rgba(30,40,60,0.08)" />
        {/* столешница */}
        <path d={pts([bl, br, fr, fl])} fill={top} stroke={ink(top, 0.7)} strokeWidth={LW} strokeLinejoin="round" />
        <path d={pts([fl, fr, { x: fr.x, y: fr.y + th }, { x: fl.x, y: fl.y + th }])} fill={ink(top, 0.86)} stroke={ink(top, 0.7)} strokeWidth={LW} strokeLinejoin="round" />
        {[0.3, 0.62].map((v) => (
          <path key={v} d={`M ${lerp(bl.x, fl.x, v) + 40} ${lerp(bl.y, fl.y, v)} Q 540 ${lerp(bl.y, fl.y, v) + 4} ${lerp(br.x, fr.x, v) - 40} ${lerp(bl.y, fl.y, v) - 2}`} stroke={ink(top, 0.9)} strokeWidth={1.6} fill="none" opacity={0.5} />
        ))}
        {/* бумаги и ручка перед ним */}
        <path d={pts([on(430, 1.1), on(590, 1.1), on(600, 1.26), on(420, 1.26)])} fill="#FFFFFF" stroke="#CFC8BA" strokeWidth={2} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={pts([on(450, 1.13 + i * 0.035), on(450 + [110, 90, 60][i], 1.13 + i * 0.035), on(450 + [110, 90, 60][i], 1.142 + i * 0.035), on(450, 1.142 + i * 0.035)])} fill={C.navy} opacity={0.3} />
        ))}
        <path d={pts([on(612, 1.2), on(690, 1.16), on(692, 1.175), on(614, 1.215)])} fill={C.navy} />
        {/* подставка с ручками */}
        <rect x={on(60, 1.08).x - 22} y={on(60, 1.08).y - 50} width={44} height={52} rx={8} fill="#6F7B8C" stroke={ink("#6F7B8C", 0.7)} strokeWidth={2.4} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={on(60, 1.08).x - 12 + i * 12} y1={on(60, 1.08).y - 50} x2={on(60, 1.08).x - 16 + i * 14} y2={on(60, 1.08).y - 90 + i * 8} stroke={[C.navy, C.blue, C.orange][i]} strokeWidth={6} strokeLinecap="round" />
        ))}
        {keys ? <KeysSmall x={d.keys.x} y={d.keys.y} k={1.2} /> : null}
        {/* кружка */}
        <ellipse cx={d.cup.x} cy={d.cup.y + 2} rx={32} ry={9} fill="rgba(30,40,60,0.2)" />
        <rect x={d.cup.x - 26} y={d.cup.y - 62} width={52} height={64} rx={8} fill="#FFFFFF" stroke={ink("#FFFFFF", 0.7)} strokeWidth={2.6} />
        <path d={`M ${d.cup.x + 24} ${d.cup.y - 50} q 24 6 0 32`} stroke={ink("#FFFFFF", 0.7)} strokeWidth={6} fill="none" />
        <rect x={d.cup.x - 26} y={d.cup.y - 42} width={52} height={10} fill={C.navySoft} opacity={0.8} />
      </Svg>
      {arms}
      {clock}
      <LaptopFront x={d.laptop.x} y={d.laptop.y} w={d.laptop.w} open={lid} />
      {armsFront}
    </div>
  );
};

// Кабинет спереди целиком. Слоты: body (директор, layer "body"), arms
// (его руки, layer "arms": на столе или на клавиатуре — за крышкой),
// armsFront (рука перед крышкой ноутбука). clock — настольные часы
// (DigitalClock в DIRF.clock), напр. <DigitalClock x={DIRF.clock.x}
// y={DIRF.clock.y} scale={DIRF.clock.scale} flip={…} />.
export const DirectorFront: React.FC<{ readonly evening?: number; readonly lid?: number; readonly keys?: boolean; readonly clock?: React.ReactNode; readonly body?: React.ReactNode; readonly arms?: React.ReactNode; readonly armsFront?: React.ReactNode }> = ({ evening = 0, lid = 1, keys = true, clock, body, arms, armsFront }) => (
  <>
    <DirFrontBack evening={evening} />
    <DirChairBack />
    {body}
    <DirFrontDesk lid={lid} keys={keys} clock={clock} evening={evening} arms={arms} armsFront={armsFront} />
    <OfficeLight evening={evening} />
  </>
);

// =====================================================================
// Кабинет директора — ОБРАТНЫЙ ПЛАН (из-за плеча директора, сцены 3a, 8a)
// Передний план: затылок и плечи директора (силуэт, слегка размыт),
// ноутбук экраном к нам (виден экран — так и должно быть со стороны
// пользователя), край стола. Дальше: стеклянная стена со сдвижной дверью,
// в двери — гость (помощница), за стеклом — открытое пространство.
// =====================================================================
export const DIRR = {
  horizon: 1150,
  glassTop: 560,
  glassFloor: 1560, // линия пола у стеклянной стены
  door: { x0: 690, x1: 960 }, // проём двери
  visitor: { x: 830, y: 1585, s: 0.72 }, // гость в двери: place = { x, y, h: H × s }
  visitorOut: { x: 830, y: 1548, s: 0.66 }, // за дверью (снаружи)
  laptop: { x: 655, y: 1735, w: 430 }, // шарнир ноутбука (LaptopUser)
  head: { x: 215, y: 1350 }, // центр затылка директора
  deskEdge: 1612, // дальний край его стола
} as const;
export const DIRR_CAM = {
  main: { x: 540, y: 1240, zoom: 1 },
  visitor: { x: 760, y: 1230, zoom: 1.5 },
} as const;

// Затылок и плечи директора со спины (передний план). headUp 0…1 —
// поднимает голову от ноутбука; turn −1…1 — лёгкий поворот головы.
export const DirectorBack: React.FC<{ readonly x?: number; readonly y?: number; readonly headUp?: number; readonly turn?: number; readonly blur?: number; readonly evening?: number }> = ({ x = DIRR.head.x, y = DIRR.head.y, headUp = 0, turn = 0, blur = 2, evening = 0 }) => {
  const u = easeInOut(clamp(headUp));
  const hy = y - 26 * u;
  const hair = "#1F1A19";
  const skin = mix("#DCAA84", "#E7A779", 0.3 * clamp(evening));
  const jacket = "#2C3B5E";
  const shirt = "#BFD6EE";
  const tx = turn * 14;
  return (
    <Svg style={{ filter: `blur(${blur}px)` }}>
      {/* плечи и спина пиджака */}
      <path d={`M ${x - 262} 2100 L ${x - 252} ${y + 360} Q ${x - 246} ${y + 236} ${x - 130} ${y + 178} Q ${x} ${y + 150} ${x + 130} ${y + 178} Q ${x + 246} ${y + 236} ${x + 252} ${y + 360} L ${x + 262} 2100 Z`} fill={jacket} stroke={ink(jacket, 0.7)} strokeWidth={LW * 1.4} />
      <path d={`M ${x - 2} ${y + 210} L ${x + 4} 2100`} stroke={ink(jacket, 0.8)} strokeWidth={5} opacity={0.5} />
      <path d={`M ${x - 232} ${y + 330} Q ${x - 214} ${y + 236} ${x - 130} ${y + 196}`} stroke={mix(jacket, "#FFFFFF", 0.16)} strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d={`M ${x - 200} ${y + 420} Q ${x - 210} ${y + 600} ${x - 196} 2100 M ${x + 200} ${y + 420} Q ${x + 214} ${y + 600} ${x + 200} 2100`} stroke={ink(jacket, 0.82)} strokeWidth={4} fill="none" opacity={0.6} />
      {/* воротник рубашки и шея */}
      <path d={`M ${x - 92 + tx * 0.3} ${y + 150} Q ${x + tx * 0.3} ${y + 120} ${x + 92 + tx * 0.3} ${y + 150} L ${x + 80} ${y + 182} Q ${x} ${y + 160} ${x - 80} ${y + 182} Z`} fill={shirt} stroke={ink(shirt, 0.7)} strokeWidth={LW} />
      <rect x={x - 62 + tx * 0.5} y={hy + 60} width={124} height={100} rx={40} fill={skin} stroke={ink(skin, 0.7)} strokeWidth={LW} />
      {/* уши */}
      <ellipse cx={x - 98 + tx} cy={hy + 6} rx={20} ry={34} fill={skin} stroke={ink(skin, 0.7)} strokeWidth={LW} />
      <ellipse cx={x + 98 + tx} cy={hy + 6} rx={20} ry={34} fill={skin} stroke={ink(skin, 0.7)} strokeWidth={LW} />
      {/* затылок: короткая стрижка */}
      <ellipse cx={x + tx} cy={hy - 14} rx={100} ry={118} fill={hair} stroke={ink(hair, 0.8)} strokeWidth={LW} />
      <path d={`M ${x - 80 + tx} ${hy + 56} Q ${x + tx} ${hy + 86} ${x + 80 + tx} ${hy + 56}`} fill={hair} />
      <path d={`M ${x - 54 + tx} ${hy - 90} Q ${x - 10 + tx} ${hy - 118} ${x + 40 + tx} ${hy - 98}`} stroke={mix(hair, "#FFFFFF", 0.22)} strokeWidth={10} fill="none" strokeLinecap="round" />
    </Svg>
  );
};

export const DirReverseBack: React.FC<{ readonly door?: number; readonly evening?: number }> = ({ door = 0, evening = 0 }) => {
  const e = clamp(evening);
  const r = DIRR;
  const prof = mix("#7D8B9C", "#8A7B6E", 0.3 * e);
  const dOpen = easeInOut(clamp(door)) * (r.door.x1 - r.door.x0 - 12);
  const doorTop = r.glassFloor - DOOR.h * 0.72;
  return (
    <div style={box({ left: 0, top: 0 })}>
      {/* за стеклом: открытое пространство (стол помощницы — справа) */}
      <OpenSpaceBlur x0={-200} x1={1300} top={r.glassTop - 100} floorY={r.glassFloor - 60} k={0.8} evening={e} blur={2} />
      <Svg>
        {/* потолок кабинета и пол (ковролин) */}
        <path d={`M -400 -600 L 1500 -600 L 1500 ${r.glassTop} L -400 ${r.glassTop} Z`} fill={mix(P.ceil, "#EFE3D6", 0.5 * e)} />
        <rect x={-400} y={r.glassFloor} width={1900} height={700} fill={mix("#D4D2CE", "#D9C4AC", 0.5 * e)} />
        {/* стекло: тонировка и блики */}
        <rect x={-400} y={r.glassTop} width={1900} height={r.glassFloor - r.glassTop} fill={P.glassTint} />
        {[[-20, 90], [120, 30], [1000, 70]].map(([x0, w]) => (
          <path key={x0} d={pts([{ x: x0, y: r.glassFloor }, { x: x0 + w, y: r.glassFloor }, { x: x0 + w + 300, y: r.glassTop }, { x: x0 + 300, y: r.glassTop }])} fill="#FFFFFF" opacity={0.14} />
        ))}
        {/* створка двери: уезжает влево (вид изнутри) */}
        <rect x={r.door.x0 - dOpen} y={doorTop} width={r.door.x1 - r.door.x0} height={r.glassFloor - doorTop} fill="rgba(205,224,240,0.3)" stroke={prof} strokeWidth={4} />
        <rect x={r.door.x1 - dOpen - 34} y={r.glassFloor - 400} width={9} height={210} rx={4} fill="#B9C2CD" stroke={ink("#B9C2CD", 0.7)} strokeWidth={2} />
        {/* профили */}
        <line x1={-400} y1={r.glassTop} x2={1500} y2={r.glassTop} stroke={prof} strokeWidth={14} />
        <line x1={-400} y1={r.glassFloor} x2={1500} y2={r.glassFloor} stroke={prof} strokeWidth={16} />
        {[300, r.door.x0, r.door.x1].map((x) => (
          <line key={x} x1={x} y1={r.glassTop} x2={x} y2={r.glassFloor} stroke={prof} strokeWidth={x === 300 ? 8 : 10} />
        ))}
        <line x1={r.door.x0} y1={doorTop} x2={r.door.x1} y2={doorTop} stroke={prof} strokeWidth={10} />
        {/* обратная сторона таблички (без надписи) */}
        <rect x={(r.door.x0 + r.door.x1) / 2 - 100} y={doorTop - 76} width={200} height={54} rx={10} fill="#EEF1F4" stroke={ink("#EEF1F4", 0.75)} strokeWidth={3} />
      </Svg>
    </div>
  );
};

// Стол директора на переднем плане (обратный план) и ноутбук экраном к
// нам. screen — содержимое экрана (DOM, ширина 1000 номинальных px),
// напр. <CalendarDay … /> в масштабе 1000/DAY.w.
export const DirReverseDesk: React.FC<{ readonly screen?: React.ReactNode; readonly glow?: number; readonly evening?: number }> = ({ screen, glow = 0.6, evening = 0 }) => {
  const r = DIRR;
  const top = mix(P.wood, "#E3B98A", 0.3 * clamp(evening));
  return (
    <div style={box({ left: 0, top: 0 })}>
      <Svg>
        <path d={pts([{ x: -400, y: r.deskEdge }, { x: 1500, y: r.deskEdge }, { x: 1500, y: 2400 }, { x: -400, y: 2400 }])} fill={top} stroke={ink(top, 0.7)} strokeWidth={LW} />
        {[1680, 1790, 1900].map((y) => (
          <path key={y} d={`M -400 ${y} Q 540 ${y + 10} 1500 ${y - 6}`} stroke={ink(top, 0.9)} strokeWidth={2} fill="none" opacity={0.45} />
        ))}
        {/* бумаги справа */}
        <path d={pts([{ x: 830, y: 1700 }, { x: 1020, y: 1690 }, { x: 1060, y: 1860 }, { x: 850, y: 1880 }])} fill="#FFFFFF" stroke="#CFC8BA" strokeWidth={2.4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={872} y={1740 + i * 34} width={[130, 110, 80][i]} height={10} rx={5} fill={C.navy} opacity={0.35} transform={`rotate(-3 872 ${1740 + i * 34})`} />
        ))}
      </Svg>
      <LaptopUser x={r.laptop.x} y={r.laptop.y} w={r.laptop.w} glow={glow}>
        {screen}
      </LaptopUser>
    </div>
  );
};

// Обратный план целиком. Слоты: visitor — гость в двери (за стеклом/в
// проёме), director — силуэт со спины (по умолчанию DirectorBack).
export const DirectorReverse: React.FC<{ readonly door?: number; readonly evening?: number; readonly screen?: React.ReactNode; readonly visitor?: React.ReactNode; readonly director?: React.ReactNode; readonly headUp?: number }> = ({ door = 0, evening = 0, screen, visitor, director, headUp = 0 }) => (
  <>
    <DirReverseBack door={door} evening={evening} />
    {visitor}
    <DirReverseDesk screen={screen} evening={evening} />
    {director ?? <DirectorBack headUp={headUp} evening={evening} />}
    <OfficeLight evening={evening} />
  </>
);

// =====================================================================
// Переговорная (сцена 7c): длинный стол уходит в глубину, на задней
// стене экран «Долбоордун планы», слева окна (Бишкек), справа — стена
// со входом (дверь за правым краем кадра). Перспектива с одной точкой
// схода: s — масштаб глубины, рост = H × s.
// =====================================================================
export const MEET = { horizon: 860, floorF: 1900, vpx: 540, backS: 0.6 } as const;
export const meetY = (s: number) => MEET.horizon + (MEET.floorF - MEET.horizon) * s;
export const meetS = (y: number) => (y - MEET.horizon) / (MEET.floorF - MEET.horizon);
export const meetX = (X: number, s: number) => MEET.vpx + (X - MEET.vpx) * s;
const mPt = (X: number, s: number, up = 0): Pt => ({ x: meetX(X, s), y: meetY(s) - up * s });
const MT = { x0: 290, x1: 790, sN: 1.04, sF: 0.64 }; // стол
const SCR = (() => {
  const s = MEET.backS;
  const w = 1000 * s;
  const h = 560 * s;
  const bottom = meetY(s) - 640 * s;
  return { x: MEET.vpx - w / 2, y: bottom - h, w, h };
})();
const seatAt = (X: number, s: number, h: number, face: number) => ({ x: meetX(X, s), y: meetY(s), s, h: h * s, face });
// Места: place = { x, y, h }, face — куда смотрит (−1 влево … 1 вправо).
export const MEET_POS = {
  client: seatAt(140, 0.9, 795, 0.85), // заказчик — слева ближе
  assistant: seatAt(140, 0.74, 765, 0.85), // помощница — слева дальше
  colleagueW: seatAt(940, 0.74, 760, -0.85), // сотрудница — справа дальше
  colleagueM: seatAt(540, 0.63, 785, 0), // сотрудник — во главе стола, лицом к нам
  director: seatAt(940, 0.9, 800, -0.85), // место директора — справа ближе (сначала пусто)
  // вход директора: из-за правого края к своему креслу
  enterPath: [mPt(1700, 0.84), mPt(1300, 0.86), mPt(1060, 0.9)],
  // экран на задней стене (кадр мира) и столешница (y ближнего/дальнего края)
  screen: SCR,
  tableTop: { near: meetY(MT.sN) - O31.deskH * MT.sN, far: meetY(MT.sF) - O31.deskH * MT.sF },
} as const;
export const MEET_CAM = {
  wide: { x: 540, y: 1250, zoom: 0.92 },
  screen: { x: SCR.x + SCR.w / 2, y: SCR.y + SCR.h / 2, zoom: 1.9 },
  director: { x: 800, y: 1300, zoom: 1.7 },
  client: { x: 280, y: 1300, zoom: 1.7 },
} as const;

// Экран переговорной: «Долбоордун планы» и три строки плана.
export const SlideScreen: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly hi?: number }> = ({ x, y, w, h, hi = -1 }) => {
  const k = w / 600;
  const S = M13_TEXT.slide;
  return (
    <div style={box({ left: x, top: y, width: w, height: h })}>
      <div style={box({ left: -8 * k, top: -8 * k, width: w + 16 * k, height: h + 16 * k, borderRadius: 14 * k, backgroundColor: "#22262E", boxShadow: "0 14px 26px rgba(23,42,70,0.2)" })} />
      <div style={box({ left: 0, top: 0, width: w, height: h, borderRadius: 8 * k, overflow: "hidden", background: `linear-gradient(180deg, #1F3558, ${C.navy})` })}>
        <div style={box({ left: 34 * k, top: 26 * k, fontFamily: F.text, fontWeight: 800, fontSize: 52 * k, color: "#FFFFFF", whiteSpace: "nowrap", lineHeight: 1 })}>{S.title}</div>
        <div style={box({ left: 34 * k, top: 92 * k, width: 70 * k, height: 8 * k, borderRadius: 4 * k, backgroundColor: C.yellow })} />
        {S.rows.map((row, i) => (
          <div key={row} style={box({ left: 34 * k, top: (124 + i * 70) * k, width: w - 68 * k, height: 56 * k, borderRadius: 12 * k, backgroundColor: i === hi ? "rgba(255,212,59,0.95)" : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: 16 * k, paddingLeft: 18 * k, boxSizing: "border-box" })}>
            <div style={{ width: 26 * k, height: 26 * k, borderRadius: 13 * k, backgroundColor: i === hi ? C.navy : ["#7FB2FF", "#6FD3B8", C.orange][i] }} />
            <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 40 * k, color: i === hi ? C.navy : "#FFFFFF", whiteSpace: "nowrap" }}>{row}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MeetChair: React.FC<{ readonly X: number; readonly s: number; readonly face: number; readonly color?: string }> = ({ X, s, face, color = P.chair }) => {
  const p = mPt(X, s);
  const seat = 0.27 * 800 * s;
  const back = face > 0.3 ? -1 : face < -0.3 ? 1 : 0; // спинка за спиной
  const w = 120 * s;
  return (
    <g>
      <ellipse cx={p.x} cy={p.y - 4} rx={130 * s} ry={14 * s} fill="rgba(30,40,60,0.18)" />
      <rect x={p.x - 6 * s} y={p.y - seat} width={12 * s} height={seat - 20 * s} fill="#6E7886" />
      <path d={`M ${p.x - 120 * s} ${p.y - 10 * s} L ${p.x + 120 * s} ${p.y - 10 * s}`} stroke="#3B4351" strokeWidth={12 * s} strokeLinecap="round" />
      {back === 0 ? (
        <rect x={p.x - w} y={p.y - seat - 330 * s} width={2 * w} height={340 * s} rx={40 * s} fill={color} stroke={ink(color, 0.7)} strokeWidth={lw(s)} />
      ) : (
        <path d={`M ${p.x + back * 80 * s} ${p.y - seat} L ${p.x + back * 120 * s} ${p.y - seat - 340 * s} Q ${p.x + back * 124 * s} ${p.y - seat - 380 * s} ${p.x + back * 84 * s} ${p.y - seat - 380 * s} L ${p.x + back * 60 * s} ${p.y - seat - 370 * s} Q ${p.x + back * 36 * s} ${p.y - seat - 360 * s} ${p.x + back * 44 * s} ${p.y - seat - 330 * s} L ${p.x + back * 40 * s} ${p.y - seat} Z`} fill={color} stroke={ink(color, 0.7)} strokeWidth={lw(s)} strokeLinejoin="round" />
      )}
      <rect x={p.x - 120 * s} y={p.y - seat - 8 * s} width={240 * s} height={34 * s} rx={14 * s} fill={color} stroke={ink(color, 0.7)} strokeWidth={lw(s)} />
    </g>
  );
};

export const MeetingRoomBack: React.FC<{ readonly evening?: number; readonly hi?: number }> = ({ evening = 0, hi = -1 }) => {
  const e = clamp(evening);
  const s = MEET.backS;
  const RX = { x0: -340, x1: 1420 };
  const bl = mPt(RX.x0, s);
  const br = mPt(RX.x1, s);
  const tl = mPt(RX.x0, s, O31.ceilH);
  const tr = mPt(RX.x1, s, O31.ceilH);
  const near = 1.6;
  const wall = mix("#E7ECF2", "#EBDCCB", 0.5 * e);
  const side = mix("#DCE3EB", "#E2CFBC", 0.5 * e);
  // окно на левой стене (перспективный четырёхугольник)
  const wq = [mPt(RX.x0, 0.66, 1150), mPt(RX.x0, 1.25, 1150), mPt(RX.x0, 1.25, 260), mPt(RX.x0, 0.66, 260)];
  return (
    <div style={box({ left: 0, top: 0 })}>
      <Svg>
        {/* потолок, задняя стена, боковые стены, пол */}
        <rect x={-800} y={-1000} width={2700} height={tl.y + 1000} fill={mix(P.ceil, "#EFE3D6", 0.5 * e)} />
        <path d={pts([tl, mPt(RX.x0, near, O31.ceilH), mPt(RX.x0, near), bl])} fill={side} />
        <path d={pts([tr, mPt(RX.x1, near, O31.ceilH), mPt(RX.x1, near), br])} fill={mix(side, "#C9D3DE", 0.3)} />
        <path d={pts([bl, br, mPt(RX.x1, 2.2), mPt(RX.x0, 2.2)])} fill={mix("#AEB9C8", "#B9A891", 0.4 * e)} />
        <path d={pts([tl, tr, br, bl])} fill={wall} stroke={ink(wall, 0.8)} strokeWidth={lw(s)} />
        <rect x={bl.x} y={bl.y - 14} width={br.x - bl.x} height={14} fill={mix(wall, "#9AA6B6", 0.3)} />
        {/* потолочные светильники */}
        {[0.75, 1.0].map((sv) => (
          <path key={sv} d={pts([mPt(300, sv, O31.ceilH), mPt(780, sv, O31.ceilH), mPt(780, sv + 0.08, O31.ceilH), mPt(300, sv + 0.08, O31.ceilH)])} fill="#FFFFFF" stroke={ink("#FFFFFF", 0.75)} strokeWidth={lw(sv)} />
        ))}
      </Svg>
      {/* окно слева: вид на город */}
      <div style={box({ left: 0, top: 0, clipPath: `polygon(${wq.map((q) => `${q.x}px ${q.y}px`).join(", ")})` })}>
        <CityView id="mtcity" x0={-900} x1={200} y0={wq[1].y - 200} y1={wq[2].y + 200} base={wq[0].y + 140} k={1.1} evening={e} />
      </div>
      <Svg>
        <path d={pts(wq)} fill="none" stroke={P.frame} strokeWidth={16} strokeLinejoin="round" />
        <path d={pts(wq)} fill="none" stroke={ink(P.frame, 0.78)} strokeWidth={3} />
        <line x1={mPt(RX.x0, 0.85).x} y1={mPt(RX.x0, 0.85, 1150).y} x2={mPt(RX.x0, 0.85).x} y2={mPt(RX.x0, 0.85, 260).y} stroke={P.frame} strokeWidth={14} />
        {/* правая стена: матовое стекло в коридор */}
        <path d={pts([mPt(RX.x1, 0.66, 1250), mPt(RX.x1, near, 1250), mPt(RX.x1, near, 120), mPt(RX.x1, 0.66, 120)])} fill="#F4F7FA" opacity={0.55} />
        <path d={pts([mPt(RX.x1, 0.66, 1250), mPt(RX.x1, near, 1250), mPt(RX.x1, near, 120), mPt(RX.x1, 0.66, 120)])} fill="none" stroke="#8E9AAB" strokeWidth={6} />
        {/* растение в углу */}
        {(() => {
          const p = mPt(1300, 0.64);
          const ps = 0.64;
          return (
            <g>
              {[-30, -10, 10, 30].map((a, i) => (
                <ellipse key={a} cx={p.x} cy={p.y - 330 * ps} rx={30 * ps} ry={170 * ps} fill={i % 2 ? P.plant : P.plantDeep} stroke={ink(P.plantDeep, 0.7)} strokeWidth={lw(ps) * 0.7} transform={`rotate(${a} ${p.x} ${p.y - 150 * ps})`} />
              ))}
              <path d={`M ${p.x - 55 * ps} ${p.y - 150 * ps} L ${p.x + 55 * ps} ${p.y - 150 * ps} L ${p.x + 44 * ps} ${p.y} L ${p.x - 44 * ps} ${p.y} Z`} fill={P.pot} stroke={ink(P.pot, 0.7)} strokeWidth={lw(ps)} />
            </g>
          );
        })()}
      </Svg>
      <SlideScreen x={SCR.x} y={SCR.y} w={SCR.w} h={SCR.h} hi={hi} />
    </div>
  );
};

// Стол переговорной (рисуется после тел сидящих и до их рук).
export const MeetingTable: React.FC<{ readonly evening?: number }> = ({ evening = 0 }) => {
  const top = mix("#F2F3F5", "#F1E2CF", 0.4 * clamp(evening));
  const H = O31.deskH;
  const nl = mPt(MT.x0, MT.sN, H);
  const nr = mPt(MT.x1, MT.sN, H);
  const fl = mPt(MT.x0, MT.sF, H);
  const fr = mPt(MT.x1, MT.sF, H);
  const th = 26;
  return (
    <Svg>
      <ellipse cx={MEET.vpx} cy={meetY(0.84)} rx={360} ry={90} fill="rgba(30,40,60,0.14)" />
      {/* опоры */}
      {[0.72, 0.96].map((sv) => (
        <g key={sv}>
          <rect x={meetX(540, sv) - 22 * sv} y={meetY(sv) - (H - 30) * sv} width={44 * sv} height={(H - 40) * sv} fill="#6B7584" stroke={ink("#6B7584", 0.7)} strokeWidth={lw(sv)} />
          <rect x={meetX(540, sv) - 150 * sv} y={meetY(sv) - 18 * sv} width={300 * sv} height={18 * sv} rx={9 * sv} fill="#5F6977" stroke={ink("#5F6977", 0.7)} strokeWidth={lw(sv)} />
        </g>
      ))}
      <path d={pts([fl, fr, nr, nl])} fill={top} stroke={ink(top, 0.7)} strokeWidth={lw(1)} strokeLinejoin="round" />
      <path d={pts([nl, nr, { x: nr.x, y: nr.y + th }, { x: nl.x, y: nl.y + th }])} fill={mix(top, "#AEB8C5", 0.5)} stroke={ink(top, 0.7)} strokeWidth={lw(1)} />
      {/* папки и бумаги на столе */}
      {[
        [370, 0.92, C.blue],
        [700, 0.84, "#5E9A93"],
        [420, 0.74, "#FFFFFF"],
        [660, 0.7, "#FFFFFF"],
      ].map(([X, sv, c], i) => {
        const a = mPt((X as number) - 50, sv as number, H);
        const b = mPt((X as number) + 50, sv as number, H);
        const d = mPt((X as number) + 50, (sv as number) - 0.05, H);
        const f = mPt((X as number) - 50, (sv as number) - 0.05, H);
        return <path key={i} d={pts([a, b, d, f])} fill={c as string} stroke={ink(c as string, 0.75)} strokeWidth={2} />;
      })}
    </Svg>
  );
};

// Переговорная целиком. Слоты: head — сидящий во главе стола (за столом),
// seated — тела сидящих по бокам (layer "body"), arms — руки всех
// (layer "arms", поверх стола), front — кто ближе стола (входящий
// директор). chairs — какие кресла рисовать (по умолчанию все пять).
export const MeetingRoom: React.FC<{ readonly evening?: number; readonly hi?: number; readonly head?: React.ReactNode; readonly seated?: React.ReactNode; readonly arms?: React.ReactNode; readonly front?: React.ReactNode }> = ({ evening = 0, hi = -1, head, seated, arms, front }) => {
  const M = MEET_POS;
  return (
    <>
      <MeetingRoomBack evening={evening} hi={hi} />
      <Svg>
        <MeetChair X={540} s={M.colleagueM.s} face={0} color="#3F5E7E" />
      </Svg>
      {head}
      <Svg>
        {[M.assistant, M.colleagueW, M.client, M.director].map((p, i) => (
          <MeetChair key={i} X={MEET.vpx + (p.x - MEET.vpx) / p.s} s={p.s} face={p.face} color="#3F5E7E" />
        ))}
      </Svg>
      {seated}
      <MeetingTable evening={evening} />
      {arms}
      {front}
      <OfficeLight evening={evening} />
    </>
  );
};
