// Character preview sheet: neutral, speaking, smile, pointing, curious —
// rendered as a single still (npm run preview:horse).
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../fonts";
import { PALETTE } from "../theme";
import { EXPRESSION, GESTURE, type PartialPose, REST } from "./pose";
import { HorseRig } from "./rig";
import type { Mouth } from "./lipsync";

const CLOSED: Mouth = { open: 0, wide: 0, round: 0, teeth: 0, tongue: 0, press: 0 };
const panels: { label: string; pose: PartialPose; mouth: Mouth }[] = [
  { label: "Neutral", pose: { ...EXPRESSION.neutral, ...GESTURE.rest, breath: 0.5 }, mouth: CLOSED },
  { label: "Speaking", pose: { ...EXPRESSION.explaining, ...GESTURE.presentRight, breath: 0.5, lookX: 0.1 }, mouth: { open: 0.75, wide: 0.6, round: 0.1, teeth: 0.4, tongue: 0, press: 0 } },
  { label: "Smile", pose: { ...EXPRESSION.happy, ...GESTURE.waveRight, breath: 0.5 }, mouth: CLOSED },
  { label: "Pointing", pose: { ...EXPRESSION.confident, ...GESTURE.pointLeft, headTurn: -0.5, lookX: -0.6, breath: 0.5 }, mouth: { open: 0.35, wide: 0.9, round: 0, teeth: 0.8, tongue: 0, press: 0 } },
  { label: "Curious", pose: { ...EXPRESSION.curious, ...GESTURE.raiseRight, headTurn: 0.25, lookX: 0.3, lookY: -0.3, breath: 0.5 }, mouth: { open: 0.2, wide: 0.3, round: 0.6, teeth: 0, tongue: 0, press: 0 } },
];

export const HorsePreview: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PALETTE.bg, fontFamily }}>
    {panels.map((p, i) => (
      <div key={p.label} style={{ position: "absolute", left: 40 + i * 400, top: 60, width: 380, height: 760 }}>
        <div style={{ position: "absolute", left: 40, top: 40, width: 300, height: 450 }}>
          <HorseRig pose={{ ...REST, ...p.pose }} mouth={p.mouth} width={300} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontSize: 34, fontWeight: 800, color: PALETTE.ink, letterSpacing: "0.04em" }}>{p.label.toUpperCase()}</div>
      </div>
    ))}
  </AbsoluteFill>
);
