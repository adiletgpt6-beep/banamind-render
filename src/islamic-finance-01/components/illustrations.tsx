// Vector illustrations (SVG) of the finance series. All geometry is static and
// driven by props, so every frame is deterministic.
import type { CSSProperties } from "react";
import { PALETTE } from "../theme";
import { fontFamily } from "../fonts";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Sub-range of a 0..1 progress: 0 until `a`, 1 after `b`. */
const sub = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// ---------------------------------------------------------------- Bank
export const AnimatedBank: React.FC<{
  readonly build: number; // 0..1 construction progress
  readonly width?: number;
  readonly style?: CSSProperties;
  readonly accent?: string;
}> = ({ build, width = 520, style, accent = PALETTE.green }) => {
  const steps = sub(build, 0, 0.35);
  const cols = sub(build, 0.25, 0.7);
  const roof = sub(build, 0.55, 1);
  const stroke = PALETTE.ink;
  const colX = [86, 160, 234, 308];
  return (
    <svg width={width} viewBox="0 0 420 340" style={style} fill="none">
      {/* steps */}
      <g style={{ transform: `translateY(${(1 - steps) * 40}px)`, opacity: steps }}>
        <rect x="30" y="300" width="360" height="22" rx="6" fill="#FFFFFF" stroke={stroke} strokeWidth="5" />
        <rect x="52" y="278" width="316" height="22" rx="6" fill="#FFFFFF" stroke={stroke} strokeWidth="5" />
      </g>
      {/* columns grow from the floor */}
      {colX.map((x, i) => {
        const c = sub(cols, i * 0.12, 0.64 + i * 0.12);
        const h = 120 * c;
        return (
          <g key={x}>
            <rect x={x - 18} y={278 - h} width="36" height={h} rx="4" fill="#FFFFFF" stroke={stroke} strokeWidth="5" />
            {c > 0.92 ? <rect x={x - 24} y={154} width="48" height="12" rx="3" fill="#FFFFFF" stroke={stroke} strokeWidth="5" /> : null}
          </g>
        );
      })}
      {/* door */}
      <rect x="190" y="200" width="40" height="78" rx="4" fill={PALETTE.navy} opacity={sub(cols, 0.5, 0.9)} />
      {/* beam + pediment */}
      <g style={{ transform: `translateY(${(1 - roof) * -60}px)`, opacity: roof }}>
        <rect x="56" y="128" width="308" height="30" rx="6" fill="#FFFFFF" stroke={stroke} strokeWidth="5" />
        <path d="M210 36 L44 128 L376 128 Z" fill="#FFFFFF" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
        <path d="M210 62 L92 122 L328 122 Z" fill={accent} opacity="0.95" />
        <circle cx="210" cy="100" r="11" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- Interest (%)
export const InterestIcon: React.FC<{
  readonly size?: number;
  readonly cross: number; // 0..1 red line draw
  readonly style?: CSSProperties;
  readonly tone?: "coral" | "ink";
}> = ({ size = 180, cross, style, tone = "coral" }) => {
  const c = tone === "coral" ? PALETTE.coral : PALETTE.ink;
  const bg = tone === "coral" ? PALETTE.coralSoft : "#FFFFFF";
  const len = 150;
  return (
    <svg width={size} viewBox="0 0 160 160" style={style} fill="none">
      <circle cx="80" cy="80" r="72" fill={bg} stroke={c} strokeWidth="6" />
      <text x="80" y="104" textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize="78" fill={PALETTE.ink}>
        %
      </text>
      <line
        x1="28"
        y1="28"
        x2="132"
        y2="132"
        stroke={PALETTE.coral}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - clamp01(cross))}
      />
    </svg>
  );
};

// ---------------------------------------------------------------- Coin
export const DollarCoin: React.FC<{ readonly size?: number; readonly style?: CSSProperties }> = ({ size = 120, style }) => (
  <svg width={size} viewBox="0 0 120 120" style={style} fill="none">
    <circle cx="60" cy="60" r="54" fill={PALETTE.yellow} stroke={PALETTE.ink} strokeWidth="5" />
    <circle cx="60" cy="60" r="40" fill="none" stroke={PALETTE.ink} strokeWidth="3" opacity="0.35" />
    <text x="60" y="80" textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize="56" fill={PALETTE.ink}>
      $
    </text>
  </svg>
);

// ---------------------------------------------------------------- Car
export const AnimatedCar: React.FC<{
  readonly width?: number;
  readonly wheelAngle?: number; // degrees
  readonly style?: CSSProperties;
  readonly body?: string;
  readonly roof?: string;
}> = ({ width = 420, wheelAngle = 0, style, body = PALETTE.green, roof = PALETTE.greenDark }) => {
  const Wheel: React.FC<{ cx: number }> = ({ cx }) => (
    <g>
      <circle cx={cx} cy="124" r="31" fill={roof} />
      <circle cx={cx} cy="124" r="27" fill={PALETTE.ink} />
      <g style={{ transform: `rotate(${wheelAngle}deg)`, transformOrigin: `${cx}px 124px` }}>
        <circle cx={cx} cy="124" r="15" fill="#F2F3EF" />
        {[0, 45, 90, 135].map((a) => (
          <line key={a} x1={cx} y1="124" x2={cx} y2="109" stroke={PALETTE.ink} strokeWidth="4" style={{ transform: `rotate(${a}deg)`, transformOrigin: `${cx}px 124px` }} />
        ))}
        <circle cx={cx} cy="124" r="4.5" fill={PALETTE.ink} />
      </g>
    </g>
  );
  return (
    <svg width={width} viewBox="0 0 360 170" style={style} fill="none">
      <ellipse cx="182" cy="156" rx="160" ry="7" fill={PALETTE.ink} opacity="0.1" />
      {/* lower body */}
      <path d="M22 124 L22 92 Q22 78 36 76 L100 70 L136 38 Q142 30 152 30 L232 30 Q244 30 251 38 L284 70 L326 76 Q344 79 344 94 L344 124 Q344 132 336 132 L30 132 Q22 132 22 124 Z" fill={body} />
      {/* roof / cabin shading */}
      <path d="M100 70 L136 38 Q142 30 152 30 L232 30 Q244 30 251 38 L284 70 Z" fill={roof} />
      {/* windows */}
      <path d="M112 68 L140 40 Q143 37 149 37 L186 37 L186 68 Z" fill={PALETTE.blue} />
      <path d="M198 37 L230 37 Q238 37 243 42 L270 68 L198 68 Z" fill={PALETTE.blue} />
      {/* door line + handle */}
      <line x1="192" y1="72" x2="192" y2="126" stroke={roof} strokeWidth="3" />
      <rect x="200" y="84" width="22" height="6" rx="3" fill={roof} />
      {/* side trim */}
      <rect x="40" y="104" width="296" height="5" rx="2.5" fill={roof} opacity="0.7" />
      {/* lights */}
      <rect x="330" y="86" width="14" height="14" rx="4" fill={PALETTE.yellow} />
      <rect x="22" y="86" width="12" height="14" rx="4" fill={PALETTE.coral} />
      {/* bumpers */}
      <rect x="14" y="116" width="18" height="10" rx="4" fill={PALETTE.ink} opacity="0.6" />
      <rect x="334" y="116" width="18" height="10" rx="4" fill={PALETTE.ink} opacity="0.6" />
      <Wheel cx={92} />
      <Wheel cx={276} />
    </svg>
  );
};

// ---------------------------------------------------------------- Price tag
export const PriceTag: React.FC<{
  readonly value: string;
  readonly label?: string;
  readonly tone?: "ink" | "green";
  readonly width?: number;
  readonly style?: CSSProperties;
}> = ({ value, label, tone = "ink", width = 560, style }) => {
  const accent = tone === "green" ? PALETTE.green : PALETTE.ink;
  const fill = tone === "green" ? PALETTE.greenSoft : "#FFFFFF";
  return (
    <div style={{ width, position: "relative", ...style }}>
      <svg width={width} viewBox="0 0 560 240" fill="none" style={{ display: "block" }}>
        <path d="M56 24 L504 24 Q528 24 528 48 L528 192 Q528 216 504 216 L56 216 Q32 216 32 192 L32 48 Q32 24 56 24 Z" fill={fill} stroke={accent} strokeWidth="6" />
        <path d="M32 120 L8 120" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <circle cx="68" cy="60" r="10" fill="#FFFFFF" stroke={accent} strokeWidth="5" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 40,
          fontFamily,
          color: tone === "green" ? PALETTE.greenDark : PALETTE.ink,
        }}
      >
        <div style={{ fontSize: label ? 112 : 124, fontWeight: 800, letterSpacing: -3, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        {label ? (
          <div style={{ marginTop: 8, fontSize: 30, fontWeight: 700, letterSpacing: 3, color: tone === "green" ? PALETTE.green : PALETTE.inkSoft }}>{label}</div>
        ) : null}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Contract
export const FinancialContract: React.FC<{
  readonly title: string;
  readonly width?: number;
  readonly sealed?: number; // 0..1 seal/check appears
  readonly tone?: "green" | "ink" | "coral";
  readonly style?: CSSProperties;
  readonly subtitle?: string;
}> = ({ title, width = 220, sealed = 1, tone = "green", style, subtitle }) => {
  const accent = tone === "green" ? PALETTE.green : tone === "coral" ? PALETTE.coral : PALETTE.ink;
  return (
    <svg width={width} viewBox="0 0 220 280" style={style} fill="none">
      <path d="M24 12 L160 12 L204 56 L204 262 Q204 270 196 270 L24 270 Q16 270 16 262 L16 20 Q16 12 24 12 Z" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth="5" strokeLinejoin="round" />
      <path d="M160 12 L160 56 L204 56" fill="#F1F2EE" stroke={PALETTE.ink} strokeWidth="5" strokeLinejoin="round" />
      <rect x="40" y="82" width="110" height="10" rx="5" fill={PALETTE.ink} opacity="0.85" />
      <rect x="40" y="108" width="140" height="8" rx="4" fill={PALETTE.ink} opacity="0.22" />
      <rect x="40" y="128" width="124" height="8" rx="4" fill={PALETTE.ink} opacity="0.22" />
      <rect x="40" y="148" width="136" height="8" rx="4" fill={PALETTE.ink} opacity="0.22" />
      <text x="40" y="208" fontFamily={fontFamily} fontWeight={800} fontSize={title.length > 10 ? 20 : 24} fill={accent} letterSpacing="1.5">
        {title}
      </text>
      {subtitle ? (
        <text x="40" y="234" fontFamily={fontFamily} fontWeight={600} fontSize="16" fill={PALETTE.inkSoft}>
          {subtitle}
        </text>
      ) : null}
      <g style={{ transform: `scale(${clamp01(sealed)})`, transformOrigin: "166px 232px" }}>
        <circle cx="166" cy="232" r="24" fill={accent} />
        <path d="M153 232 L162 241 L180 222" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- Loan + interest icon (document with %)
export const LoanInterestIcon: React.FC<{ readonly size?: number; readonly style?: CSSProperties; readonly ban?: number }> = ({ size = 160, style, ban = 0 }) => {
  const len = 110;
  return (
    <svg width={size} viewBox="0 0 160 160" style={style} fill="none">
      <path d="M38 22 L104 22 L130 48 L130 134 Q130 140 124 140 L38 140 Q32 140 32 134 L32 28 Q32 22 38 22 Z" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth="5" strokeLinejoin="round" />
      <rect x="48" y="60" width="52" height="7" rx="3.5" fill={PALETTE.ink} opacity="0.3" />
      <rect x="48" y="76" width="64" height="7" rx="3.5" fill={PALETTE.ink} opacity="0.3" />
      <circle cx="104" cy="106" r="24" fill={PALETTE.coralSoft} stroke={PALETTE.coral} strokeWidth="4" />
      <text x="104" y="115" textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize="26" fill={PALETTE.ink}>
        %
      </text>
      <g opacity={clamp01(ban * 4)}>
        <circle cx="80" cy="80" r="66" stroke={PALETTE.coral} strokeWidth="9" strokeDasharray={415} strokeDashoffset={415 * (1 - clamp01(ban))} style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }} />
        <line x1="36" y1="36" x2="124" y2="124" stroke={PALETTE.coral} strokeWidth="9" strokeLinecap="round" strokeDasharray={len + 20} strokeDashoffset={(len + 20) * (1 - clamp01((ban - 0.5) * 2))} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- People / institution
export const PersonIcon: React.FC<{ readonly size?: number; readonly style?: CSSProperties; readonly tone?: string }> = ({ size = 160, style, tone = PALETTE.yellow }) => (
  <svg width={size} viewBox="0 0 160 160" style={style} fill="none">
    <circle cx="80" cy="80" r="74" fill={tone} stroke={PALETTE.ink} strokeWidth="5" />
    <circle cx="80" cy="64" r="24" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth="5" />
    <path d="M36 130 Q40 96 80 96 Q120 96 124 130" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export const InstitutionIcon: React.FC<{ readonly size?: number; readonly style?: CSSProperties; readonly tone?: string }> = ({ size = 160, style, tone = PALETTE.blue }) => (
  <svg width={size} viewBox="0 0 160 160" style={style} fill="none">
    <circle cx="80" cy="80" r="74" fill={tone} stroke={PALETTE.ink} strokeWidth="5" />
    <path d="M80 40 L36 66 L124 66 Z" fill={PALETTE.green} stroke={PALETTE.ink} strokeWidth="5" strokeLinejoin="round" />
    {[50, 70, 90, 110].map((x) => (
      <rect key={x} x={x - 5} y="70" width="10" height="34" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth="4" />
    ))}
    <rect x="36" y="106" width="88" height="12" rx="3" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth="4" />
  </svg>
);

// ---------------------------------------------------------------- Coin stack (CTA)
export const CoinStack: React.FC<{ readonly count: number; readonly size?: number; readonly style?: CSSProperties; readonly drop?: readonly number[] }> = ({ count, size = 220, style, drop }) => (
  <svg width={size} viewBox="0 0 220 200" style={style} fill="none">
    {Array.from({ length: count }, (_, i) => {
      const y = 170 - i * 22;
      const d = drop?.[i] ?? 1;
      return (
        <g key={i} style={{ transform: `translateY(${(1 - d) * -90}px)`, opacity: d }}>
          <ellipse cx="110" cy={y + 10} rx="78" ry="16" fill={PALETTE.greenDark} />
          <rect x="32" y={y - 6} width="156" height="16" fill={PALETTE.greenDark} />
          <ellipse cx="110" cy={y - 6} rx="78" ry="16" fill={PALETTE.green} stroke={PALETTE.greenDark} strokeWidth="3" />
          {i === count - 1 ? (
            <text x="110" y={y + 2} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize="20" fill="#FFFFFF">
              $
            </text>
          ) : null}
        </g>
      );
    })}
  </svg>
);
