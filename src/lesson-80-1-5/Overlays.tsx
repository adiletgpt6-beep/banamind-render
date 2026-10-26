// Надписи поверх кадра: название в установочном плане, итоговая фраза в
// финале, субтитры (только если включены).
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { SubtitlesContext, TimelineContext } from "./context";
import { easeOut } from "./rig/motion";
import { L815_FPS, L815_TEXT } from "./script";
import { Subtitles } from "./Subtitles";

const FPS = L815_FPS;

export const Overlays: React.FC = () => {
  const tl = useContext(TimelineContext);
  const subs = useContext(SubtitlesContext);
  const f = useCurrentFrame();
  // название: на установочном плане сцены 1 (во время реплики 03 и после), ≈ 5 с
  const l03 = tl.cues.find((c) => c.id === "l03")!;
  const titleFrom = l03.fromFrame - 10;
  const titleTo = titleFrom + 5 * FPS;
  const ta = easeOut((f - titleFrom) / 14) * (1 - easeOut((f - (titleTo - 14)) / 14));
  // итоговая фраза: последние ~5 с
  const finalFrom = tl.durationInFrames - Math.round(5.2 * FPS);
  const fa = easeOut((f - finalFrom) / 18);
  return (
    <>
      {ta > 0.01 && f < titleTo ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 54, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: ta }}>
          <div style={{ fontFamily, fontSize: 56, fontWeight: 800, color: "#2A3A5C", backgroundColor: "rgba(255,255,255,0.72)", padding: "10px 34px", borderRadius: 22, letterSpacing: 0.5, transform: `translateY(${(1 - ta) * -10}px)` }}>
            {L815_TEXT.title}
          </div>
        </div>
      ) : null}
      {f >= finalFrom ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: fa }}>
          <div style={{ fontFamily, fontSize: 60, fontWeight: 800, color: "#2A3A5C", backgroundColor: "rgba(255,255,255,0.78)", padding: "14px 40px", borderRadius: 24, textAlign: "center", lineHeight: 1.2, boxShadow: "0 8px 24px rgba(40,35,60,0.12)" }}>
            {L815_TEXT.finalLines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
      ) : null}
      {subs ? <Subtitles /> : null}
    </>
  );
};
