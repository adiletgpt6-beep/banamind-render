// V2 scene 6 (22–24.5 s): navy card. The presenter stands at the left and
// presents "MURABAHA — Cost-Plus Sale"; the asset purchase → agreed resale
// graphic is stacked on the right.
import { AbsoluteFill } from "remotion";
import { AnimatedCar, FinancialContract } from "../components/illustrations";
import { KineticText, TransactionArrow } from "../components/ui";
import { fontFamily } from "../fonts";
import { HorsePresenter, type HorseShot } from "../horse/HorsePresenter";
import type { LipsyncData } from "../horse/lipsync";
import { EXPRESSION, GESTURE } from "../horse/pose";
import { type If01Manifest, wordStart } from "../manifest";
import { easeInOut, prog, sec, springFirm } from "../motion";
import { PALETTE } from "../theme";

const BASE = 660;

export const nameShot = (m: If01Manifest): HorseShot => {
  const murabaha = sec(wordStart(m, "l6", "murabaha", 22.72));
  return {
    from: BASE + 6,
    to: BASE + 82,
    place: { x: 290, y: 690, scale: 0.9 },
    enter: "bottom",
    enterFrames: 18,
    exit: "none",
    beats: [
      { at: BASE + 6, dur: 0, pose: { ...EXPRESSION.confident, headTurn: 0.1, lookX: 0.1, ...GESTURE.rest } },
      { at: BASE + 14, dur: 14, pose: { ...GESTURE.pointUpRight, armRShoulder: 120, armRElbow: 28, headTurn: 0.3, lookX: 0.5, lookY: -0.6 } }, // presents the title
      { at: murabaha - 2, dur: 10, pose: { headNod: 7, browL: 0.4, browR: 0.4 } }, // nods on the word
      { at: murabaha + 14, dur: 10, pose: { headNod: 0 } },
      { at: murabaha + 22, dur: 14, pose: { ...GESTURE.presentRight, armRShoulder: 58, armRHoof: 40, headTurn: 0.35, lookX: 0.6, lookY: 0.3, ...EXPRESSION.explaining } }, // the graphic
      { at: BASE + 66, dur: 10, pose: { lookX: 0, lookY: 0, headTurn: 0, ...EXPRESSION.happy } },
    ],
  };
};

export const NameV2: React.FC<{ readonly frame: number; readonly manifest: If01Manifest; readonly lipsync: LipsyncData }> = ({ frame: f, manifest, lipsync }) => {
  const wipe = prog(f, 0, 14, easeInOut);
  const r = wipe * 1400;
  const out = prog(f, 70, 82, easeInOut);
  const underline = prog(f, 28, 42, easeInOut);
  const sub = prog(f, 30, 42);
  const top = springFirm(f, 38, 22);
  const bottom = springFirm(f, 52, 22);
  const arrow = prog(f, 46, 60, easeInOut);
  const abs = BASE + f;
  const Box: React.FC<{ readonly y: number; readonly s: number; readonly label: string; readonly children: React.ReactNode }> = ({ y, s, label, children }) => (
    <div style={{ position: "absolute", left: 650, top: y, width: 380, opacity: s, transform: `translateX(${(1 - s) * 40}px)` }}>
      <div style={{ width: 380, height: 220, borderRadius: 36, backgroundColor: PALETTE.navySoft, border: `4px solid rgba(255,255,255,0.12)`, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      <div style={{ marginTop: 18, textAlign: "center", fontFamily, fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.86)" }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ transform: `translateY(${-out * 1920}px)` }}>
      <AbsoluteFill style={{ backgroundColor: PALETTE.navy, clipPath: `circle(${r}px at 50% 50%)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 290 }}>
          <KineticText text="MURABAHA" frame={f} start={8} size={140} color="#FFFFFF" mode="letters" stagger={2} letterSpacing={0.02} />
        </div>
        <div style={{ position: "absolute", left: 540 - 170 * underline, top: 460, width: 340 * underline, height: 12, borderRadius: 6, backgroundColor: PALETTE.green }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily, fontSize: 58, fontWeight: 700, color: PALETTE.green, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>Cost-Plus Sale</div>
        <Box y={720} s={top} label="Asset purchase">
          <AnimatedCar width={260} />
        </Box>
        <TransactionArrow x1={840} y1={1010} x2={840} y2={1100} progress={arrow} color={PALETTE.green} width={7} />
        <Box y={1130} s={bottom} label="Agreed resale">
          <div style={{ position: "relative", width: 260, height: 190 }}>
            <FinancialContract title="SALE" width={140} tone="green" style={{ position: "absolute", left: 10, top: 0 }} />
            <div style={{ position: "absolute", left: 124, top: 92, padding: "10px 16px", borderRadius: 16, backgroundColor: PALETTE.green, color: "#FFFFFF", fontFamily, fontWeight: 800, fontSize: 30, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>$22,000</div>
          </div>
        </Box>
        <HorsePresenter frame={abs} shot={nameShot(manifest)} lipsync={lipsync} manifest={manifest} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
