// Реквизит фильма 80-1-9 «Кому сказать спасибо?»: белые тарелки с дольками
// яблока, долька в руке (целая и надкушенная), сложенная бумажная салфетка
// (лежит или в пальцах), деревянный поднос со стопкой чистых салфеток,
// стеклянный кувшин и стаканы с водой, дастархан на ковре, закрытый Коран на
// подставке-рехале на полке (без букв и псевдоарабских строк), лодочка и
// папка «Наши вопросы» с рисунком Земли на подоконнике.
//
// Координаты — мир комнаты (px). Камера смотрит на низкий столик почти
// вровень, чуть сверху: у стоящих предметов (x, y) — центр опоры на
// поверхности; лежащие плоские предметы сжаты по вертикали (K ≈ 0,3).
// Свет — из окна справа: блики справа, тени чуть влево и вниз. Каждый
// компонент — абсолютный <svg> 1×1 с overflow: visible, чтобы сцена могла
// сортировать его по глубине вместе с персонажами.
import { useId } from "react";
import { EARTH_TOTAL, EarthSheetContent, SHEET_H, SHEET_W } from "../film-1-7/drawings";
import { PaperBoat } from "../film-1-7/set";
import { FOLDER_H, FOLDER_W, FolderContent } from "../film-1-8/drawings";
import { clamp01, HOLE_X, HOLE_Y, K, lerp, NAPKIN_T, napkinCorners, plateGeo, plateSlot, SLICE_H, sliceW, slotRows, stackNapkinW, STACK_JR, STACK_JX, towards, trayGeo, type Pt } from "./propsGeom";
export { napkinGrip, napkinOtherGrip, plateSlot, sliceW, trayHandles, trayTop } from "./propsGeom";

const SVG_STYLE: React.CSSProperties = { position: "absolute", left: 0, top: 0, overflow: "visible" };
const World: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <svg width={1} height={1} style={SVG_STYLE}>
    {children}
  </svg>
);

type F1 = (x: number) => number;
const r1 = (v: number) => Math.round(v * 100) / 100;
const poly = (pts: readonly Pt[]) => `M ${pts.map((p) => `${r1(p.x)} ${r1(p.y)}`).join(" L ")} Z`;

const sliceTop = (a: number, H: number): F1 => (x) => -H / 2 + 0.13 * H * (1 - (x / a) ** 2);
const sliceBot = (a: number, H: number): F1 => (x) => -H / 2 + H * Math.pow(Math.max(0, 1 - (x / a) ** 2), 0.6);

// Край укуса: x границы при данном y (правее — откушено). Три следа зубов,
// средний глубже — край вогнутый.
const biteCut = (a: number, H: number) => {
  const xc = a - 0.64 * a;
  const rt = 0.26 * H;
  const cs = [-0.34, 0, 0.34].map((k) => ({ y: k * H, x: xc + rt + (0.16 * H * Math.abs(k)) / 0.34 }));
  return (y: number) => {
    let m = Infinity;
    for (const c of cs) {
      const dy = y - c.y;
      if (Math.abs(dy) < rt) m = Math.min(m, c.x - Math.sqrt(rt * rt - dy * dy));
    }
    return m;
  };
};

// Первая точка на [lo, hi], где g меняет знак с − на + (выборка + деление пополам).
const firstCross = (g: F1, lo: number, hi: number): number | null => {
  const N = 48;
  let prev = lo;
  if (g(lo) >= 0) return lo;
  for (let i = 1; i <= N; i++) {
    const x = lo + ((hi - lo) * i) / N;
    if (g(x) >= 0) {
      let a = prev;
      let b = x;
      for (let k = 0; k < 18; k++) {
        const m = (a + b) / 2;
        if (g(m) >= 0) b = m;
        else a = m;
      }
      return (a + b) / 2;
    }
    prev = x;
  }
  return null;
};

// Область между top и bot на [lo, hi], обрезанная справа краем cut (если есть).
const regionPath = (lo: number, hi: number, top: F1, bot: F1, cut: ((y: number) => number) | null) => {
  const N = 22;
  const pts: Pt[] = [];
  const xt = cut ? firstCross((x) => x - cut(top(x)), lo, hi) ?? hi : hi;
  const xb = cut ? firstCross((x) => x - cut(bot(x)), lo, hi) ?? hi : hi;
  for (let i = 0; i <= N; i++) {
    const x = lo + ((xt - lo) * i) / N;
    pts.push({ x, y: top(x) });
  }
  if (cut && (xt < hi || xb < hi)) {
    const y0 = top(xt);
    const y1 = bot(xb);
    for (let i = 1; i < 14; i++) {
      const y = lerp(y0, y1, i / 14);
      pts.push({ x: Math.min(cut(y), hi), y });
    }
  }
  for (let i = 0; i <= N; i++) {
    const x = xb - ((xb - lo) * i) / N;
    pts.push({ x, y: bot(x) });
  }
  return poly(pts);
};

type SliceGeo = { peel: string; flesh: string; core: string; cutEdge: string | null; shine: string; outlineW: number };
const sliceCache = new Map<string, SliceGeo>();
const sliceGeo = (s: number, bitten: boolean): SliceGeo => {
  const key = `${s.toFixed(2)}|${bitten ? 1 : 0}`;
  const hit = sliceCache.get(key);
  if (hit) return hit;
  const a = s / 2;
  const H = s * SLICE_H;
  const top = sliceTop(a, H);
  const bot = sliceBot(a, H);
  const pt = Math.max(0.8, s * 0.075);
  const cut = bitten ? biteCut(a, H) : null;
  // мякоть: от среза до внутренней границы кожуры
  const botIn: F1 = (x) => bot(x) - pt;
  const xf = firstCross((x) => -(botIn(x) - top(x)), 0, a) ?? a;
  const coreBot: F1 = (x) => top(x) + 0.17 * H * (1 - (x / (0.75 * a)) ** 2);
  const xcFlat = 0.62 * a;
  let cutEdge: string | null = null;
  if (cut) {
    const pts: Pt[] = [];
    for (let i = 0; i <= 16; i++) {
      const y = lerp(-H / 2, H / 2, i / 16);
      const x = cut(y);
      if (x < a && y >= top(x) - 0.2 && y <= bot(x) + 0.2) pts.push({ x, y });
    }
    cutEdge = pts.length > 1 ? `M ${pts.map((p) => `${r1(p.x)} ${r1(p.y)}`).join(" L ")}` : null;
  }
  const shinePts: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = lerp(0.12 * a, 0.55 * a, i / 8);
    shinePts.push({ x, y: bot(x) - pt * 0.45 });
  }
  const g: SliceGeo = {
    peel: regionPath(-a, a, top, bot, cut),
    flesh: regionPath(-xf, xf, top, botIn, cut),
    core: regionPath(-xcFlat, xcFlat, top, (x) => Math.min(coreBot(x), botIn(x)), cut),
    cutEdge,
    shine: cut && cut(bot(0.55 * a)) < 0.55 * a ? "" : `M ${shinePts.map((p) => `${r1(p.x)} ${r1(p.y)}`).join(" L ")}`,
    outlineW: Math.max(0.35, s * 0.018),
  };
  sliceCache.set(key, g);
  return g;
};

const FLESH = "#F8EBC6";
const FLESH_CORE = "#EEDBA6";

// Детерминированный id для градиентов внутри компонента (по месту в дереве).
const useSvgId = (prefix: string) => `${prefix}${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;

// Рисунок дольки в местных координатах (центр 0, 0). Кожура — плавный
// переход от жёлто-зелёного бочка (−x) к красной (+x).
const SliceShape: React.FC<{ readonly s: number; readonly bitten: boolean }> = ({ s, bitten }) => {
  const g = sliceGeo(s, bitten);
  const id = useSvgId("l819ap");
  return (
    <>
      <defs>
        <linearGradient id={id} x1={-s / 2} x2={s / 2} y1={0} y2={0} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C9C451" />
          <stop offset="0.16" stopColor="#D6A841" />
          <stop offset="0.34" stopColor="#D2602F" />
          <stop offset="0.55" stopColor="#C4392D" />
          <stop offset="1" stopColor="#AF2D27" />
        </linearGradient>
      </defs>
      <path d={g.peel} fill={`url(#${id})`} stroke="#8C2821" strokeWidth={g.outlineW} strokeLinejoin="round" />
      <path d={g.flesh} fill={FLESH} />
      <path d={g.core} fill={FLESH_CORE} opacity={0.8} />
      {g.cutEdge ? <path d={g.cutEdge} fill="none" stroke="#DCC18A" strokeWidth={g.outlineW * 1.2} strokeLinecap="round" /> : null}
      {g.shine ? <path d={g.shine} fill="none" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={g.outlineW * 1.4} strokeLinecap="round" /> : null}
    </>
  );
};


// Долька отдельно (в руке): центр (x, y), длина w (обычно sliceW ширины
// тарелки), rot — градусы. bite: 0 — целая, 1 — откушен кусочек с конца +x
// (до поворота; biteEnd = −1 — с конца −x), ≥ 2 — съедена (ничего).
export const AppleSlice: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly rot: number;
  readonly bite: number;
  readonly biteEnd?: 1 | -1;
}> = ({ x, y, w, rot, bite, biteEnd = 1 }) => {
  const b = Math.floor(bite);
  if (b >= 2) return null;
  return (
    <World>
      <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)})${biteEnd < 0 ? " scale(-1 1)" : ""}`}>
        <SliceShape s={w} bitten={b >= 1} />
      </g>
    </World>
  );
};




// Тарелка: (x, y) — центр опоры (ножки) на поверхности, w — ширина.
// slices[i] — долька i ещё на тарелке (длина массива = число гнёзд).
export const PlateView: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly slices: readonly boolean[]; readonly uid: string }> = ({ x, y, w, slices, uid }) => {
  const g = plateGeo(x, y, w);
  const n = slices.length;
  const s = sliceW(w);
  const id = `${uid}-plate`;
  const slots = slices.map((on, i) => ({ on, i, ...plateSlot(x, y, w, n, i) }));
  const nFront = slotRows(n).front.length;
  const order = [...slots.filter((p) => p.i >= nFront), ...slots.filter((p) => p.i < nFront)];
  return (
    <World>
      <defs>
        <linearGradient id={`${id}-side`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#CFCBC2" />
          <stop offset="0.55" stopColor="#E4E1DA" />
          <stop offset="1" stopColor="#F2F0EB" />
        </linearGradient>
        <linearGradient id={`${id}-well`} x1="0" x2="1" y1="0" y2="0.4">
          <stop offset="0" stopColor="#EDEBE5" />
          <stop offset="1" stopColor="#FAF9F5" />
        </linearGradient>
      </defs>
      {/* мягкая тень на поверхности (чуть влево — свет из окна справа) */}
      <ellipse cx={x - 1} cy={y + 1.5} rx={g.R * 1.02} ry={g.footRy * 1.5} fill="#3A2A1A" opacity={0.08} />
      <ellipse cx={x - 0.5} cy={y + 1} rx={g.footRx * 1.15} ry={g.footRy * 1.12} fill="#3A2A1A" opacity={0.14} />
      {/* ножка и наружная сторона тарелки */}
      <ellipse cx={x} cy={y} rx={g.footRx} ry={g.footRy} fill="#C9C5BC" />
      <path
        d={`M ${x - g.R} ${g.rimY} C ${x - g.R} ${g.rimY + g.hp * 0.9} ${x - g.footRx * 1.25} ${y + g.footRy * 0.2} ${x - g.footRx} ${y + g.footRy * 0.35} A ${g.footRx} ${g.footRy} 0 0 0 ${x + g.footRx} ${y + g.footRy * 0.35} C ${x + g.footRx * 1.25} ${y + g.footRy * 0.2} ${x + g.R} ${g.rimY + g.hp * 0.9} ${x + g.R} ${g.rimY} Z`}
        fill={`url(#${id}-side)`}
      />
      {/* поле (широкий край) и углубление */}
      <ellipse cx={x} cy={g.rimY} rx={g.R} ry={g.ry} fill="#FCFBF8" stroke="#D2CEC6" strokeWidth={Math.max(0.5, w * 0.007)} />
      <ellipse cx={x} cy={g.rimY + w * 0.008} rx={g.wellRx * 1.06} ry={g.wellRy * 1.06} fill="#E2DED6" />
      <ellipse cx={x} cy={g.wellY} rx={g.wellRx} ry={g.wellRy} fill={`url(#${id}-well)`} />
      {/* блик на правом крае поля */}
      <path d={`M ${x + g.R * 0.35} ${g.rimY - g.ry * 0.86} A ${g.R * 0.9} ${g.ry * 0.9} 0 0 1 ${x + g.R * 0.86} ${g.rimY + g.ry * 0.12}`} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0.8, w * 0.016)} strokeLinecap="round" opacity={0.95} />
      {/* дольки: тени, затем задний ряд, затем передний */}
      {order.map((p) =>
        p.on ? <ellipse key={`sh${p.i}`} cx={p.x - 0.6} cy={p.y + s * SLICE_H * 0.5 - 0.2} rx={s * 0.44} ry={s * 0.075} fill="#6E655A" opacity={0.22} /> : null,
      )}
      {order.map((p) =>
        p.on ? (
          <g key={p.i} transform={`translate(${r1(p.x)} ${r1(p.y)}) rotate(${p.rot})`}>
            <SliceShape s={s} bitten={false} />
          </g>
        ) : null,
      )}
    </World>
  );
};


const mid = (p: Pt, q: Pt): Pt => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
const add = (p: Pt, dx: number, dy: number): Pt => ({ x: p.x + dx, y: p.y + dy });
// Точка внутри четырёхугольника P0 P1 P2 P3 по долям (u — к P1, v — к P3).
const bilerp = (P: readonly Pt[], u: number, v: number): Pt => towards(towards(P[0], P[1], u), towards(P[3], P[2], u), v);

// Мягкий контур: края слегка провисают (в руке — сильнее, нижний край
// волной), углы скруглены. Сдвиг (dx, dy) — для тени и среза.
const napkinOutline = (P: readonly Pt[], w: number, flat: number, dx = 0, dy = 0) => {
  const t = clamp01(flat);
  const C = { x: (P[0].x + P[2].x) / 2, y: (P[0].y + P[2].y) / 2 };
  // [провисание вниз, выгиб наружу, волна] для краёв 0→1, 1→2, 2→3, 3→0
  const held = [
    [0.03, 0, 0],
    [0.01, -0.02, 0],
    [0.04, 0, 0.012],
    [0, -0.012, 0],
  ];
  const edgePt = (i: number, s: number): Pt => {
    const a = P[i];
    const b = P[(i + 1) % 4];
    const p = towards(a, b, s);
    const m = mid(a, b);
    const len = Math.hypot(m.x - C.x, m.y - C.y) || 1;
    const nx = (m.x - C.x) / len;
    const ny = (m.y - C.y) / len;
    const bell = 4 * s * (1 - s);
    const [sg, bl, wv] = held[i].map((k) => k * w * (1 - t));
    const soft = 0.004 * w * bell;
    const wave = wv * Math.sin(s * Math.PI * 3);
    return { x: p.x + dx + nx * (bl * bell + soft), y: p.y + dy + sg * bell + ny * (bl * bell + soft) + wave };
  };
  const rc = 0.07;
  const N = 10;
  let d = "";
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k <= N; k++) {
      const p = edgePt(i, rc + ((1 - 2 * rc) * k) / N);
      d += `${i === 0 && k === 0 ? "M" : "L"} ${r1(p.x)} ${r1(p.y)} `;
    }
    const corner = add(P[(i + 1) % 4], dx, dy);
    const nxt = edgePt((i + 1) % 4, rc);
    d += `Q ${r1(corner.x)} ${r1(corner.y)} ${r1(nxt.x)} ${r1(nxt.y)} `;
  }
  return `${d}Z`;
};


// Тиснение «ромбиком»: две серии диагоналей внутри поля (в долях u, v).
const quiltLines = (P: readonly Pt[]) => {
  const m = 0.13;
  const M = 0.87;
  const segs: [Pt, Pt][] = [];
  for (const c of [-0.45, -0.22, 0, 0.22, 0.45]) {
    const u0 = Math.max(m, m + c);
    const u1 = Math.min(M, M + c);
    segs.push([bilerp(P, u0, u0 - c), bilerp(P, u1, u1 - c)]);
  }
  for (const c of [0.55, 0.78, 1, 1.22, 1.45]) {
    const u0 = Math.max(m, c - M);
    const u1 = Math.min(M, c - m);
    segs.push([bilerp(P, u0, c - u0), bilerp(P, u1, c - u1)]);
  }
  return segs.map(([a, b]) => `M ${r1(a.x)} ${r1(a.y)} L ${r1(b.x)} ${r1(b.y)}`).join(" ");
};

// Рисунок салфетки в мировых координатах (без своей <svg>). edge — толщина
// видимого среза у лежащей; detail = false — только лист (нижние в стопке).
const NapkinShape: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly rot: number; readonly flat: number; readonly shadow?: boolean; readonly edge?: number; readonly detail?: boolean }> = ({
  x,
  y,
  w,
  rot,
  flat,
  shadow = true,
  edge = 0.5,
  detail = true,
}) => {
  const id = useSvgId("l819nap");
  const t = clamp01(flat);
  const P = napkinCorners(x, y, w, rot, t);
  const C = { x, y };
  const sw = Math.max(0.3, w * 0.011);
  const hold = 1 - t;
  // слои у открытого угла чуть разъезжаются
  const layer = (dx: number, dy: number) =>
    poly([towards(towards(P[2], P[1], 0.4), C, 0.1), add(towards(towards(P[2], P[1], 0.14), C, 0.04), dx, dy), add(P[2], dx, dy), add(towards(towards(P[2], P[3], 0.14), C, 0.04), dx, dy), towards(towards(P[2], P[3], 0.4), C, 0.1)]);
  const crease = [bilerp(P, 0.04, 0.5), bilerp(P, 0.96, 0.5)];
  const grip = towards(P[0], C, 0.16);
  const folds = [bilerp(P, 0.5, 0.96), bilerp(P, 0.86, 0.72)];
  const grad = { a: towards(P[0], C, 0.4), b: P[2] };
  return (
    <>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={r1(grad.a.x)} y1={r1(grad.a.y)} x2={r1(grad.b.x)} y2={r1(grad.b.y)}>
          <stop offset="0" stopColor="#FBFAF6" />
          <stop offset="0.6" stopColor={t > 0.5 ? "#F4F1EA" : "#ECE7DD"} />
          <stop offset="1" stopColor="#F6F3EC" />
        </linearGradient>
      </defs>
      {shadow && t > 0.02 ? <path d={napkinOutline(P, w, t, -0.8, 1.3 * t)} fill="#3A2A1A" opacity={0.12 * t} /> : null}
      {edge > 0 && t > 0.02 ? <path d={napkinOutline(P, w, t, 0, edge * t)} fill="#E2DBCD" /> : null}
      {detail ? (
        <>
          <path d={layer(lerp(0.15, 0.5, t), 0.8)} fill="#EDE9E0" stroke="#D9D1C2" strokeWidth={sw * 0.6} strokeLinejoin="round" />
          <path d={layer(lerp(0.08, 0.25, t), 0.4)} fill="#F3F0E9" stroke="#DCD5C7" strokeWidth={sw * 0.6} strokeLinejoin="round" />
        </>
      ) : null}
      <path d={napkinOutline(P, w, t)} fill={`url(#${id})`} stroke="#D6CEBF" strokeWidth={sw} strokeLinejoin="round" />
      {detail ? (
        <>
          <path d={quiltLines(P)} fill="none" stroke="#E5DFD3" strokeWidth={sw * 0.6} />
          {/* линия сгиба */}
          <path d={`M ${r1(crease[0].x)} ${r1(crease[0].y)} Q ${r1(C.x)} ${r1(C.y + w * 0.02 * hold)} ${r1(crease[1].x)} ${r1(crease[1].y)}`} fill="none" stroke="#DCD4C5" strokeWidth={sw * 0.9} opacity={0.5 + 0.5 * t} />
          {/* мягкие складки от щепоти (только в руке) */}
          {hold > 0.03
            ? folds.map((p, i) => (
                <g key={i} opacity={hold}>
                  <path d={`M ${r1(grip.x)} ${r1(grip.y)} Q ${r1(lerp(grip.x, p.x, 0.5) - w * 0.04)} ${r1(lerp(grip.y, p.y, 0.5) + w * 0.03)} ${r1(p.x)} ${r1(p.y)}`} fill="none" stroke="#D9D2C4" strokeWidth={w * 0.05} strokeLinecap="round" opacity={0.28} />
                  <path d={`M ${r1(grip.x + w * 0.02)} ${r1(grip.y)} Q ${r1(lerp(grip.x, p.x, 0.5) - w * 0.01)} ${r1(lerp(grip.y, p.y, 0.5) + w * 0.02)} ${r1(p.x + w * 0.012)} ${r1(p.y - w * 0.012)}`} fill="none" stroke="#FFFFFF" strokeWidth={w * 0.01} strokeLinecap="round" opacity={0.35} />
                </g>
              ))
            : null}
          {/* свет из окна справа на правой кромке */}
          <path d={`M ${r1(bilerp(P, 0.95, 0.08).x)} ${r1(bilerp(P, 0.95, 0.08).y)} L ${r1(bilerp(P, 0.95, 0.85).x)} ${r1(bilerp(P, 0.95, 0.85).y)}`} stroke="#FFFFFF" strokeWidth={sw * 1.2} opacity={0.75} />
        </>
      ) : null}
    </>
  );
};

export const NapkinView: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly rot: number; readonly flat: number }> = ({ x, y, w, rot, flat }) => (
  <World>
    <NapkinShape x={x} y={y} w={w} rot={rot} flat={flat} />
  </World>
);



// Верхний край длинного борта с ушками на концах (от левого конца к правому).
const wallTop = (g: ReturnType<typeof trayGeo>, base: number, w: number) => {
  const { x0, x1, rh, eh } = g;
  const e = w * 0.2;
  return `M ${r1(x0)} ${r1(base - eh * 0.82)} Q ${r1(x0)} ${r1(base - eh)} ${r1(x0 + w * 0.05)} ${r1(base - eh)} C ${r1(x0 + e * 0.8)} ${r1(base - eh)} ${r1(x0 + e * 0.7)} ${r1(base - rh)} ${r1(x0 + e * 1.3)} ${r1(base - rh)} L ${r1(x1 - e * 1.3)} ${r1(base - rh)} C ${r1(x1 - e * 0.7)} ${r1(base - rh)} ${r1(x1 - e * 0.8)} ${r1(base - eh)} ${r1(x1 - w * 0.05)} ${r1(base - eh)} Q ${r1(x1)} ${r1(base - eh)} ${r1(x1)} ${r1(base - eh * 0.82)}`;
};
const wallPath = (g: ReturnType<typeof trayGeo>, base: number, bottom: number, w: number) => `${wallTop(g, base, w)} L ${r1(g.x1)} ${r1(bottom - 1.5)} Q ${r1(g.x1)} ${r1(bottom)} ${r1(g.x1 - 1.5)} ${r1(bottom)} L ${r1(g.x0 + 1.5)} ${r1(bottom)} Q ${r1(g.x0)} ${r1(bottom)} ${r1(g.x0)} ${r1(bottom - 1.5)} Z`;
// Прорезь-ручка: скруглённый вытянутый вырез (обход против часовой — дырка).
const holePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${r1(cx - rx + ry)} ${r1(cy - ry)} A ${r1(ry)} ${r1(ry)} 0 0 0 ${r1(cx - rx + ry)} ${r1(cy + ry)} L ${r1(cx + rx - ry)} ${r1(cy + ry)} A ${r1(ry)} ${r1(ry)} 0 0 0 ${r1(cx + rx - ry)} ${r1(cy - ry)} Z`;

export const TrayView: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly count: number; readonly uid: string }> = ({ x, y, w, count, uid }) => {
  const g = trayGeo(x, y, w);
  const id = `${uid}-tray`;
  const n = Math.max(0, Math.min(STACK_JX.length, Math.round(count)));
  const nw = stackNapkinW(w);
  const k = w / 112;
  const base = y - g.ft - g.D * 0.12;
  const hx = w * HOLE_X;
  const hyF = g.yF - g.eh * HOLE_Y;
  const hyB = g.yB - g.eh * HOLE_Y;
  const hrx = w * 0.052;
  const hry = w * 0.013;
  const sw = Math.max(0.4, w * 0.006);
  return (
    <World>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#B88F5F" />
          <stop offset="0.6" stopColor="#CDA674" />
          <stop offset="1" stopColor="#DDB989" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#D9B887" />
          <stop offset="1" stopColor="#EACDA2" />
        </linearGradient>
      </defs>
      {/* тень на столе */}
      <rect x={g.x0 - 2} y={g.yB + 1} width={w + 2} height={g.D + 2.5} rx={5} fill="#3A2A1A" opacity={0.1} />
      <rect x={g.x0} y={g.yF - 2} width={w} height={3.2} rx={1.6} fill="#3A2A1A" opacity={0.16} />
      {/* дальний борт: видна внутренняя сторона, прорези тёмные */}
      <path d={`${wallPath(g, g.yB, g.yB + g.rh, w)} ${holePath(x - hx, hyB, hrx, hry)} ${holePath(x + hx, hyB, hrx, hry)}`} fill="#D3B080" fillRule="evenodd" stroke="#A9814F" strokeWidth={sw} />
      <path d={holePath(x - hx, hyB, hrx, hry)} fill="#6B4E2E" opacity={0.35} />
      <path d={holePath(x + hx, hyB, hrx, hry)} fill="#6B4E2E" opacity={0.35} />
      <path d={wallTop(g, g.yB, w)} fill="none" stroke="#F2DDBA" strokeWidth={sw * 1.6} />
      {/* дно с мягким рисунком дерева */}
      <rect x={g.x0 + 1.5 * k} y={g.yB - g.ft} width={w - 3 * k} height={g.yF - g.yB} fill={`url(#${id}-floor)`} />
      {[0.25, 0.5, 0.75].map((v, i) => (
        <path key={i} d={`M ${r1(g.x0 + w * 0.06)} ${r1(g.yB - g.ft + g.D * v)} Q ${r1(x - w * 0.1)} ${r1(g.yB - g.ft + g.D * v - 0.8 * (i % 2 ? 1 : -1))} ${r1(g.x1 - w * 0.06)} ${r1(g.yB - g.ft + g.D * v + 0.4)}`} fill="none" stroke="#C49C68" strokeWidth={sw} opacity={0.45} />
      ))}
      {/* торцы — видны только верхние кромки */}
      <rect x={g.x0} y={g.yB - g.eh * 0.82} width={2 * k} height={g.D} fill="#E6C99C" />
      <rect x={g.x1 - 2 * k} y={g.yB - g.eh * 0.82} width={2 * k} height={g.D} fill="#F0D8B0" />
      {/* стопка чистых салфеток */}
      {Array.from({ length: n }, (_, i) => {
        const top = i === n - 1;
        return (
          <NapkinShape
            key={i}
            x={x + STACK_JX[i] * k}
            y={base - i * NAPKIN_T}
            w={nw}
            rot={STACK_JR[i]}
            flat={1}
            shadow={i === 0}
            edge={NAPKIN_T}
            detail={top}
          />
        );
      })}
      {/* ближний борт с прорезями (сквозь них видно дно) */}
      <path d={`${wallPath(g, g.yF, g.yF, w)} ${holePath(x - hx, hyF, hrx, hry)} ${holePath(x + hx, hyF, hrx, hry)}`} fill={`url(#${id}-front)`} fillRule="evenodd" stroke="#9C7546" strokeWidth={sw} />
      <path d={wallTop(g, g.yF, w)} fill="none" stroke="#F5E2C2" strokeWidth={sw * 1.8} strokeLinecap="round" />
      {/* верхняя кромка прорезей в тени */}
      {[-1, 1].map((k) => (
        <path key={k} d={`M ${r1(x + k * hx - hrx + hry)} ${r1(hyF - hry)} L ${r1(x + k * hx + hrx - hry)} ${r1(hyF - hry)}`} stroke="#6E4C2C" strokeWidth={sw * 1.6} strokeLinecap="round" />
      ))}
    </World>
  );
};

// ======================= вода: кувшин и стакан =======================
// Профиль сосуда: точки [доля высоты, полуширина в долях h] снизу вверх.
type Profile = readonly (readonly [number, number])[];
const sideCurve = (prof: Profile, x: number, y: number, h: number, side: -1 | 1, inset = 0) => {
  const pts = prof.map(([t, r]) => ({ x: x + side * Math.max(0.5, r * h - inset), y: y - t * h }));
  // Катмулл–Ром → кубические Безье
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return { start: pts[0], end: pts[pts.length - 1], d };
};
const reverseCurve = (prof: Profile, x: number, y: number, h: number, side: -1 | 1, inset = 0) => sideCurve([...prof].reverse(), x, y, h, side, inset);
const halfAt = (prof: Profile, t: number) => {
  for (let i = 0; i < prof.length - 1; i++) {
    const [t0, r0] = prof[i];
    const [t1, r1v] = prof[i + 1];
    if (t >= t0 && t <= t1) return lerp(r0, r1v, (t - t0) / Math.max(1e-6, t1 - t0));
  }
  return prof[prof.length - 1][1];
};

// Силуэт сосуда до доли высоты tTop (с дугой дна спереди).
const vesselPath = (prof: Profile, x: number, y: number, h: number, inset = 0) => {
  const L = sideCurve(prof, x, y, h, -1, inset);
  const R = reverseCurve(prof, x, y, h, 1, inset);
  const rb = prof[0][1] * h - inset;
  const rt = prof[prof.length - 1][1] * h - inset;
  return `M ${r1(L.start.x)} ${r1(L.start.y)}${L.d} A ${r1(rt)} ${r1(rt * K)} 0 0 1 ${r1(R.start.x)} ${r1(R.start.y)}${R.d} A ${r1(rb)} ${r1(rb * K)} 0 0 1 ${r1(L.start.x)} ${r1(L.start.y)} Z`;
};

const GLASS_EDGE = "#8FB3C0";
const WATER = "#9ED2EA";

// Вода в сосуде: от дна (доля tb) до уровня tw; сверху — поверхность-эллипс.
const Water: React.FC<{ readonly prof: Profile; readonly x: number; readonly y: number; readonly h: number; readonly tb: number; readonly tw: number; readonly wall: number }> = ({ prof, x, y, h, tb, tw, wall }) => {
  const sub: [number, number][] = [[tb, halfAt(prof, tb)]];
  for (const [t, r] of prof) if (t > tb && t < tw) sub.push([t, r]);
  sub.push([tw, halfAt(prof, tw)]);
  const yb = y - tb * h;
  const L = sideCurve(sub, x, y, h, -1, wall);
  const R = reverseCurve(sub, x, y, h, 1, wall);
  const rb = sub[0][1] * h - wall;
  const rw = sub[sub.length - 1][1] * h - wall;
  const yw = y - tw * h;
  return (
    <>
      <path d={`M ${r1(L.start.x)} ${r1(L.start.y)}${L.d} A ${r1(rw)} ${r1(rw * K)} 0 0 0 ${r1(R.start.x)} ${r1(R.start.y)}${R.d} A ${r1(rb)} ${r1(rb * K)} 0 0 1 ${r1(L.start.x)} ${r1(yb)} Z`} fill={WATER} opacity={0.42} />
      {/* спокойная поверхность воды */}
      <ellipse cx={x} cy={yw} rx={rw} ry={rw * K} fill="#D2EEF8" opacity={0.75} stroke="#86BCD4" strokeWidth={Math.max(0.4, h * 0.008)} />
      <ellipse cx={x + rw * 0.35} cy={yw - rw * K * 0.15} rx={rw * 0.32} ry={rw * K * 0.28} fill="#FFFFFF" opacity={0.6} />
    </>
  );
};

// Кувшин из прозрачного стекла: носик влево, ручка вправо; (x, y) — центр дна.
const JUG_PROFILE: Profile = [
  [0, 0.235],
  [0.05, 0.255],
  [0.3, 0.29],
  [0.55, 0.275],
  [0.76, 0.215],
  [0.88, 0.2],
  [1, 0.225],
];
export const JugView: React.FC<{ readonly x: number; readonly y: number; readonly h: number }> = ({ x, y, h }) => {
  const sw = Math.max(0.6, h * 0.012);
  const rt = 0.225 * h;
  const yt = y - h;
  const rb = 0.235 * h;
  const hl = sideCurve(JUG_PROFILE.slice(1, 5), x, y, h, 1, h * 0.06);
  return (
    <World>
      {/* тень и светлый блик воды на столе (свет справа — тень влево) */}
      <ellipse cx={x - h * 0.06} cy={y + 1} rx={h * 0.32} ry={h * 0.32 * K * 0.8} fill="#3A2A1A" opacity={0.12} />
      <ellipse cx={x - h * 0.12} cy={y + 1.5} rx={h * 0.14} ry={h * 0.035} fill="#E8F7FC" opacity={0.45} />
      {/* ручка (за корпусом сверху и снизу) */}
      <path d={`M ${r1(x + 0.2 * h)} ${r1(y - 0.84 * h)} C ${r1(x + 0.5 * h)} ${r1(y - 0.86 * h)} ${r1(x + 0.52 * h)} ${r1(y - 0.42 * h)} ${r1(x + 0.27 * h)} ${r1(y - 0.3 * h)}`} fill="none" stroke="#CFE6EE" strokeWidth={h * 0.06} strokeLinecap="round" opacity={0.75} />
      <path d={`M ${r1(x + 0.2 * h)} ${r1(y - 0.84 * h)} C ${r1(x + 0.5 * h)} ${r1(y - 0.86 * h)} ${r1(x + 0.52 * h)} ${r1(y - 0.42 * h)} ${r1(x + 0.27 * h)} ${r1(y - 0.3 * h)}`} fill="none" stroke={GLASS_EDGE} strokeWidth={sw} strokeLinecap="round" opacity={0.8} />
      <path d={`M ${r1(x + 0.24 * h)} ${r1(y - 0.8 * h)} C ${r1(x + 0.44 * h)} ${r1(y - 0.8 * h)} ${r1(x + 0.45 * h)} ${r1(y - 0.47 * h)} ${r1(x + 0.29 * h)} ${r1(y - 0.36 * h)}`} fill="none" stroke="#FFFFFF" strokeWidth={sw * 0.9} strokeLinecap="round" opacity={0.7} />
      {/* стекло: лёгкий тон, дальняя стенка */}
      <path d={vesselPath(JUG_PROFILE, x, y, h)} fill="#E6F3F7" opacity={0.32} />
      <Water prof={JUG_PROFILE} x={x} y={y} h={h} tb={0.06} tw={0.58} wall={h * 0.018} />
      {/* толстое дно */}
      <ellipse cx={x} cy={y} rx={rb} ry={rb * K} fill="#D7ECF2" opacity={0.55} stroke={GLASS_EDGE} strokeWidth={sw * 0.8} />
      <ellipse cx={x} cy={y - h * 0.05} rx={rb * 0.85} ry={rb * K * 0.85} fill="none" stroke="#B9D7E1" strokeWidth={sw * 0.7} opacity={0.8} />
      {/* горлышко и носик */}
      <ellipse cx={x} cy={yt} rx={rt} ry={rt * K} fill="#EEF8FB" opacity={0.35} stroke={GLASS_EDGE} strokeWidth={sw} />
      <path d={`M ${r1(x - rt * 0.55)} ${r1(yt - rt * K * 0.8)} Q ${r1(x - rt * 1.25)} ${r1(yt - rt * K * 0.9)} ${r1(x - rt * 1.38)} ${r1(yt - h * 0.07)} Q ${r1(x - rt * 1.12)} ${r1(yt + h * 0.005)} ${r1(x - rt * 0.92)} ${r1(yt + rt * K * 0.55)}`} fill="#EEF8FB" fillOpacity={0.4} stroke={GLASS_EDGE} strokeWidth={sw} strokeLinejoin="round" />
      {/* контур стекла */}
      <path d={vesselPath(JUG_PROFILE, x, y, h)} fill="none" stroke={GLASS_EDGE} strokeWidth={sw} opacity={0.9} />
      {/* блики: справа длинный (окно), слева короткий */}
      <path d={`M ${r1(hl.start.x)} ${r1(hl.start.y)}${hl.d}`} fill="none" stroke="#FFFFFF" strokeWidth={h * 0.028} strokeLinecap="round" opacity={0.8} />
      <path d={`M ${r1(x - 0.2 * h)} ${r1(y - 0.24 * h)} Q ${r1(x - 0.235 * h)} ${r1(y - 0.36 * h)} ${r1(x - 0.215 * h)} ${r1(y - 0.47 * h)}`} fill="none" stroke="#FFFFFF" strokeWidth={h * 0.016} strokeLinecap="round" opacity={0.65} />
      <circle cx={x + 0.14 * h} cy={y - 0.83 * h} r={h * 0.012} fill="#FFFFFF" opacity={0.9} />
    </World>
  );
};

// Небольшой стакан из прозрачного стекла с водой; (x, y) — центр дна.
const CUP_PROFILE: Profile = [
  [0, 0.3],
  [0.5, 0.335],
  [1, 0.37],
];
export const CupView: React.FC<{ readonly x: number; readonly y: number; readonly h: number }> = ({ x, y, h }) => {
  const sw = Math.max(0.5, h * 0.018);
  const rt = 0.37 * h;
  const rb = 0.3 * h;
  return (
    <World>
      <ellipse cx={x - h * 0.06} cy={y + 0.8} rx={h * 0.4} ry={h * 0.4 * K * 0.8} fill="#3A2A1A" opacity={0.12} />
      <path d={vesselPath(CUP_PROFILE, x, y, h)} fill="#E6F3F7" opacity={0.3} />
      <Water prof={CUP_PROFILE} x={x} y={y} h={h} tb={0.1} tw={0.64} wall={h * 0.03} />
      <ellipse cx={x} cy={y} rx={rb} ry={rb * K} fill="#D7ECF2" opacity={0.6} stroke={GLASS_EDGE} strokeWidth={sw * 0.8} />
      <ellipse cx={x} cy={y - h} rx={rt} ry={rt * K} fill="none" stroke={GLASS_EDGE} strokeWidth={sw} />
      <path d={vesselPath(CUP_PROFILE, x, y, h)} fill="none" stroke={GLASS_EDGE} strokeWidth={sw} opacity={0.9} />
      <path d={`M ${r1(x + rb * 0.62)} ${r1(y - h * 0.14)} L ${r1(x + rt * 0.66)} ${r1(y - h * 0.88)}`} stroke="#FFFFFF" strokeWidth={h * 0.05} strokeLinecap="round" opacity={0.75} />
      <path d={`M ${r1(x - rb * 0.7)} ${r1(y - h * 0.3)} L ${r1(x - rt * 0.72)} ${r1(y - h * 0.62)}`} stroke="#FFFFFF" strokeWidth={h * 0.028} strokeLinecap="round" opacity={0.6} />
    </World>
  );
};

// ======================= дастархан =======================
// Длинная полоса светлой ткани на ковре (вид чуть сверху, глубина ≈ 40 px):
// скромная кайма с ромбиками вдоль длинных краёв. y — средняя линия.
export const Dastarkhan: React.FC<{ readonly x1: number; readonly x2: number; readonly y: number; readonly uid: string }> = ({ x1, x2, y, uid }) => {
  const D = 40;
  const yB = y - D / 2;
  const yF = y + D / 2;
  const w = x2 - x1;
  const id = `${uid}-dk`;
  const band = (yc: number, hgt: number) => {
    const step = 15;
    const n = Math.floor((w - 16) / step);
    const x0 = x1 + (w - n * step) / 2;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const cx = x0 + i * step;
      d += `M ${r1(cx - 3.6)} ${r1(yc)} L ${r1(cx)} ${r1(yc - hgt)} L ${r1(cx + 3.6)} ${r1(yc)} L ${r1(cx)} ${r1(yc + hgt)} Z `;
    }
    return d;
  };
  const creases = [0.18, 0.41, 0.63, 0.86];
  return (
    <World>
      <defs>
        <linearGradient id={`${id}-cloth`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#EDE2CA" />
          <stop offset="1" stopColor="#F7EEDB" />
        </linearGradient>
      </defs>
      {/* тень на ковре и тонкий край ткани */}
      <rect x={x1 - 3} y={yB + 3} width={w + 2} height={D + 1.5} rx={3} fill="#3A1A12" opacity={0.18} />
      <rect x={x1} y={yB + 1.6} width={w} height={D} rx={2.5} fill="#D8CAAA" />
      <rect x={x1} y={yB} width={w} height={D} rx={2.5} fill={`url(#${id}-cloth)`} />
      {/* кайма: полоски и ромбики */}
      {[yB + 4.5, yF - 5.5].map((yc, i) => (
        <g key={i}>
          <rect x={x1 + 6} y={yc - 2.6} width={w - 12} height={5.2} fill="#B9614A" opacity={0.85} />
          <path d={band(yc, 1.9)} fill="#F3E7CC" />
          <rect x={x1 + 6} y={yc + (i ? -4.6 : 3.8)} width={w - 12} height={0.8} fill="#7F8F5A" opacity={0.7} />
        </g>
      ))}
      {/* подрубленные концы и мягкие заломы */}
      <rect x={x1} y={yB} width={5} height={D} rx={2} fill="#E2D5B8" />
      <rect x={x2 - 5} y={yB} width={5} height={D} rx={2} fill="#E2D5B8" />
      {/* прямые заломы от хранения в сложенном виде: тень и свет рядом */}
      {creases.map((c, i) => (
        <g key={i}>
          <line x1={r1(x1 + w * c)} y1={yB + 8} x2={r1(x1 + w * c + 1.5)} y2={yF - 9} stroke="#DCCFB3" strokeWidth={1.2} opacity={0.45} />
          <line x1={r1(x1 + w * c + 1.3)} y1={yB + 8} x2={r1(x1 + w * c + 2.8)} y2={yF - 9} stroke="#FFFFFF" strokeWidth={0.8} opacity={0.4} />
        </g>
      ))}
    </World>
  );
};

// ======================= Коран на полке =======================
// Закрытый Коран (зелёная обложка с геометрической рамкой и восьмиконечной
// звездой — без букв) на складной подставке-рехале (X); ножки — на доске
// полки y, центр x, w — ширина подставки.
export const QuranOnShelf: React.FC<{ readonly x: number; readonly y: number; readonly w: number }> = ({ x, y, w }) => {
  const sw = Math.max(0.6, w * 0.014);
  // подставка: две дощечки крест-накрест, перекрестье на высоте 0,24 w
  const legW = w * 0.09;
  const cy = y - w * 0.237; // ось перекрестья
  // книга: наклонена назад на подставке, обложкой к зрителю
  const bw = w * 0.74;
  const bh = w * 0.92;
  const bx = x - bw / 2 + w * 0.02;
  const by = y - w * 0.36 - bh;
  const pg = w * 0.05; // толщина блока страниц
  const r = w * 0.03;
  const star = (cx: number, cy2: number, R: number) => {
    const sq = (a0: number) =>
      [0, 1, 2, 3].map((i) => {
        const a = a0 + (i * Math.PI) / 2;
        return { x: cx + Math.cos(a) * R, y: cy2 + Math.sin(a) * R };
      });
    return `${poly(sq(Math.PI / 4))} ${poly(sq(0))}`;
  };
  const board = (x1: number, y1: number, x2: number, y2: number, fill: string) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const L = Math.hypot(dx, dy);
    const nx = (-dy / L) * (legW / 2);
    const ny = (dx / L) * (legW / 2);
    return <path d={poly([{ x: x1 + nx, y: y1 + ny }, { x: x2 + nx, y: y2 + ny }, { x: x2 - nx, y: y2 - ny }, { x: x1 - nx, y: y1 - ny }])} fill={fill} stroke="#5E3F27" strokeWidth={sw} strokeLinejoin="round" />;
  };
  const bcx = bx + bw / 2;
  const bcy = by + bh / 2;
  return (
    <World>
      {/* тень на стене (влево — свет из окна справа) и на полке */}
      <rect x={bx - w * 0.05} y={by + w * 0.03} width={bw} height={bh} rx={r * 2} fill="#5A4226" opacity={0.07} />
      <ellipse cx={x - w * 0.04} cy={y + 1} rx={w * 0.56} ry={w * 0.06} fill="#3A2A1A" opacity={0.18} />
      {/* дальняя дощечка рехаля */}
      {board(x + w * 0.42, y, x - w * 0.3, y - w * 0.43, "#7C5536")}
      {/* книга: блок страниц справа и снизу, корешок слева */}
      <rect x={bx + pg * 0.6} y={by + pg * 0.7} width={bw} height={bh} rx={r} fill="#EFE4CB" stroke="#CDBF9E" strokeWidth={sw * 0.8} />
      {[0.3, 0.55, 0.8].map((k) => (
        <line key={k} x1={bx + bw + pg * 0.6 - 0.6} y1={by + bh * k} x2={bx + bw + pg * 0.6 - 0.6} y2={by + bh * k + bh * 0.12} stroke="#D9CCAD" strokeWidth={sw * 0.6} />
      ))}
      <rect x={bx} y={by} width={bw} height={bh} rx={r} fill="#2F6B4F" stroke="#21503B" strokeWidth={sw} />
      <rect x={bx} y={by} width={bw * 0.11} height={bh} rx={r} fill="#245A41" />
      <line x1={bx + bw * 0.11} y1={by + 1} x2={bx + bw * 0.11} y2={by + bh - 1} stroke="#1C4733" strokeWidth={sw} />
      {/* рамка и угловые элементы (геометрия, без надписей) */}
      <rect x={bx + bw * 0.2} y={by + bh * 0.08} width={bw * 0.7} height={bh * 0.84} rx={r * 0.5} fill="none" stroke="#D2B56A" strokeWidth={sw * 1.3} />
      <rect x={bx + bw * 0.25} y={by + bh * 0.12} width={bw * 0.6} height={bh * 0.76} rx={r * 0.4} fill="none" stroke="#C9A961" strokeWidth={sw * 0.7} opacity={0.85} />
      {[
        [bx + bw * 0.25, by + bh * 0.12],
        [bx + bw * 0.85, by + bh * 0.12],
        [bx + bw * 0.25, by + bh * 0.88],
        [bx + bw * 0.85, by + bh * 0.88],
      ].map(([cx, cy2], i) => (
        <path key={i} d={star(cx, cy2, w * 0.035)} fill="#D2B56A" opacity={0.9} />
      ))}
      <path d={star(bcx + bw * 0.05, bcy, w * 0.13)} fill="none" stroke="#D9BC70" strokeWidth={sw * 1.2} strokeLinejoin="round" />
      <circle cx={bcx + bw * 0.05} cy={bcy} r={w * 0.045} fill="none" stroke="#D9BC70" strokeWidth={sw} />
      <circle cx={bcx + bw * 0.05} cy={bcy} r={w * 0.014} fill="#D9BC70" />
      {/* свет на правой кромке обложки */}
      <line x1={bx + bw - sw} y1={by + r} x2={bx + bw - sw} y2={by + bh - r} stroke="#5E9B7C" strokeWidth={sw * 1.2} opacity={0.8} />
      {/* ближняя дощечка рехаля: её верхний край держит низ книги */}
      {board(x - w * 0.42, y, x + w * 0.3, y - w * 0.385, "#946A47")}
      <circle cx={x + w * 0.023} cy={cy} r={legW * 0.32} fill="#C9A274" stroke="#5E3F27" strokeWidth={sw * 0.6} />
    </World>
  );
};

// ======================= подоконник =======================
// Бумажная лодочка из 80-1-5 и раскрытая папка «Наши вопросы» с рисунком
// Земли, поставленная на подоконник «домиком» (половинки под углом, корешок
// дальше от камеры): слева — обложка с надписью, справа — рисунок.
// y — верх доски подоконника.
export const SillDisplay: React.FC<{ readonly boatX: number; readonly folderX: number; readonly folderW: number; readonly y: number }> = ({ boatX, folderX, folderW, y }) => {
  const half = FOLDER_W / 2;
  const hw = (folderW / 2) * 0.94; // половинка, повёрнутая на ~20°
  const fh = folderW * (FOLDER_H / FOLDER_W) * 0.95; // чуть наклонена назад
  const rise = (folderW / 2) * 0.34 * K; // корешок дальше — выше в кадре
  const sx = hw / half;
  const sy = fh / FOLDER_H;
  const left = `matrix(${sx} ${-rise / half} 0 ${sy} ${folderX - hw} ${y - fh})`;
  const right = `matrix(${sx} ${rise / half} 0 ${sy} ${folderX} ${y - fh - rise})`;
  const ek = 168 / SHEET_W;
  return (
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      <World>
        {/* тень папки на подоконнике */}
        <path d={`M ${folderX - hw - 2} ${y + 1} L ${folderX} ${y - rise + 1} L ${folderX + hw + 2} ${y + 1} L ${folderX + hw - 4} ${y + 4} L ${folderX - hw - 6} ${y + 4} Z`} fill="#3A2A1A" opacity={0.14} />
        {/* левая половинка: обложка с надписью */}
        <g transform={left}>
          <svg x={0} y={0} width={half} height={FOLDER_H} viewBox={`0 0 ${half} ${FOLDER_H}`} overflow="hidden">
            <FolderContent />
          </svg>
        </g>
        {/* правая половинка: рисунок Земли вложен в папку */}
        <g transform={right}>
          <svg x={0} y={0} width={half} height={FOLDER_H} viewBox={`${half} 0 ${half} ${FOLDER_H}`} overflow="hidden">
            <FolderContent />
            <g transform={`translate(${half + 21} ${60}) rotate(2) scale(${ek})`}>
              <rect x={3} y={5} width={SHEET_W} height={SHEET_H} rx={4} fill="#000" opacity={0.12} />
              <EarthSheetContent len={EARTH_TOTAL} />
            </g>
          </svg>
          {/* половинка чуть в тени (отвёрнута от окна) */}
          <rect x={0} y={0} width={half} height={FOLDER_H} rx={8} fill="#5A4226" opacity={0.07} />
        </g>
        {/* корешок */}
        <line x1={folderX} y1={y - fh - rise} x2={folderX} y2={y - rise} stroke="#A9895F" strokeWidth={1.2} />
      </World>
      {/* лодочка: низ корпуса — на подоконнике */}
      <World>
        <ellipse cx={boatX - 2} cy={y + 1} rx={30} ry={3.2} fill="#3A2A1A" opacity={0.14} />
      </World>
      <PaperBoat x={boatX} y={y - 12} />
    </div>
  );
};
