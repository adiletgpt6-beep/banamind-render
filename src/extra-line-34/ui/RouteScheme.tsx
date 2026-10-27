// Схема маршрута BalaGo №34 (SVG): плоская тёплая иллюстрация — школа
// (3 этажа, крыльцо, деревья) и подъезд пятиэтажного панельного дома.
// Это ПЛАН маршрута (пунктир со стрелкой), а не выполненная поездка.
//   mode "family" — запрос семьи: МЕКТЕП слева → ҮЙ справа; в светлом
//                   окне дома — силуэты няни (низкий пучок, очки) и малышки
//                   (два хвостика): сына встретят дома;
//   mode "full"   — общий маршрут сервиса: ҮЙ → МЕКТЕП → ҮЙ.
// reveal 0..1 — пунктир прорисовывается от начала к концу. Подписи — из
// EL_TEXT.site. Необязательная метка — маленький белый седан (VW Polo).
// Чистая функция от пропсов; свет сверху-слева, тени вправо-вниз.
import { useId } from "react";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F } from "../theme";

export type RouteMode = "family" | "full";

// Размеры холста схемы (единицы viewBox); высота при ширине w —
// routeSchemeHeight(mode, w).
export const ROUTE_VB = {
  family: { w: 1000, h: 650 },
  full: { w: 1100, h: 560 },
} as const;
export const routeSchemeHeight = (mode: RouteMode, w: number) => (w * ROUTE_VB[mode].h) / ROUTE_VB[mode].w;

type P = { readonly x: number; readonly y: number };
type Curve = readonly [P, P, P, P];

const bez = (c: Curve, t: number): P => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return { x: a * c[0].x + b * c[1].x + d * c[2].x + e * c[3].x, y: a * c[0].y + b * c[1].y + d * c[2].y + e * c[3].y };
};
const sample = (c: Curve, n = 64): P[] => Array.from({ length: n + 1 }, (_, i) => bez(c, i / n));
const toD = (pts: readonly P[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

// Начало пути длиной r (0..1 по длине дуги), конец и направление в нём.
const partial = (pts: readonly P[], r: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = clamp(r) * total;
  const out: P[] = [pts[0]];
  let ang = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
  for (let i = 0; i < seg.length; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    ang = Math.atan2(b.y - a.y, b.x - a.x);
    if (left >= seg[i]) {
      out.push(b);
      left -= seg[i];
      continue;
    }
    const k = seg[i] ? left / seg[i] : 0;
    out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
    break;
  }
  return { pts: out, tip: out[out.length - 1], ang };
};

// ---------- Окно ----------
const Win: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly glass?: string; readonly cross?: boolean }> = ({
  x,
  y,
  w,
  h,
  glass = "#C3DAEA",
  cross = true,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={3} fill={glass} stroke="#FFFFFF" strokeWidth={4} />
    <path d={`M ${x + 6} ${y + h - 8} L ${x + w * 0.55} ${y + 6}`} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={5} strokeLinecap="round" />
    {cross ? <path d={`M ${x + w / 2} ${y + 2} L ${x + w / 2} ${y + h - 2} M ${x + 2} ${y + h * 0.4} L ${x + w - 2} ${y + h * 0.4}`} stroke="#FFFFFF" strokeWidth={3} /> : null}
    <rect x={x - 4} y={y + h + 1} width={w + 8} height={5} rx={2} fill="#FFFFFF" opacity={0.85} />
  </g>
);

// ---------- Деревья (тополь и круглое) ----------
const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly h: number }> = ({ x, y, h }) => (
  <g>
    <rect x={x - 4} y={y - h * 0.22} width={8} height={h * 0.22} rx={3} fill="#8D7258" />
    <ellipse cx={x} cy={y - h * 0.58} rx={h * 0.15} ry={h * 0.44} fill={C.green} />
    <path d={`M ${x} ${y - h * 1.02} Q ${x + h * 0.2} ${y - h * 0.6} ${x} ${y - h * 0.14} Q ${x + h * 0.12} ${y - h * 0.6} ${x} ${y - h * 1.02} Z`} fill={C.greenDark} opacity={0.55} />
    <ellipse cx={x - h * 0.05} cy={y - h * 0.74} rx={h * 0.04} ry={h * 0.16} fill="#FFFFFF" opacity={0.16} />
  </g>
);

const RoundTree: React.FC<{ readonly x: number; readonly y: number; readonly r: number }> = ({ x, y, r }) => (
  <g>
    <rect x={x - 5} y={y - r * 0.9} width={10} height={r * 0.9} rx={4} fill="#8D7258" />
    <circle cx={x} cy={y - r * 1.55} r={r} fill="#98B887" />
    <circle cx={x + r * 0.55} cy={y - r * 1.25} r={r * 0.62} fill="#86A97C" />
    <circle cx={x - r * 0.5} cy={y - r * 1.25} r={r * 0.6} fill="#A5C394" />
    <circle cx={x - r * 0.3} cy={y - r * 1.9} r={r * 0.35} fill="#FFFFFF" opacity={0.14} />
  </g>
);

// ---------- Школа: 3 этажа, центральный вход с козырьком ----------
const SC = { wall: "#F3DEBA", shade: "#E7CB9C", center: "#F8EAD0", trim: "#C8876B", trimDark: "#B07259", door: "#7FA3BC" };
const School: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({ x, y, s }) => {
  const wins: React.ReactNode[] = [];
  for (let k = 0; k < 3; k++) {
    for (const cx of [-150, -98, 98, 150]) wins.push(<Win key={`w${k}${cx}`} x={cx - 20} y={-70 * (k + 1) + 14} w={40} h={40} />);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={18} cy={6} rx={214} ry={15} fill="rgba(23,38,61,0.10)" />
      <rect x={-185} y={-224} width={370} height={224} fill={SC.wall} />
      <rect x={148} y={-224} width={37} height={224} fill={SC.shade} opacity={0.6} />
      <rect x={-185} y={-74} width={370} height={6} fill={SC.shade} opacity={0.7} />
      <rect x={-185} y={-144} width={370} height={6} fill={SC.shade} opacity={0.7} />
      <rect x={-185} y={-16} width={370} height={16} fill={SC.shade} />
      <rect x={-196} y={-240} width={392} height={20} rx={5} fill={SC.trim} />
      {wins}
      {/* центральный блок с фронтоном и эмблемой-книгой */}
      <rect x={-64} y={-262} width={128} height={262} fill={SC.center} />
      <rect x={40} y={-262} width={24} height={262} fill={SC.shade} opacity={0.35} />
      <path d="M -80 -256 L 0 -306 L 80 -256 Z" fill={SC.trim} />
      <path d="M -80 -256 L 0 -306 L 0 -296 L -66 -256 Z" fill="#FFFFFF" opacity={0.18} />
      <rect x={-80} y={-262} width={160} height={9} rx={3} fill={SC.trimDark} />
      <circle cx={0} cy={-222} r={21} fill="#FFFFFF" stroke={SC.trim} strokeWidth={4} />
      <path d="M -12 -229 Q -6 -233 0 -229 Q 6 -233 12 -229 L 12 -213 Q 6 -217 0 -213 Q -6 -217 -12 -213 Z" fill={C.yellow} stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M 0 -229 L 0 -213" stroke={C.ink} strokeWidth={2} />
      <Win x={-30} y={-192} w={60} h={40} />
      <Win x={-30} y={-124} w={60} h={40} />
      {/* вход */}
      <rect x={-48} y={-94} width={96} height={13} rx={5} fill={SC.trim} />
      <rect x={-31} y={-81} width={62} height={67} fill={SC.door} />
      <rect x={-27} y={-77} width={25} height={40} rx={2} fill="#A9C6DA" />
      <rect x={2} y={-77} width={25} height={40} rx={2} fill="#A9C6DA" />
      <path d="M 0 -81 L 0 -14" stroke="#5F8299" strokeWidth={3} />
      <rect x={-52} y={-14} width={104} height={7} rx={2} fill="#E2D5BF" />
      <rect x={-60} y={-7} width={120} height={7} rx={2} fill="#D9CAB1" />
    </g>
  );
};

// ---------- Подъезд панельной пятиэтажки ----------
const HM = {
  wall: "#E9E5DC",
  seam: "#D7D1C4",
  shade: "#DAD4C7",
  plinth: "#D3CCBE",
  roof: "#C7C0B2",
  door: "#8A7766",
  canopy: "#9BAAB7",
  rail: "#C9C2B3",
  lit: "#FFD98A",
  litCore: "#FFF0C6",
  sil: "#5E4B5C",
};
const STOREY = 62;
const PLINTH = 24;
const storeyTop = (k: number) => -PLINTH - STOREY * (k + 1);

// Светлое окно (2-й этаж, справа): няня (профиль вправо, низкий пучок,
// очки) и малышка (лицом к ней, два хвостика).
const LitWindow: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly people: boolean; readonly id: string }> = ({ x, y, w, h, people, id }) => (
  <g>
    <defs>
      <radialGradient id={`${id}lit`} cx="0.45" cy="0.4" r="0.75">
        <stop offset="0" stopColor={HM.litCore} />
        <stop offset="1" stopColor={HM.lit} />
      </radialGradient>
      <radialGradient id={`${id}glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFE3A0" stopOpacity={0.75} />
        <stop offset="1" stopColor="#FFE3A0" stopOpacity={0} />
      </radialGradient>
      <clipPath id={`${id}wc`}>
        <rect x={x} y={y} width={w} height={h} rx={3} />
      </clipPath>
    </defs>
    <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.95} ry={h * 1.15} fill={`url(#${id}glow)`} />
    <rect x={x} y={y} width={w} height={h} rx={3} fill={`url(#${id}lit)`} />
    <g clipPath={`url(#${id}wc)`}>
      {/* шторы по краям */}
      <path d={`M ${x} ${y} L ${x + w * 0.12} ${y} Q ${x + w * 0.08} ${y + h * 0.6} ${x + w * 0.14} ${y + h} L ${x} ${y + h} Z`} fill="#F2B98A" opacity={0.85} />
      <path d={`M ${x + w} ${y} L ${x + w * 0.88} ${y} Q ${x + w * 0.92} ${y + h * 0.6} ${x + w * 0.86} ${y + h} L ${x + w} ${y + h} Z`} fill="#F2B98A" opacity={0.85} />
      {people ? (
        <g fill={HM.sil}>
          {/* няня: плечи, голова, низкий пучок сзади, очки */}
          <path d={`M ${x + w * 0.14} ${y + h} Q ${x + w * 0.16} ${y + h * 0.62} ${x + w * 0.3} ${y + h * 0.6} Q ${x + w * 0.44} ${y + h * 0.62} ${x + w * 0.47} ${y + h} Z`} />
          <rect x={x + w * 0.27} y={y + h * 0.5} width={w * 0.07} height={h * 0.14} />
          <circle cx={x + w * 0.31} cy={y + h * 0.36} r={h * 0.2} />
          <path d={`M ${x + w * 0.39} ${y + h * 0.35} L ${x + w * 0.43} ${y + h * 0.42} L ${x + w * 0.385} ${y + h * 0.45} Z`} />
          <circle cx={x + w * 0.205} cy={y + h * 0.45} r={h * 0.105} />
          <circle cx={x + w * 0.37} cy={y + h * 0.33} r={h * 0.065} fill="none" stroke="#FFE9B8" strokeWidth={h * 0.03} />
          <path d={`M ${x + w * 0.33} ${y + h * 0.32} L ${x + w * 0.26} ${y + h * 0.31}`} stroke="#FFE9B8" strokeWidth={h * 0.025} strokeLinecap="round" fill="none" />
          {/* малышка: два хвостика на макушке, лицом к няне */}
          <path d={`M ${x + w * 0.55} ${y + h} Q ${x + w * 0.56} ${y + h * 0.74} ${x + w * 0.64} ${y + h * 0.73} Q ${x + w * 0.72} ${y + h * 0.74} ${x + w * 0.73} ${y + h} Z`} />
          <circle cx={x + w * 0.64} cy={y + h * 0.6} r={h * 0.15} />
          {[-1, 1].map((k) => {
            const hx = x + w * 0.64;
            const hy = y + h * 0.6;
            const hr = h * 0.15;
            return (
              <g key={k}>
                <ellipse cx={hx + k * hr * 1.2} cy={hy - hr * 0.62} rx={hr * 0.3} ry={hr * 0.62} transform={`rotate(${k * 64} ${hx + k * hr * 1.2} ${hy - hr * 0.62})`} />
                <circle cx={hx + k * hr * 0.86} cy={hy - hr * 0.62} r={hr * 0.22} fill="#F2A2B0" />
              </g>
            );
          })}
          <path d={`M ${x + w * 0.565} ${y + h * 0.6} L ${x + w * 0.535} ${y + h * 0.64} L ${x + w * 0.57} ${y + h * 0.67} Z`} />
        </g>
      ) : null}
    </g>
    <rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke="#FFFFFF" strokeWidth={4} />
    <rect x={x - 5} y={y + h + 1} width={w + 10} height={6} rx={2} fill="#FFFFFF" opacity={0.9} />
  </g>
);

const Home: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly people: boolean; readonly id: string }> = ({ x, y, s, people, id }) => {
  const parts: React.ReactNode[] = [];
  for (let k = 0; k < 5; k++) {
    const t = storeyTop(k);
    // левая колонка: окна с балконами (со 2-го этажа)
    parts.push(<Win key={`l${k}`} x={-128} y={t + 12} w={66} h={36} />);
    if (k > 0) {
      parts.push(
        <g key={`b${k}`}>
          <rect x={-140} y={t + 40} width={90} height={20} rx={2} fill={HM.rail} />
          <rect x={-140} y={t + 40} width={90} height={4} fill="#FFFFFF" opacity={0.5} />
          <path
            d={`M -126 ${t + 44} L -126 ${t + 60} M -110 ${t + 44} L -110 ${t + 60} M -95 ${t + 44} L -95 ${t + 60} M -80 ${t + 44} L -80 ${t + 60} M -65 ${t + 44} L -65 ${t + 60}`}
            stroke="#B9B2A3"
            strokeWidth={2}
          />
        </g>,
      );
    }
    // правая колонка: окна; на 2-м этаже — большое светлое окно
    if (k !== 1) parts.push(<Win key={`r${k}`} x={62} y={t + 12} w={66} h={36} />);
    // лестничная клетка: узкие окна
    if (k > 0) parts.push(<Win key={`s${k}`} x={-13} y={t + 14} w={26} h={34} cross={false} />);
  }
  const lt = storeyTop(1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={18} cy={6} rx={176} ry={14} fill="rgba(23,38,61,0.10)" />
      <rect x={-150} y={-PLINTH - STOREY * 5} width={300} height={PLINTH + STOREY * 5} fill={HM.wall} />
      <rect x={124} y={-PLINTH - STOREY * 5} width={26} height={PLINTH + STOREY * 5} fill={HM.shade} opacity={0.7} />
      {[1, 2, 3, 4].map((k) => (
        <rect key={k} x={-150} y={-PLINTH - STOREY * k - 1} width={300} height={2.5} fill={HM.seam} />
      ))}
      <rect x={-37} y={-PLINTH - STOREY * 5} width={2.5} height={STOREY * 5} fill={HM.seam} />
      <rect x={35} y={-PLINTH - STOREY * 5} width={2.5} height={STOREY * 5} fill={HM.seam} />
      <rect x={-156} y={-PLINTH - STOREY * 5 - 12} width={312} height={14} rx={3} fill={HM.roof} />
      <rect x={-150} y={-PLINTH} width={300} height={PLINTH} fill={HM.plinth} />
      {parts}
      <LitWindow x={50} y={lt + 6} w={96} h={54} people={people} id={id} />
      {/* вход в подъезд: козырёк, дверь, ступени, скамейка */}
      <rect x={-38} y={-100} width={76} height={11} rx={4} fill={HM.canopy} />
      <path d="M -32 -89 L -32 -26 M 32 -89 L 32 -26" stroke="#AEB9C3" strokeWidth={3} />
      <rect x={-22} y={-88} width={44} height={64} rx={3} fill={HM.door} />
      <rect x={-15} y={-80} width={30} height={20} rx={2} fill="#B5C9D6" />
      <circle cx={13} cy={-52} r={2.6} fill="#E8DCC8" />
      <rect x={-34} y={-24} width={68} height={8} rx={2} fill="#D9D2C4" />
      <rect x={-42} y={-16} width={84} height={8} rx={2} fill="#CFC7B7" />
      <g>
        <rect x={64} y={-26} width={54} height={6} rx={2} fill={C.wood} />
        <rect x={64} y={-38} width={54} height={6} rx={2} fill={C.wood} />
        <path d="M 70 -20 L 70 -8 M 112 -20 L 112 -8" stroke={C.woodDark} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---------- Маленький белый седан (VW Polo), вид сбоку, носом вправо ----------
export const PoloMarker: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly opacity?: number }> = ({ x, y, s = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={4} cy={2} rx={62} ry={7} fill="rgba(23,38,61,0.16)" />
    <path
      d="M -58 -10 L -58 -24 Q -57 -29 -50 -30 L -38 -31 Q -30 -33 -24 -42 Q -20 -47 -12 -47 L 12 -47 Q 20 -47 26 -41 L 34 -32 L 52 -29 Q 60 -27 60 -20 L 60 -10 Q 60 -6 56 -6 L -54 -6 Q -58 -6 -58 -10 Z"
      fill="#FFFFFF"
      stroke="#AEB8C6"
      strokeWidth={2.2}
      strokeLinejoin="round"
    />
    <path d="M -20 -41 Q -17 -44 -11 -44 L -2 -44 L -2 -32 L -28 -32 Z" fill="#BFD5E5" />
    <path d="M 2 -44 L 11 -44 Q 18 -44 22 -39 L 29 -32 L 2 -32 Z" fill="#BFD5E5" />
    <path d="M -1 -32 L -1 -10" stroke="#C7CFDA" strokeWidth={1.6} />
    <rect x={54} y={-25} width={6} height={4} rx={1.5} fill="#FFE8A6" />
    <rect x={-58} y={-25} width={4} height={4} rx={1} fill="#E59A86" />
    <path d="M -50 -18 L 50 -18" stroke="#E3E8EE" strokeWidth={2} />
    {[-34, 36].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-7} r={10.5} fill="#2B3445" />
        <circle cx={wx} cy={-7} r={4.5} fill="#C9D1DB" />
      </g>
    ))}
  </g>
);

// ---------- Подпись-плашка ----------
const Label: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly size: number; readonly opacity?: number; readonly fid: string }> = ({
  x,
  y,
  text,
  size,
  opacity = 1,
  fid,
}) => {
  const w = text.length * size * 0.66 + size * 1.1;
  const h = size * 1.38;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y} width={w} height={h} rx={h / 2} fill="#FFFFFF" filter={`url(#${fid})`} />
      <text x={x} y={y + h * 0.7} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={size} fill={C.ink} letterSpacing={size * 0.03}>
        {text}
      </text>
    </g>
  );
};

// ---------- Пунктир маршрута ----------
const RoutePath: React.FC<{ readonly c: Curve; readonly reveal: number; readonly start?: boolean }> = ({ c, reveal, start = true }) => {
  const pts = sample(c);
  const road = toD(pts);
  const part = partial(pts, reveal);
  const a = (part.ang * 180) / Math.PI;
  return (
    <g>
      <path d={road} stroke="#E2D6BE" strokeWidth={40} fill="none" strokeLinecap="round" />
      <path d={road} stroke="#F3ECDD" strokeWidth={32} fill="none" strokeLinecap="round" />
      {reveal > 0.002 ? (
        <>
          <path d={toD(part.pts)} stroke={C.ink} strokeWidth={7} strokeDasharray="17 13" strokeLinecap="round" fill="none" />
          <g transform={`translate(${part.tip.x} ${part.tip.y}) rotate(${a})`} opacity={clamp(reveal * 10)}>
            <path d="M -17 -14 L 2 0 L -17 14" stroke={C.ink} strokeWidth={7.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </>
      ) : null}
      {start ? <circle cx={c[0].x} cy={c[0].y} r={11} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} /> : null}
    </g>
  );
};

// ---------- Фон: небо, мягкое солнце сверху-слева, Ала-Тоо, земля ----------
const Scenery: React.FC<{ readonly w: number; readonly h: number; readonly ground: number; readonly id: string }> = ({ w, h, ground, id }) => {
  const peaks = [0, 0.1, 0.19, 0.3, 0.41, 0.52, 0.63, 0.74, 0.86, 1].map((k, i) => ({ x: k * w, y: ground - (i % 2 ? 250 : 170) - ((i * 37) % 50) }));
  const ridge = peaks.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E2EDF5" />
          <stop offset="1" stopColor="#F5F6F1" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill={`url(#${id}sky)`} />
      <circle cx={w * 0.1} cy={h * 0.12} r={h * 0.3} fill="#FFF7DE" opacity={0.75} />
      <circle cx={w * 0.1} cy={h * 0.12} r={h * 0.065} fill="#FFE7A6" />
      <path d={`${ridge} L ${w} ${ground} L 0 ${ground} Z`} fill="#D9E5EE" />
      {peaks.map((p, i) =>
        i % 2 ? (
          <path
            key={i}
            d={`M ${p.x - 34} ${p.y + 26} L ${p.x} ${p.y} L ${p.x + 34} ${p.y + 26} L ${p.x + 12} ${p.y + 20} L ${p.x} ${p.y + 30} L ${p.x - 14} ${p.y + 20} Z`}
            fill="#FFFFFF"
            opacity={0.9}
          />
        ) : null,
      )}
      <path d={`M 0 ${ground - 18} Q ${w * 0.5} ${ground - 46} ${w} ${ground - 18} L ${w} ${h} L 0 ${h} Z`} fill="#E3EBD4" />
      <path d={`M 0 ${ground + 30} Q ${w * 0.5} ${ground + 4} ${w} ${ground + 30} L ${w} ${h} L 0 ${h} Z`} fill="#EAF0DE" />
    </g>
  );
};

export const RouteScheme: React.FC<{
  readonly reveal: number;
  readonly mode: RouteMode;
  readonly w: number;
  readonly car?: boolean; // маленький белый седан на линии (только «family»)
  readonly labels?: boolean;
  readonly people?: boolean; // силуэты няни и малышки в окне (по умолчанию в «family»)
  readonly style?: React.CSSProperties;
}> = ({ reveal, mode, w, car = true, labels = true, people, style }) => {
  const id = `rs${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const vb = ROUTE_VB[mode];
  const h = routeSchemeHeight(mode, w);
  const site = EL_TEXT.site;
  const shadow = (
    <filter id={`${id}sh`} x="-20%" y="-30%" width="140%" height="190%">
      <feDropShadow dx={0} dy={6} stdDeviation={7} floodColor="#17263D" floodOpacity={0.14} />
    </filter>
  );
  const clip = (
    <clipPath id={`${id}clip`}>
      <rect x={0} y={0} width={vb.w} height={vb.h} rx={36} />
    </clipPath>
  );

  if (mode === "family") {
    const ground = 470;
    const route: Curve = [
      { x: 255, y: 488 },
      { x: 335, y: 590 },
      { x: 680, y: 590 },
      { x: 762, y: 492 },
    ];
    const r = easeInOut(clamp(reveal));
    const carAt = bez(route, 0.5);
    return (
      <svg width={w} height={h} viewBox={`0 0 ${vb.w} ${vb.h}`} style={{ display: "block", overflow: "visible", ...style }}>
        <defs>
          {shadow}
          {clip}
        </defs>
        <g clipPath={`url(#${id}clip)`}>
          <Scenery w={vb.w} h={vb.h} ground={ground} id={id} />
          <Poplar x={42} y={ground + 4} h={270} />
          <Poplar x={474} y={ground + 2} h={230} />
          <Poplar x={958} y={ground + 4} h={290} />
          <School x={255} y={ground} s={0.95} />
          <Home x={770} y={ground} s={1} people={people ?? true} id={id} />
          <RoundTree x={520} y={ground + 6} r={30} />
          <RoutePath c={route} reveal={r} />
          {car ? <PoloMarker x={carAt.x} y={carAt.y + 10} s={0.92} opacity={easeOut(clamp((reveal - 0.55) / 0.3))} /> : null}
        </g>
        {labels ? (
          <>
            <Label x={255} y={548} text={site.familyRoute[0]} size={56} fid={`${id}sh`} />
            <Label x={770} y={548} text={site.familyRoute[1]} size={56} fid={`${id}sh`} />
          </>
        ) : null}
      </svg>
    );
  }

  // full: ҮЙ → МЕКТЕП → ҮЙ (один и тот же дом слева и справа)
  const ground = 352;
  const legs: readonly Curve[] = [
    [
      { x: 170, y: 368 },
      { x: 240, y: 446 },
      { x: 470, y: 446 },
      { x: 538, y: 374 },
    ],
    [
      { x: 566, y: 372 },
      { x: 626, y: 446 },
      { x: 856, y: 446 },
      { x: 930, y: 372 },
    ],
  ];
  const r = clamp(reveal);
  const parts = site.route;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${vb.w} ${vb.h}`} style={{ display: "block", overflow: "visible", ...style }}>
      <defs>
        {shadow}
        {clip}
      </defs>
      <g clipPath={`url(#${id}clip)`}>
        <Scenery w={vb.w} h={vb.h} ground={ground} id={id} />
        <Poplar x={40} y={ground + 4} h={210} />
        <Poplar x={352} y={ground + 2} h={170} />
        <Poplar x={746} y={ground + 2} h={170} />
        <Poplar x={1062} y={ground + 4} h={210} />
        <Home x={170} y={ground} s={0.6} people={people ?? false} id={`${id}a`} />
        <School x={550} y={ground} s={0.64} />
        <Home x={930} y={ground} s={0.6} people={people ?? false} id={`${id}b`} />
        <RoutePath c={legs[0]} reveal={easeInOut(clamp(r * 2))} />
        <RoutePath c={legs[1]} reveal={easeInOut(clamp(r * 2 - 1))} start={false} />
      </g>
      {labels ? (
        <>
          <Label x={170} y={428} text={parts[0]} size={88} fid={`${id}sh`} />
          <Label x={550} y={428} text={parts[1]} size={88} fid={`${id}sh`} />
          <Label x={930} y={428} text={parts[2]} size={88} fid={`${id}sh`} />
        </>
      ) : null}
    </svg>
  );
};
