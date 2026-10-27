// Сцена 4 «full» BG-035: бонусный жетон — тоже полный сапар ҮЙ → МЕКТЕП → ҮЙ.
//
// Сюжет движения (все моменты — от фактической озвучки n04, useWordAt):
//  a) 0 → «Бонус»: левый мятный жетон пары «+2» приседает, поднимается из
//     гнезда со свечением и дугой летит к центру, вращаясь монетой; лоток
//     отъезжает назад (масштаб, прозрачность, размытие). В центре жетон
//     пружиной вырастает в большой диск (крупно «АКЫСЫЗ» со звездой), затем
//     лицевая сторона раскрывается ирисом — сам жетон становится «окном»
//     с мятным ободком. С 2-го кадра — метка «Шарттуу мисал…».
//  b) «толук» — подпись «2 бонус = 2 толук сапар» (остаётся до конца).
//     В окне утро: голубое небо, встаёт солнце над Ала-Тоо, панельный дом
//     слева, школа справа, тополя. Белая машина ждёт у дома; лупа «Кур
//     тагылган» показывает пристёгнутого ребёнка. «эртең» — плашка
//     «Эртең менен | ҮЙ → МЕКТЕП», машина (ребёнок пристёгнут, колёса
//     крутятся, разгон/торможение с клевком) едет к школе, камера в окне
//     ведёт её с параллаксом гор.
//  c) «сабактан» — диск переворачивается монетой (rotateY с бликом и
//     подъёмом), плашка — тоже: «Сабактан кийин | МЕКТЕП → ҮЙ». Тёплое небо,
//     та же улица; машина едет обратно от школы к дому, у подъезда ждёт
//     мама и машет.
//  d) «Бир»: окно делится на две половины-«створки»: сверху утро, снизу
//     день (дневная сцена сжимается вниз, утренняя падает сверху). На
//     «тарапка» нижняя половина отламывается вниз и сереет — остаётся одна
//     «Бир тарап»: машина едет только к школе, по ободу — одна стрелка.
//     «эмес» — плашка «Бир тарап» зачёркивается и вздрагивает; половина
//     возвращается и защёлкивается (сплющивание, волна). Плашка сверху
//     достраивается до «ҮЙ → МЕКТЕП → ҮЙ» с галочкой, вторая стрелка
//     замыкает петлю по ободу; внизу мама с сыном дома. Хвост: блик, огонёк
//     бежит по петле, лёгкий наезд камеры.
//  e) последние ≈ 32 кадра: ирис закрывается, диск снова жетон «АКЫСЫЗ»,
//     уменьшается и дугой возвращается в своё гнездо (защёлкивание, волна);
//     лоток возвращается. Конец = FullTray в TRAY_HOME, оба бонусных жетона
//     мягко светятся (FULL_END.glowBonus) — сцена 5 продолжает без скачка.
//
// Факты: бонусный жетон = 1 полный сапар ҮЙ → МЕКТЕП → ҮЙ (не одна сторона);
// сцена — шарттуу мисал (метка всё время); белая легковая машина, ребёнок
// пристёгнут; без еды, цен, GPS и уведомлений.
import type React from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  Actor,
  atBody,
  type Place,
  type PoseIn,
} from "../../../two-schedules-2d/rig/Actor";
import {
  clamp,
  cruise,
  easeIn,
  easeInOut,
  easeOut,
  keys,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { PanelHouse, Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { useLine, useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG35_TEXT, BG35_WORDS } from "../script";
import { bonusPos, FullTray, TRAY, TRAY_HOME, TrayFrame } from "../tokens";
import { box, Caption, Check, ExampleTag, pop, Txt, WhiteCar } from "../ui";

const T = BG35_TEXT.full;
const W = BG35_WORDS.n04;

// Диск-окно: центр и «жетонный» радиус r (видимый край = r · 56/60, как
// у Token). Окно внутри ободка — радиус SR (единицы мини-сцены).
export const FULL_DISC = { x: 540, y: 860, r: 334 } as const;
const R_FULL = FULL_DISC.r;
const VIS = 56 / 60;
const SR = (R_FULL * 50) / 60;

// Постоянные кадры сцены (от её начала).
export const FULL_KEYS = {
  lift: 3, // жетон поднимается из гнезда
  fly: 12, // полёт к центру
  flyEnd: 38,
  grow: 34, // пружиной вырастает в диск
  growD: 22,
  iris: 40, // лицевая сторона раскрывается окном
  irisD: 20,
  close: 32, // за столько кадров до конца диск закрывается
  land: 10, // за столько кадров до конца жетон садится в гнездо
} as const;

// Конечное состояние (для сцены 5): FullTray в TRAY_HOME, glowBonus.
export const FULL_END = { glowBonus: 0.55 } as const;

// ---------- Улица в окне (единицы мини-сцены, центр окна = 0, 0) ----------
const ST = {
  yard: 74, // газон за тротуаром
  walk: 96, // верх тротуара (низ зданий)
  curb: 118,
  road: 202,
  dash: 160,
  carY: 184,
  houseX: -205,
  houseW: 132,
  schoolX: 215,
  momX: -206,
  momY: 106,
  sonX: -176,
  carS: 0.42,
  amFrom: -190,
  amTo: 140,
  pmFrom: 150,
  pmTo: -62,
  camHome: -50, // камера в окне: у дома
  camSchool: 70, // у школы
} as const;
const FS = 1.12; // масштаб улицы в целом окне (крупнее машина и люди)
const FTY = -18; // сдвиг улицы в целом окне
const HS = 0.6; // масштаб сцен в половинках
const AM_TY = -121; // утро — верхняя половина (дорога у диаметра)
const PM_TY = 90; // день — нижняя половина

const ROUTE = T.route;
const ROUTE_CUT = ROUTE.lastIndexOf("→");
const ROUTE_HEAD = ROUTE.slice(0, ROUTE_CUT).trim();
const ROUTE_TAIL = ROUTE.slice(ROUTE_CUT).trim();

const SKY_AM =
  "linear-gradient(180deg, #A6D0F1 0%, #D3E9F8 50%, #FFF1DA 76%, #FFF1DA 100%)";
const SKY_PM =
  "linear-gradient(180deg, #F6BA80 0%, #FFD6A2 46%, #FFF0D8 76%, #FFF0D8 100%)";
const STRIKE = "#E25B4E";

// Ала-Тоо на дальнем плане (контур и снежные шапки).
const MOUNTAINS =
  "M -720 100 L -630 34 L -560 54 L -480 -6 L -400 44 L -330 4 L -250 -28 L -180 22 L -110 -2 L -40 40 L 30 -18 L 100 26 L 170 -32 L 240 12 L 320 -12 L 400 36 L 470 -4 L 560 44 L 720 22 L 720 100 Z";
const SNOW = [
  [-480, -6],
  [-250, -28],
  [30, -18],
  [170, -32],
  [320, -12],
]
  .map(
    ([x, y]) =>
      `M ${x - 20} ${y + 17} L ${x} ${y} L ${x + 22} ${y + 18} L ${x + 9} ${y + 12} L ${x - 3} ${y + 19} L ${x - 10} ${y + 13} Z`,
  )
  .join(" ");

// ---------- Мелкие функции движения ----------
const bump = (x: number, d: number) =>
  x <= 0 || x >= d ? 0 : Math.sin((Math.PI * x) / d);
// «Защёлкивание» (как в сцене 3): растяжение → удар → затухающая пружина.
const settle = (k: number) => {
  if (k < -3 || k >= 12) return 0;
  if (k < 0) return -0.3 * easeIn((k + 3) / 3);
  return Math.cos(k * 0.9) * Math.exp(-k / 2.8) * (1 - k / 12);
};
const bez = (
  a: { x: number; y: number },
  c: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
) => {
  const q = 1 - t;
  return {
    x: q * q * a.x + 2 * q * t * c.x + t * t * b.x,
    y: q * q * a.y + 2 * q * t * c.y + t * t * b.y,
  };
};

type CarState = {
  readonly x: number;
  readonly dir: 1 | -1;
  readonly wheel: number;
  readonly pitch: number;
  readonly speed: number;
  readonly bob: number;
  readonly kid: boolean;
};

const WHEEL_R = 38 * ST.carS;
// Поездка от x0 к x1 за кадры t0…t1: колёса по пройденному пути, клевок
// носом при разгоне/торможении, лёгкое покачивание на ходу.
const drive = (
  f: number,
  t0: number,
  t1: number,
  x0: number,
  x1: number,
  kid: boolean,
  ease: (x: number) => number = cruise,
): CarState => {
  const at = (t: number) =>
    lerp(x0, x1, ease(clamp((t - t0) / Math.max(1, t1 - t0))));
  const x = at(f);
  const v = Math.abs(x - at(f - 1));
  const dist = Math.abs(x - x0);
  return {
    x,
    dir: x1 >= x0 ? 1 : -1,
    wheel: (dist / WHEEL_R) * (180 / Math.PI),
    pitch: -1.6 * bump(f - t0, 12) + 2.4 * bump(f - t1 + 3, 12),
    speed: v,
    bob: 0.9 * Math.sin(dist * 0.11) * clamp(v / 3),
    kid,
  };
};

// ---------- Мини-сцена: небо, солнце ----------
const Sun: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly pm: boolean;
  readonly f: number;
}> = ({ x, y, s, pm, f }) => (
  <div
    style={box({
      left: x,
      top: y,
      width: 0,
      height: 0,
      transform: `scale(${s})`,
    })}
  >
    <div
      style={box({
        left: -96,
        top: -96,
        width: 192,
        height: 192,
        borderRadius: "50%",
        background: pm
          ? "radial-gradient(circle, rgba(255,160,60,0.55) 0%, rgba(255,170,70,0) 70%)"
          : "radial-gradient(circle, rgba(255,214,90,0.62) 0%, rgba(255,214,90,0) 70%)",
      })}
    />
    <svg
      width={1}
      height={1}
      style={box({ left: 0, top: 0, overflow: "visible" })}
    >
      <g transform={`rotate(${f * 0.7})`}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={36}
            y={-3.5}
            width={15}
            height={7}
            rx={3.5}
            fill={pm ? "#FFB04A" : "#FFD24A"}
            transform={`rotate(${i * 30})`}
          />
        ))}
      </g>
      <circle r={29} fill={pm ? "#FFA83C" : "#FFD54A"} />
      <circle r={20} fill={pm ? "#FFC266" : "#FFE27A"} />
    </svg>
  </div>
);

const Cloud: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({
  x,
  y,
  s,
}) => (
  <svg
    width={1}
    height={1}
    style={box({ left: x, top: y, overflow: "visible" })}
  >
    <g transform={`scale(${s})`} fill="#FFFFFF" opacity={0.92}>
      <ellipse cx={0} cy={6} rx={56} ry={16} />
      <circle cx={-18} cy={-4} r={20} />
      <circle cx={12} cy={-10} r={25} />
      <circle cx={36} cy={2} r={15} />
    </g>
  </svg>
);

// Небо — прямоугольник окна (top…top + h), облака, солнце.
const Sky: React.FC<{
  readonly pm: boolean;
  readonly top: number;
  readonly h: number;
  readonly f: number;
  readonly sun: { readonly x: number; readonly y: number; readonly s: number };
  readonly clouds: number;
}> = ({ pm, top, h, f, sun, clouds }) => (
  <>
    <div
      style={box({
        left: -SR - 6,
        top,
        width: 2 * SR + 12,
        height: h,
        background: pm ? SKY_PM : SKY_AM,
      })}
    />
    <Sun x={sun.x} y={sun.y} s={sun.s} pm={pm} f={f} />
    {clouds > 0.01 ? (
      <div style={box({ left: 0, top: 0, opacity: clouds })}>
        <Cloud x={-178 + f * 0.32} y={top + h * 0.17} s={0.9} />
        <Cloud x={96 + f * 0.22} y={top + h * 0.27} s={0.66} />
      </div>
    ) : null}
  </>
);

// ---------- Мини-сцена: здания, люди, машина ----------
const School: React.FC<{ readonly x: number; readonly y: number; readonly f: number }> = ({
  x,
  y,
  f,
}) => {
  const wv = 3 * Math.sin(f / 5);
  const win = (wx: number, wy: number, k: number) => (
    <rect
      key={k}
      x={wx}
      y={wy}
      width={17}
      height={21}
      rx={2}
      fill="#9FB6CE"
      stroke="#FFFFFF"
      strokeWidth={3}
    />
  );
  return (
    <svg
      width={1}
      height={1}
      style={box({ left: x, top: y, overflow: "visible" })}
    >
      {/* флагшток с флагом Кыргызстана */}
      <rect x={-74} y={-196} width={4} height={90} fill="#8C929C" />
      <path
        d={`M -70 -194 Q -58 ${-198 + wv} -44 -194 L -44 -174 Q -58 ${-178 + wv} -70 -174 Z`}
        fill="#E8112D"
      />
      <circle cx={-57} cy={-184} r={4.6} fill="#FFD23F" />
      {/* корпус */}
      <rect x={-98} y={-110} width={196} height={110} fill="#F7EAD2" />
      <rect x={-104} y={-118} width={208} height={12} rx={3} fill="#D9C7A4" />
      {[-86, -62, 45, 69].map((wx, i) => win(wx, -94, i))}
      {[-86, -62, 45, 69].map((wx, i) => win(wx, -52, 10 + i))}
      {/* центральный вход с фронтоном */}
      <rect x={-34} y={-142} width={68} height={142} fill="#FFFFFF" />
      <path d="M -42 -140 L 0 -168 L 42 -140 Z" fill={C.yellow} />
      <path
        d="M -42 -140 L 0 -168 L 42 -140"
        fill="none"
        stroke={C.yellowDeep}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <circle cx={0} cy={-118} r={10} fill={C.yellowSoft} stroke={C.yellowDeep} strokeWidth={3} />
      {win(-8.5, -98, 30)}
      <rect x={-17} y={-46} width={34} height={46} rx={3} fill={C.yellowDeep} />
      <rect x={-1} y={-46} width={2} height={46} fill="#C99400" />
      <rect x={-30} y={-6} width={60} height={6} fill="#DCD5C8" />
    </svg>
  );
};

const MOM_PLACE = (): Place => ({ x: ST.momX, y: ST.momY, h: 92 });
const SON_PLACE = (): Place => ({ x: ST.sonX, y: ST.momY + 2, h: 62 });
const MOM_FACE = () => 0.55;
const SON_FACE = () => 0.35;

// Машет рукой (rig, армR — рука справа на экране); w — подъём руки 0…1.
const wavePose = (P: Place, f: number, w: number, ph: number): PoseIn => {
  const a = clamp(w);
  if (a < 0.03) return { expr: "smile" };
  return {
    expr: "smile",
    armR: {
      target: atBody(
        P,
        lerp(118, 168, a) + 24 * Math.sin(f * 0.5 + ph) * a,
        lerp(-560, -1010, a),
      ),
      shape: "wave",
      elbow: "out",
    },
  };
};

// Лупа «Кур тагылган»: крупно ребёнок в кресле автомобиля, ремень по диагонали.
const Loupe: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly a: number;
  readonly tx: number;
  readonly ty: number;
}> = ({ x, y, a, tx, ty }) => {
  if (a <= 0.01) return null;
  const R = 46;
  return (
    <div
      style={box({
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity: clamp(a * 1.6),
        transform: `scale(${0.55 + 0.45 * a})`,
      })}
    >
      <svg
        width={1}
        height={1}
        style={box({ left: 0, top: 0, overflow: "visible" })}
      >
        <path
          d={`M ${-R * 0.55} ${R * 0.78} L ${tx - x} ${ty - y}`}
          stroke="#FFFFFF"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle cx={tx - x} cy={ty - y} r={5} fill="#FFFFFF" />
      </svg>
      <div
        style={box({
          left: -R - 5,
          top: -R - 5,
          width: 2 * R,
          height: 2 * R,
          borderRadius: "50%",
          overflow: "hidden",
          border: "5px solid #FFFFFF",
          backgroundColor: "#CFE2F2",
          boxShadow: "0 8px 18px rgba(20,40,90,0.25)",
        })}
      >
        <svg width={2 * R} height={2 * R} viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`}>
          <path
            d="M -30 50 L -30 -4 Q -30 -24 -10 -24 L 12 -24 Q 30 -24 30 -4 L 30 50 Z"
            fill="#5A6170"
          />
          <path d="M -27 50 Q -25 12 0 10 Q 25 12 27 50 Z" fill="#F28C5B" />
          <circle cx={0} cy={-8} r={15} fill="#E3B08A" />
          <path d="M -15 -12 Q -2 -30 15 -12 Q 2 -22 -15 -12 Z" fill="#3B2B24" />
          <path
            d="M -5 -3 Q 0 1 5 -3"
            fill="none"
            stroke="#8A4B36"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d="M -19 14 L 18 44"
            stroke="#2A2E36"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <rect x={10} y={32} width={14} height={9} rx={2} fill="#C9CED6" transform="rotate(39 17 36)" />
        </svg>
      </div>
      <div
        style={box({
          left: R + 12,
          top: -27,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 16px 6px 8px",
          borderRadius: 999,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 6px 16px rgba(20,40,90,0.18)",
          whiteSpace: "nowrap",
          fontFamily,
          fontWeight: 900,
          fontSize: 32,
          color: C.navy,
        })}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: C.mintDeep,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={26} />
        </div>
        {T.belt}
      </div>
    </div>
  );
};

const CarSprite: React.FC<{ readonly c: CarState }> = ({ c }) => {
  const sl = clamp((c.speed - 1.5) / 6) * 0.6;
  const rear = -250 * ST.carS - 10;
  return (
    <div
      style={box({
        left: c.x,
        top: ST.carY + c.bob,
        width: 0,
        height: 0,
        transform: `scaleX(${c.dir}) rotate(${c.pitch}deg)`,
      })}
    >
      {sl > 0.02 ? (
        <svg
          width={1}
          height={1}
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          {[
            [-30, 34],
            [-52, 22],
            [-14, 18],
          ].map(([yy, len], i) => (
            <line
              key={i}
              x1={rear - len * (0.6 + c.speed / 10)}
              y1={yy}
              x2={rear}
              y2={yy}
              stroke="#FFFFFF"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={sl}
            />
          ))}
        </svg>
      ) : null}
      <WhiteCar x={0} y={0} s={ST.carS} kid={c.kid} wheel={c.wheel} />
    </div>
  );
};

// Улица (без неба): горы с параллаксом, газон, тротуар, дорога, дом, школа,
// тополя, мама (и сын), машина. Масштаб s, сдвиг ty, камера camX.
const Street: React.FC<{
  readonly uid: string;
  readonly f: number;
  readonly pm: boolean;
  readonly camX: number;
  readonly s: number;
  readonly ty: number;
  readonly car: CarState | null;
  readonly mom?: { readonly wave: number; readonly son: boolean };
  readonly loupe?: number;
}> = ({ uid, f, pm, camX, s, ty, car, mom, loupe = 0 }) => (
  <div
    style={box({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      transform: `translateY(${ty}px) scale(${s})`,
    })}
  >
    <svg
      width={1}
      height={1}
      style={box({
        left: 0,
        top: 0,
        overflow: "visible",
        transform: `translateX(${-camX * 0.3}px)`,
      })}
    >
      <path d={MOUNTAINS} fill={pm ? "#E8C9AF" : "#C4D6E9"} />
      <path d={SNOW} fill={pm ? "#FFF4E8" : "#F6FAFD"} />
    </svg>
    <div style={box({ left: 0, top: 0, transform: `translateX(${-camX}px)` })}>
      <svg
        width={1}
        height={1}
        style={box({ left: 0, top: 0, overflow: "visible" })}
      >
        <rect x={-900} y={ST.yard} width={1800} height={ST.walk - ST.yard + 2} fill={pm ? "#D6E0B6" : "#CFE4BD"} />
        <rect x={-900} y={ST.walk} width={1800} height={ST.curb - ST.walk} fill="#ECE6DB" />
        <rect x={-900} y={ST.curb - 3} width={1800} height={5} fill="#CFC7BA" />
        <rect x={-900} y={ST.curb + 2} width={1800} height={ST.road - ST.curb - 2} fill="#A9B1BC" />
        <line
          x1={-900}
          y1={ST.dash}
          x2={900}
          y2={ST.dash}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={4}
          strokeDasharray="26 22"
        />
        <rect x={-900} y={ST.road} width={1800} height={7} fill="#DAD4C9" />
        <rect x={-900} y={ST.road + 7} width={1800} height={300} fill={pm ? "#CBDBA9" : "#C6E0AC"} />
      </svg>
      <Tree x={-330} y={ST.walk} s={0.19} kind="poplar" />
      <Tree x={-82} y={ST.walk} s={0.21} kind="poplar" />
      <Tree x={60} y={ST.walk} s={0.16} kind="round" tone={pm ? 1 : 0} />
      <Tree x={350} y={ST.walk} s={0.2} kind="poplar" />
      <div
        style={box({
          left: ST.houseX - ST.houseW / 2,
          top: ST.walk + 2,
          width: 0,
          height: 0,
          transformOrigin: "0 0",
          transform: `scale(${ST.houseW / 600})`,
        })}
      >
        <PanelHouse
          x={0}
          y={0}
          w={600}
          floors={5}
          color={pm ? "#EDD7BC" : "#E8DDCB"}
          seed={4}
          door={300}
        />
      </div>
      <School x={ST.schoolX} y={ST.walk + 2} f={f} />
      {mom ? (
        <>
          <Actor
            uid={`${uid}-mom`}
            look="mom"
            f={f}
            place={MOM_PLACE}
            face={MOM_FACE}
            pose={() => wavePose(MOM_PLACE(), f, mom.wave, 0)}
            seed={5}
          />
          {mom.son ? (
            <Actor
              uid={`${uid}-son`}
              look="son"
              f={f}
              place={SON_PLACE}
              face={SON_FACE}
              pose={() => wavePose(SON_PLACE(), f, 1, 1.7)}
              seed={9}
            />
          ) : null}
        </>
      ) : null}
      {car ? <CarSprite c={car} /> : null}
      {car && loupe > 0 ? (
        <Loupe
          x={car.x + 26}
          y={ST.carY - 140}
          a={loupe}
          tx={car.x - 19}
          ty={ST.carY - 58}
        />
      ) : null}
    </div>
    {pm ? (
      <div
        style={box({
          left: -900,
          top: -400,
          width: 1800,
          height: 800,
          backgroundColor: "rgba(255,170,90,0.08)",
        })}
      />
    ) : null}
  </div>
);

// ---------- Диск-окно ----------
// Повторяет рисунок Token (мятный ободок, звезда, «АКЫСЫЗ»), а при open → 1
// лицевая сторона раскрывается ирисом и внутри видна мини-сцена.
const STAR =
  "M 0 -26 L 7.6 -10.4 L 24.7 -8 L 12.4 4 L 15.3 21 L 0 13 L -15.3 21 L -12.4 4 L -24.7 -8 L -7.6 -10.4 Z";

const arcD = (a0: number, a1: number, rr: number) => {
  const p = (a: number) =>
    `${rr * Math.cos((a * Math.PI) / 180)} ${rr * Math.sin((a * Math.PI) / 180)}`;
  return `M ${p(a0)} A ${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
};

// Стрелка по ободу (по часовой стрелке от a0 на span·p градусов).
const RimArrow: React.FC<{ readonly a0: number; readonly span: number; readonly p: number }> = ({
  a0,
  span,
  p,
}) => {
  if (p <= 0.01) return null;
  const rr = 53.4;
  const a1 = a0 + span * p;
  const r1 = (a1 * Math.PI) / 180;
  const e = { x: rr * Math.cos(r1), y: rr * Math.sin(r1) };
  const t = { x: -Math.sin(r1), y: Math.cos(r1) };
  const n = { x: Math.cos(r1), y: Math.sin(r1) };
  const head = `M ${e.x + t.x * 4} ${e.y + t.y * 4} L ${e.x + n.x * 3 - t.x * 0.6} ${e.y + n.y * 3 - t.y * 0.6} L ${e.x - n.x * 3 - t.x * 0.6} ${e.y - n.y * 3 - t.y * 0.6} Z`;
  const d = arcD(a0, a1, rr);
  return (
    <g>
      <path d={d} fill="none" stroke={C.navy} strokeWidth={3.6} strokeLinecap="round" />
      <path d={head} fill={C.navy} stroke={C.navy} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.yellow} strokeWidth={2.1} strokeLinecap="round" />
      <path d={head} fill={C.yellow} />
    </g>
  );
};

const discShadow = (lift: number, sh: number) =>
  `drop-shadow(0 ${(4 + 14 * lift) * sh}px ${(6 + 16 * lift) * sh}px rgba(20,40,90,${0.18 + 0.1 * lift}))`;

const Disc: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly open: number;
  readonly lift?: number;
  readonly glow?: number;
  readonly rotY?: number;
  readonly squash?: number;
  readonly half?: "top" | "bottom";
  readonly dy?: number;
  readonly rot?: number;
  readonly opacity?: number;
  readonly gray?: number;
  readonly seam?: number;
  readonly arcs?: readonly [number, number];
  readonly glint?: number; // угол огонька на ободе (NaN — нет)
  readonly sheen?: number; // −1…1 — положение блика (вне — нет)
  readonly shadow?: boolean; // своя тень (у половинок — общая, снаружи)
  readonly children?: React.ReactNode;
}> = (p) => {
  const { x, y, r, open } = p;
  const lift = p.lift ?? 0;
  const glow = p.glow ?? 0;
  const iris = easeOut(clamp(open));
  const k = r / R_FULL;
  const lt = clamp((r - 54) / 14); // подпись «АКЫСЫЗ» с ростом жетона
  const faceA = 1 - clamp(open * 1.8);
  const fillR = lerp(49, 52.5, iris);
  const wr = ((r * 50) / 60) * iris;
  const sq = p.squash ?? 0;
  const rotY = p.rotY ?? 0;
  const back = Math.cos((rotY * Math.PI) / 180) < 0;
  const sh = 1 + 1.4 * k;
  const clip =
    p.half === "top"
      ? "polygon(-30% -30%, 130% -30%, 130% 50%, -30% 50%)"
      : p.half === "bottom"
        ? "polygon(-30% 50%, 130% 50%, 130% 130%, -30% 130%)"
        : undefined;
  const sheen = p.sheen ?? 9;
  const arcs = p.arcs ?? [0, 0];
  const glint = p.glint ?? NaN;
  // left/top — целые пиксели (иначе медленное плавание диска идёт
  // ступеньками по 1 px), дробный остаток — в transform (субпиксельно).
  const left = Math.round(x - r);
  const top = Math.round(y - r);
  return (
    <div
      style={box({
        left,
        top,
        width: 2 * r,
        height: 2 * r,
        opacity: p.opacity ?? 1,
        transform: `translate(${x - r - left}px, ${y - r - top + (p.dy ?? 0)}px) rotate(${p.rot ?? 0}deg) perspective(1600px) rotateY(${rotY}deg) scale(${1 + 0.08 * sq}, ${1 - 0.1 * sq})`,
        filter:
          [
            p.shadow === false ? "" : discShadow(lift, sh),
            p.gray ? `grayscale(${p.gray})` : "",
          ]
            .join(" ")
            .trim() || undefined,
      })}
    >
      <div
        style={box({
          left: 0,
          top: 0,
          width: 2 * r,
          height: 2 * r,
          clipPath: clip,
          transform: back ? "scaleX(-1)" : undefined,
        })}
      >
        <svg
          width={2 * r}
          height={2 * r}
          viewBox="-60 -60 120 120"
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          {glow > 0 ? (
            <circle
              r={58 + 6 * glow}
              fill="none"
              stroke={C.mint}
              strokeWidth={8}
              opacity={0.45 * glow}
            />
          ) : null}
          <circle r={56} fill={C.mintDeep} />
          <circle r={fillR} fill={C.mint} />
        </svg>
        {wr > 0.5 ? (
          <div
            style={box({
              left: r - wr,
              top: r - wr,
              width: 2 * wr,
              height: 2 * wr,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: C.mintSoft,
            })}
          >
            <div
              style={box({
                left: wr,
                top: wr,
                width: 0,
                height: 0,
                transform: `scale(${k})`,
              })}
            >
              {p.children}
            </div>
            {sheen > -1 && sheen < 1 ? (
              <div
                style={box({
                  left: 0,
                  top: 0,
                  width: 2 * wr,
                  height: 2 * wr,
                  background:
                    "linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.62) 50%, rgba(255,255,255,0) 62%)",
                  transform: `translateX(${sheen * 2 * wr}px)`,
                })}
              />
            ) : null}
            <div
              style={box({
                left: 0,
                top: 0,
                width: 2 * wr,
                height: 2 * wr,
                borderRadius: "50%",
                boxShadow: `inset 0 ${12 * k}px ${26 * k}px rgba(10,50,35,0.28), inset 0 0 0 ${4 * k}px rgba(255,255,255,0.75)`,
              })}
            />
          </div>
        ) : null}
        <svg
          width={2 * r}
          height={2 * r}
          viewBox="-60 -60 120 120"
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          {faceA > 0 ? (
            <g opacity={faceA} transform={`scale(${1 + 0.3 * (1 - faceA)})`}>
              <circle r={41} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
              <g transform={`translate(0 ${-10 * lt}) scale(${1 - 0.18 * lt})`}>
                <path d={STAR} fill="#FFFFFF" />
              </g>
              {lt > 0 ? (
                <text
                  y={30}
                  textAnchor="middle"
                  fontFamily={fontFamily}
                  fontWeight={900}
                  fontSize={14}
                  fill="#145C36"
                  opacity={lt * faceA}
                >
                  {BG35_TEXT.fill.tokenBonus}
                </text>
              ) : null}
            </g>
          ) : null}
          {p.seam ? (
            <g opacity={p.seam}>
              <rect x={-56} y={-1.05} width={112} height={2.1} fill={C.mintDeep} />
              <rect x={-50} y={-0.25} width={100} height={0.5} fill="rgba(255,255,255,0.5)" />
            </g>
          ) : null}
          <RimArrow a0={198} span={144} p={arcs[0]} />
          <RimArrow a0={18} span={144} p={arcs[1]} />
          {Number.isFinite(glint) ? (
            <circle
              cx={53.4 * Math.cos((glint * Math.PI) / 180)}
              cy={53.4 * Math.sin((glint * Math.PI) / 180)}
              r={2.4}
              fill="#FFFFFF"
              opacity={0.9}
            />
          ) : null}
        </svg>
      </div>
    </div>
  );
};

// ---------- Плашки ----------
// Точка-якорь (x, y) плашки, которая плавает вместе с диском: целые
// left/top и дробный остаток в transform — плашка движется с диском
// субпиксельно, без ступенек по 1 px.
const subpx = (x: number, y: number): React.CSSProperties => {
  const left = Math.round(x);
  const top = Math.round(y);
  return box({
    left,
    top,
    width: 0,
    height: 0,
    transform: `translate(${x - left}px, ${y - top}px)`,
  });
};

const SunIcon: React.FC<{ readonly pm: boolean }> = ({ pm }) => (
  <svg width={34} height={34} viewBox="-17 -17 34 34" style={{ overflow: "visible" }}>
    {pm ? (
      <>
        <path d="M -9 4 A 9 9 0 0 1 9 4 Z" fill={C.navy} />
        {[-150, -120, -90, -60, -30].map((a) => (
          <line
            key={a}
            x1={12 * Math.cos((a * Math.PI) / 180)}
            y1={4 + 12 * Math.sin((a * Math.PI) / 180)}
            x2={16 * Math.cos((a * Math.PI) / 180)}
            y2={4 + 16 * Math.sin((a * Math.PI) / 180)}
            stroke={C.navy}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        <line x1={-15} y1={8} x2={15} y2={8} stroke={C.navy} strokeWidth={3} strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle r={7.5} fill={C.navy} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={11 * Math.cos(a)}
              y1={11 * Math.sin(a)}
              x2={15.5 * Math.cos(a)}
              y2={15.5 * Math.sin(a)}
              stroke={C.navy}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </>
    )}
  </svg>
);

// Плашка над диском: «Эртең менен | ҮЙ → МЕКТЕП» → «Сабактан кийин |
// МЕКТЕП → ҮЙ» → «ҮЙ → МЕКТЕП» → «ҮЙ → МЕКТЕП → ҮЙ ✓» (tail, check).
const Chip: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly a: number;
  readonly rotX: number;
  readonly mode: "am" | "pm" | "route";
  readonly tail: number;
  readonly check: number;
}> = ({ x, y, a, rotX, mode, tail, check }) => {
  if (a <= 0.01) return null;
  const route = mode === "route";
  return (
    <div style={subpx(x, y)}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(-50%, -50%) perspective(700px) rotateX(${rotX}deg) scale(${a})`,
          opacity: clamp(a * 2),
          display: "flex",
          alignItems: "center",
          padding: "7px 8px",
          borderRadius: 999,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${route && check > 0 ? C.mint : C.line}`,
          boxShadow: "0 10px 26px rgba(20,40,90,0.16)",
          whiteSpace: "nowrap",
          fontFamily,
          fontWeight: 900,
          color: C.navy,
        }}
      >
        {!route ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "5px 20px 7px 12px",
              borderRadius: 999,
              backgroundColor: mode === "am" ? C.yellow : "#FFB76B",
              fontSize: 33,
            }}
          >
            <SunIcon pm={mode === "pm"} />
            {mode === "am" ? T.morning : T.afternoon}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 37,
            padding: route ? "4px 12px 6px 22px" : "4px 20px 6px 14px",
          }}
        >
          {mode === "am" ? (
            <Txt>{T.morningRoute}</Txt>
          ) : mode === "pm" ? (
            <Txt>{T.afternoonRoute}</Txt>
          ) : (
            <>
              <Txt>{ROUTE_HEAD}</Txt>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  overflow: "hidden",
                  maxWidth: 150 * clamp(tail),
                  opacity: clamp(tail * 1.5),
                }}
              >
                <Txt>{ROUTE_TAIL}</Txt>
              </span>
            </>
          )}
        </div>
        {route ? (
          <div
            style={{
              width: 54 * clamp(check),
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 2,
            }}
          >
            {check > 0 ? (
              <div
                style={{
                  width: 54,
                  height: 54,
                  flexShrink: 0,
                  borderRadius: "50%",
                  backgroundColor: C.mintDeep,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${check})`,
                }}
              >
                <Check size={38} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Плашка «Бир тарап» в щели между половинками; strike — зачёркивание.
const OneWayPill: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly p: number;
  readonly strike: number;
  readonly shake: number;
}> = ({ x, y, p, strike, shake }) => {
  if (p <= 0.01) return null;
  return (
    <div style={subpx(x, y)}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(-50%, -50%) translateX(${shake}px) rotate(${-2 - 6 * (1 - Math.min(1, p))}deg) scale(${p})`,
          opacity: clamp(p * 2),
        }}
      >
        <div
          style={{
            padding: "6px 34px 12px",
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
            border: `4px solid ${strike > 0.5 ? C.muted : C.navy}`,
            boxShadow: "0 12px 28px rgba(20,40,90,0.2)",
            fontFamily,
            fontWeight: 900,
            fontSize: 48,
            color: strike > 0.5 ? C.muted : C.navy,
            whiteSpace: "nowrap",
          }}
        >
          {T.oneWay}
        </div>
        {strike > 0 ? (
          <div
            style={{
              position: "absolute",
              left: -14,
              top: "50%",
              height: 9,
              marginTop: -4,
              width: `calc(${108 * strike}% + ${14 * strike}px)`,
              borderRadius: 5,
              backgroundColor: STRIKE,
              transformOrigin: "0 50%",
              transform: "rotate(-8deg)",
              boxShadow: "0 2px 0 rgba(255,255,255,0.8)",
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

// ---------- Сцена ----------
export const FullScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n04 = useLine("n04");
  const fullAt = useWordAt("n04", W.full);
  const morningAt = useWordAt("n04", W.morning);
  const schoolAt = useWordAt("n04", W.school);
  const afterAt = useWordAt("n04", W.after);
  const homeAt = useWordAt("n04", W.home);
  const oneWayAt = useWordAt("n04", W.oneWay);
  const sideAt = useWordAt("n04", W.oneWay + 1); // «тарапка»
  const notAt = useWordAt("n04", W.not);
  const K = FULL_KEYS;

  const closeAt = frames - K.close;
  const land = frames - K.land;

  // --- план (от слов реплики)
  const amStart = morningAt + 2;
  const amEnd = Math.max(
    amStart + 20,
    Math.min(afterAt - 6, Math.max(schoolAt + 14, amStart + 24)),
  );
  const flipFrom = afterAt - 4;
  const flipD = 16;
  const flipMid = flipFrom + flipD / 2;
  const pmStart = flipFrom + flipD - 4;
  const pmEnd = Math.max(
    pmStart + 20,
    Math.min(oneWayAt - 6, Math.max(homeAt + 8, pmStart + 24)),
  );
  const mFrom = Math.max(pmEnd + 2, oneWayAt - 6);
  const mD = 16;
  const mTo = mFrom + mD;
  const dFrom = Math.max(mTo - 2, sideAt);
  const dD = 12;
  const gagFrom = mTo - 2;
  const gagTo = Math.max(gagFrom + 20, notAt);
  const pillAt = dFrom + 3;
  const strikeFrom = Math.max(pillAt + 8, notAt - 3);
  const joinFrom = Math.min(
    Math.max(strikeFrom + 12, n04.to - 2),
    closeAt - 60,
  );
  const joinD = 14;
  const joinTo = joinFrom + joinD;
  const backArcTo = joinTo + 28;
  const exitFrom = dFrom + 6;

  // --- лоток уходит назад
  const dim =
    easeInOut((f - 6) / 26) * (1 - easeInOut((f - (closeAt + 4)) / 16));
  const cam =
    1 +
    0.022 *
      easeInOut((f - 30) / Math.max(1, closeAt - 30)) *
      (1 - easeInOut((f - closeAt) / 18));

  // --- диск: полёт, рост, плавание, закрытие, возврат
  const P0 = bonusPos(0);
  const float =
    3.5 *
    Math.sin((f - 60) / 22) *
    easeOut((f - 56) / 20) *
    (1 - easeInOut((f - closeAt) / 10));
  const D = { x: FULL_DISC.x, y: FULL_DISC.y + float };
  let pos: { x: number; y: number };
  let r: number;
  let rotY: number;
  let lift: number;
  let glow: number;
  let sq: number;
  let open: number;
  const endGlow = FULL_END.glowBonus * easeOut((f - (land - 6)) / 12);
  if (f < closeAt) {
    const tl = easeOut((f - K.lift) / 10);
    const tf = easeInOut((f - K.fly) / (K.flyEnd - K.fly));
    pos = bez({ x: P0.x, y: P0.y - 30 * tl }, { x: 352, y: 1100 }, D, tf);
    const rFly = 48 + 10 * tl + 66 * easeIn(tf);
    r = lerp(rFly, R_FULL, pop(f, K.grow, K.growD));
    rotY = 360 * easeInOut((f - K.fly) / (K.flyEnd - K.fly + 4));
    lift = tl * (1 - 0.45 * easeInOut((f - 50) / 20));
    glow = tl * (1 - easeInOut((f - K.iris) / 12));
    sq = keys(f, [
      [0, 0],
      [2, 0.55],
      [6, -0.35],
      [11, 0.12],
      [15, 0],
    ]);
    open = easeInOut((f - K.iris) / K.irisD);
  } else {
    open = 1 - easeInOut((f - closeAt) / 12);
    const tb = clamp((f - (closeAt + 6)) / (land - closeAt - 6));
    const eb = easeInOut(tb);
    pos = bez(D, { x: 690, y: 1110 }, P0, eb);
    const r1 = lerp(R_FULL, 60, easeInOut((f - (closeAt + 3)) / 15));
    r = lerp(r1, 48, easeIn(tb));
    rotY = -360 * eb;
    lift = 0.55 * (1 - easeIn(tb));
    glow = Math.max(endGlow, 0.5 * bump(f - closeAt, 24));
    sq = settle(f - land);
  }

  // --- переворот (утро → день)
  // +0,5 кадра: ни один кадр не попадает ровно на 90° (диск «ребром»
  // исчезал на кадр); лицевая сторона меняется на flipMid — как раз между
  // кадрами < 90° и > 90°.
  const flipT = clamp((f - flipFrom + 0.5) / flipD);
  const flipA = f >= flipFrom && f < flipFrom + flipD ? 180 * easeInOut(flipT) : 0;
  const flipB = Math.sin(Math.PI * flipT);
  const pmFace = f >= flipMid;

  // --- утро
  const amCar = drive(f, amStart, amEnd, ST.amFrom, ST.amTo, true);
  const amCam = lerp(
    ST.camHome,
    ST.camSchool,
    easeInOut((f - amStart + 4) / (amEnd - amStart + 8)),
  );
  const amSunY = lerp(40, -150, easeOut((f - 44) / Math.max(30, afterAt - 44)));
  const loupe =
    easeOut((f - 54) / 10) * (1 - easeInOut((f - (amStart + 12)) / 10));

  // --- день
  const pmCar = drive(f, pmStart, pmEnd, ST.pmFrom, ST.pmTo, true);
  const pmCam = lerp(
    ST.camSchool,
    ST.camHome,
    easeInOut((f - pmStart + 4) / (pmEnd - pmStart + 8)),
  );
  const pmSunY = lerp(-160, -138, easeInOut((f - flipMid) / 60));
  const momWave = easeOut((f - (pmEnd - 14)) / 10);

  // --- половинки
  const tm = easeInOut((f - mFrom) / mD);
  const amIn = easeOut((f - (mFrom + 2)) / (mD - 2));
  const det =
    easeOut((f - dFrom) / dD) * (1 - easeIn((f - joinFrom) / joinD));
  const son = f >= dFrom + 4;
  const gagCar = drive(f, gagFrom, gagTo, ST.amFrom, ST.amTo, true);
  const pmCarC: CarState | null = !son
    ? drive(f, 0, 1, ST.pmTo, ST.pmTo, true)
    : f < exitFrom + 26
      ? drive(f, exitFrom, exitFrom + 26, ST.pmTo, -620, false, easeIn)
      : null;
  const seam =
    easeOut((f - (mTo - 6)) / 6) * (1 - easeInOut((f - closeAt) / 8));
  const arcsA = 1 - easeIn((f - closeAt) / 8);
  const arcs: [number, number] = [
    easeInOut((f - gagFrom) / Math.max(1, gagTo - gagFrom)) * arcsA,
    easeInOut((f - joinTo) / (backArcTo - joinTo)) * arcsA,
  ];
  // огонёк пробегает петлю ровно один круг и завершает его к закрытию
  // диска (не обрывается на полпути при более коротком хвосте сцены)
  const glintFrom = backArcTo + 4;
  const glintD = Math.max(30, closeAt - 2 - glintFrom);
  const glint =
    f >= glintFrom && f < Math.min(closeAt, glintFrom + glintD)
      ? 198 + 360 * cruise((f - glintFrom) / glintD)
      : NaN;
  const joinSq = 0.45 * settle(f - joinTo);
  const sheen =
    f >= flipFrom && f < flipFrom + flipD
      ? -1 + 2 * flipT
      : f >= backArcTo && f < backArcTo + 20
        ? -1 + (2 * (f - backArcTo)) / 20
        : 9;

  // --- плашки
  const chipA =
    pop(f, morningAt - 6, 14) * (1 - easeIn((f - (closeAt - 8)) / 8));
  // как у диска: +0,5 кадра, плашка не встаёт ровно ребром (90°)
  const flip1 = 180 * easeInOut((f - (afterAt - 1) + 0.5) / 12);
  const flip2 = 180 * easeInOut((f - (mFrom + 1) + 0.5) / 12);
  const chipMode: "am" | "pm" | "route" =
    flip2 >= 90 ? "route" : flip1 >= 90 ? "pm" : "am";
  const chipRot =
    flip2 > 0
      ? flip2 < 90
        ? flip2
        : flip2 - 180
      : flip1 < 90
        ? flip1
        : flip1 - 180;
  const tail = easeOut((f - joinTo) / 12);
  const check = pop(f, joinTo + 5, 12);
  const topLift = -16 * det;
  const pillP = pop(f, pillAt, 12) * (1 - easeIn((f - joinFrom) / 7));
  const strike = easeOut((f - strikeFrom) / 8);
  const sk = f - strikeFrom - 5;
  const shake = sk > 0 ? 11 * Math.sin(sk * 1.5) * Math.exp(-sk / 5) : 0;
  const tagA = 1 - easeInOut((f - (closeAt + 10)) / 8);

  // --- содержимое окна
  const amFull = (uid: string) => (
    <>
      <Sky pm={false} top={-SR} h={2 * SR} f={f} sun={{ x: -30, y: amSunY, s: 1 }} clouds={1} />
      <Street uid={uid} f={f} pm={false} camX={amCam} s={FS} ty={FTY} car={amCar} loupe={loupe} />
    </>
  );
  const pmFull = (uid: string) => (
    <>
      <Sky pm top={-SR} h={2 * SR} f={f} sun={{ x: 140, y: pmSunY, s: 1 }} clouds={1} />
      <Street
        uid={uid}
        f={f}
        pm
        camX={pmCam}
        s={FS}
        ty={FTY}
        car={pmCar}
        mom={{ wave: momWave, son: false }}
      />
    </>
  );
  const composite = (uid: string) => (
    <>
      <Sky
        pm
        top={lerp(-SR, 0, tm)}
        h={lerp(2 * SR, SR, tm)}
        f={f}
        sun={{ x: lerp(140, 18, tm), y: lerp(pmSunY, 26, tm), s: lerp(1, 0.6, tm) }}
        clouds={1 - tm}
      />
      <Street
        uid={`${uid}-pm`}
        f={f}
        pm
        camX={lerp(ST.camHome, 0, tm)}
        s={lerp(FS, HS, tm)}
        ty={lerp(FTY, PM_TY, tm)}
        car={pmCarC}
        mom={{ wave: momWave, son }}
      />
      {amIn > 0 ? (
        <div
          style={box({
            left: -SR - 6,
            top: -SR - 6,
            width: 2 * SR + 12,
            height: SR + 6,
            overflow: "hidden",
          })}
        >
          <div
            style={box({
              left: SR + 6,
              top: SR + 6,
              width: 0,
              height: 0,
              transform: `translateY(${(amIn - 1) * (SR + 12)}px)`,
            })}
          >
            {/* створка: обрезана по своей дороге (у диаметра) */}
            <div
              style={box({
                left: -SR - 6,
                top: -SR - 6,
                width: 2 * SR + 12,
                height: SR + 6,
                overflow: "hidden",
              })}
            >
              <div style={box({ left: SR + 6, top: SR + 6, width: 0, height: 0 })}>
                <Sky pm={false} top={-SR} h={SR} f={f} sun={{ x: -24, y: -206, s: 0.72 }} clouds={1} />
                <Street
                  uid={`${uid}-am`}
                  f={f}
                  pm={false}
                  camX={0}
                  s={HS}
                  ty={AM_TY}
                  car={gagCar}
                />
              </div>
            </div>
            {amIn < 1 ? (
              <div
                style={box({
                  left: -SR - 6,
                  top: -8,
                  width: 2 * SR + 12,
                  height: 8,
                  backgroundColor: C.mintDeep,
                  boxShadow: "0 6px 12px rgba(10,50,35,0.25)",
                })}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );

  // створки: с mFrom окно — «медальон» из двух половин; двумя отдельными
  // копиями (обрезанными по диаметру) рисуется, только пока половины врозь
  const locket = f >= mFrom;
  const split = locket && det > 0.0005;
  const showDisc = f >= 1 && f < land + 8;
  const discBase = {
    x: pos.x,
    y: pos.y,
    r,
    open,
    lift: lift + 0.5 * flipB,
    glow,
    rotY: rotY + flipA,
  };
  const discScale = 1 + 0.05 * flipB;

  // мятные волны: защёлкивание половинок и посадка жетона
  const ringJoin = f - joinTo;
  const ringLand = f - land;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        overflow: "hidden",
        fontFamily,
      }}
    >
      {/* ---------- сцена под камерой ---------- */}
      <div
        style={box({
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: `${FULL_DISC.x}px ${FULL_DISC.y}px`,
          transform: `scale(${cam})`,
        })}
      >
        {/* лоток: отъезжает назад, тускнеет и размывается */}
        <div
          style={box({
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            transformOrigin: `${TRAY.cx}px ${TRAY.cy}px`,
            transform: `scale(${1 - 0.06 * dim})`,
            opacity: 1 - 0.62 * dim,
            filter: dim > 0.01 ? `blur(${4.5 * dim}px)` : undefined,
          })}
        >
          <TrayFrame v={TRAY_HOME}>
            <FullTray hideBonus={[showDisc, false]} glowBonus={endGlow} />
          </TrayFrame>
        </div>

        {/* светлый ореол за диском — отделяет «окно» от лотка */}
        {dim > 0.01 ? (
          <div
            style={box({
              left: D.x - 540,
              top: D.y - 540,
              width: 1080,
              height: 1080,
              borderRadius: "50%",
              opacity: dim,
              background:
                "radial-gradient(circle, rgba(255,253,247,0.96) 0%, rgba(255,253,247,0.86) 46%, rgba(232,246,236,0.5) 58%, rgba(255,253,247,0) 70%)",
            })}
          />
        ) : null}

        {/* диск-окно */}
        {showDisc ? (
          <div
            style={box({
              left: 0,
              top: 0,
              width: 1080,
              height: 1920,
              transformOrigin: `${pos.x}px ${pos.y}px`,
              transform: `scale(${discScale})`,
              // у половинок общая тень: тень верхней не ложится на нижнюю
              filter: split
                ? discShadow(discBase.lift, 1 + (1.4 * r) / R_FULL)
                : undefined,
            })}
          >
            {split ? (
              <>
                <Disc
                  {...discBase}
                  half="bottom"
                  dy={120 * det}
                  rot={7 * det}
                  opacity={1 - 0.45 * det}
                  gray={0.9 * det}
                  squash={sq + joinSq}
                  seam={seam}
                  arcs={arcs}
                  glint={glint}
                  sheen={sheen}
                  shadow={false}
                >
                  {open > 0 ? composite("b") : null}
                </Disc>
                <Disc
                  {...discBase}
                  half="top"
                  dy={topLift}
                  squash={sq + joinSq}
                  seam={seam}
                  arcs={arcs}
                  glint={glint}
                  sheen={sheen}
                  shadow={false}
                >
                  {open > 0 ? composite("t") : null}
                </Disc>
              </>
            ) : (
              <Disc
                {...discBase}
                squash={sq + joinSq}
                sheen={sheen}
                seam={locket ? seam : 0}
                arcs={arcs}
                glint={glint}
              >
                {open > 0
                  ? locket
                    ? composite("c")
                    : pmFace
                      ? pmFull("p")
                      : amFull("a")
                  : null}
              </Disc>
            )}
          </div>
        ) : null}

        {/* волны */}
        <svg
          width={1080}
          height={1920}
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          {ringJoin >= 0 && ringJoin < 18 ? (
            <circle
              cx={D.x}
              cy={D.y}
              r={R_FULL * VIS + 6 + 70 * easeOut(ringJoin / 18)}
              fill="none"
              stroke={C.mintDeep}
              strokeWidth={10 * (1 - easeOut(ringJoin / 18))}
              opacity={0.65 * (1 - easeOut(ringJoin / 18))}
            />
          ) : null}
          {ringLand >= 0 && ringLand < 16 ? (
            <circle
              cx={P0.x}
              cy={P0.y}
              r={TRAY.bonusR + 4 + 46 * easeOut(ringLand / 16)}
              fill="none"
              stroke={C.mintDeep}
              strokeWidth={8 * (1 - easeOut(ringLand / 16))}
              opacity={0.7 * (1 - easeOut(ringLand / 16))}
            />
          ) : null}
        </svg>

        {/* «Бир тарап» — в щели между половинками */}
        <OneWayPill
          x={D.x}
          y={D.y + 52 * det + 6}
          p={pillP}
          strike={strike}
          shake={shake}
        />

        {/* плашка над диском */}
        <Chip
          x={D.x}
          y={D.y - R_FULL * VIS + topLift}
          a={chipA}
          rotX={chipRot}
          mode={chipMode}
          tail={tail}
          check={check}
        />
      </div>

      {/* ---------- подписи (экран) ---------- */}
      <Caption
        f={f}
        at={fullAt - 2}
        out={closeAt - 4}
        text={T.eq}
        // ниже метки «Шарттуу мисал…» (38 px, y ≈ 262–342) и выше плашки
        // маршрута над диском (верх ≈ 495)
        top={378}
        size={58}
        accent={C.mintDeep}
      />
      {tagA > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: tagA }}>
          <ExampleTag f={f} at={2} />
        </div>
      ) : null}
    </div>
  );
};
