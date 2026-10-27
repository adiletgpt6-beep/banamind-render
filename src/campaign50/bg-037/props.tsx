// Предметы ролика: конверты (на столе сбоку и крупно сверху), банковская
// карта, бумажный лист «Шарттар». Палитра — art.tsx.
import { fontFamily } from "../../fonts";
import { NAVY, NAVY_SOFT, YELLOW } from "./art";
import { box } from "./shots";

export const PAPER = "#FFFDF7";
export const ENV = "#F3E2C0"; // крафтовый конверт
export const ENV_SHADE = "#E2CB9F";
export const ENV_LINE = "#B99A66";
export const CARD_BLUE = "#2F62A8";

// Конверт, лежащий на столе (вид сбоку-сверху, мировые px). (x, y) —
// середина нижнего края на столешнице. lift — приподнят над столом.
export const EnvelopeSide: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly w?: number;
  readonly lift?: number;
  readonly rot?: number;
  readonly glow?: number;
  readonly open?: number;
  readonly opacity?: number;
}> = ({ x, y, label, w = 170, lift = 0, rot = 0, glow = 0, open = 0, opacity = 1 }) => {
  const h = w * 0.42;
  return (
    <div style={box({ left: x - w / 2, top: y - h - lift, width: w, height: h, transform: `rotate(${rot}deg)`, opacity })}>
      {glow > 0 ? <div style={box({ left: -14, top: -14, width: w + 28, height: h + 28, borderRadius: 18, backgroundColor: YELLOW, opacity: 0.45 * glow })} /> : null}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <rect x={0} y={0} width={w} height={h} rx={6} fill={ENV} stroke={ENV_LINE} strokeWidth={2} />
        <path d={`M 2 2 L ${w / 2} ${h * (0.62 - 1.1 * open)} L ${w - 2} 2`} fill={open > 0.5 ? ENV_SHADE : "none"} stroke={ENV_LINE} strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <div
        style={box({
          left: 0,
          top: h * 0.5,
          width: w,
          textAlign: "center",
          fontFamily,
          fontWeight: 1000,
          fontSize: w * 0.17,
          color: NAVY,
          lineHeight: 1,
        })}
      >
        {label}
      </div>
    </div>
  );
};

// Банковская карта, лежащая на столе (вид сбоку-сверху).
export const BankCardOnTable: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={90 * s} height={26 * s} viewBox="0 0 90 26" style={box({ left: x - 45 * s, top: y - 22 * s })}>
    <path d="M 8 4 L 86 4 L 80 22 L 2 22 Z" fill={CARD_BLUE} stroke="#1E3F75" strokeWidth={1.5} />
    <rect x={14} y={9} width={12} height={7} rx={1.5} fill="#F2C94C" />
  </svg>
);

// Письмо «Катталуу» на столе (лист под углом).
export const LetterOnTable: React.FC<{ readonly x: number; readonly y: number; readonly label: string }> = ({ x, y, label }) => (
  <div style={box({ left: x - 90, top: y - 34, width: 180, height: 38 })}>
    <svg width={180} height={38} viewBox="0 0 180 38" style={box({ left: 0, top: 0 })}>
      <path d="M 14 2 L 178 2 L 166 36 L 2 36 Z" fill={PAPER} stroke="#D9D2C2" strokeWidth={2} />
    </svg>
    <div style={box({ left: 0, top: 7, width: 180, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 21, color: NAVY_SOFT })}>{label}</div>
  </div>
);

// Крупный конверт сверху (px кадра). open 0…1 — клапан откидывается вверх;
// sheet 0…1 — лист выезжает вверх из конверта.
export const EnvelopeTop: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly label: string;
  readonly open?: number;
  readonly sheet?: number;
  readonly num?: string;
  readonly glow?: number;
  readonly opacity?: number;
}> = ({ x, y, w, label, open = 0, sheet = 0, num, glow = 0, opacity = 1 }) => {
  const h = w * 0.62;
  // клапан: от закрытого (треугольник вниз) к открытому (вверх)
  const flapY = h * 0.55 * (1 - 2 * open);
  return (
    <div style={box({ left: x - w / 2, top: y - h / 2, width: w, height: h, opacity })}>
      {glow > 0 ? <div style={box({ left: -20, top: -20, width: w + 40, height: h + 40, borderRadius: 30, boxShadow: `0 0 0 10px rgba(255,201,40,${0.6 * glow})` })} /> : null}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <rect x={0} y={0} width={w} height={h} rx={14} fill={ENV_SHADE} />
        {/* лист внутри */}
        {sheet > 0 ? <rect x={w * 0.08} y={-h * 0.55 * sheet + h * 0.06} width={w * 0.84} height={h * 0.8} rx={8} fill={PAPER} stroke="#E4DCCB" strokeWidth={2} /> : null}
        {/* передняя часть конверта */}
        <path d={`M 0 ${h * 0.12} L ${w / 2} ${h * 0.6} L ${w} ${h * 0.12} L ${w} ${h - 14} Q ${w} ${h} ${w - 14} ${h} L 14 ${h} Q 0 ${h} 0 ${h - 14} Z`} fill={ENV} stroke={ENV_LINE} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M 0 ${h} L ${w * 0.42} ${h * 0.5} M ${w} ${h} L ${w * 0.58} ${h * 0.5}`} stroke={ENV_LINE} strokeWidth={2.5} opacity={0.6} />
        {/* клапан */}
        <path d={`M 0 4 L ${w / 2} ${flapY} L ${w} 4 Z`} fill={open > 0.5 ? ENV_SHADE : ENV} stroke={ENV_LINE} strokeWidth={3} strokeLinejoin="round" />
      </svg>
      <div style={box({ left: 0, top: h * 0.62, width: w, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, fontFamily })}>
        {num ? (
          <div style={{ width: w * 0.12, height: w * 0.12, borderRadius: w * 0.06, backgroundColor: NAVY, color: YELLOW, fontWeight: 1000, fontSize: w * 0.08, display: "flex", alignItems: "center", justifyContent: "center" }}>{num}</div>
        ) : null}
        <div style={{ fontWeight: 1000, fontSize: w * 0.11, color: NAVY, lineHeight: 1 }}>{label}</div>
      </div>
    </div>
  );
};

// Банковская карта крупно (px кадра).
export const BankCard: React.FC<{ readonly w: number; readonly style?: React.CSSProperties }> = ({ w, style }) => {
  const h = w * 0.63;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.06, background: `linear-gradient(135deg, #3C77C6, ${CARD_BLUE} 60%, #24508E)`, boxShadow: "0 14px 30px rgba(20,40,75,0.28)", position: "relative", ...style }}>
      <div style={box({ left: w * 0.09, top: h * 0.32, width: w * 0.16, height: h * 0.2, borderRadius: 6, backgroundColor: "#F2C94C" })} />
      <div style={box({ left: w * 0.09, top: h * 0.68, width: w * 0.6, height: h * 0.07, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.65)" })} />
      <div style={box({ left: w * 0.72, top: h * 0.62, width: w * 0.18, height: w * 0.18, borderRadius: w * 0.09, backgroundColor: "rgba(255,201,40,0.85)" })} />
      <div style={box({ left: w * 0.62, top: h * 0.62, width: w * 0.18, height: w * 0.18, borderRadius: w * 0.09, backgroundColor: "rgba(232,70,58,0.75)" })} />
    </div>
  );
};

// Рука с рукавом мамы (вид сверху), указывает/держит. (x, y) — кончики
// пальцев; angle — направление руки (градусы, 0 — рука идёт снизу вверх).
export const TopHand: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly card?: boolean; readonly sleeve?: string }> = ({
  x,
  y,
  angle = 0,
  card,
  sleeve = "#5E9A93",
}) => (
  <div style={box({ left: x, top: y, width: 1, height: 1, transform: `rotate(${angle}deg)`, transformOrigin: "0 0" })}>
    <svg width={260} height={900} viewBox="-130 -40 260 900" style={box({ left: -130, top: -40, overflow: "visible" })}>
      <rect x={-62} y={150} width={124} height={760} rx={50} fill={sleeve} />
      <rect x={-62} y={150} width={124} height={40} rx={18} fill="#4A7F79" />
      <path d="M -46 160 Q -54 60 -36 18 Q -20 -14 0 -18 Q 22 -14 34 14 Q 52 60 46 160 Z" fill="#E6B590" />
      <path d="M 34 70 Q 66 54 74 84 Q 66 106 40 110" fill="#E6B590" stroke="#D29B74" strokeWidth={3} />
      {[-22, 0, 22].map((k) => (
        <path key={k} d={`M ${k} 30 L ${k} 70`} stroke="#D29B74" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      ))}
      {card ? (
        <g transform="translate(-10 -40) rotate(-8)">
          <rect x={-90} y={-70} width={190} height={120} rx={14} fill={CARD_BLUE} stroke="#1E3F75" strokeWidth={3} />
          <rect x={-70} y={-40} width={34} height={26} rx={5} fill="#F2C94C" />
          <rect x={-70} y={14} width={120} height={9} rx={4} fill="#BFD3F2" />
        </g>
      ) : null}
    </svg>
  </div>
);
