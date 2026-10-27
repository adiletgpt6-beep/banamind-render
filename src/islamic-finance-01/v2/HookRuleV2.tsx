// V2 scenes 1 + 2 (0–6.5 s) with the presenter: he asks the question, the
// percent badge appears beside him and gets crossed out; then he steps to the
// left and teaches the RIBA card.
import { AbsoluteFill } from "remotion";
import { InterestIcon, LoanInterestIcon } from "../components/illustrations";
import { Camera, Card, KineticText, Pill } from "../components/ui";
import { fontFamily } from "../fonts";
import { HorsePresenter, type HorseShot } from "../horse/HorsePresenter";
import type { LipsyncData } from "../horse/lipsync";
import { EXPRESSION, GESTURE } from "../horse/pose";
import { type If01Manifest, wordStart } from "../manifest";
import { cameraScale, easeIn, easeInOut, mixColor, prog, sec, springFirm, springPop, springSoft } from "../motion";
import { PALETTE } from "../theme";

export const hookRuleShot = (m: If01Manifest): HorseShot => {
  const interest = sec(wordStart(m, "l1", "interest", 1.68));
  const prohibited = sec(wordStart(m, "l2", "prohibited", 5.35));
  const riba = sec(wordStart(m, "l2", "riba", 4.8));
  return {
    from: 0,
    to: 195,
    place: { x: 470, y: 560, scale: 1.04 },
    enter: "none",
    exit: "fade",
    exitFrames: 9,
    moves: [{ at: 82, dur: 22, to: { x: 206, y: 700, scale: 0.62 } }],
    beats: [
      { at: 0, dur: 0, pose: { ...EXPRESSION.curious, lookX: 0, lookY: 0, headTurn: 0 } },
      { at: 4, dur: 14, pose: { ...GESTURE.raiseRight } }, // "what if…" — a question hoof
      { at: interest - 10, dur: 12, pose: { headTurn: 0.6, lookX: 0.8, lookY: -0.2, armRElbow: 100, armRShoulder: 30, armROpen: 0.6 } }, // looks at the % badge
      { at: interest + 10, dur: 8, pose: { ...EXPRESSION.surprised, headTurn: 0.5, lookX: 0.7, lookY: -0.2 } }, // crossed out — surprised
      { at: 70, dur: 12, pose: { ...EXPRESSION.confident, headTurn: 0, lookX: 0, lookY: 0, ...GESTURE.rest } },
      // scene 2: step to the left and present the card
      { at: 92, dur: 16, pose: { ...EXPRESSION.explaining, headTurn: 0.5, lookX: 0.7, lookY: 0.1, ...GESTURE.presentRight } },
      { at: riba - 4, dur: 10, pose: { ...GESTURE.pointRight, headNod: 3 } },
      { at: prohibited - 2, dur: 8, pose: { browL: 0.5, browR: 0.5, browTiltL: -4, browTiltR: -4, headNod: 6, earL: 6, earR: 6 } },
      { at: prohibited + 14, dur: 12, pose: { ...EXPRESSION.confident, headTurn: 0.1, lookX: 0.1, lookY: 0, ...GESTURE.presentRight } },
    ],
  };
};

export const HookRuleV2: React.FC<{ readonly frame: number; readonly manifest: If01Manifest; readonly lipsync: LipsyncData }> = ({ frame: f, manifest, lipsync }) => {
  const morphAt = 86;
  const cam = f < morphAt ? cameraScale(f, 0, morphAt, 1, 1.05) : cameraScale(f, morphAt, morphAt + 30, 1.05, 1);
  const headOut = prog(f, 82, 94, easeIn);
  const interest = sec(wordStart(manifest, "l1", "interest", 1.68));
  const pct = springPop(f, interest - 14);
  const pctGrow = 1 + 0.15 * prog(f, interest - 2, interest + 6) - 0.15 * prog(f, interest + 14, interest + 26);
  const cross = prog(f, interest + 2, interest + 14, easeInOut);
  const bounce = f > interest + 16 ? Math.abs(Math.sin(((f - interest - 16) / 22) * Math.PI)) * Math.exp(-(f - interest - 16) / 28) * -22 : 0;
  const sideOut = 1 - prog(f, morphAt - 4, morphAt + 10);

  const cardIn = springFirm(f, morphAt + 16, 24);
  const ribaAt = sec(wordStart(manifest, "l2", "riba", 4.8));
  const prohibitedAt = sec(wordStart(manifest, "l2", "prohibited", 5.35));
  const ban = prog(f, prohibitedAt - 6, prohibitedAt + 14, easeInOut);
  const greenAt = prohibitedAt + 16;
  const toGreen = prog(f, greenAt, greenAt + 16, easeInOut);
  const accent = mixColor(PALETTE.coral, PALETTE.green, toGreen);
  const tint = mixColor("#FFFFFF", PALETTE.greenSoft, toGreen);
  const sceneOut = prog(f, 186, 195, easeIn);
  const shot = hookRuleShot(manifest);

  return (
    <Camera scale={cam}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 228, opacity: 1 - headOut, transform: `translateY(${-headOut * 60}px)` }}>
        <KineticText text={"NO\nINTEREST?"} frame={f} start={-5} size={150} stagger={3} />
      </div>
      {/* the presenter */}
      <HorsePresenter frame={f} shot={shot} lipsync={lipsync} manifest={manifest} />
      {/* percent badge beside his head */}
      <div style={{ position: "absolute", left: 800, top: 640 + bounce, opacity: Math.min(pct, sideOut), transform: `scale(${pct * pctGrow})`, transformOrigin: "50% 50%" }}>
        <InterestIcon size={220} cross={cross} />
      </div>

      {/* scene 2: RIBA card to the right of the presenter */}
      {f >= morphAt + 12 ? (
        <AbsoluteFill style={{ opacity: Math.min(1, cardIn * 1.3) * (1 - sceneOut), transform: `translateY(${-sceneOut * 80}px)` }}>
          <Card accent={accent} bg={tint} style={{ left: 432, top: 620, width: 612, height: 720, transform: `scale(${0.7 + 0.3 * cardIn})`, transformOrigin: "20% 45%" }}>
            <div style={{ position: "absolute", left: 40, top: 38 }}>
              <Pill frame={f} start={morphAt + 24} tone="green" size={26} firm>
                ISLAMIC FINANCE
              </Pill>
            </div>
            <div style={{ position: "absolute", left: 36, top: 132 }}>
              <KineticText text="RIBA" frame={f} start={Math.max(morphAt + 18, ribaAt - 34)} size={176} mode="letters" stagger={3} align="left" letterSpacing={-0.03} />
            </div>
            <div style={{ position: "absolute", left: 44, top: 332, fontFamily, fontSize: 40, fontWeight: 600, color: PALETTE.inkSoft, opacity: prog(f, morphAt + 40, morphAt + 52), transform: `translateY(${(1 - prog(f, morphAt + 40, morphAt + 52)) * 20}px)` }}>
              Interest on loans
            </div>
            <div style={{ position: "absolute", left: 356, top: 420, opacity: springSoft(f, morphAt + 34), transform: `scale(${springSoft(f, morphAt + 34)})`, transformOrigin: "50% 50%" }}>
              <LoanInterestIcon size={220} ban={ban} />
            </div>
            <div style={{ position: "absolute", left: 44, top: 548, fontFamily, fontSize: 32, fontWeight: 800, letterSpacing: "0.08em", color: toGreen > 0.5 ? PALETTE.greenDark : "#B23A3A", opacity: prog(f, prohibitedAt, prohibitedAt + 10) }}>
              {toGreen > 0.5 ? "NOT ALLOWED" : "PROHIBITED"}
            </div>
            <div style={{ position: "absolute", left: 44, top: 600, width: 280 * toGreen, height: 10, borderRadius: 5, backgroundColor: PALETTE.green }} />
          </Card>
        </AbsoluteFill>
      ) : null}
    </Camera>
  );
};
