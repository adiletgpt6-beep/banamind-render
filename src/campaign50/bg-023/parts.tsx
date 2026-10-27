import React from "react";
import { fontFamily } from "../../fonts";
import { C } from "./theme";

// ---------- Пазл ----------
// Край: 1 — выступ наружу, -1 — паз, 0 — ровный. Порядок: верх, право, низ, лево.
export type Edges = readonly [number, number, number, number];

export const piecePath = (L: number, e: Edges): string => {
  const P = [
    [0, 0],
    [L, 0],
    [L, L],
    [0, L],
  ];
  let d = `M 0 0`;
  for (let i = 0; i < 4; i++) {
    const [x0, y0] = P[i];
    const [x1, y1] = P[(i + 1) % 4];
    const dx = (x1 - x0) / L;
    const dy = (y1 - y0) / L;
    const nx = dy;
    const ny = -dx;
    const k = e[i];
    const pt = (t: number, h: number) => `${(x0 + dx * L * t + nx * h * L).toFixed(1)} ${(y0 + dy * L * t + ny * h * L).toFixed(1)}`;
    if (k === 0) {
      d += ` L ${pt(1, 0)}`;
      continue;
    }
    const r = 0.13 * L;
    d += ` L ${pt(0.4, 0)} C ${pt(0.42, k * 0.03)} ${pt(0.41, k * 0.05)} ${pt(0.4, k * 0.07)}`;
    d += ` A ${r.toFixed(1)} ${r.toFixed(1)} 0 1 ${k > 0 ? 1 : 0} ${pt(0.6, k * 0.07)}`;
    d += ` C ${pt(0.59, k * 0.05)} ${pt(0.58, k * 0.03)} ${pt(0.6, 0)} L ${pt(1, 0)}`;
  }
  return d + " Z";
};

export const Piece: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly color: string;
  readonly edges: Edges;
  readonly rot?: number;
  readonly scale?: number;
  readonly opacity?: number;
  readonly lift?: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, size, color, edges, rot = 0, scale = 1, opacity = 1, lift = 0, children }) => {
  const pad = size * 0.25;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `rotate(${rot}deg) scale(${scale})`,
        transformOrigin: "50% 50%",
        opacity,
      }}
    >
      <svg width={size + pad * 2} height={size + pad * 2} viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`} style={{ position: "absolute", left: -pad, top: -pad, overflow: "visible" }}>
        <path d={piecePath(size, edges)} fill="rgba(20,40,90,0.14)" transform={`translate(${4 + lift * 0.4} ${10 + lift})`} />
        <path d={piecePath(size, edges)} fill={color} stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
        <path d={piecePath(size, edges)} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={3} transform={`translate(${size * 0.04} ${size * 0.04}) scale(0.92)`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily }}>{children}</div>
    </div>
  );
};

// ---------- Иконки ----------
export const HouseIcon: React.FC<{ readonly size: number; readonly roof?: string; readonly body?: string }> = ({ size, roof = C.navy, body = C.paper }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M14 48 L50 16 L86 48" fill="none" stroke={roof} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    <rect x="24" y="44" width="52" height="44" rx="6" fill={body} stroke={C.navy} strokeWidth={6} />
    <rect x="43" y="60" width="16" height="28" rx="3" fill={C.navy} />
    <rect x="66" y="22" width="9" height="16" rx="2" fill={C.navy} />
  </svg>
);

export const SchoolIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 120 108" style={{ overflow: "visible" }}>
    <line x1="60" y1="4" x2="60" y2="30" stroke={C.navy} strokeWidth="4" />
    <path d="M60 4 L82 10 L60 16 Z" fill={C.yellow} stroke={C.navy} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M10 46 L60 26 L110 46" fill={C.paper} stroke={C.navy} strokeWidth="6" strokeLinejoin="round" />
    <rect x="16" y="44" width="88" height="58" rx="6" fill={C.paper} stroke={C.navy} strokeWidth="6" />
    {[28, 50, 76, 92].map((x) => (
      <rect key={x} x={x - 6} y="56" width="13" height="14" rx="2" fill={C.blue} opacity={0.75} />
    ))}
    <rect x="51" y="76" width="18" height="26" rx="3" fill={C.navy} />
    <circle cx="60" cy="40" r="6" fill={C.yellow} stroke={C.navy} strokeWidth="2.5" />
  </svg>
);

export const Check: React.FC<{ readonly size: number; readonly t?: number; readonly color?: string }> = ({ size, t = 1, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: `scale(${0.6 + 0.4 * t})`, opacity: t }}>
    <circle cx="20" cy="20" r="18" fill={color} />
    <path d="M11 21 L17.5 27 L29 14" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" strokeDashoffset={30 * (1 - t)} />
  </svg>
);

export const ClockIcon: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="16" fill="#fff" stroke={color} strokeWidth="4" />
    <path d="M20 11 L20 20 L27 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const PinIcon: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M20 37 C 9 24 7 19 7 15 A 13 13 0 0 1 33 15 C 33 19 31 24 20 37 Z" fill={color} />
    <circle cx="20" cy="15" r="5.5" fill="#fff" />
  </svg>
);

export const LinkIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x="3" y="13" width="20" height="14" rx="7" fill="none" stroke={C.navy} strokeWidth="4" />
    <rect x="17" y="13" width="20" height="14" rx="7" fill="none" stroke={C.navy} strokeWidth="4" />
  </svg>
);

export const WaIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="19" r="15" fill="#25D366" />
    <path d="M8 35 L11 26 L17 31 Z" fill="#25D366" />
    <path d="M14 13 C 14 21 19 26 27 26 L 28.5 23 L 25 21 L 23 23 C 20 22 18 20 17 17 L 19 15 L 17 11.5 Z" fill="#fff" />
  </svg>
);

export const Chip: React.FC<{
  readonly children: React.ReactNode;
  readonly bg?: string;
  readonly color?: string;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, bg = C.paper, color = C.navy, size = 34, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.35,
      padding: `${size * 0.32}px ${size * 0.62}px`,
      borderRadius: size * 1.2,
      background: bg,
      color,
      fontFamily,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.1,
      boxShadow: `0 10px 26px ${C.shadow}`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Ребёнок на сиденье (вид спереди, через лобовое стекло) ----------
export type KidLook = { readonly skin: string; readonly hair: string; readonly shirt: string; readonly girl?: boolean };

export const Kid: React.FC<{
  readonly look: KidLook;
  /** 0…1 — ремень протянут и пристёгнут. */
  readonly belt: number;
  readonly blink: boolean;
  readonly smile?: number;
}> = ({ look, belt, blink, smile = 1 }) => {
  const strap = "M 34 118 L 132 196";
  const len = 126;
  return (
    <svg width={170} height={230} viewBox="0 0 170 230" style={{ overflow: "visible" }}>
      {/* туловище */}
      <path d="M 22 230 L 26 150 Q 30 112 85 110 Q 140 112 144 150 L 148 230 Z" fill={look.shirt} stroke={C.navy} strokeWidth={4} />
      {/* шея и голова */}
      <rect x="73" y="92" width="24" height="24" rx="8" fill={look.skin} />
      {look.girl && <path d="M 36 66 Q 30 112 52 116 L 118 116 Q 140 112 134 66 Z" fill={look.hair} />}
      <ellipse cx="85" cy="62" rx="44" ry="47" fill={look.skin} stroke={C.navy} strokeWidth={3} />
      {/* волосы */}
      <path
        d={look.girl ? "M 40 66 Q 38 14 85 13 Q 132 14 130 66 Q 118 36 85 34 Q 58 36 40 66 Z" : "M 41 58 Q 42 14 85 14 Q 128 14 129 58 Q 112 30 92 38 Q 70 26 41 58 Z"}
        fill={look.hair}
      />
      {/* глаза */}
      {blink ? (
        <>
          <path d="M 63 66 Q 69 69 75 66" stroke={C.navy} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 95 66 Q 101 69 107 66" stroke={C.navy} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="69" cy="65" rx="5.5" ry="7" fill={C.navy} />
          <ellipse cx="101" cy="65" rx="5.5" ry="7" fill={C.navy} />
          <circle cx="71" cy="62.5" r="1.8" fill="#fff" />
          <circle cx="103" cy="62.5" r="1.8" fill="#fff" />
        </>
      )}
      <circle cx="58" cy="80" r="7" fill="#FF9E8A" opacity={0.45} />
      <circle cx="112" cy="80" r="7" fill="#FF9E8A" opacity={0.45} />
      <path d={`M 72 ${84} Q 85 ${84 + 10 * smile} 98 ${84}`} stroke={C.navy} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* руки на коленях */}
      <path d="M 36 170 Q 40 210 70 214" stroke={look.shirt} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M 134 170 Q 130 210 100 214" stroke={look.shirt} strokeWidth={22} fill="none" strokeLinecap="round" />
      <circle cx="72" cy="214" r="10" fill={look.skin} />
      <circle cx="98" cy="214" r="10" fill={look.skin} />
      {/* ремень: плечо → бедро */}
      <path d={strap} stroke={C.belt} strokeWidth={15} strokeLinecap="round" fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - belt)} />
      <path d="M 34 118 L 132 196" stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray={`6 8`} fill="none" opacity={belt > 0.98 ? 1 : 0} />
      <g opacity={belt > 0.98 ? 1 : 0}>
        <rect x="120" y="186" width="30" height="22" rx="5" fill={C.yellow} stroke={C.navy} strokeWidth={3} />
      </g>
    </svg>
  );
};

export const KIDS: readonly KidLook[] = [
  { skin: "#F1C7A0", hair: "#2A1B12", shirt: "#4C8DF0" },
  { skin: "#E8B78E", hair: "#3B2316", shirt: "#FFC90E", girl: true },
  { skin: "#DDA97F", hair: "#1E140E", shirt: "#38B98A" },
];
