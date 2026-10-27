// Общие элементы ролика: бумага чека с зубчатыми краями, стол (вид
// сверху), рука мамы крупным планом, белая легковая машина, плашки и
// иконки. Всё рисуется кодом (SVG/HTML), без эмодзи и чужих картинок.
import type React from "react";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { LOOKS } from "../../two-schedules-2d/rig/looks";
import { box } from "../../two-schedules-2d/shots";
import { C } from "./palette";
import { BG31_TEXT } from "./script";

// Появление элемента: прозрачность и подъём снизу.
export const rise = (f: number, at: number, d = 12, dist = 26): React.CSSProperties => {
  const a = easeOut((f - at) / d);
  return { opacity: a, translate: `0 ${(1 - a) * dist}px` };
};

// План [from, to): плавно проявляется поверх предыдущего за fade кадров и
// остаётся ещё fade кадров после to (пока следующий план проявляется).
export const Cut: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly fade?: number;
  readonly children: React.ReactNode;
}> = ({ f, from, to, fade = 8, children }) => {
  if (f < from || f >= to + fade) return null;
  const a = from === 0 ? 1 : Math.min(1, (f - from) / fade);
  return <div style={{ position: "absolute", inset: 0, opacity: a, overflow: "hidden" }}>{children}</div>;
};

// Стрелка «→» / «↔» одинаковой толщины во всех надписях.
export const ArrowGlyph: React.FC<{ readonly both?: boolean; readonly size?: number; readonly color?: string }> = ({ both, size = 0.9, color = "currentColor" }) => (
  <svg width={`${size * 1.15}em`} height={`${size}em`} viewBox="0 0 46 40" style={{ margin: "0 0.22em", verticalAlign: "-0.08em" }}>
    <path
      d={both ? "M 6 20 L 40 20 M 30 10 L 40 20 L 30 30 M 16 10 L 6 20 L 16 30" : "M 4 20 L 40 20 M 28 8 L 40 20 L 28 32"}
      fill="none"
      stroke={color}
      strokeWidth={5.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Текст со стрелками: «ҮЙ → МЕКТЕП → ҮЙ».
export const Txt: React.FC<{ readonly children: string }> = ({ children }) => {
  const parts = children.split(/\s*(→|↔)\s*/);
  return (
    <>
      {parts.map((p, i) => (p === "→" ? <ArrowGlyph key={i} /> : p === "↔" ? <ArrowGlyph key={i} both /> : <span key={i}>{p}</span>))}
    </>
  );
};

// Галочка (SVG); p — доля прорисовки 0…1.
export const Check: React.FC<{ readonly size: number; readonly color?: string; readonly p?: number; readonly width?: number }> = ({ size, color = "#FFFFFF", p = 1, width = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <path
      d="M 4 10.5 L 8.5 15 L 16 5.5"
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={`${p} 1`}
    />
  </svg>
);

// Иконки: дом и школа (SVG, без эмодзи).
export const HomeIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M 6 19 L 20 7 L 34 19" fill="none" stroke={C.navy} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 10 17 L 10 33 L 30 33 L 30 17" fill={C.yellowSoft} stroke={C.navy} strokeWidth={3.2} strokeLinejoin="round" />
    <rect x={17} y={23} width={7} height={10} rx={1.5} fill={C.navy} />
  </svg>
);
export const SchoolIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M 5 16 L 20 8 L 35 16" fill="none" stroke={C.navy} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={8} y={16} width={24} height={17} fill="#FFFFFF" stroke={C.navy} strokeWidth={3} strokeLinejoin="round" />
    <rect x={12} y={20} width={4} height={4} fill={C.navy} />
    <rect x={24} y={20} width={4} height={4} fill={C.navy} />
    <rect x={17.5} y={25} width={5} height={8} fill={C.yellow} stroke={C.navy} strokeWidth={1.6} />
    <circle cx={20} cy={13} r={2.4} fill={C.yellow} stroke={C.navy} strokeWidth={1.4} />
  </svg>
);

// Контур бумаги чека: зубцы сверху/снизу (оторванный край), ровные бока.
export const paperPath = (w: number, h: number, tooth = 14, top = true, bottom = true) => {
  const n = Math.max(2, Math.round(w / (tooth * 2)));
  const step = w / n;
  let d = `M 0 ${top ? tooth : 0}`;
  if (top) for (let i = 0; i < n; i++) d += ` L ${i * step + step / 2} 0 L ${(i + 1) * step} ${tooth}`;
  else d += ` L ${w} 0`;
  d += ` L ${w} ${h - (bottom ? tooth : 0)}`;
  if (bottom) for (let i = n; i > 0; i--) d += ` L ${i * step - step / 2} ${h} L ${(i - 1) * step} ${h - tooth}`;
  else d += ` L 0 ${h}`;
  return `${d} Z`;
};

// Лист чека: фон-бумага с тенью и содержимое поверх (координаты внутри
// листа от левого верхнего угла).
export const Paper: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly tooth?: number;
  readonly top?: boolean;
  readonly bottom?: boolean;
  readonly color?: string;
  readonly shadow?: number;
  readonly style?: React.CSSProperties;
  readonly children?: React.ReactNode;
}> = ({ w, h, tooth = 14, top = true, bottom = true, color = C.paper, shadow = 1, style, children }) => (
  <div style={{ position: "absolute", width: w, height: h, ...style }}>
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: shadow ? `drop-shadow(0 ${18 * shadow}px ${26 * shadow}px rgba(60,45,20,${0.22 * shadow}))` : undefined }}>
      <path d={paperPath(w, h, tooth, top, bottom)} fill={color} stroke={C.paperEdge} strokeWidth={2} strokeLinejoin="round" />
    </svg>
    {children}
  </div>
);

// Пунктир чека.
export const Dashed: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly color?: string }> = ({ x, y, w, color = "#CFC5B0" }) => (
  <div style={box({ left: x, top: y, width: w, height: 0, borderTop: `4px dashed ${color}` })} />
);

// Стол (вид сверху): светлое дерево, мягкая виньетка.
export const TableTop: React.FC = () => (
  <div
    style={box({
      inset: 0,
      backgroundColor: C.table,
      backgroundImage: `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.55), rgba(255,255,255,0) 62%), repeating-linear-gradient(94deg, rgba(196,170,130,0.10) 0 3px, transparent 3px 46px, rgba(196,170,130,0.07) 46px 48px, transparent 48px 120px)`,
    })}
  />
);

// Плашка «Шарттуу мисал»: поездка показана как условная иллюстрация, а не
// как уже доступная услуга.
export const ExampleTag: React.FC<{ readonly f: number; readonly at?: number; readonly top?: number; readonly left?: number }> = ({ f, at = 4, top = 262, left = 90 }) => (
  <div style={{ position: "absolute", left, right: 150, top, display: "flex", justifyContent: "flex-start", fontFamily, ...rise(f, at) }}>
    <div
      style={{
        padding: "10px 24px",
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.95)",
        border: `3px solid ${C.yellow}`,
        color: C.navy,
        fontSize: 32,
        fontWeight: 800,
        boxShadow: "0 8px 20px rgba(20,40,90,0.12)",
      }}
    >
      {BG31_TEXT.example}
    </div>
  </div>
);

// Жёлтый маркер позади текста: прорисовка слева направо (p 0…1).
export const Marker: React.FC<{ readonly p: number; readonly children: React.ReactNode; readonly color?: string; readonly style?: React.CSSProperties }> = ({ p, children, color = C.yellow, style }) => (
  <span style={{ position: "relative", display: "inline-block", ...style }}>
    <span
      style={{
        position: "absolute",
        left: "-0.18em",
        right: "-0.18em",
        top: "12%",
        bottom: "4%",
        borderRadius: "0.18em",
        backgroundColor: color,
        transform: `scaleX(${Math.max(0, Math.min(1, p))}) skewX(-6deg)`,
        transformOrigin: "0 50%",
      }}
    />
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);

// Рука мамы крупным планом (вид сверху): кисть с рукавом кардигана.
// (x, y) — кончики пальцев, angle — направление руки (градусы, 0 — пальцы
// вверх, рука входит снизу), grip 0…1 — пальцы сжимают край бумаги.
export const MacroHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle?: number;
  readonly grip?: number;
  readonly s?: number;
  readonly opacity?: number;
}> = ({ x, y, angle = 0, grip = 0, s = 1, opacity = 1 }) => {
  const mom = LOOKS.mom;
  const curl = 1 - 0.32 * grip;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity }}>
      <g transform={`rotate(${angle}) scale(${s})`}>
        {/* рукав кардигана */}
        <path d="M -78 210 L -62 520 L 92 520 L 84 206 Q 4 182 -78 210 Z" fill={mom.topColor} />
        <path d="M -76 214 Q 4 192 84 210 L 86 244 Q 4 226 -76 248 Z" fill={mom.topShade} />
        {/* ладонь */}
        <path d="M -62 214 Q -76 120 -54 74 L 58 70 Q 78 128 66 212 Z" fill={mom.skin} />
        {/* пальцы */}
        {[
          [-44, 78, 108],
          [-14, 70, 126],
          [16, 70, 122],
          [44, 78, 100],
        ].map(([fx, fy, len], i) => (
          <rect key={i} x={fx - 14} y={fy - len * curl} width={28} height={len * curl + 16} rx={14} fill={i % 2 ? mom.skin : mom.skinShade} />
        ))}
        {/* большой палец */}
        <path d={`M -58 168 Q -${104 - 20 * grip} ${120 - 10 * grip} -${96 - 22 * grip} ${84 - 6 * grip} Q -80 76 -70 96 Q -66 132 -46 150 Z`} fill={mom.skinShade} />
        {/* часы на запястье */}
        <rect x={-58} y={196} width={124} height={20} rx={8} fill="#3A3F4B" opacity={0.85} />
      </g>
    </svg>
  );
};

// Белая легковая машина (вид сбоку, нос вправо). Серый контур, чтобы
// кузов читался на светлом фоне; за рулём — водитель (руки на руле, без
// телефона), в заднем окне — один пристёгнутый ребёнок.
export const WhiteCar: React.FC<{
  readonly x: number;
  readonly y: number; // низ колёс
  readonly s?: number;
  readonly dir?: 1 | -1;
  readonly kid?: boolean;
  readonly wheel?: number;
}> = ({ x, y, s = 1, dir = 1, kid = true, wheel = 0 }) => (
  <div style={box({ left: x, top: y, width: 1, height: 1 })}>
    <svg width={560 * s} height={210 * s} viewBox="-280 -200 560 210" style={box({ left: -280 * s, top: -200 * s, overflow: "visible" })}>
      <g transform={`scale(${dir} 1)`}>
        <ellipse cx={0} cy={2} rx={250} ry={14} fill="rgba(20,25,40,0.2)" />
        <path
          d="M -250 -46 Q -254 -96 -214 -104 L -150 -112 Q -112 -176 -30 -180 L 70 -178 Q 136 -172 176 -114 L 226 -104 Q 256 -96 254 -52 L 252 -24 L -248 -24 Z"
          fill={C.car}
          stroke={C.carEdge}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <path d="M -128 -114 Q -96 -162 -34 -166 L 6 -166 L 6 -114 Z" fill="#A9C8E2" />
        <path d="M 22 -114 L 22 -166 L 66 -164 Q 118 -158 152 -114 Z" fill="#A9C8E2" />
        {/* водитель: голова и руки на руле */}
        <circle cx={78} cy={-134} r={19} fill="#3A2E2A" />
        <path d="M 54 -114 Q 78 -128 104 -114 Z" fill="#4C5361" />
        <circle cx={120} cy={-122} r={9} fill="none" stroke="#2A2E36" strokeWidth={4} />
        {kid ? (
          <g>
            {/* плечи и голова ребёнка; ремень — через плечо и грудь, ниже подбородка */}
            <path d="M -68 -114 Q -46 -132 -24 -114 Z" fill="#5E9A93" />
            <circle cx={-46} cy={-143} r={14} fill="#E3B08A" />
            <path d="M -61 -146 Q -46 -165 -31 -146 Q -45 -156 -61 -146 Z" fill="#3B2B24" />
            <path d="M -60 -115 L -36 -126" stroke="#2A2E36" strokeWidth={5} strokeLinecap="round" />
          </g>
        ) : null}
        <g stroke="rgba(60,70,90,0.35)" strokeWidth={3} fill="none">
          <path d="M 18 -114 L 18 -28" />
          <path d="M -118 -110 L -112 -28" />
        </g>
        <path d="M -250 -58 L 254 -58" stroke="rgba(0,0,0,0.08)" strokeWidth={4} />
        <rect x={238} y={-86} width={14} height={18} rx={4} fill="#FFE7A8" />
        <rect x={-252} y={-86} width={10} height={18} rx={4} fill="#E25B4E" />
        {[-160, 160].map((wx) => (
          <g key={wx} transform={`translate(${wx} -24) rotate(${wheel * dir})`}>
            <circle r={38} fill="#23262E" />
            <circle r={20} fill="#C9CED6" />
            <rect x={-3} y={-20} width={6} height={40} fill="#8C929C" />
            <rect x={-20} y={-3} width={40} height={6} fill="#8C929C" />
          </g>
        ))}
      </g>
    </svg>
  </div>
);

// Круглый штамп с вопросом (как печать на квитанции). p — появление
// (0…1): штамп «опускается» сверху и отпечатывается.
export const QuestionStamp: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly p: number; readonly text: string }> = ({ x, y, r, p, text }) => {
  const k = 1.5 - 0.5 * easeOut(p);
  return (
    <div
      style={box({
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: r,
        border: `${r * 0.09}px solid ${C.stamp}`,
        boxShadow: `inset 0 0 0 ${r * 0.06}px rgba(255,255,255,0.9), inset 0 0 0 ${r * 0.12}px ${C.stamp}`,
        backgroundColor: "rgba(255,255,255,0.35)",
        color: C.stamp,
        fontFamily,
        fontWeight: 1000,
        fontSize: r * 1.25,
        lineHeight: `${2 * r - r * 0.18}px`,
        textAlign: "center",
        opacity: Math.min(1, p * 2.2) * 0.92,
        transform: `rotate(${-14 + 4 * p}deg) scale(${k})`,
      })}
    >
      {text}
    </div>
  );
};
