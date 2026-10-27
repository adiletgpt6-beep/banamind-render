import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { easeOut, pop } from "../components/anim";
import { Gear } from "../morning-rush/icons";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { DotGrid, Paper, Tape, drop } from "./paper";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.prelaunch;

// 47–53 с: «Азыр БалаГону ишке киргизүүгө даярданып жатам.
// Алдын ала каттоо ачык.» Статус подготовки и штамп «Алдын ала каттоо».
export const PrelaunchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const logoAt = Math.max(12, wordCue(timeline, "prelaunch", "БалаГо", 10) - 6);
  const statusAt = Math.max(
    logoAt + 8,
    wordCue(timeline, "prelaunch", "ишке", logoAt + 20) - 6,
  );
  const stampAt = Math.max(
    statusAt + 20,
    segmentCue(timeline, "prelaunch", "open") - 2,
  );
  const stamp = interpolate(frame, [stampAt, stampAt + 8], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <div
        style={{
          position: "absolute",
          left: 540 - 120,
          top: SAFE.top + 10,
          opacity: interpolate(frame, [logoAt, logoAt + 6], [0, 1], clamp),
          scale: `${interpolate(pop(frame, fps, logoAt), [0, 1], [0.6, 1])}`,
        }}
      >
        <Logo size={240} />
      </div>

      {/* статус подготовки */}
      <Paper
        style={{
          left: 120,
          right: 150,
          top: SAFE.top + 300,
          padding: "36px 30px 42px",
          backgroundColor: COLORS.yellowSoft,
          border: `6px solid ${COLORS.yellow}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          ...drop(frame, statusAt, -1, 50),
        }}
      >
        <Tape width={140} rotate={-5} style={{ top: -22, left: 40 }} />
        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: "50%",
            backgroundColor: COLORS.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Gear size={90} angle={(frame / fps) * 45} />
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.12,
            textAlign: "center",
          }}
        >
          {T.status}
        </div>
        {/* полоса «идёт подготовка» — без процентов и дат */}
        <div
          style={{
            width: 560,
            height: 26,
            borderRadius: 13,
            backgroundColor: COLORS.white,
            border: `4px solid ${COLORS.navy}`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 200,
              left:
                -200 +
                ((Math.max(0, frame - statusAt) / (1.6 * fps)) % 1) * 760,
              borderRadius: 13,
              backgroundColor: COLORS.yellow,
            }}
          />
        </div>
      </Paper>

      {/* штамп «Алдын ала каттоо» */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SAFE.top + 830,
          display: "flex",
          justifyContent: "center",
          opacity: stamp,
        }}
      >
        <div
          style={{
            padding: "22px 44px",
            border: `8px solid ${COLORS.navy}`,
            borderRadius: 22,
            fontSize: 78,
            fontWeight: 900,
            color: COLORS.navy,
            backgroundColor: COLORS.white,
            rotate: "-5deg",
            scale: `${interpolate(stamp, [0, 1], [1.6, 1])}`,
            boxShadow: "0 14px 30px rgba(20, 40, 90, 0.15)",
          }}
        >
          {T.register}
        </div>
      </div>
    </AbsoluteFill>
  );
};
