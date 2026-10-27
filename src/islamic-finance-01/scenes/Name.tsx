// Scene 6 (22–24.5 s): navy card — "MURABAHA", Cost-Plus Sale,
// Asset purchase → Agreed resale, supported by the car and contract.
import { AbsoluteFill } from "remotion";
import { AnimatedCar, FinancialContract } from "../components/illustrations";
import { KineticText, TransactionArrow } from "../components/ui";
import { fontFamily } from "../fonts";
import { easeInOut, prog, springFirm } from "../motion";
import { PALETTE } from "../theme";

export const Name: React.FC<{ readonly frame: number }> = ({ frame: f }) => {
  const wipe = prog(f, 0, 14, easeInOut);
  const r = wipe * 1400;
  const out = prog(f, 70, 82, easeInOut);
  const underline = prog(f, 28, 42, easeInOut);
  const sub = prog(f, 30, 42);
  const left = springFirm(f, 36, 22);
  const right = springFirm(f, 50, 22);
  const arrow = prog(f, 44, 58, easeInOut);
  const Box: React.FC<{ readonly x: number; readonly s: number; readonly label: string; readonly children: React.ReactNode }> = ({ x, s, label, children }) => (
    <div style={{ position: "absolute", left: x, top: 1040, width: 330, opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ width: 330, height: 230, borderRadius: 36, backgroundColor: PALETTE.navySoft, border: `4px solid rgba(255,255,255,0.12)`, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      <div style={{ marginTop: 22, textAlign: "center", fontFamily, fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.86)", letterSpacing: "0.02em" }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ transform: `translateY(${-out * 1920}px)` }}>
      <AbsoluteFill style={{ backgroundColor: PALETTE.navy, clipPath: `circle(${r}px at 50% 50%)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 620 }}>
          <KineticText text="MURABAHA" frame={f} start={8} size={150} color="#FFFFFF" mode="letters" stagger={2} letterSpacing={0.02} />
        </div>
        <div style={{ position: "absolute", left: 540 - 170 * underline, top: 800, width: 340 * underline, height: 12, borderRadius: 6, backgroundColor: PALETTE.green }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 846, textAlign: "center", fontFamily, fontSize: 60, fontWeight: 700, color: PALETTE.green, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>Cost-Plus Sale</div>
        <Box x={80} s={left} label="Asset purchase">
          <AnimatedCar width={250} roof={PALETTE.greenDark} />
        </Box>
        <Box x={670} s={right} label="Agreed resale">
          <div style={{ position: "relative", width: 250, height: 190 }}>
            <FinancialContract title="SALE" width={140} tone="green" style={{ position: "absolute", left: 0, top: 0 }} />
            <div style={{ position: "absolute", left: 118, top: 92, padding: "10px 16px", borderRadius: 16, backgroundColor: PALETTE.green, color: "#FFFFFF", fontFamily, fontWeight: 800, fontSize: 30, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>$22,000</div>
          </div>
        </Box>
        <TransactionArrow x1={430} y1={1155} x2={650} y2={1155} progress={arrow} color={PALETTE.green} width={7} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
