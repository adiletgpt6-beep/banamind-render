import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { DotGrid, Marker, Paper, Tape, drop } from "./paper";
import { SLOT_CENTER, ScheduleBoard } from "./ScheduleBoard";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.trust;

// 14–20 с: камера приближает пустое школьное окно в расписании.
// «А бала мектепке барышы керек. Мындай учурда… кимге ишенсе болот?»
export const TrustScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
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
  // Приближение к пустому окну, затем медленный «дрейф» в паузе.
  const z1 = Math.max(1, schoolAt);
  const z2 = z1 + Math.round(1.2 * fps);
  const zoom = interpolate(
    frame,
    [0, z1, z2, Math.max(z2 + 1, durationInFrames)],
    [1, 1.04, 1.75, 1.85],
    { ...clamp, easing: easeInOut },
  );
  const glow =
    interpolate(frame, [schoolAt, schoolAt + 10], [0, 1], clamp) *
    (0.75 + 0.25 * Math.sin((frame / fps) * Math.PI * 2 * 0.7));
  // В момент вопроса расписание приглушается — фокус на словах.
  const dim = interpolate(frame, [qAt - 4, qAt + 10], [0, 0.55], clamp);
  const marker = interpolate(frame, [highlightAt, highlightAt + 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <AbsoluteFill
        style={{
          transformOrigin: `${SLOT_CENTER.x}px ${SLOT_CENTER.y}px`,
          scale: `${zoom}`,
          // окно уезжает к центру кадра, освобождая место вопросу сверху
          translate: `${interpolate(zoom, [1, 1.75], [0, 540 - SLOT_CENTER.x])}px ${interpolate(zoom, [1, 1.75], [0, 1180 - SLOT_CENTER.y])}px`,
        }}
      >
        <ScheduleBoard
          frame={10_000}
          messageAt={[0, 0, 0]}
          unfold={1}
          slotGlow={glow}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ backgroundColor: `rgba(255, 255, 255, ${dim})` }}
      />

      {/* вопрос доверия */}
      <Paper
        style={{
          left: 120,
          right: 150,
          top: SAFE.top + 120,
          padding: "40px 30px 46px",
          textAlign: "center",
          fontSize: 96,
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
