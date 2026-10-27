// V2 scene 3 (6.5–9 s): close-up of the presenter asking "THEN HOW?", a big
// question mark beside his head, then a gesture that introduces the example.
import { Camera, KineticText } from "../components/ui";
import { fontFamily } from "../fonts";
import { HorsePresenter, type HorseShot } from "../horse/HorsePresenter";
import type { LipsyncData } from "../horse/lipsync";
import { EXPRESSION, GESTURE } from "../horse/pose";
import { type If01Manifest, wordStart } from "../manifest";
import { cameraScale, easeIn, floatY, prog, sec, springPop } from "../motion";
import { PALETTE } from "../theme";

const BASE = 195;

export const questionShot = (m: If01Manifest): HorseShot => {
  const work = sec(wordStart(m, "l3", "work", 8.0));
  return {
    from: BASE,
    to: BASE + 75,
    place: { x: 500, y: 540, scale: 1.42 },
    placeEnd: { x: 500, y: 520, scale: 1.5 },
    enter: "fade",
    enterFrames: 10,
    exit: "fade",
    exitFrames: 12,
    beats: [
      { at: BASE, dur: 0, pose: { ...EXPRESSION.curious, headTurn: 0.1, lookX: 0.05, ...GESTURE.rest } },
      { at: BASE + 6, dur: 12, pose: { browL: 0.8, browR: 0.7, browTiltL: 6, browTiltR: 2, headTilt: -4, ...GESTURE.raiseRight } },
      { at: BASE + 30, dur: 10, pose: { lookX: 0.5, lookY: -0.3, headTurn: 0.35 } }, // glances at the question mark
      { at: BASE + 44, dur: 10, pose: { lookX: 0, lookY: 0, headTurn: 0 } },
      { at: work - 6, dur: 12, pose: { ...EXPRESSION.confident, ...GESTURE.presentLeft, headTurn: -0.3, lookX: -0.5, lookY: 0.3 } }, // introduces the example (car comes from the left)
    ],
  };
};

export const QuestionV2: React.FC<{ readonly frame: number; readonly manifest: If01Manifest; readonly lipsync: LipsyncData }> = ({ frame: f, manifest, lipsync }) => {
  const out = prog(f, 66, 75, easeIn);
  const cam = cameraScale(f, 0, 75, 1, 1.03);
  const q = springPop(f, 26);
  const abs = BASE + f;
  return (
    <Camera scale={cam}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${-out * 50}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
          <KineticText text="THEN HOW?" frame={f} start={0} size={150} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 790,
            top: 520 + floatY(f, 8, 70),
            fontFamily,
            fontSize: 260,
            fontWeight: 900,
            color: PALETTE.yellow,
            WebkitTextStroke: `6px ${PALETTE.ink}`,
            opacity: q,
            transform: `scale(${q}) rotate(${10 - 10 * q}deg)`,
            transformOrigin: "50% 80%",
            lineHeight: 1,
          }}
        >
          ?
        </div>
      </div>
      <HorsePresenter frame={abs} shot={questionShot(manifest)} lipsync={lipsync} manifest={manifest} />
    </Camera>
  );
};
