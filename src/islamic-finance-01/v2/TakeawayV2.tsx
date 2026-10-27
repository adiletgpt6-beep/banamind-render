// V2 scene 7 (24.5–27.5 s): the presenter stands between the two contract
// cards and directs attention to each; "DIFFERENT CONTRACT" below.
import { AbsoluteFill } from "remotion";
import { AnimatedCar, DollarCoin, LoanInterestIcon } from "../components/illustrations";
import { ComparisonCard, KineticText, Pill } from "../components/ui";
import { fontFamily } from "../fonts";
import { HorsePresenter, type HorseShot } from "../horse/HorsePresenter";
import type { LipsyncData } from "../horse/lipsync";
import { EXPRESSION, GESTURE } from "../horse/pose";
import { type If01Manifest, wordStart } from "../manifest";
import { easeIn, easeInOut, prog, sec } from "../motion";
import { PALETTE } from "../theme";

const BASE = 735;

export const takeawayShot = (m: If01Manifest): HorseShot => {
  const not = sec(wordStart(m, "l7", "not", 24.6));
  const different = sec(wordStart(m, "l7", "different", 25.87));
  const contract = sec(wordStart(m, "l7", "contract", 26.5));
  return {
    from: BASE + 4,
    to: BASE + 90,
    place: { x: 540, y: 612, scale: 0.5 },
    enter: "bottom",
    enterFrames: 16,
    exit: "fade",
    exitFrames: 8,
    beats: [
      { at: BASE + 4, dur: 0, pose: { ...EXPRESSION.explaining, ...GESTURE.rest } },
      // "Not" — a small head shake
      { at: not, dur: 5, pose: { headTurn: -0.35 } },
      { at: not + 5, dur: 6, pose: { headTurn: 0.35 } },
      { at: not + 11, dur: 6, pose: { headTurn: 0 } },
      { at: not + 16, dur: 12, pose: { ...GESTURE.presentLeft, headTurn: -0.35, lookX: -0.6, lookY: 0.1 } }, // the loan card
      { at: different - 2, dur: 12, pose: { ...GESTURE.presentRight, armLShoulder: 8, armLElbow: 26, armLOpen: 0, headTurn: 0.35, lookX: 0.6, lookY: 0.1, browL: 0.4, browR: 0.4 } }, // the sale card
      { at: contract + 8, dur: 12, pose: { ...GESTURE.bothOpen, headTurn: 0, lookX: 0, lookY: 0.1, ...EXPRESSION.confident } },
    ],
  };
};

export const TakeawayV2: React.FC<{ readonly frame: number; readonly manifest: If01Manifest; readonly lipsync: LipsyncData }> = ({ frame: f, manifest, lipsync }) => {
  const tDifferent = Math.max(30, sec(wordStart(manifest, "l7", "different", 25.87)) - BASE - 2);
  const strike = prog(f, 20, 30, easeInOut);
  const out = prog(f, 82, 90, easeIn);
  const abs = BASE + f;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 60}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <Pill frame={f} start={8} tone="yellow" size={40} firm>
            FREE MONEY?
          </Pill>
          <div style={{ position: "absolute", left: "4%", top: "50%", width: `${92 * strike}%`, height: 10, borderRadius: 5, backgroundColor: PALETTE.coral, transform: "translateY(-50%) rotate(-6deg)", transformOrigin: "0 50%" }} />
        </div>
      </div>
      <ComparisonCard title="INTEREST-BASED LOAN" tone="coral" frame={f} start={10} x={30} y={560} w={340} h={490}>
        <LoanInterestIcon size={150} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily, fontWeight: 800, fontSize: 30, color: PALETTE.ink }}>
          <DollarCoin size={46} /> <span>+</span> <span style={{ color: PALETTE.coral }}>%</span>
        </div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 22, color: PALETTE.inkSoft, textAlign: "center", padding: "0 24px" }}>money lent, interest charged</div>
      </ComparisonCard>
      <ComparisonCard title="ASSET SALE" tone="green" frame={f} start={16} x={710} y={560} w={340} h={490}>
        <AnimatedCar width={210} />
        <div style={{ padding: "8px 18px", borderRadius: 16, backgroundColor: PALETTE.greenSoft, border: `4px solid ${PALETTE.green}`, fontFamily, fontWeight: 800, fontSize: 32, color: PALETTE.greenDark }}>$22,000</div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 22, color: PALETTE.inkSoft, textAlign: "center", padding: "0 24px" }}>asset sold, price disclosed</div>
      </ComparisonCard>
      <HorsePresenter frame={abs} shot={takeawayShot(manifest)} lipsync={lipsync} manifest={manifest} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1190 }}>
        <KineticText text={"DIFFERENT\nCONTRACT"} frame={f} start={tDifferent} size={118} stagger={4} accent={{ CONTRACT: PALETTE.greenDark }} />
      </div>
    </AbsoluteFill>
  );
};
