// Installment schedule: a track with N nodes between the buyer and the
// financier. Small payment cards travel along it one by one; each node turns
// green when its payment arrives. Orderly and predictable — no meter growing.
import { fontFamily } from "../fonts";
import { easeInOut, prog, springPop } from "../motion";
import { PALETTE } from "../theme";

export const PaymentTimeline: React.FC<{
  readonly frame: number;
  readonly start: number; // first payment leaves
  readonly interval: number; // frames between payments
  readonly travel: number; // frames a card needs to travel
  readonly count: number;
  readonly fromX: number; // payer x
  readonly toX: number; // payee x
  readonly y: number;
  readonly appear: number; // frame the track fades in
}> = ({ frame, start, interval, travel, count, fromX, toX, y, appear }) => {
  const show = prog(frame, appear, appear + 12);
  const nodes = Array.from({ length: count }, (_, i) => fromX + ((toX - fromX) * (i + 1)) / (count + 1));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: show, pointerEvents: "none" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }} fill="none">
        <line x1={fromX} y1={y} x2={toX} y2={y} stroke={PALETTE.ink} strokeWidth="4" strokeDasharray="10 12" opacity="0.35" />
        {nodes.map((x, i) => {
          const arrived = frame >= start + i * interval + travel;
          const s = springPop(frame, start + i * interval + travel);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="13" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth="4" opacity="0.6" />
              {arrived ? <circle cx={x} cy={y} r={13 * (0.8 + 0.2 * s)} fill={PALETTE.green} stroke={PALETTE.greenDark} strokeWidth="4" /> : null}
              {arrived ? <path d={`M ${x - 6} ${y} L ${x - 1.5} ${y + 4.5} L ${x + 6.5} ${y - 5}`} stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: s }} /> : null}
            </g>
          );
        })}
      </svg>
      {Array.from({ length: count }, (_, i) => {
        const t0 = start + i * interval;
        const p = prog(frame, t0, t0 + travel, easeInOut);
        if (frame < t0 - 6 || frame > t0 + travel + 4) return null;
        const inOp = prog(frame, t0 - 6, t0);
        const outOp = 1 - prog(frame, t0 + travel - 3, t0 + travel + 4);
        const x = fromX + (toX - fromX) * p;
        const lift = Math.sin(p * Math.PI) * -34;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 46,
              top: y - 36 + lift,
              width: 92,
              height: 64,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              border: `4px solid ${PALETTE.green}`,
              boxShadow: "0 10px 24px rgba(21,24,32,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              fontWeight: 800,
              fontSize: 30,
              color: PALETTE.greenDark,
              opacity: Math.min(inOp, outOp),
            }}
          >
            ${i + 1}
          </div>
        );
      })}
    </div>
  );
};
