// Scene 7 (24.5–27.5 s): two contract cards side by side and "DIFFERENT CONTRACT".
// Neither option is labelled better, cheaper or safer.
import { AbsoluteFill } from "remotion";
import { AnimatedCar, DollarCoin, LoanInterestIcon } from "../components/illustrations";
import { ComparisonCard, KineticText, Pill } from "../components/ui";
import { fontFamily } from "../fonts";
import { type If01Manifest, wordStart } from "../manifest";
import { easeIn, easeInOut, prog, sec } from "../motion";
import { PALETTE } from "../theme";

export const Takeaway: React.FC<{ readonly frame: number; readonly manifest: If01Manifest }> = ({ frame: f, manifest }) => {
  const base = sec(24.5);
  const tDifferent = Math.max(30, sec(wordStart(manifest, "l7", "different", 25.87)) - base - 2);
  const strike = prog(f, 20, 30, easeInOut);
  const out = prog(f, 82, 90, easeIn);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 60}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <Pill frame={f} start={8} tone="yellow" size={40} firm>
            FREE MONEY?
          </Pill>
          <div style={{ position: "absolute", left: "4%", top: "50%", width: `${92 * strike}%`, height: 10, borderRadius: 5, backgroundColor: PALETTE.coral, transform: "translateY(-50%) rotate(-6deg)", transformOrigin: "0 50%" }} />
        </div>
      </div>
      <ComparisonCard title="INTEREST-BASED LOAN" tone="coral" frame={f} start={10} x={60} y={580} w={460} h={600}>
        <LoanInterestIcon size={230} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily, fontWeight: 800, fontSize: 34, color: PALETTE.ink }}>
          <DollarCoin size={54} /> <span>+</span> <span style={{ color: PALETTE.coral }}>%</span>
        </div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 28, color: PALETTE.inkSoft }}>money lent, interest charged</div>
      </ComparisonCard>
      <ComparisonCard title="ASSET SALE" tone="green" frame={f} start={16} x={560} y={580} w={460} h={600}>
        <AnimatedCar width={300} />
        <div style={{ padding: "10px 22px", borderRadius: 18, backgroundColor: PALETTE.greenSoft, border: `4px solid ${PALETTE.green}`, fontFamily, fontWeight: 800, fontSize: 36, color: PALETTE.greenDark }}>$22,000</div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 28, color: PALETTE.inkSoft }}>asset sold, price disclosed</div>
      </ComparisonCard>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240 }}>
        <KineticText text={"DIFFERENT\nCONTRACT"} frame={f} start={tDifferent} size={118} stagger={4} accent={{ CONTRACT: PALETTE.greenDark }} />
      </div>
    </AbsoluteFill>
  );
};
