// 2D-слой поверх 3D: виньетка, тёплый блик, титр урока в первой сцене.
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { clamp, s } from "./motion";
import { LESSON_TEXT } from "./script";

const NAVY = "#17345c";

export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [1, 0], clamp);
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames - 1], [0, 1], clamp);

  const titleIn = spring({ frame: frame - s(0.9), fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
  const titleOut = interpolate(frame, [s(5.5), s(6.2)], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const chapterIn = spring({ frame: frame - s(0.6), fps, config: { damping: 18, stiffness: 120 } });
  const lineW = interpolate(frame, [s(1.1), s(2.2)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const titleVisible = frame < s(6.3);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* тёплый блик от окна */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 78% 12%, rgba(255,226,170,0.28) 0%, rgba(255,226,170,0.08) 28%, rgba(255,226,170,0) 55%)",
          opacity: 0.85 + 0.15 * Math.sin(frame * 0.04),
          mixBlendMode: "screen",
        }}
      />
      {/* виньетка */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 48%, rgba(10,20,40,0.22) 80%, rgba(10,20,40,0.5) 100%)" }} />

      {titleVisible ? (
        <div style={{ position: "absolute", left: 120, bottom: 120, fontFamily, color: "#fff", opacity: titleOut }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: NAVY,
              background: "#f5c531",
              padding: "10px 22px",
              borderRadius: 999,
              opacity: chapterIn,
              translate: `0px ${(1 - chapterIn) * 30}px`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            {LESSON_TEXT.chapter}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 112,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -1,
              textShadow: "0 6px 30px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.35)",
              opacity: titleIn,
              translate: `0px ${(1 - titleIn) * 60}px`,
              scale: String(0.94 + 0.06 * titleIn),
              transformOrigin: "left bottom",
            }}
          >
            {LESSON_TEXT.title}
          </div>
          <div style={{ marginTop: 18, height: 6, width: 420 * lineW, borderRadius: 3, background: "linear-gradient(90deg, #f5c531, rgba(245,197,49,0))" }} />
        </div>
      ) : null}

      <AbsoluteFill style={{ backgroundColor: "#07101d", opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};
