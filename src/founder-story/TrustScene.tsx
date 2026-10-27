import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { DotGrid, Marker, Paper, Tape, drop } from "./paper";
import { FamilyChat } from "./FamilyChat";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.trust;

// Чат продолжается без подмены интерфейса схемой расписания.
// «А бала мектепке барышы керек. Мындай учурда… кимге ишенсе болот?»
export const TrustScene: React.FC = () => {
  const frame = useCurrentFrame();
  const timeline = useTimeline();

  const schoolAt = wordCue(timeline, "trust", "мектепке", 10);
  const qAt = Math.max(
    schoolAt + 16,
    wordCue(
      timeline,
      "trust",
      "кимге",
      segmentCue(timeline, "trust", "trust") + 20,
    ) - 6,
  );
  const highlightAt = Math.max(
    qAt + 6,
    wordCue(timeline, "trust", T.highlight, qAt + 14),
  );
  // Первые кадры совпадают с концом ChatScene. Только после общего
  // перехода цельное окно уменьшается и опускается под будущий вопрос.
  const settle = interpolate(frame, [18, Math.max(50, schoolAt + 27)], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const marker = interpolate(frame, [highlightAt, highlightAt + 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <AbsoluteFill
        style={{
          transformOrigin: `540px ${SAFE.top}px`,
          transform: `translateY(${settle * 440}px) scale(${1 - settle * 0.32})`,
        }}
      >
        <FamilyChat frame={10_000} messageAt={[0, 0, 0]} />
      </AbsoluteFill>

      {/* вопрос доверия */}
      <Paper
        style={{
          left: 120,
          right: 150,
          top: SAFE.top + 20,
          padding: "40px 30px 46px",
          textAlign: "center",
          fontSize: 88,
          fontWeight: 900,
          lineHeight: 1.1,
          ...drop(frame, qAt, -1.5, 40),
        }}
      >
        <Tape width={150} rotate={-5} style={{ top: -22, left: 40 }} />
        <Tape width={150} rotate={4} style={{ top: -22, right: 40 }} />
        {T.question.split(" ").map((w, i) => (
          <span key={i}>
            {w.startsWith(T.highlight) ? (
              <Marker progress={marker}>{w}</Marker>
            ) : (
              w
            )}{" "}
          </span>
        ))}
      </Paper>
    </AbsoluteFill>
  );
};
