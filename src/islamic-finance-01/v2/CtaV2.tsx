// V2 scene 8 (27.5–30 s): the presenter looks at the viewer, waves, and holds
// a friendly expression on a stable final frame.
import { AbsoluteFill } from "remotion";
import { CoinStack } from "../components/illustrations";
import { KineticText, Pill, TransactionArrow } from "../components/ui";
import { HorsePresenter, type HorseShot } from "../horse/HorsePresenter";
import type { LipsyncData } from "../horse/lipsync";
import { EXPRESSION, GESTURE } from "../horse/pose";
import { type If01Manifest, wordStart } from "../manifest";
import { easeInOut, prog, sec, springFirm } from "../motion";
import { PALETTE } from "../theme";

const BASE = 825;

export const ctaShot = (m: If01Manifest): HorseShot => {
  const follow = sec(wordStart(m, "l8", "follow", 27.58));
  const explained = sec(wordStart(m, "l8", "explained", 28.95));
  return {
    from: BASE,
    to: 900,
    place: { x: 370, y: 640, scale: 0.92 },
    enter: "bottom",
    enterFrames: 16,
    exit: "none",
    beats: [
      { at: BASE, dur: 0, pose: { ...EXPRESSION.happy, ...GESTURE.rest, lookX: 0, lookY: 0 } },
      { at: follow, dur: 12, pose: { ...GESTURE.waveRight } },
      { at: follow + 14, dur: 8, pose: { armRHoof: 22 } },
      { at: follow + 22, dur: 8, pose: { armRHoof: -18 } },
      { at: follow + 30, dur: 8, pose: { armRHoof: 10 } },
      { at: follow + 40, dur: 14, pose: { ...GESTURE.presentRight, armRShoulder: 40, armRElbow: 70, armRHoof: 40, headTurn: 0.25, lookX: 0.5, lookY: -0.2 } }, // toward FOLLOW
      { at: explained + 10, dur: 14, pose: { ...GESTURE.rest, armRShoulder: 14, armRElbow: 40, headTurn: 0, lookX: 0, lookY: 0, ...EXPRESSION.happy } },
    ],
  };
};

export const CtaV2: React.FC<{ readonly frame: number; readonly manifest: If01Manifest; readonly lipsync: LipsyncData }> = ({ frame: f, manifest, lipsync }) => {
  const drops = [0, 1, 2, 3, 4].map((i) => springFirm(f, 14 + i * 5, 18));
  const arrow = prog(f, 38, 52, easeInOut);
  const pulse = 1 + 0.03 * Math.sin((f / 18) * Math.PI) * (1 - prog(f, 48, 64));
  const abs = BASE + f;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <KineticText text={"MONEY,\nEXPLAINED."} frame={f} start={0} size={126} stagger={4} accent={{ "EXPLAINED.": PALETTE.greenDark }} />
      </div>
      <HorsePresenter frame={abs} shot={ctaShot(manifest)} lipsync={lipsync} manifest={manifest} />
      <div style={{ position: "absolute", left: 640, top: 760, transform: `scale(${pulse})`, transformOrigin: "50% 50%" }}>
        <Pill frame={f} start={16} tone="green" size={36} firm>
          FOLLOW FOR MORE
        </Pill>
      </div>
      <TransactionArrow x1={850} y1={1150} x2={850} y2={900} progress={arrow} color={PALETTE.ink} width={6} curve={0} opacity={0.5} />
      <div style={{ position: "absolute", left: 850 - 120, top: 1130 }}>
        <CoinStack count={5} size={240} drop={drops} />
      </div>
    </AbsoluteFill>
  );
};
