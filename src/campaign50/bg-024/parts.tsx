// Общие элементы рисовки BG-024: рука родителя, телефон, деталь пазла,
// белая легковая машина (дети пристёгнуты), фон, плашки.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { BG24_VIDEO } from "./script";

// ---------- Фон ----------
export const Backdrop: React.FC<{ readonly tone?: "warm" | "cool"; readonly drift?: number }> = ({ tone = "warm", drift = 0 }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: C.paper, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: -260 + drift * 0.4,
        top: -260,
        width: 820,
        height: 820,
        borderRadius: 410,
        backgroundColor: tone === "warm" ? C.yellowSoft : C.sky,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -240 - drift * 0.3,
        bottom: -200,
        width: 700,
        height: 700,
        borderRadius: 350,
        backgroundColor: tone === "warm" ? C.sky : C.yellowSoft,
      }}
    />
  </div>
);

// ---------- Плашка ----------
export const Pill: React.FC<{
  readonly children: React.ReactNode;
  readonly bg?: string;
  readonly color?: string;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, bg = C.navy, color = "#FFFFFF", size = 40, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: `${size * 0.28}px ${size * 0.75}px`,
      borderRadius: 999,
      backgroundColor: bg,
      color,
      fontFamily,
      fontSize: size,
      fontWeight: 900,
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Деталь пазла ----------
// Прямоугольник со скруглёнными углами, выступ справа и выемка слева.
export const piecePath = (w: number, h: number, tab = true, notch = true) => {
  const r = Math.min(26, h * 0.17);
  const k = 18;
  const m = h / 2;
  return [
    `M ${k} 0 H ${w - k} Q ${w} 0 ${w} ${k}`,
    tab ? `V ${m - r} A ${r} ${r} 0 0 1 ${w} ${m + r}` : "",
    `V ${h - k} Q ${w} ${h} ${w - k} ${h} H ${k} Q 0 ${h} 0 ${h - k}`,
    notch ? `V ${m + r} A ${r} ${r} 0 0 0 0 ${m - r}` : "",
    `V ${k} Q 0 0 ${k} 0 Z`,
  ].join(" ");
};

export type PieceKind = "home" | "school" | "time";

export const Icon: React.FC<{ readonly kind: PieceKind; readonly s?: number; readonly color?: string }> = ({ kind, s = 44, color = C.navy }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    {kind === "home" ? (
      <g fill="none" stroke={color} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round">
        <path d="M6 23 L24 8 L42 23" />
        <path d="M11 20 V41 H37 V20" />
        <path d="M20 41 V29 H28 V41" />
      </g>
    ) : kind === "school" ? (
      <g fill="none" stroke={color} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round">
        <path d="M5 41 H43" />
        <path d="M9 41 V19 H39 V41" />
        <path d="M5 19 L24 8 L43 19" />
        <path d="M20 41 V31 H28 V41" />
        <path d="M15 25 H19 M29 25 H33" />
      </g>
    ) : (
      <g fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round">
        <circle cx={24} cy={25} r={16} />
        <path d="M24 16 V25 L31 29" />
      </g>
    )}
  </svg>
);

export const Piece: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly kind: PieceKind;
  readonly label: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly dashed?: boolean;
  readonly opacity?: number;
  readonly scale?: number;
  readonly rotate?: number;
  readonly tab?: boolean;
  readonly notch?: boolean;
  readonly textColor?: string;
}> = ({ x, y, w = 250, h = 150, kind, label, fill = "#FFFFFF", stroke = C.navy, dashed, opacity = 1, scale = 1, rotate = 0, tab = true, notch = true, textColor = C.navy }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      opacity,
      transform: `rotate(${rotate}deg) scale(${scale})`,
      transformOrigin: "50% 50%",
    }}
  >
    <svg width={w + 30} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path
        d={piecePath(w, h, tab, notch)}
        fill={fill}
        stroke={stroke}
        strokeWidth={5}
        strokeDasharray={dashed ? "14 12" : undefined}
        style={{ filter: dashed ? undefined : "drop-shadow(0 10px 14px rgba(20,40,90,0.14))" }}
      />
    </svg>
    {label ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "0 26px 0 30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily,
          fontSize: 31,
          fontWeight: 900,
          color: textColor,
          lineHeight: 1.08,
          textAlign: "center",
        }}
      >
        <Icon kind={kind} s={42} color={textColor} />
        {label}
      </div>
    ) : null}
  </div>
);

// ---------- Рука родителя (указательный палец) ----------
// (x, y) — кончик пальца; рука приходит снизу справа, angle — наклон.
// press 0…1 — лёгкое нажатие (палец чуть сгибается и опускается).
export const Hand: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly press?: number; readonly opacity?: number; readonly grip?: boolean }> = ({
  x,
  y,
  angle = -24,
  press = 0,
  opacity = 1,
  grip = false,
}) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity, pointerEvents: "none", overflow: "visible" }}>
    <g transform={`translate(${x} ${y + press * 10}) rotate(${angle}) scale(${1 - press * 0.03})`}>
      {/* рукав */}
      <path d="M -62 210 L 74 210 L 96 720 L -92 720 Z" fill={C.sleeve} />
      <path d="M -66 200 Q 6 186 78 200 L 80 238 Q 6 226 -68 238 Z" fill="#FFFFFF" opacity={0.9} />
      {/* ладонь */}
      <path d="M -54 96 Q -66 150 -56 206 L 70 206 Q 86 150 70 104 Q 58 84 30 86 L -30 86 Q -50 86 -54 96 Z" fill={C.skin} />
      {/* согнутые пальцы */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${-2 + i * 24} ${92 + i * 4} q 14 -8 26 2 q 6 30 -4 46 q -14 8 -24 -2 Z`} fill={C.skinShade} opacity={grip ? 1 : 0.85} />
      ))}
      {/* большой палец */}
      <path d="M -54 130 Q -92 112 -100 82 Q -102 66 -88 66 Q -70 78 -42 104 Z" fill={C.skin} stroke={C.skinShade} strokeWidth={3} />
      {/* указательный палец */}
      <path d={`M -32 ${100} L -32 ${16 + press * 6} Q -32 0 -16 0 Q 0 0 0 ${16 + press * 6} L 0 ${100} Z`} fill={C.skin} stroke={C.skinShade} strokeWidth={3} />
      <path d={`M -26 ${14 + press * 6} Q -16 6 -6 ${14 + press * 6}`} fill="none" stroke="#F6D8C2" strokeWidth={5} strokeLinecap="round" />
    </g>
  </svg>
);

// ---------- Белая легковая машина (вид сбоку) ----------
// Дети на заднем сиденье пристёгнуты ремнями, впереди постоянный водитель.
// dir = 1 — едет вправо, -1 — влево. roll — угол колёс (градусы).
export const Car: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly dir?: 1 | -1; readonly roll?: number; readonly bounce?: number }> = ({
  x,
  y,
  s = 1,
  dir = 1,
  roll = 0,
  bounce = 0,
}) => {
  const W = 440;
  const kid = (cx: number, hair: string) => (
    <g>
      <circle cx={cx} cy={58} r={15} fill={C.skin} />
      <path d={`M ${cx - 15} 56 Q ${cx} 34 ${cx + 15} 56 Q ${cx + 8} 46 ${cx} 47 Q ${cx - 8} 46 ${cx - 15} 56 Z`} fill={hair} />
      <path d={`M ${cx - 18} 82 Q ${cx} 70 ${cx + 18} 82 L ${cx + 18} 90 L ${cx - 18} 90 Z`} fill="#F1B830" />
      {/* ремень безопасности */}
      <path d={`M ${cx - 12} 72 L ${cx + 14} 90`} stroke="#2B3550" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  return (
    <svg
      width={W * s}
      height={190 * s}
      viewBox={`0 0 ${W} 190`}
      style={{ position: "absolute", left: x - (W * s) / 2, top: y - 170 * s + bounce, overflow: "visible" }}
    >
      <g transform={dir === -1 ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <ellipse cx={W / 2} cy={182} rx={200} ry={10} fill="rgba(20,40,90,0.12)" />
        {/* кузов */}
        <path
          d="M 6 128 Q 4 96 34 90 L 104 82 L 156 34 Q 168 22 188 22 L 298 22 Q 318 22 332 36 L 382 84 L 418 92 Q 438 98 438 122 L 438 146 Q 438 158 424 158 L 18 158 Q 6 158 6 146 Z"
          fill="#FFFFFF"
          stroke="#BCC8DA"
          strokeWidth={4}
        />
        {/* окна */}
        <path d="M 120 84 L 164 40 Q 172 34 184 34 L 246 34 L 246 84 Z" fill="#CFE6F7" />
        <path d="M 256 34 L 296 34 Q 312 34 322 44 L 362 84 L 256 84 Z" fill="#CFE6F7" />
        <g>
          {kid(158, "#3B2A20")}
          {kid(212, "#5A3A28")}
          {/* водитель */}
          <circle cx={302} cy={56} r={15} fill={C.skin} />
          <path d="M 287 52 Q 302 36 317 52 Q 306 46 287 52 Z" fill="#2B2B2B" />
          <path d="M 282 84 Q 302 70 322 84 L 322 90 L 282 90 Z" fill={C.navy} />
          <path d="M 290 72 L 316 90" stroke="#2B3550" strokeWidth={5} strokeLinecap="round" />
        </g>
        <path d="M 250 30 L 250 156" stroke="#E2E8F2" strokeWidth={4} />
        <path d="M 20 112 L 430 112" stroke="#EEF2F8" strokeWidth={3} />
        <rect x={404} y={104} width={26} height={12} rx={5} fill="#FFE27A" />
        <rect x={8} y={106} width={18} height={12} rx={5} fill="#F2A08F" />
        {/* колёса */}
        {[96, 344].map((cx) => (
          <g key={cx} transform={`rotate(${roll} ${cx} 158)`}>
            <circle cx={cx} cy={158} r={30} fill="#2B3550" />
            <circle cx={cx} cy={158} r={14} fill="#DCE3EE" />
            <path d={`M ${cx} 144 L ${cx} 172 M ${cx - 14} 158 L ${cx + 14} 158`} stroke="#9AA8C0" strokeWidth={4} />
          </g>
        ))}
      </g>
    </svg>
  );
};

// ---------- Логотип ----------
export const Logo: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly opacity?: number; readonly scale?: number }> = ({ x, y, r, opacity = 1, scale = 1 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, opacity, transform: `scale(${scale})` }}>
    <Img
      src={staticFile(BG24_VIDEO.logo)}
      style={{ width: r * 2, height: r * 2, borderRadius: r, objectFit: "cover", boxShadow: "0 18px 40px rgba(20,40,90,0.16)" }}
    />
  </div>
);
