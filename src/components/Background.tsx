import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config";

// Белый фон с мягкими жёлтыми и голубыми пятнами, которые медленно дрейфуют.
// Движение зависит только от номера кадра.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          left: -320 + Math.sin(t * 0.5) * 30,
          top: -260 + Math.cos(t * 0.4) * 30,
          background: `radial-gradient(circle, ${COLORS.yellowSoft} 0%, rgba(255,244,194,0) 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          right: -420 + Math.cos(t * 0.35) * 40,
          bottom: -380 + Math.sin(t * 0.45) * 40,
          background: `radial-gradient(circle, ${COLORS.sky} 0%, rgba(234,243,252,0) 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          right: -260 + Math.sin(t * 0.3) * 25,
          top: 640 + Math.cos(t * 0.5) * 25,
          background: `radial-gradient(circle, ${COLORS.yellowSoft} 0%, rgba(255,244,194,0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
