import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import { Logo } from "../components/Logo";
import { fadeUp, pop } from "../components/anim";

// Решение: логотип появляется вместе со словом «БалаГо».
export const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const logoAt = Math.max(0, wordCue(timeline, "brand", "БалаГо", 8) - 6);
  const taglineAt = wordCue(timeline, "brand", "балдар", logoAt + 16);
  const logoPop = pop(frame, fps, logoAt);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        color: COLORS.navy,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* мягкое жёлтое сияние за логотипом */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          top: 330,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.yellowSoft} 0%, rgba(255,244,194,0) 68%)`,
          scale: interpolate(logoPop, [0, 1], [0.5, 1]),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 56,
        }}
      >
        <Logo
          size={600}
          style={{
            opacity: interpolate(frame, [logoAt, logoAt + 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(logoPop, [0, 1], [0.55, 1]),
            rotate: `${interpolate(logoPop, [0, 1], [-10, 0])}deg`,
          }}
        />
        <div
          style={{
            padding: "22px 60px",
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            fontSize: 74,
            fontWeight: 900,
            boxShadow: `0 16px 40px ${COLORS.shadow}`,
            ...fadeUp(frame, taglineAt - 3, 12, 40),
          }}
        >
          {TEXT.brand.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
