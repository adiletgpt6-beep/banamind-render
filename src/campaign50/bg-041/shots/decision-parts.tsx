// Детали сцены «decision» (вид сверху на семейный стол): стол с дорожкой
// в кыргызском орнаменте, жёлтая папка «Биздин чечим» (обложка
// поворачивается в 3D вокруг корешка), карточка первой полной пробной
// поездки с двумя мини-картами, лист с пунктом «Улантабыз», руки
// родителей сверху (мама — оранжевый свитер, папа — голубая рубашка),
// стрелка «проба → решение». Всё — чистые функции параметров.
import { fontFamily } from "../../../fonts";
import { ArrowText, box, CheckIcon, clamp01, HouseIcon, mix, NAVY, NAVY_SOFT, popScale, SchoolIcon, YELLOW, YELLOW_DEEP } from "../art";
import { BG41_TEXT } from "../script";

const T = BG41_TEXT.decision;

// ---------- Геометрия (мировые px, кадр при z = 1 — весь ролик 1080×1920) ----------
// Раскрытая папка: левая половина — обложка (внутри карточка пробы),
// правая — задняя сторона с листом решения. Корешок — x = 540.
export const SPINE = 540;
export const PAGE_W = 474;
export const FOLDER_TOP = 610;
export const FOLDER_H = 690;
export const FOLDER_CY = FOLDER_TOP + FOLDER_H / 2; // 955
// перспектива обложки: «камера» над корешком
export const PERSP = 2200;
// карточка пробы на внутренней стороне обложки (локально в обложке)
export const CARD = { x: 26, y: 30, w: 422, h: 630 } as const;
export const CARD_WORLD = { x: SPINE - PAGE_W + CARD.x, y: FOLDER_TOP + CARD.y } as const;
export const CARD_C = { x: CARD_WORLD.x + CARD.w / 2, y: CARD_WORLD.y + CARD.h / 2 } as const;
// мини-карты на карточке (локально в карточке)
export const STRIP = { x: 20, w: 382, h: 130, y1: 262, y2: 484 } as const;
// лист решения на задней стороне (локально в половине папки)
export const PAPER = { x: 22, y: 30, w: 430, h: 630 } as const;
export const CHECKBOX = { x: SPINE + PAPER.x + 34, y: FOLDER_TOP + PAPER.y + 240, s: 66 } as const;
// галочка (локально в квадрате)
export const TICK = [
  { x: 14, y: 36 },
  { x: 28, y: 50 },
  { x: 54, y: 15 },
] as const;

// ---------- Полилинии со скруглёнными углами (маршрут машины) ----------
export type Pt = { readonly x: number; readonly y: number };

const roundPoly = (pts: readonly Pt[], r: number): Pt[] => {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const d1 = Math.hypot(b.x - a.x, b.y - a.y);
    const d2 = Math.hypot(c.x - b.x, c.y - b.y);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const p1 = { x: b.x + ((a.x - b.x) / d1) * rr, y: b.y + ((a.y - b.y) / d1) * rr };
    const p2 = { x: b.x + ((c.x - b.x) / d2) * rr, y: b.y + ((c.y - b.y) / d2) * rr };
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      out.push({ x: (1 - t) ** 2 * p1.x + 2 * (1 - t) * t * b.x + t * t * p2.x, y: (1 - t) ** 2 * p1.y + 2 * (1 - t) * t * b.y + t * t * p2.y });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

// точка на полилинии по доле длины u, с направлением (градусы)
export const along = (poly: readonly Pt[], u: number) => {
  const lens: number[] = [0];
  for (let i = 1; i < poly.length; i++) lens.push(lens[i - 1] + Math.hypot(poly[i].x - poly[i - 1].x, poly[i].y - poly[i - 1].y));
  const total = lens[lens.length - 1];
  const d = clamp01(u) * total;
  let i = 1;
  while (i < poly.length - 1 && lens[i] < d) i++;
  const a = poly[i - 1];
  const b = poly[i];
  const seg = Math.max(1e-6, lens[i] - lens[i - 1]);
  const t = clamp01((d - lens[i - 1]) / seg);
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), ang: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
};

const polyD = (poly: readonly Pt[]) => poly.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

// маршруты на мини-картах (локально в полосе карты 382×130)
// утро: дом слева → школа справа; после уроков: школа слева → дом справа
const LEG_PTS: Record<1 | 2, readonly Pt[]> = {
  1: [
    { x: 64, y: 96 },
    { x: 150, y: 96 },
    { x: 150, y: 36 },
    { x: 318, y: 36 },
  ],
  2: [
    { x: 64, y: 36 },
    { x: 250, y: 36 },
    { x: 250, y: 96 },
    { x: 318, y: 96 },
  ],
};
export const LEG_POLY: Record<1 | 2, Pt[]> = { 1: roundPoly(LEG_PTS[1], 20), 2: roundPoly(LEG_PTS[2], 20) };

// ---------- Стол ----------
// Кремово-древесная столешница, тёплый вечерний свет лампы, дорожка с
// упрощённым орнаментом «кочкор мүйүз», пиала чая, очки.
const Horn: React.FC<{ readonly x: number; readonly y: number; readonly c: string }> = ({ x, y, c }) => (
  <g transform={`translate(${x} ${y})`}>
    <path
      d="M 0 18 L 0 2 C 0 -14 -22 -16 -26 -2 C -29 8 -18 14 -12 6 M 0 2 C 0 -14 22 -16 26 -2 C 29 8 18 14 12 6"
      fill="none"
      stroke={c}
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M 0 26 L 8 36 L 0 46 L -8 36 Z" fill={c} />
  </g>
);

export const Table: React.FC<{ readonly glow?: number }> = ({ glow = 1 }) => (
  <>
    <div style={box({ left: -900, top: -900, width: 2880, height: 3900, background: "linear-gradient(165deg, #F3E2C6 0%, #EBD3AE 55%, #E6CBA2 100%)" })} />
    {/* волокна дерева */}
    {Array.from({ length: 22 }, (_, i) => (
      <div
        key={i}
        style={box({
          left: -900,
          top: -700 + i * 150 + ((i * 37) % 50),
          width: 2880,
          height: 3 + (i % 3),
          borderRadius: 3,
          backgroundColor: "rgba(160,110,60,0.10)",
          transform: `rotate(${((i % 5) - 2) * 0.25}deg)`,
        })}
      />
    ))}
    {/* дорожка-скатерть с орнаментом */}
    <div style={box({ left: 380, top: -900, width: 320, height: 3900, backgroundColor: "#C9563F", boxShadow: "0 4px 10px rgba(120,60,30,0.18)" })}>
      <div style={box({ left: 14, top: 0, width: 14, height: "100%", backgroundColor: YELLOW_DEEP })} />
      <div style={box({ right: 14, top: 0, width: 14, height: "100%", backgroundColor: YELLOW_DEEP })} />
      <div style={box({ left: 34, top: 0, width: 4, height: "100%", backgroundColor: "#F7E3B0", opacity: 0.8 })} />
      <div style={box({ right: 34, top: 0, width: 4, height: "100%", backgroundColor: "#F7E3B0", opacity: 0.8 })} />
      <svg width={320} height={3900} viewBox="0 0 320 3900" style={box({ left: 0, top: 0 })}>
        {Array.from({ length: 33 }, (_, i) => (
          <Horn key={i} x={160} y={40 + i * 120} c={i % 2 ? "#F7E3B0" : YELLOW_DEEP} />
        ))}
      </svg>
    </div>
    {/* блокнот и карандаш (без еды и напитков на столе) */}
    <svg width={1} height={1} style={{ position: "absolute", left: 150, top: 1440, overflow: "visible" }}>
      <g transform="rotate(-10)">
        <rect x={-78} y={-66} width={156} height={132} rx={12} fill="rgba(120,70,30,0.14)" transform="translate(8 10)" />
        <rect x={-78} y={-66} width={156} height={132} rx={12} fill="#FFFFFF" stroke="#D5DEEA" strokeWidth={4} />
        {[-30, -6, 18, 42].map((ly) => (
          <path key={ly} d={`M -56 ${ly} L 56 ${ly}`} stroke="#C9D6EA" strokeWidth={4} strokeLinecap="round" />
        ))}
        <rect x={-78} y={-66} width={156} height={22} rx={10} fill="#3E6FB8" />
      </g>
      <g transform="translate(70 40) rotate(-38)">
        <rect x={-8} y={-90} width={16} height={150} rx={4} fill={"#F2B630"} stroke="#14284B" strokeWidth={3} />
        <path d="M -8 60 L 0 84 L 8 60 Z" fill="#E8C9A0" stroke="#14284B" strokeWidth={3} strokeLinejoin="round" />
      </g>
    </svg>
    {/* очки папы */}
    <svg width={1} height={1} style={{ position: "absolute", left: 915, top: 1385, overflow: "visible" }}>
      <g transform="rotate(-18)">
        <ellipse cx={-48} cy={0} rx={40} ry={30} fill="rgba(210,230,250,0.55)" stroke="#3B2E28" strokeWidth={7} />
        <ellipse cx={48} cy={0} rx={40} ry={30} fill="rgba(210,230,250,0.55)" stroke="#3B2E28" strokeWidth={7} />
        <path d="M -10 -4 Q 0 -14 10 -4" fill="none" stroke="#3B2E28" strokeWidth={6} />
        <path d="M -88 -6 L -128 -40 M 88 -6 L 128 -40" stroke="#3B2E28" strokeWidth={6} strokeLinecap="round" />
      </g>
    </svg>
    {/* тёплый вечерний свет лампы (светлый, без затемнения) */}
    <div
      style={box({
        left: -900,
        top: -900,
        width: 2880,
        height: 3900,
        background: "radial-gradient(circle at 34% 30%, rgba(255,218,150,0.55) 0%, rgba(255,218,150,0.18) 22%, rgba(255,218,150,0) 40%)",
        opacity: glow,
      })}
    />
  </>
);

// ---------- Мини-карта маршрута ----------
// Светло-голубая карта (#EAF1FB), белые улицы, жёлтая линия маршрута.
// Полоса 382×130; grow 0…1 — карта «разворачивается» вверх и вниз
// (улицы продолжаются) до размера кадра при финальном въезде камеры.
const H_STREETS = Array.from({ length: 16 }, (_, i) => 36 + 60 * (i - 7));
const V_STREETS = [-270, -160, -50, 70, 150, 250, 330, 440, 550, 660];
const MAP_VB = { x: -300, y: -420, w: 1000, h: 980 } as const;

const MapBase: React.FC = () => (
  <>
    <rect x={MAP_VB.x} y={MAP_VB.y} width={MAP_VB.w} height={MAP_VB.h} fill="#EAF1FB" />
    {/* кварталы: скверы и дома */}
    {H_STREETS.slice(0, -1).map((y0, i) =>
      V_STREETS.slice(0, -1).map((x0, j) => {
        const k = (i * 7 + j * 3) % 6;
        if (k > 1) return null;
        const x1 = V_STREETS[j + 1];
        const y1 = H_STREETS[i + 1];
        return <rect key={`${i}-${j}`} x={x0 + 11} y={y0 + 10} width={x1 - x0 - 22} height={y1 - y0 - 20} rx={8} fill={k === 0 ? "#D5ECD9" : "#DCE6F4"} />;
      }),
    )}
    {/* улицы */}
    {H_STREETS.map((y) => (
      <rect key={`h${y}`} x={MAP_VB.x} y={y - (y === 96 ? 8 : 6)} width={MAP_VB.w} height={y === 96 ? 16 : 12} fill="#FFFFFF" />
    ))}
    {V_STREETS.map((x) => (
      <rect key={`v${x}`} x={x - (x === 150 ? 8 : 6)} y={MAP_VB.y} width={x === 150 ? 16 : 12} height={MAP_VB.h} fill="#FFFFFF" />
    ))}
  </>
);

// маленькая белая машина BalaGo сверху (жёлтые полосы по бокам), носом по +x
const TinyCar: React.FC<{ readonly x: number; readonly y: number; readonly ang: number; readonly alpha: number }> = ({ x, y, ang, alpha }) =>
  alpha <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${ang})`} opacity={alpha}>
      <ellipse cx={2} cy={4} rx={25} ry={15} fill="rgba(20,40,75,0.2)" />
      <rect x={-22} y={-12.5} width={44} height={25} rx={8} fill="#FFFFFF" stroke={NAVY} strokeWidth={2.6} />
      <rect x={-20} y={-11} width={40} height={4} rx={2} fill={YELLOW} />
      <rect x={-20} y={7} width={40} height={4} rx={2} fill={YELLOW} />
      <rect x={6} y={-8} width={8} height={16} rx={2.5} fill="#BFD8F2" stroke={NAVY} strokeWidth={1.4} />
      <rect x={-16} y={-7.5} width={5} height={15} rx={2} fill="#BFD8F2" stroke={NAVY} strokeWidth={1.4} />
      <rect x={20} y={-10} width={3} height={5} rx={1} fill="#FFE58A" />
      <rect x={20} y={5} width={3} height={5} rx={1} fill="#FFE58A" />
    </g>
  );

export const MapStrip: React.FC<{
  readonly leg: 1 | 2;
  readonly top: number;
  readonly route: number; // 0…1 — пройденная часть маршрута (сплошная жёлтая)
  readonly car?: { readonly u: number; readonly alpha: number } | null;
  readonly grow?: number;
  readonly icons?: number;
}> = ({ leg, top, route, car, grow = 0, icons = 1 }) => {
  const poly = LEG_POLY[leg];
  const g = clamp01(grow);
  // видимая область полосы (локально)
  const r = { x0: mix(0, -280, g), y0: mix(0, -400, g), x1: mix(STRIP.w, STRIP.w + 290, g), y1: mix(STRIP.h, STRIP.h + 410, g) };
  const rad = 16 * (1 - g);
  const inset = `inset(${r.y0 - MAP_VB.y}px ${MAP_VB.x + MAP_VB.w - r.x1}px ${MAP_VB.y + MAP_VB.h - r.y1}px ${r.x0 - MAP_VB.x}px round ${rad}px)`;
  const c = car ? along(poly, car.u) : null;
  const home = leg === 1 ? { x: 40, y: 96 } : { x: 342, y: 96 };
  const school = leg === 1 ? { x: 342, y: 36 } : { x: 40, y: 36 };
  return (
    <div style={box({ left: STRIP.x, top, width: STRIP.w, height: STRIP.h })}>
      <div style={box({ left: MAP_VB.x, top: MAP_VB.y, width: MAP_VB.w, height: MAP_VB.h, clipPath: inset })}>
        <svg width={MAP_VB.w} height={MAP_VB.h} viewBox={`${MAP_VB.x} ${MAP_VB.y} ${MAP_VB.w} ${MAP_VB.h}`} style={box({ left: 0, top: 0 })}>
          <MapBase />
          {/* запланированный маршрут — пунктир */}
          <path d={polyD(poly)} fill="none" stroke={YELLOW_DEEP} strokeWidth={6} strokeDasharray="9 10" strokeLinecap="round" opacity={0.75} />
          {/* пройденный маршрут — сплошная жёлтая линия с контуром */}
          {route > 0 ? (
            <>
              <path d={polyD(poly)} fill="none" stroke={NAVY} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(route)} />
              <path d={polyD(poly)} fill="none" stroke={YELLOW} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(route)} />
            </>
          ) : null}
          {c && car ? <TinyCar x={c.x} y={c.y} ang={c.ang} alpha={car.alpha} /> : null}
          {icons > 0 ? (
            <g opacity={icons}>
              <circle cx={home.x} cy={home.y} r={25} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
              <g transform={`translate(${home.x - 19} ${home.y - 20})`}>
                <HouseIcon size={38} />
              </g>
              <circle cx={school.x} cy={school.y} r={25} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
              <g transform={`translate(${school.x - 19} ${school.y - 20})`}>
                <SchoolIcon size={38} />
              </g>
            </g>
          ) : null}
        </svg>
      </div>
      <div style={box({ left: r.x0, top: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0, borderRadius: rad, boxShadow: `inset 0 0 0 3px rgba(74,93,128,${0.35 * (1 - g)})` })} />
    </div>
  );
};

// ---------- Карточка «Биринчи толук сыноо сапары» ----------
export type CardState = {
  readonly check1: number;
  readonly check2: number;
  readonly stamp: number;
  readonly route1: number;
  readonly route2: number;
  readonly car1?: { readonly u: number; readonly alpha: number } | null;
  readonly car2?: { readonly u: number; readonly alpha: number } | null;
  readonly lift?: number; // 0…1 — карточка приподнимается (инфографика)
  readonly grow?: number; // 0…1 — карта 1 разворачивается
  readonly icons?: number;
};

const words = T.trialTitle.split(" ");
const TITLE_LINES = [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
const LEGS = [T.legMorning, T.legAfter].map((s) => {
  const i = s.indexOf(":");
  return { when: s.slice(0, i), route: s.slice(i + 1).trim() };
});

const LegHead: React.FC<{ readonly top: number; readonly i: 0 | 1; readonly check: number }> = ({ top, i, check }) => (
  <div style={box({ left: 0, top, width: CARD.w, height: 76 })}>
    <div style={box({ left: 24, top: 0, fontSize: 27, fontWeight: 800, color: NAVY_SOFT, lineHeight: 1 })}>{LEGS[i].when}</div>
    <div style={box({ left: 22, top: 32, fontSize: 34, fontWeight: 1000, color: NAVY, lineHeight: 1, display: "flex", alignItems: "center", whiteSpace: "nowrap", letterSpacing: 0.5 })}>
      <ArrowText text={LEGS[i].route} size={34} arrowColor={YELLOW_DEEP} />
    </div>
    <div
      style={box({
        left: CARD.w - 74,
        top: 8,
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: check > 0 ? YELLOW : "#FFFFFF",
        boxShadow: `inset 0 0 0 4px ${NAVY}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${check > 0 ? 1 + 0.12 * Math.sin(Math.PI * clamp01(check)) : 1})`,
      })}
    >
      <CheckIcon size={36} color={NAVY} draw={check} />
    </div>
  </div>
);

export const TrialCard: React.FC<{ readonly s: CardState }> = ({ s }) => {
  const lift = clamp01(s.lift ?? 0);
  const st = clamp01(s.stamp);
  return (
    <div
      style={box({
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        transform: `scale(${1 + 0.04 * lift})`,
        fontFamily,
      })}
    >
      <div
        style={box({
          inset: 0,
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          boxShadow: `0 ${6 + 18 * lift}px ${12 + 30 * lift}px rgba(90,55,20,${0.22 + 0.1 * lift}), inset 0 0 0 4px ${NAVY}`,
        })}
      />
      {/* шапка карточки */}
      <div
        style={box({
          left: 0,
          top: 0,
          width: CARD.w,
          height: 112,
          borderRadius: "24px 24px 0 0",
          backgroundColor: NAVY,
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 35,
          fontWeight: 1000,
          lineHeight: 1.12,
        })}
      >
        <div>{TITLE_LINES[0]}</div>
        <div style={{ color: YELLOW }}>{TITLE_LINES[1]}</div>
      </div>
      {/* штамп «акысыз» */}
      {st > 0 ? (
        <div style={box({ left: 0, top: 120, width: CARD.w, display: "flex", justifyContent: "center" })}>
          <div
            style={{
              transform: `rotate(-6deg) scale(${popScale(st) * (1 + 0.5 * (1 - Math.min(1, st * 1.6)))})`,
              opacity: Math.min(1, st * 2),
              padding: "4px 26px 7px",
              borderRadius: 16,
              backgroundColor: YELLOW,
              boxShadow: `inset 0 0 0 4px ${NAVY}, 0 4px 0 rgba(20,40,75,0.18)`,
              color: NAVY,
              fontSize: 36,
              fontWeight: 1000,
              lineHeight: 1,
              letterSpacing: 1,
            }}
          >
            {T.trialFree}
          </div>
        </div>
      ) : null}
      <LegHead top={182} i={0} check={s.check1} />
      <LegHead top={404} i={1} check={s.check2} />
      <MapStrip leg={2} top={STRIP.y2} route={s.route2} car={s.car2} icons={s.icons ?? 1} />
      {/* карта 1 — последней: при развороте накрывает всю карточку */}
      <MapStrip leg={1} top={STRIP.y1} route={s.route1} car={s.car1} grow={s.grow} icons={s.icons ?? 1} />
    </div>
  );
};

// ---------- Задняя сторона папки: лист «Биздин чечим» ----------
export const DecisionPage: React.FC<{ readonly tick: number; readonly pulse?: number }> = ({ tick, pulse = 0 }) => (
  <div style={box({ left: SPINE, top: FOLDER_TOP, width: PAGE_W, height: FOLDER_H, fontFamily })}>
    <div
      style={box({
        inset: 0,
        borderRadius: "6px 22px 22px 6px",
        backgroundColor: "#F7C85A",
        boxShadow: `inset 0 0 0 5px ${NAVY}, 0 14px 30px rgba(90,55,20,0.25)`,
      })}
    />
    <div style={box({ left: 0, top: 5, width: 16, height: FOLDER_H - 10, backgroundColor: "#E2A529" })} />
    <div
      style={box({
        left: PAPER.x,
        top: PAPER.y,
        width: PAPER.w,
        height: PAPER.h,
        borderRadius: 10,
        backgroundColor: "#FFFDF8",
        boxShadow: "0 4px 10px rgba(90,55,20,0.18)",
        backgroundImage: "repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 44px, #DCE6F3 44px, #DCE6F3 47px)",
        backgroundPosition: "0 150px",
        backgroundSize: "100% 47px",
        backgroundRepeat: "repeat-y",
      })}
    >
      <div style={box({ left: 0, right: 0, top: 0, height: 150, backgroundColor: "#FFFDF8", borderRadius: "10px 10px 0 0" })} />
      <div style={box({ left: 0, right: 0, top: 50, textAlign: "center", fontSize: 46, fontWeight: 1000, color: NAVY, lineHeight: 1 })}>{T.folder}</div>
      <div style={box({ left: PAPER.w / 2 - 110, top: 112, width: 220, height: 10, borderRadius: 5, backgroundColor: YELLOW })} />
    </div>
    {/* зажим листа */}
    <div style={box({ left: PAGE_W / 2 - 60, top: 14, width: 120, height: 34, borderRadius: 8, backgroundColor: NAVY })} />
    <div style={box({ left: PAGE_W / 2 - 40, top: 2, width: 80, height: 20, borderRadius: 10, border: `5px solid ${NAVY_SOFT}`, borderBottom: "none", boxSizing: "border-box" })} />
    {/* пункт «Улантабыз» */}
    <div
      style={box({
        left: CHECKBOX.x - SPINE,
        top: CHECKBOX.y - FOLDER_TOP,
        width: CHECKBOX.s,
        height: CHECKBOX.s,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        boxShadow: `inset 0 0 0 5px ${NAVY}, 0 0 0 ${4 + 10 * pulse}px rgba(255,201,40,${0.85 * pulse})`,
      })}
    >
      <svg width={CHECKBOX.s} height={CHECKBOX.s} viewBox={`0 0 ${CHECKBOX.s} ${CHECKBOX.s}`} style={{ overflow: "visible" }}>
        {tick > 0 ? (
          <path
            d={`M ${TICK[0].x} ${TICK[0].y} Q ${TICK[0].x + 6} ${TICK[0].y + 9} ${TICK[1].x} ${TICK[1].y} Q ${TICK[1].x + 10} ${TICK[1].y - 18} ${TICK[2].x} ${TICK[2].y}`}
            fill="none"
            stroke="#1D3E8A"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - clamp01(tick)}
          />
        ) : null}
      </svg>
    </div>
    <div
      style={box({
        left: CHECKBOX.x - SPINE + CHECKBOX.s + 18,
        top: CHECKBOX.y - FOLDER_TOP + CHECKBOX.s / 2 - 30,
        fontSize: 48,
        fontWeight: 1000,
        color: NAVY,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      })}
    >
      {T.choice}
    </div>
  </div>
);

// точка галочки по доле u (для кончика ручки)
export const tickPoint = (u: number): Pt => {
  const p = along(roundPoly(TICK, 4), u);
  return { x: CHECKBOX.x + p.x, y: CHECKBOX.y + p.y };
};

// ---------- Обложка папки (3D-поворот вокруг корешка) ----------
// theta 0 — лежит слева раскрытой (видна внутренняя сторона с карточкой),
// 180 — закрыта поверх листа (видна лицевая сторона с наклейкой).
const coverPoly = (theta: number) => {
  const a = (theta * Math.PI) / 180;
  const z = PAGE_W * Math.sin(a);
  const k = PERSP / (PERSP - z);
  const xe = SPINE - PAGE_W * Math.cos(a) * k;
  const yt = FOLDER_CY + (FOLDER_TOP - FOLDER_CY) * k;
  const yb = FOLDER_CY + (FOLDER_TOP + FOLDER_H - FOLDER_CY) * k;
  return { xe, yt, yb, k, z };
};

// проекция точки края обложки (y — мировая) для руки, которая её держит
export const coverEdge = (theta: number, y: number) => {
  const p = coverPoly(theta);
  return { x: p.xe, y: FOLDER_CY + (y - FOLDER_CY) * p.k, k: p.k };
};

export const CoverOutside: React.FC = () => (
  <div style={box({ inset: 0, fontFamily })}>
    <div style={box({ inset: 0, borderRadius: "6px 22px 22px 6px", backgroundColor: YELLOW_DEEP, boxShadow: `inset 0 0 0 6px ${NAVY}` })} />
    <div style={box({ left: 24, top: 24, right: 24, bottom: 24, borderRadius: 14, border: "3px solid rgba(255,236,170,0.75)" })} />
    <div style={box({ left: 0, top: 6, width: 18, bottom: 6, backgroundColor: "#DDA126" })} />
    {/* наклейка */}
    <div
      style={box({
        left: 44,
        top: 160,
        width: PAGE_W - 112,
        height: 128,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        boxShadow: `inset 0 0 0 5px ${NAVY}, 0 6px 0 rgba(20,40,75,0.16)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: NAVY,
        fontSize: 37,
        fontWeight: 1000,
        whiteSpace: "nowrap",
      })}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: YELLOW, boxShadow: `inset 0 0 0 4px ${NAVY}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckIcon size={30} />
      </div>
      {T.folder}
    </div>
    {/* резинка-застёжка */}
    <div style={box({ right: 30, top: 6, width: 14, bottom: 6, backgroundColor: NAVY, opacity: 0.85 })} />
  </div>
);

const CoverInside: React.FC<{ readonly card: CardState }> = ({ card }) => (
  <div style={box({ inset: 0 })}>
    <div style={box({ inset: 0, borderRadius: "22px 6px 6px 22px", backgroundColor: "#F7C85A", boxShadow: `inset 0 0 0 5px ${NAVY}, 0 14px 30px rgba(90,55,20,0.25)` })} />
    <div style={box({ right: 0, top: 5, width: 16, bottom: 5, backgroundColor: "#E2A529" })} />
    {/* уголки-держатели карточки */}
    {[
      [CARD.x - 6, CARD.y - 6, 0],
      [CARD.x + CARD.w - 34, CARD.y - 6, 90],
    ].map(([x, y, r], i) => (
      <div key={i} style={box({ left: x, top: y, width: 40, height: 40, transform: `rotate(${r}deg)`, background: `linear-gradient(135deg, ${NAVY_SOFT} 50%, rgba(0,0,0,0) 50%)`, borderRadius: 6 })} />
    ))}
    <TrialCard s={card} />
  </div>
);

export const FolderCover: React.FC<{ readonly theta: number; readonly card: CardState }> = ({ theta, card }) => {
  const th = Math.max(0, Math.min(180, theta));
  const p = coverPoly(th);
  const inside = th < 90;
  const sh = Math.sin((th * Math.PI) / 180);
  // тень поднятой обложки (свет слева сверху — тень вправо-вниз)
  const shX = SPINE - PAGE_W * Math.cos((th * Math.PI) / 180) + p.z * 0.32;
  return (
    <>
      {th > 0 && th < 180 ? (
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path
            d={`M ${SPINE} ${FOLDER_TOP + 10} L ${shX} ${FOLDER_TOP + 10 + p.z * 0.18} L ${shX} ${FOLDER_TOP + FOLDER_H + p.z * 0.18} L ${SPINE} ${FOLDER_TOP + FOLDER_H} Z`}
            fill={`rgba(90,55,20,${0.2 * sh})`}
          />
          {/* силуэт обложки (виден и «ребром», когда стоит вертикально) */}
          <path d={`M ${SPINE} ${FOLDER_TOP} L ${p.xe} ${p.yt} L ${p.xe} ${p.yb} L ${SPINE} ${FOLDER_TOP + FOLDER_H} Z`} fill={inside ? "#F7C85A" : YELLOW_DEEP} stroke={NAVY} strokeWidth={6} strokeLinejoin="round" />
        </svg>
      ) : null}
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, perspective: th > 0 && th < 180 ? PERSP : undefined, perspectiveOrigin: `${SPINE}px ${FOLDER_CY}px`, pointerEvents: "none" })}>
        {inside ? (
          <div
            style={box({
              left: SPINE - PAGE_W,
              top: FOLDER_TOP,
              width: PAGE_W,
              height: FOLDER_H,
              transformOrigin: "100% 50%",
              transform: th > 0 ? `rotateY(${th}deg)` : undefined,
            })}
          >
            <CoverInside card={card} />
            {th > 0 ? <div style={box({ inset: 0, borderRadius: 22, backgroundColor: `rgba(120,70,20,${0.16 * sh})` })} /> : null}
          </div>
        ) : (
          <div
            style={box({
              left: SPINE,
              top: FOLDER_TOP,
              width: PAGE_W,
              height: FOLDER_H,
              transformOrigin: "0% 50%",
              transform: th < 180 ? `rotateY(${th - 180}deg)` : undefined,
            })}
          >
            <CoverOutside />
            {th < 180 ? <div style={box({ inset: 0, borderRadius: 22, backgroundColor: `rgba(255,250,235,${0.22 * sh})` })} /> : null}
          </div>
        )}
      </div>
    </>
  );
};

// ---------- Руки родителей (вид сверху) ----------
export type ArmLook = { readonly sleeve: string; readonly sleeveShade: string; readonly skin: string; readonly skinShade: string; readonly cuff: "knit" | "shirt" };
export const MOM_ARM: ArmLook = { sleeve: "#E9A23B", sleeveShade: "#C7821E", skin: "#E4B28C", skinShade: "#C48D66", cuff: "knit" };
export const DAD_ARM: ArmLook = { sleeve: "#8DB3DE", sleeveShade: "#6890BF", skin: "#D9A680", skinShade: "#B98760", cuff: "shirt" };

export type HandPose = "point" | "pen" | "grip";
// точка «касания» в локальных координатах кисти (запястье — 0,0; пальцы — к −y)
export const HAND_TIP: Record<HandPose, Pt> = {
  point: { x: -27, y: -172 },
  pen: { x: -46, y: -196 },
  grip: { x: -2, y: -132 },
};

// запястье, при котором точка касания попадает в target
// руки крупнее «условных» — ближе к реальному размеру относительно листа A4
export const HAND_SCALE = 1.2;

export const wristFor = (pose: HandPose, target: Pt, angle: number, s0 = 1): Pt => {
  const a = (angle * Math.PI) / 180;
  const s = s0 * HAND_SCALE;
  const t = HAND_TIP[pose];
  const rx = (t.x * Math.cos(a) - t.y * Math.sin(a)) * s;
  const ry = (t.x * Math.sin(a) + t.y * Math.cos(a)) * s;
  return { x: target.x - rx, y: target.y - ry };
};

const Finger: React.FC<{ readonly x: number; readonly y: number; readonly len: number; readonly w: number; readonly ang: number; readonly look: ArmLook; readonly folded?: boolean }> = ({ x, y, len, w, ang, look, folded }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    <rect x={-w / 2} y={-len} width={w} height={len + w * 0.6} rx={w / 2} fill={folded ? look.skinShade : look.skin} stroke={look.skinShade} strokeWidth={3} />
    {!folded && len > 30 ? <ellipse cx={0} cy={-len + w * 0.62} rx={w * 0.3} ry={w * 0.4} fill="#F6D9C4" opacity={0.85} /> : null}
    {!folded && len > 50 ? <path d={`M ${-w * 0.32} ${-len * 0.45} Q 0 ${-len * 0.45 - 4} ${w * 0.32} ${-len * 0.45}`} stroke={look.skinShade} strokeWidth={2} fill="none" opacity={0.6} /> : null}
  </g>
);

const Pen: React.FC = () => (
  <g>
    <path d="M -46 -196 L -38 -172 L -52 -167 Z" fill="#3A3F4F" />
    <path d="M -38 -172 L 46 52 L 32 58 L -52 -167 Z" fill={NAVY} />
    <path d="M -24 -136 L -6 -88 L -20 -83 L -38 -131 Z" fill="#C9D2E0" />
    <path d="M 34 22 L 46 52 L 32 58 L 20 27 Z" fill={YELLOW} />
  </g>
);

export const TopArm: React.FC<{
  readonly uid: string;
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly pose: HandPose;
  readonly look: ArmLook;
  readonly s?: number;
  readonly lift?: number; // 0…1 — рука приподнята (тень дальше)
}> = ({ uid, x, y, angle, pose, look, s = 1, lift = 0 }) => {
  const L = look;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <filter id={`sh-${uid}`} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={7000} height={7000}>
          <feDropShadow dx={12 + 16 * lift} dy={18 + 22 * lift} stdDeviation={9 + 6 * lift} floodColor="#5A3714" floodOpacity={0.26} />
        </filter>
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s * HAND_SCALE})`} filter={`url(#sh-${uid})`}>
        {/* кисть */}
        <g>
          {pose === "point" ? (
            <>
              <Finger x={-4} y={-80} len={20} w={22} ang={2} look={L} folded />
              <Finger x={14} y={-78} len={17} w={21} ang={6} look={L} folded />
              <Finger x={30} y={-72} len={13} w={19} ang={12} look={L} folded />
            </>
          ) : pose === "pen" ? (
            <>
              <Finger x={14} y={-80} len={20} w={21} ang={6} look={L} folded />
              <Finger x={30} y={-72} len={14} w={19} ang={12} look={L} folded />
              <Finger x={-4} y={-82} len={44} w={22} ang={-8} look={L} />
            </>
          ) : (
            <>
              <Finger x={-24} y={-82} len={56} w={22} ang={-4} look={L} />
              <Finger x={-5} y={-86} len={64} w={22} ang={-1} look={L} />
              <Finger x={13} y={-84} len={60} w={21} ang={2} look={L} />
              <Finger x={29} y={-78} len={46} w={19} ang={6} look={L} />
            </>
          )}
          <path d="M -36 8 C -42 -18 -44 -56 -38 -84 Q -2 -96 34 -86 C 40 -58 40 -22 36 8 Z" fill={L.skin} stroke={L.skinShade} strokeWidth={3} />
          {[-22, -4, 14, 29].map((kx, i) => (
            <path key={i} d={`M ${kx - 7} ${-76 + Math.abs(kx) * 0.12} Q ${kx} ${-82 + Math.abs(kx) * 0.12} ${kx + 7} ${-76 + Math.abs(kx) * 0.12}`} stroke={L.skinShade} strokeWidth={2.2} fill="none" opacity={0.55} />
          ))}
          {pose === "point" ? (
            <>
              <Finger x={-22} y={-82} len={92} w={23} ang={-3} look={L} />
              <Finger x={-36} y={-26} len={50} w={25} ang={-30} look={L} />
            </>
          ) : pose === "pen" ? (
            <>
              <Pen />
              <Finger x={-22} y={-82} len={70} w={23} ang={-14} look={L} />
              <Finger x={-36} y={-30} len={66} w={25} ang={-26} look={L} />
            </>
          ) : (
            <Finger x={-36} y={-24} len={46} w={25} ang={-42} look={L} />
          )}
        </g>
        {/* рукав и манжета */}
        <path d="M -54 26 L -70 1500 L 70 1500 L 54 26 Q 0 10 -54 26 Z" fill={L.sleeve} stroke={L.sleeveShade} strokeWidth={4} />
        <path d="M -40 300 Q -6 316 30 296 M -46 620 Q 0 640 44 612" stroke={L.sleeveShade} strokeWidth={4} fill="none" opacity={0.55} />
        {L.cuff === "knit" ? (
          <>
            <rect x={-56} y={-4} width={112} height={48} rx={18} fill={L.sleeve} stroke={L.sleeveShade} strokeWidth={4} />
            {[-36, -18, 0, 18, 36].map((cx) => (
              <path key={cx} d={`M ${cx} 4 L ${cx} 36`} stroke={L.sleeveShade} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
            ))}
          </>
        ) : (
          <>
            <rect x={-52} y={-2} width={104} height={44} rx={10} fill={L.sleeve} stroke={L.sleeveShade} strokeWidth={4} />
            <circle cx={32} cy={20} r={6} fill="#FFFFFF" stroke={L.sleeveShade} strokeWidth={2} />
          </>
        )}
      </g>
    </svg>
  );
};

// ---------- Стрелка «проба → решение» ----------
export const DecisionArrow: React.FC<{ readonly from: Pt; readonly c1: Pt; readonly c2: Pt; readonly to: Pt; readonly draw: number; readonly opacity?: number }> = ({ from, c1, c2, to, draw, opacity = 1 }) => {
  if (draw <= 0 || opacity <= 0) return null;
  const d = `M ${from.x} ${from.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`;
  const ang = (Math.atan2(to.y - c2.y, to.x - c2.x) * 180) / Math.PI;
  const head = clamp01((draw - 0.85) / 0.15);
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }}>
      <path d={d} fill="none" stroke={NAVY} strokeWidth={17} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(draw)} />
      <path d={d} fill="none" stroke={YELLOW} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(draw)} />
      {head > 0 ? (
        <g transform={`translate(${to.x} ${to.y}) rotate(${ang}) scale(${popScale(head)})`}>
          <path d="M 12 0 L -24 -22 L -16 0 L -24 22 Z" fill={YELLOW} stroke={NAVY} strokeWidth={6} strokeLinejoin="round" />
        </g>
      ) : null}
    </svg>
  );
};

// круг-«касание» пальца
export const TapRing: React.FC<{ readonly x: number; readonly y: number; readonly u: number }> = ({ x, y, u }) =>
  u <= 0 || u >= 1 ? null : (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <circle r={14 + 46 * u} fill="none" stroke={YELLOW} strokeWidth={8 * (1 - u) + 1} opacity={1 - u} />
      <circle r={8 + 26 * u} fill="none" stroke={NAVY} strokeWidth={3} opacity={0.6 * (1 - u)} />
    </svg>
  );
