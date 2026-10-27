// Шаг 3: панель 3/6 ленты как книжка-раскладушка. Панель рисуется здесь
// (а не в Ribbon): она разворачивается на сгибе (−90° → 0°, как у Ribbon),
// затем мама наклоняет нижний край к себе (0° → TILT) — лист становится
// «полом» диорамы, и на нём по очереди встают вырезанные из бумаги слои
// (CSS 3D: каждый слой поворачивается вокруг своей линии сгиба): хребет
// Ала-Тоо, тополя, панельный дом, школа, улица, белая машина, мама и дети;
// за ними встаёт небо-задник. Утром машина везёт детей к школе,
// после уроков — обратно; мама встречает дочь у подъезда. В конце слои
// ложатся, лист возвращается плашмя — остаётся плоская печать P3Art.
// Все координаты — панели 3 (u — поперёк, v — от сгиба к нижнему краю);
// мир сцены — как у RibbonStage.
import { Car, Mountains, Poplar } from "../art";
import { box, settle, Svg } from "../kit";
import { HOUSE_H, P3_GROUND, P3_ROAD, P3_SCHOOL_DOOR, P3_WALK, P3G, P3Label, P3Picture, P3Route, SCHOOL_H, ToyHouse, ToySchool, type P3Vis } from "../panels/P3";
import { CloseHand, SKIN } from "../props/CloseHand";
import { FoldedEdge, panelTop, RIB, RIB_X } from "../ribbon";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, lerp, smoothstep } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { C, F } from "../theme";
import { CAR_HOME, CAR_SCHOOL, carTrip, carU, type Step3Plan } from "./step3-plan";

const T = BG25_TEXT.step3;

export const PERSP = 2600; // как у панелей Ribbon
export const TILT = 56; // наклон «пола» диорамы, градусы
const TOP = panelTop(3);
const POP = 16; // длительность «pop» одного слоя

export type Origin = { readonly x: number; readonly y: number };
export const ORIGIN_FLAT: Origin = { x: RIB.w / 2, y: 0 };

// Точка панели (u, v) на плоскости листа → мир сцены (с перспективой).
export const projPanel = (u: number, v: number, ang: number, o: Origin) => {
  const a = (ang * Math.PI) / 180;
  const y = v * Math.cos(a);
  const z = v * Math.sin(a);
  const s = PERSP / (PERSP - z);
  return { x: RIB_X + o.x + (u - o.x) * s, y: TOP + o.y + (y - o.y) * s, s };
};

const span = (f: number, a: number, b: number) => easeInOut((f - a) / Math.max(1, b - a));
const bump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)));
const mixHex = (a: string, b: string, t: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a);
  const B = p(b);
  return `#${A.map((v, i) => (256 + Math.round(lerp(v, B[i], clamp(t)))).toString(16).slice(1)).join("")}`;
};

// ---------- Слои диорамы ----------
// Небо — высокий бумажный задник за диорамой: встаёт от сгиба выше листа и
// закрывает панель 2. Он плоский (дальний слой), поэтому рисуется 2D в мире
// ленты: огромная 3D-карточка с сильной перспективой рисуется Chromium
// с обрезанными тайлами.
const SKY = { x: RIB_X - 120, w: RIB.w + 240, h: 1180, below: 30 } as const;
const SKY_U = RIB_X - SKY.x; // u панели → x внутри задника
const FAR = { u0: 0, w: 820, v: 150, h: 178 } as const;
const NEAR = { u0: 350, w: 470, v: 206, h: 116 } as const;
const BACK: readonly (readonly [number, number, number])[] = [
  [34, 300, 142],
  [300, 302, 156],
  [330, 306, 126],
  [500, 300, 140],
  [776, 296, 134],
];
const FRONT: readonly (readonly [number, number, number])[] = [
  [292, 443, 132],
  [318, 445, 106],
  [494, 443, 120],
];
const SHRUBS: readonly (readonly [number, number])[] = [
  [64, 30],
  [214, 26],
  [430, 32],
  [598, 27],
  [770, 30],
];
const SHRUB_V = 596;
const HOUSE = { u0: P3G.house.x - 10, w: P3G.house.w + 20, v: P3G.base, h: HOUSE_H + 16 } as const;
const SCHOOL = { u0: P3G.school.x - 12, w: P3G.school.w + 24, v: P3G.base, h: SCHOOL_H + 4 } as const;

// Машина: белая легковая из art.tsx (дети пристёгнуты, водитель).
// Машина идёт по ближней полосе; дети выходят на тротуар (за машиной) и
// видны над её крышей.
const CAR_S = 0.52;
const CAR_W = 440 * CAR_S;
const CAR_CX = CAR_W / 2 + 12;
const CAR_V = 520;
// окна детей относительно центра машины (машина смотрит вправо)
const WIN_BOY = (160 - 220) * CAR_S;
const WIN_GIRL = (214 - 220) * CAR_S;

// Люди (рост, мировые px) и линии их «прорезей» на полу.
const MOM_H = 112;
const GIRL_H = 84;
const BOY_H = 82;
const MOM_V = 450;
const GIRL_V = 446;
const BOY_V = 447;
const MOM_X = 110;
const GIRL_HOME = MOM_X + 36;
const GIRL_MEET = MOM_X + 32;
const PEOPLE_H = 190;
// кисть опущенной руки мамы (как REST в Figure), мировые px от ступней
const REST_R = { x: 0.086 * MOM_H, y: -0.47 * MOM_H } as const;

// ---------- Состояние по кадру ----------
// Подъём слоя: 0 — лежит в печати, 1 — стоит (с упругим перелётом),
// в конце — плавно ложится обратно за FOLD кадров.
const FOLD = 13;
const riseAt = (f: number, at: number, down: number, dur = POP) => settle(f - at, dur) * (1 - easeInOut((f - down) / FOLD));

// Начало складывания слоя (кадры от P.downA). Слои ложатся назад сзади
// вперёд: каждый ложится поверх уже лёгших дальних и всегда стоит круче
// дальнего — плоскости не пересекаются (иначе Chromium режет фигурки
// мамы и дочки карточкой дома). Небо — последним: пока плашка условия
// возвращается на бумагу, оно ещё закрывает панель 2.
const FOLD_AT = { far: 0, near: 1, back: 2, house: 3, school: 3, front: 5, people: 6, car: 7, shrubs: 8, sky: 14 } as const;

export const layerRises = (f: number, P: Step3Plan) => {
  const d = P.downA;
  const o = FOLD_AT;
  return {
    sky: riseAt(f, P.pop.sky, d + o.sky, 24),
    far: riseAt(f, P.pop.far, d + o.far),
    near: riseAt(f, P.pop.near, d + o.near),
    back: BACK.map((_, i) => riseAt(f, P.pop.back + i * 3, d + o.back)),
    house: riseAt(f, P.pop.house, d + o.house),
    school: riseAt(f, P.pop.school, d + o.school),
    front: FRONT.map((_, i) => riseAt(f, P.pop.front + i * 3, d + o.front)),
    shrubs: SHRUBS.map((_, i) => riseAt(f, P.pop.shrubs + i * 2, d + o.shrubs)),
    car: riseAt(f, P.pop.car, d + o.car),
    mom: riseAt(f, P.pop.mom, d + o.people),
    girl: riseAt(f, P.pop.girl, d + o.people),
    boy: riseAt(f, P.pop.car, d + o.people),
    road: easeInOut((f - P.pop.road) / 18),
  };
};

// Печать на листе. Сначала за 7 кадров плоская рамка картинки (небо,
// земля, язычок «3/6») сменяется «полом» диорамы — до подъёма гор; затем
// каждый напечатанный элемент гаснет, когда встаёт его слой. В конце
// элемент проявляется, только когда его слой почти лёг (rise < 0,15), а
// рамка возвращается, когда легли все слои, — без мутного двойного кадра.
const printState = (f: number, P: Step3Plan) => {
  const d = P.downA;
  const o = FOLD_AT;
  const el = (pop: number, fold: number) => 1 - span(f, pop - 1, pop + 4) + span(f, d + fold + 8, d + fold + 13);
  const base = span(f, P.tiltA - 3, P.tiltA + 4) * (1 - span(f, d + 16, d + 22));
  const vis: P3Vis = {
    frame: 1 - base,
    far: el(P.pop.far, o.far),
    near: el(P.pop.near, o.near),
    back: el(P.pop.back, o.back),
    house: el(P.pop.house, o.house),
    school: el(P.pop.school, o.school),
    front: el(P.pop.front, o.front),
    road: 1 - span(f, P.pop.road - 1, P.pop.road + 10) + span(f, d + 16, d + 22),
    car: el(P.pop.car, o.car),
  };
  return { base, tag: 1 - base, vis };
};

// Небо: утро (золотистое у горизонта, солнце низко слева), после уроков —
// теплее (солнце проходит по небу вправо).
// Солнце: u — поперёк панели, hh — высота над сгибом (видно над хребтом,
// под плашками кадра).
const skyState = (f: number, P: Step3Plan) => {
  const m = span(f, P.sunA, P.sunB);
  const a = span(f, P.noonA, P.noonB);
  const s = easeInOut((f - P.noonA) / (P.noonB - P.noonA));
  const riseH = lerp(0, 88, easeOut((f - P.sunA) / (P.sunB - P.sunA)));
  const u = lerp(118, 700, s);
  // дуга пологая: солнце проходит под плашкой маршрута, над хребтом
  const hh = lerp(riseH, 82, s) + 8 * Math.sin(Math.PI * s);
  return { m, a, sun: { u, hh }, sunOn: f >= P.sunA };
};

// Машина: где стоит/едет, вращение колёс, покачивание, разворот.
const carState = (f: number, P: Step3Plan) => {
  const u = carU(f, P);
  const { p1, p2 } = carTrip(f, P);
  const dist = (CAR_SCHOOL - CAR_HOME) * (p1 + p2);
  const roll = (dist / (30 * CAR_S)) * (180 / Math.PI);
  const v = Math.abs(carU(f + 1, P) - carU(f - 1, P)) / 2;
  const facing = f < P.noonA + 8 ? 1 : -1;
  const acc = ((carU(f + 2, P) - 2 * u + carU(f - 2, P)) / 4) * facing;
  const bounce = -1.4 * clamp(v / 6) * Math.abs(Math.sin(dist / 10));
  const pitch = clamp(-acc * 1.2, -2.2, 2.2);
  // разворот бумажной фигурки на месте, пока идут уроки: поворот вокруг
  // вертикали с лёгким подскоком. Ширина не меньше 20 % (машина не
  // исчезает), в середине — короткая смена сторон (наплыв за 3 кадра).
  const fp = smoothstep((f - (P.noonA + 2)) / 14);
  const c = Math.cos(Math.PI * fp);
  const flipW = Math.max(0.2, Math.abs(c));
  const flipMix = clamp((0.5 - c) / 1); // 0 — смотрит вправо, 1 — влево
  const hopF = -10 * Math.sin(Math.PI * fp);
  // дети в окнах: смена — мягкой сменой кадра (6 кадров), без «щелчка»;
  // у школы первой выходит дочь (окно 2), за ней мальчик (окно 1)
  const swaps: readonly (readonly [number, number, number])[] = [
    [P.boardB, 1, 2],
    [P.ulA, 2, 1],
    [P.ulA + 6, 1, 0],
    [P.ldB, 0, 2],
    [P.mtA + 3, 2, 1],
  ];
  let kids = { a: 1, b: 1, k: 0 };
  for (const [at, before, after] of swaps) {
    if (f >= at + 3) kids = { a: after, b: after, k: 0 };
    else if (f >= at - 3) kids = { a: before, b: after, k: easeInOut((f - (at - 3)) / 6) };
  }
  return { u, roll, bounce, pitch, flipW, flipMix, hopF, kids };
};

// Перемещение бумажной фигурки по прорези: скользит с лёгкими прыжками.
type Seg = readonly [number, number, number, number]; // [кадр от, кадр до, x от, x до]
const slide = (f: number, x0: number, segs: readonly Seg[]) => {
  let x = x0;
  let hop = 0;
  let dir = 0;
  for (const [a, b, xa, xb] of segs) {
    if (f >= b) x = xb;
    else if (f > a) {
      const p = (f - a) / (b - a);
      x = lerp(xa, xb, cruise(p, 0.25));
      const n = Math.max(2, Math.round(Math.abs(xb - xa) / 46));
      hop = -5 * Math.abs(Math.sin(Math.PI * n * p));
      dir = Math.sign(xb - xa);
    }
  }
  return { x, hop, dir };
};

// К школе и обратно дети идут разными дорожками (≈ 40 px между ними) и
// с разницей 3–4 кадра — видны оба, никто не закрывает другого.
const DOOR = P3_SCHOOL_DOOR;
const girlSegs = (P: Step3Plan): readonly Seg[] => [
  [P.boardA, P.boardB - 2, GIRL_HOME, CAR_HOME + WIN_GIRL - 4],
  [P.ulA, P.ulB - 5, CAR_SCHOOL + WIN_GIRL, DOOR + 18],
  [P.ldA + 1, P.ldB - 5, DOOR - 18, CAR_SCHOOL - WIN_GIRL],
  [P.mtA + 2, P.mtB - 2, CAR_HOME - WIN_GIRL, GIRL_MEET],
];
const boySegs = (P: Step3Plan): readonly Seg[] => [
  [P.ulA + 4, P.ulB - 1, CAR_SCHOOL + WIN_BOY, DOOR - 22],
  [P.ldA + 4, P.ldB - 2, DOOR + 22, CAR_SCHOOL - WIN_BOY],
];

// Видимость ребёнка: исчезает за машиной/в дверях и появляется обратно.
const fadeWin = (f: number, wins: readonly (readonly [number, number])[]) => {
  // wins: [кадр исчезновения, кадр появления]
  let o = 1;
  for (const [out, back] of wins) {
    if (f >= out && f < back) o = Math.min(o, 1 - clamp((f - out) / 5) + clamp((f - (back - 5)) / 5));
  }
  return clamp(o);
};

// ---------- Бумага панели ----------
const PaperFace: React.FC<{ readonly tag: number; readonly children?: React.ReactNode }> = ({ tag, children }) => (
  <div
    style={box({
      inset: 0,
      backgroundColor: C.paper,
      backgroundImage: `radial-gradient(circle at 20% 15%, rgba(255,255,255,0.9), rgba(255,255,255,0) 55%), radial-gradient(circle, rgba(120,100,60,0.05) 1.4px, transparent 1.8px)`,
      backgroundSize: "100% 100%, 22px 22px",
      overflow: "hidden",
    })}
  >
    {children}
    <div
      style={box({
        right: 22,
        top: 20,
        padding: "6px 16px",
        borderRadius: 999,
        backgroundColor: C.yellow,
        color: C.navy,
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: 30,
        lineHeight: 1.1,
        opacity: tag,
      })}
    >
      3/6
    </div>
  </div>
);

// Вырезанный бумажный слой: стоит на линии сгиба v, поворачивается от
// «лежит» (0) до «стоит» (1).
// Белая кромка вырубки для SVG-рисунка: копии рисунка с унаследованной
// обводкой (у фигур без своей обводки) — под оригиналом. CSS-фильтры на
// 3D-слоях Chromium иногда обрезает, поэтому они только у фигурок людей.
const CutOut: React.FC<{ readonly k?: number; readonly children: React.ReactNode }> = ({ k = 3, children }) => (
  <g>
    <g stroke="rgba(70,55,30,0.26)" strokeWidth={2 * k + 2.5} strokeLinejoin="round" strokeLinecap="round" transform="translate(0 1.6)">
      {children}
    </g>
    <g stroke="#FFFFFF" strokeWidth={2 * k} strokeLinejoin="round" strokeLinecap="round">
      {children}
    </g>
    {children}
  </g>
);
// Фигурки людей (Actor рисует свой <svg>): белая кромка — копия фигурки,
// перекрашенная CSS-правилом в белый силуэт с толстой обводкой.
const CUT_STYLE = `
.bg25s3-cut * { fill: #FFFFFF !important; stroke: #FFFFFF !important; stroke-width: 34px !important; stroke-linejoin: round !important; stroke-linecap: round !important; opacity: 1 !important; }
.bg25s3-sh * { fill: rgba(70,55,30,0.24) !important; stroke: rgba(70,55,30,0.24) !important; stroke-width: 50px !important; stroke-linejoin: round !important; stroke-linecap: round !important; opacity: 1 !important; }
`;
const PaperFigure: React.FC<{ readonly x: number; readonly y: number; readonly opacity?: number; readonly children: React.ReactNode }> = ({ x, y, opacity = 1, children }) =>
  opacity <= 0.001 ? null : (
    <div style={box({ left: x, top: y, opacity })}>
      <div className="bg25s3-sh" style={box({ left: 0, top: 1.6 })}>
        {children}
      </div>
      <div className="bg25s3-cut" style={box({ left: 0, top: 0 })}>
        {children}
      </div>
      {children}
    </div>
  );

// spring — фигурка встаёт «пружиной»: вырастает от прорези, чуть
// наклонившись вперёд (к зрителю), и никогда не отклоняется назад —
// иначе на подъёме она прошла бы сквозь стоящий за ней дом. Ложится
// (в конце сцены) — обычным поворотом назад, когда дом уже лёг.
const Card: React.FC<{
  readonly u0: number;
  readonly w: number;
  readonly v: number;
  readonly h: number;
  readonly rise: number;
  readonly spring?: boolean;
  readonly children: React.ReactNode;
}> = ({ u0, w, v, h, rise, spring = false, children }) => {
  if (rise <= 0.004) return null;
  const ang = spring ? 90 + 26 * (1 - clamp(rise)) : 90 * rise;
  return (
    <div
      style={box({
        left: u0,
        top: v - h,
        width: w,
        height: h,
        transformOrigin: "50% 100%",
        transform: `rotateX(${-ang}deg)`,
        opacity: clamp(rise * 6),
      })}
    >
      {spring ? <div style={box({ inset: 0, transformOrigin: "50% 100%", transform: `scaleY(${rise.toFixed(4)})` })}>{children}</div> : children}
    </div>
  );
};

// Небо-задник (мир ленты): градиент по времени суток, солнце, облака.
// rise 0…1 — встаёт от сгиба (масштаб по высоте от низа, с перелётом).
const Sky2D: React.FC<{ readonly f: number; readonly st: ReturnType<typeof skyState>; readonly rise: number }> = ({ f, st, rise }) => {
  if (rise <= 0.004) return null;
  const { m, a } = st;
  const top = mixHex(mixHex("#CFE2F6", "#C6DDF5", m), "#D3E1F1", a);
  const bot = mixHex(mixHex("#EEF4FA", "#FFE3A6", m), "#FFD8AA", a);
  const sunCol = mixHex("#FFE9A8", "#FFC44E", a);
  const W = SKY.w;
  const H = SKY.h;
  const yOf = (hh: number) => H - SKY.below - hh;
  const cloud = (x0: number, hh: number, sc: number, k: number) => {
    const x = ((x0 + f * 0.3 * k) % (W + 200)) - 100;
    return (
      <g key={x0} transform={`translate(${x} ${yOf(hh)}) scale(${sc})`} opacity={0.95}>
        <ellipse cx={0} cy={0} rx={50} ry={19} fill="#FFFFFF" />
        <circle cx={-16} cy={-12} r={19} fill="#FFFFFF" />
        <circle cx={14} cy={-17} r={24} fill="#FFFFFF" />
      </g>
    );
  };
  return (
    <div
      style={box({
        left: SKY.x,
        top: TOP + SKY.below - H,
        width: W,
        height: H,
        transformOrigin: "50% 100%",
        transform: `scaleY(${rise.toFixed(4)})`,
        opacity: clamp(rise * 5),
      })}
    >
      <svg width={W} height={H} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <defs>
          <linearGradient id="bg25-p3d-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor={top} />
            <stop offset="0.97" stopColor={bot} />
          </linearGradient>
          <radialGradient id="bg25-p3d-sun">
            <stop offset="0" stopColor={sunCol} stopOpacity={0.75} />
            <stop offset="1" stopColor={sunCol} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={0} y={4} width={W} height={H - 4} rx={26} fill="rgba(70,55,30,0.18)" />
        <rect x={0} y={0} width={W} height={H} rx={26} fill="url(#bg25-p3d-sky)" stroke="#FFFFFF" strokeWidth={8} />
        {st.sunOn ? (
          <g>
            <circle cx={SKY_U + st.sun.u} cy={yOf(st.sun.hh)} r={74 + 4 * Math.sin(f / 9)} fill="url(#bg25-p3d-sun)" />
            <circle cx={SKY_U + st.sun.u} cy={yOf(st.sun.hh)} r={24} fill={sunCol} />
          </g>
        ) : null}
        {cloud(160, 250, 0.9, 1)}
        {cloud(600, 300, 0.7, 0.8)}
        {cloud(380, 420, 1.1, 1.1)}
        {cloud(800, 540, 0.8, 0.9)}
        {cloud(90, 660, 1, 1.2)}
      </svg>
    </div>
  );
};

const Shrub: React.FC<{ readonly h: number }> = ({ h }) => (
  <g>
    <circle cx={h * 0.55} cy={h * 0.62} r={h * 0.38} fill={C.poplarDark} />
    <circle cx={h * 1.05} cy={h * 0.5} r={h * 0.5} fill={C.poplar} />
    <circle cx={h * 1.55} cy={h * 0.64} r={h * 0.36} fill={C.poplarDark} />
  </g>
);

// Печать «пола» (когда слои встали): земля, тротуар, улица, язычки сгибов,
// тени слоёв и людей (направление — от солнца).
const FloorPrint: React.FC<{
  readonly opacity: number;
  readonly f: number;
  readonly R: ReturnType<typeof layerRises>;
  readonly st: ReturnType<typeof skyState>;
  readonly car: ReturnType<typeof carState>;
  readonly people: readonly { readonly x: number; readonly v: number; readonly h: number; readonly o: number }[];
}> = ({ opacity, R, st, car, people }) => {
  if (opacity <= 0.001) return null;
  const { walk, road } = P3G;
  const sd = st.sunOn ? clamp((st.sun.u - RIB.w / 2) / (RIB.w / 2), -1, 1) : -0.35;
  const sh = (u0: number, w: number, v: number, h: number, r: number, key: string) => {
    const k = clamp(r);
    if (k <= 0.01) return null;
    const L = h * 0.3 * k;
    const dx = -sd * h * 0.32 * k;
    return <path key={key} d={`M ${u0} ${v} L ${u0 + w} ${v} L ${u0 + w + dx} ${v + L} L ${u0 + dx} ${v + L} Z`} fill="#3A4A30" opacity={0.16 * k} />;
  };
  const tab = (u0: number, w: number, v: number, r: number, key: string) =>
    r > 0.02 ? (
      <g key={key} opacity={clamp(r * 3)}>
        <rect x={u0 + 4} y={v} width={w - 8} height={7} rx={2} fill="#FFFFFF" opacity={0.65} />
        <line x1={u0 + 2} y1={v} x2={u0 + w - 2} y2={v} stroke="#B9A47E" strokeWidth={1.5} opacity={0.6} />
      </g>
    ) : null;
  const roadW = 796 * R.road;
  return (
    <svg width={820} height={620} style={box({ left: 0, top: 0, overflow: "visible", opacity })}>
      <defs>
        <filter id="bg25-p3d-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
        <clipPath id="bg25-p3d-road">
          <rect x={12} y={road.y0 - 2} width={roadW} height={road.y1 - road.y0 + 4} />
        </clipPath>
      </defs>
      <rect x={12} y={12} width={796} height={596} rx={18} fill={P3_GROUND} />
      <rect x={12} y={walk.y0} width={796} height={walk.y1 - walk.y0} fill={P3_WALK} />
      <g clipPath="url(#bg25-p3d-road)">
        <rect x={12} y={road.y0} width={796} height={road.y1 - road.y0} fill={P3_ROAD} />
        <line x1={12} y1={road.mid} x2={808} y2={road.mid} stroke="#FFFFFF" strokeWidth={4} strokeDasharray="22 18" />
        <line x1={12} y1={road.y0 + 1} x2={808} y2={road.y0 + 1} stroke="#C5CDDA" strokeWidth={2} />
        <line x1={12} y1={road.y1 - 1} x2={808} y2={road.y1 - 1} stroke="#C5CDDA" strokeWidth={2} />
      </g>
      {/* тени */}
      <g filter="url(#bg25-p3d-blur)">
        {sh(FAR.u0, FAR.w, FAR.v, FAR.h * 0.7, R.far, "far")}
        {sh(NEAR.u0, NEAR.w, NEAR.v, NEAR.h, R.near, "near")}
        {BACK.map(([x, v, h], i) => sh(x - 14, 28, v, h, R.back[i], `b${i}`))}
        {sh(HOUSE.u0 + 10, HOUSE.w - 20, HOUSE.v, HOUSE.h * 0.6, R.house, "house")}
        {sh(SCHOOL.u0 + 12, SCHOOL.w - 24, SCHOOL.v, SCHOOL.h * 0.55, R.school, "school")}
        {FRONT.map(([x, v, h], i) => sh(x - 14, 28, v, h, R.front[i], `f${i}`))}
        {people.map((p, i) =>
          p.o > 0.01 ? <ellipse key={`p${i}`} cx={p.x - sd * p.h * 0.18} cy={p.v + 4} rx={p.h * 0.2} ry={5} fill="#2E3A28" opacity={0.22 * p.o} /> : null,
        )}
        {R.car > 0.01 ? <ellipse cx={car.u - sd * 18} cy={CAR_V + 6} rx={CAR_W * 0.5} ry={10} fill="#2E3A28" opacity={0.22 * clamp(R.car)} /> : null}
      </g>
      {/* язычки сгибов у основания слоёв */}
      {tab(FAR.u0, FAR.w, FAR.v, R.far, "far")}
      {tab(NEAR.u0, NEAR.w, NEAR.v, R.near, "near")}
      {tab(HOUSE.u0 + 10, HOUSE.w - 20, HOUSE.v, R.house, "house")}
      {tab(SCHOOL.u0 + 12, SCHOOL.w - 24, SCHOOL.v, R.school, "school")}
      {/* утренний / дневной свет на бумаге */}
      <rect x={12} y={12} width={796} height={596} rx={18} fill="#FFD98A" opacity={0.12 * st.m * (1 - st.a)} />
      <rect x={12} y={12} width={796} height={596} rx={18} fill="#FFBE7A" opacity={0.14 * st.a} />
    </svg>
  );
};

// Язычок номера под краем сложенных листов (как в FoldedEdge): один и тот
// же язычок, подпись «3/6» плавно сменяется на «4/6» на месте.
const EdgeTab: React.FC<{ readonly x: number; readonly y: number; readonly layers: number; readonly swap: number; readonly wobble: number; readonly opacity: number }> = ({ x, y, layers, swap, wobble, opacity }) =>
  opacity <= 0.001 ? null : (
    <div
      style={box({
        left: x + RIB.w / 2 - 46,
        top: y + layers * 7 + 4 + wobble * 8,
        width: 92,
        height: 46,
        borderRadius: "0 0 18px 18px",
        backgroundColor: C.yellow,
        color: C.navy,
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: 28,
        boxShadow: "0 6px 12px rgba(20,40,90,0.16)",
        opacity,
      })}
    >
      {[
        ["3/6", 1 - swap],
        ["4/6", swap],
      ].map(([label, o]) =>
        Number(o) > 0.001 ? (
          <div key={label} style={box({ inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: Number(o) })}>
            {label}
          </div>
        ) : null,
      )}
    </div>
  );

// Руки мамы держат края ленты (как MomHands в stage.tsx), но могут
// разойтись по ширине наклонённого листа.
const GripHands: React.FC<{ readonly f: number; readonly xl: number; readonly xr: number; readonly y: number; readonly show: number; readonly lift: number }> = ({ f, xl, xr, y, show, lift }) => {
  if (show <= 0.001) return null;
  const yy = y + (1 - show) * 520 + Math.sin(f / 26) * 4 - lift * 18;
  return (
    <Svg>
      <CloseHand x={xl - 18} y={yy} angle={-150} size={240} {...SKIN.apa} shape="pinch" mirror armLen={5} />
      <CloseHand x={xr + 18} y={yy + Math.sin(f / 31 + 1) * 3} angle={150} size={240} {...SKIN.apa} shape="pinch" armLen={5} />
    </Svg>
  );
};

export type DioramaProps = {
  readonly f: number;
  readonly P: Step3Plan;
  readonly ang: number; // поворот листа: −90 сложен, 0 плашмя, TILT — «пол»
  readonly o: Origin; // точка схода (координаты панели)
  readonly labelT: number; // кадры от «штампа» плашки условия
  readonly routeT: number; // кадры от печати строки маршрута
  readonly hands: { readonly y: number; readonly show: number; readonly lift: number; readonly tilt: number };
  readonly edge: { readonly swap: number; readonly wobble: number };
};

export const Diorama: React.FC<DioramaProps> = ({ f, P, ang, o, labelT, routeT, hands, edge }) => {
  const R = layerRises(f, P);
  const pr = printState(f, P);
  const spring = f < P.downA;
  const st = skyState(f, P);
  const car = carState(f, P);
  const lit = 0.45 * st.m * (1 - st.a);

  // ---------- люди ----------
  const g = slide(f, GIRL_HOME, girlSegs(P));
  const b = slide(f, CAR_SCHOOL + WIN_BOY, boySegs(P));
  // появление — с начала своего отрезка пути (смена места — невидимой)
  const girlO = fadeWin(f, [
    [P.boardB - 3, P.ulA + 5],
    [P.ulB - 7, P.ldA + 6],
    [P.ldB - 5, P.mtA + 7],
  ]);
  const boyO = fadeWin(f, [
    [P.ulB - 4, P.ldA + 9],
    [P.ldB - 3, 99999],
  ]) * clamp((f - (P.ulA + 4)) / 5);
  // присесть — «садится» в машину / выходит из неё
  const girlCrouch = (t: number) =>
    0.55 *
    Math.max(
      clamp((t - (P.boardB - 6)) / 5) * (1 - clamp((t - P.ulA) / 7)),
      clamp((t - (P.ldB - 6)) / 4) * (1 - clamp((t - P.mtA) / 7)),
    );
  const boyCrouch = (fr: number) => 0.55 * Math.max(1 - clamp((fr - (P.ulA + 4)) / 7), clamp((fr - (P.ldB - 4)) / 4));

  const momPose = (t: number): PoseIn => {
    const wv = bump(t, P.d1A - 6, P.d1B + 2);
    const mt = span(t, P.mtB - 6, P.mtB + 8);
    const gx = slide(t, GIRL_HOME, girlSegs(P)).x;
    const shoulder = { x: gx - MOM_X - 3, y: -GIRL_H * 0.69 };
    return {
      expr: mt > 0.3 ? "smile" : wv > 0.2 ? "smile" : "softSmile",
      lookY: 0.15 + 0.35 * mt,
      headTilt: 4 * mt,
      lean: 3 * mt,
      nod: 4 * mt,
      armR:
        mt > 0.01
          ? { target: { x: lerp(REST_R.x, shoulder.x, mt), y: lerp(REST_R.y, shoulder.y, mt) }, shape: "open", elbow: "down" }
          : wv > 0.01
            ? { target: { x: lerp(REST_R.x, 0.2 * MOM_H + 4 * Math.sin(t / 3.2), wv), y: lerp(REST_R.y, -0.98 * MOM_H, wv) }, shape: "wave", elbow: "out", wrist: 14 * Math.sin(t / 3.2) * wv }
            : undefined,
    };
  };
  const momFace = (t: number) => {
    const cu = carU(t, P);
    const gx = slide(t, GIRL_HOME, girlSegs(P)).x;
    const looksAtGirl = t >= P.mtA - 4 || t < P.d1A - 4;
    return clamp(((looksAtGirl ? gx : cu) - MOM_X) / 260, -0.2, 0.75);
  };
  const girlPose = (t: number): PoseIn => ({
    expr: "smile",
    crouch: girlCrouch(t),
    lookY: -0.25 * span(t, P.mtB - 6, P.mtB + 6),
    headTilt: -4 * span(t, P.mtB - 6, P.mtB + 6),
  });
  const girlFace = (t: number) => {
    const s = slide(t, GIRL_HOME, girlSegs(P));
    if (s.dir) return s.dir * 0.8;
    if (t >= P.mtB - 4) return -0.45;
    return 0.1;
  };
  const boyPose = (t: number): PoseIn => ({ expr: "smile", crouch: boyCrouch(t) });
  const boyFace = (t: number) => {
    const s = slide(t, CAR_SCHOOL + WIN_BOY, boySegs(P));
    return s.dir ? s.dir * 0.8 : 0.1;
  };

  const people = [
    { x: MOM_X, v: MOM_V, h: MOM_H, o: clamp(R.mom) },
    { x: g.x, v: GIRL_V, h: GIRL_H, o: clamp(R.girl) * girlO },
    { x: b.x, v: BOY_V, h: BOY_H, o: clamp(R.boy) * boyO },
  ];

  // ---------- лента: край сложенных листов и руки ----------
  const fl = projPanel(0, RIB.h, ang, o);
  const fr = projPanel(RIB.w, RIB.h, ang, o);
  const fc = projPanel(RIB.w / 2, RIB.h, ang, o);
  const edgeY = Math.min(fc.y, TOP + RIB.h) - 4;
  const shade = ang < 0 ? 0.22 * Math.sin((-ang * Math.PI) / 180) : 0.05 * Math.sin((ang * Math.PI) / 180);
  const u = clamp((ang + 90) / 90);
  const tiltK = clamp(ang / TILT);
  const scaleEdge = lerp(1, fc.s, tiltK);
  const handsXl = lerp(RIB_X, fl.x, hands.tilt);
  const handsXr = lerp(RIB_X + RIB.w, fr.x, hands.tilt);
  const edgeOld = 1 - edge.swap;

  return (
    <>
      <style>{CUT_STYLE}</style>
      {/* край ещё сложенных листов (4 → 3 листа) и один язычок: «3/6» → «4/6»;
          язычок прячется, пока лист наклонён диорамой */}
      <div style={box({ left: 0, top: 0, width: 1, height: 1, transformOrigin: `${fc.x}px ${edgeY}px`, transform: `scale(${scaleEdge})` })}>
        {edgeOld > 0.001 ? (
          <div style={box({ left: 0, top: 0, opacity: edgeOld })}>
            <FoldedEdge x={fc.x - RIB.w / 2} y={edgeY} rest={4} />
          </div>
        ) : null}
        {edge.swap > 0.001 ? (
          <div style={box({ left: 0, top: 0, opacity: edge.swap })}>
            <FoldedEdge x={fc.x - RIB.w / 2} y={edgeY} rest={3} wobble={edge.wobble} />
          </div>
        ) : null}
        <EdgeTab x={fc.x - RIB.w / 2} y={edgeY} layers={lerp(4, 3, edge.swap)} swap={edge.swap} wobble={edge.wobble} opacity={1 - tiltK} />
      </div>
      <Sky2D f={f} st={st} rise={R.sky} />
      {u > 0.001 ? (
        <div style={box({ left: RIB_X, top: TOP, width: RIB.w, height: RIB.h, perspective: PERSP, perspectiveOrigin: `${o.x}px ${o.y}px` })}>
          <div style={box({ inset: 0, transformStyle: "preserve-3d", transformOrigin: "50% 0%", transform: `rotateX(${ang}deg)` })}>
            {/* лицевая сторона листа: плоская печать ↔ печать «пола» */}
            <div style={box({ inset: 0, boxShadow: `0 ${18 + 10 * (1 - u)}px 36px rgba(20,40,90,${0.16 * u})` })}>
              <PaperFace tag={pr.tag}>
                <FloorPrint opacity={pr.base} f={f} R={R} st={st} car={car} people={people} />
                <P3Picture vis={pr.vis} />
                <P3Label t={labelT} />
                <P3Route t={routeT} />
              </PaperFace>
              <div style={box({ inset: 0, background: `linear-gradient(180deg, rgba(60,50,30,${shade * 0.6}), rgba(60,50,30,${shade}))` })} />
              <div style={box({ left: 0, right: 0, top: 0, height: 16, background: "linear-gradient(180deg, rgba(120,100,60,0.22), rgba(120,100,60,0))" })} />
            </div>

            {/* ---------- pop-up слои (сзади вперёд) ---------- */}
            <Card {...FAR} rise={R.far}>
              <svg width={FAR.w} height={FAR.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
                <CutOut>
                  <Mountains w={FAR.w} h={FAR.h - 6} x={0} y={FAR.h - 2} far />
                </CutOut>
              </svg>
            </Card>
            <Card {...NEAR} rise={R.near}>
              <svg width={NEAR.w} height={NEAR.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
                <CutOut>
                  <Mountains w={NEAR.w} h={NEAR.h - 6} x={0} y={NEAR.h - 2} />
                </CutOut>
              </svg>
            </Card>
            {BACK.map(([x, v, h], i) => (
              <Card key={`b${i}`} u0={x - 24} w={48} v={v} h={h} rise={R.back[i]}>
                <svg width={48} height={h} style={box({ left: 0, top: 0, overflow: "visible" })}>
                  <CutOut k={2.5}>
                    <Poplar x={24} y={h - 1} h={h - 4} sway={1.4 * Math.sin(f / 23 + i * 1.7)} />
                  </CutOut>
                </svg>
              </Card>
            ))}
            <Card {...HOUSE} rise={R.house}>
              <svg width={HOUSE.w} height={HOUSE.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
                <g transform={`translate(10 ${HOUSE.h - 2})`}>
                  <CutOut>
                    <ToyHouse w={P3G.house.w} lit={lit} />
                  </CutOut>
                </g>
              </svg>
            </Card>
            <Card {...SCHOOL} rise={R.school}>
              <svg width={SCHOOL.w} height={SCHOOL.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
                <g transform={`translate(12 ${SCHOOL.h - 2})`}>
                  <CutOut>
                    <ToySchool w={P3G.school.w} label={T.school} />
                  </CutOut>
                </g>
              </svg>
            </Card>
            {FRONT.map(([x, v, h], i) => (
              <Card key={`f${i}`} u0={x - 24} w={48} v={v} h={h} rise={R.front[i]}>
                <svg width={48} height={h} style={box({ left: 0, top: 0, overflow: "visible" })}>
                  <CutOut k={2.5}>
                    <Poplar x={24} y={h - 1} h={h - 4} sway={1.6 * Math.sin(f / 21 + i * 2.3)} />
                  </CutOut>
                </svg>
              </Card>
            ))}
            {/* люди: мама у подъезда, дочь, мальчик из машины */}
            <Card u0={0} w={RIB.w} v={GIRL_V} h={PEOPLE_H} rise={R.girl} spring={spring}>
              <PaperFigure x={g.x} y={PEOPLE_H + g.hop - 3} opacity={girlO}>
                <Actor uid="s3-girl" look="kidBraids" f={f} place={() => ({ x: 0, y: 0, h: GIRL_H })} face={girlFace} pose={girlPose} seed={7} blinkShift={11} />
              </PaperFigure>
            </Card>
            <Card u0={0} w={RIB.w} v={BOY_V} h={PEOPLE_H} rise={R.boy} spring={spring}>
              <PaperFigure x={b.x} y={PEOPLE_H + b.hop - 3} opacity={boyO}>
                <Actor uid="s3-boy" look="ayanSchool" f={f} place={() => ({ x: 0, y: 0, h: BOY_H })} face={boyFace} pose={boyPose} seed={3} blinkShift={23} />
              </PaperFigure>
            </Card>
            <Card u0={0} w={RIB.w} v={MOM_V} h={PEOPLE_H} rise={R.mom} spring={spring}>
              <PaperFigure x={MOM_X} y={PEOPLE_H - 3}>
                <Actor uid="s3-mom" look="apa" f={f} place={() => ({ x: 0, y: 0, h: MOM_H })} face={momFace} pose={momPose} seed={5} />
              </PaperFigure>
            </Card>
            {/* белая машина: едет по улице, на время уроков разворачивается */}
            <Card u0={car.u - CAR_W / 2 - 12} w={CAR_W + 24} v={CAR_V} h={112} rise={R.car}>
              <svg width={CAR_W + 24} height={112} style={box({ left: 0, top: 0, overflow: "visible" })}>
                {(
                  [
                    [1, 1 - car.flipMix],
                    [-1, car.flipMix],
                  ] as const
                ).map(([side, op]) =>
                  op > 0.001 ? (
                    <g key={side} opacity={op} transform={`translate(${CAR_CX} ${car.hopF}) scale(${(side * car.flipW).toFixed(4)} 1) translate(${-CAR_CX} 0) rotate(${car.pitch} ${CAR_CX} 108)`}>
                      <CutOut k={2.5}>
                        <Car x={CAR_CX} y={112 - 4 * CAR_S - 2} s={CAR_S} roll={car.roll} bounce={car.bounce} kids={car.kids.a} />
                      </CutOut>
                      {car.kids.k > 0.001 ? (
                        <g opacity={car.kids.k}>
                          <Car x={CAR_CX} y={112 - 4 * CAR_S - 2} s={CAR_S} roll={car.roll} bounce={car.bounce} kids={car.kids.b} />
                        </g>
                      ) : null}
                    </g>
                  ) : null,
                )}
              </svg>
            </Card>
            {SHRUBS.map(([x, h], i) => (
              <Card key={`s${i}`} u0={x - h} w={h * 2.2} v={SHRUB_V} h={h * 1.2} rise={R.shrubs[i]}>
                <svg width={h * 2.2} height={h * 1.2} style={box({ left: 0, top: 0, overflow: "visible" })}>
                  <g transform={`translate(0 ${h * 0.1})`}>
                    <CutOut k={2.5}>
                      <Shrub h={h} />
                    </CutOut>
                  </g>
                </svg>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
      <GripHands f={f} xl={handsXl} xr={handsXr} y={hands.y} show={hands.show} lift={hands.lift} />
    </>
  );
};
