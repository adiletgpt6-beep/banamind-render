import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { easeInOut, easeOut, pop } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { DotGrid, Paper, Tape, drop } from "./paper";
import { Road } from "./Road";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.idea;
export const IDEA_ROAD_Y = SAFE.top + 470;
const LOGO = { size: 300, top: SAFE.top + 20 };

// Разбросанные бумажки расписания (откуда → куда собираются вокруг логотипа).
const SCRAPS = [
  { from: [60, SAFE.top + 60, -12], to: [250, SAFE.top + 90, -8] },
  { from: [760, SAFE.top + 20, 10], to: [700, SAFE.top + 60, 7] },
  { from: [40, SAFE.top + 330, 8], to: [230, SAFE.top + 250, 5] },
  { from: [780, SAFE.top + 300, -9], to: [720, SAFE.top + 250, -6] },
] as const;

// 29–39 с: «БалаГонун идеясы ушул муктаждыктан жаралды.»
// Бумажки собираются вокруг логотипа, линия времени становится дорогой,
// появляются заметки «Ата-энеге жардам» и «Алдын ала пландаштыруу».
export const IdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const logoAt = Math.max(24, wordCue(timeline, "idea", "БалаГо", 12) - 4);
  const gather = interpolate(frame, [logoAt - 6, logoAt + 16], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const roadAt = Math.max(
    logoAt + 16,
    wordCue(timeline, "idea", "муктаждыктан", logoAt + 30) - 2,
  );
  const morph = interpolate(frame, [roadAt, roadAt + 24], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const idea2 = segmentCue(timeline, "idea", "idea2");
  const noteAt = [
    Math.max(
      roadAt + 12,
      wordCue(timeline, "idea", T.notes[0].word, idea2) - 4,
    ),
  ];
  noteAt.push(
    Math.max(
      noteAt[0] + 14,
      wordCue(timeline, "idea", T.notes[1].word, noteAt[0] + 40) - 8,
    ),
  );
  const logoPop = pop(frame, fps, logoAt);

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      {/* линия времени → дорога */}
      <Road
        y={IDEA_ROAD_Y}
        morph={morph}
        draw={interpolate(frame, [12, 26], [0.6, 1], {
          ...clamp,
          easing: easeOut,
        })}
        dashShift={Math.max(0, frame - roadAt) * 3}
      />

      {/* бумажки собираются вокруг логотипа */}
      {SCRAPS.map((s, i) => {
        const x = s.from[0] + (s.to[0] - s.from[0]) * gather;
        const y = s.from[1] + (s.to[1] - s.from[1]) * gather;
        const r = s.from[2] + (s.to[2] - s.from[2]) * gather;
        return (
          <Paper
            key={i}
            style={{
              left: x,
              top: y,
              width: 150,
              height: 110,
              padding: 18,
              rotate: `${r}deg`,
              scale: `${1 - 0.25 * gather}`,
              opacity: interpolate(
                frame,
                [12 + i * 3, 18 + i * 3],
                [0, 1],
                clamp,
              ),
            }}
          >
            {[0, 1, 2].map((k) => (
              <div
                key={k}
                style={{
                  height: 12,
                  marginBottom: 12,
                  borderRadius: 6,
                  width: `${[90, 60, 75][(i + k) % 3]}%`,
                  backgroundColor: k === 1 ? COLORS.yellow : COLORS.block,
                }}
              />
            ))}
          </Paper>
        );
      })}

      {/* логотип */}
      <div
        style={{
          position: "absolute",
          left: 540 - LOGO.size / 2,
          top: LOGO.top,
          opacity: interpolate(frame, [logoAt, logoAt + 6], [0, 1], clamp),
          scale: `${interpolate(logoPop, [0, 1], [0.5, 1])}`,
        }}
      >
        <Logo size={LOGO.size} />
      </div>

      {/* заметки-акценты */}
      {T.notes.map((n, i) => (
        <Paper
          key={n.text}
          style={{
            left: i ? 250 : 120,
            right: i ? 150 : 280,
            top: SAFE.top + 620 + i * 210,
            padding: "30px 34px",
            backgroundColor: i ? COLORS.white : COLORS.yellow,
            border: i ? `4px solid ${COLORS.yellow}` : "none",
            fontSize: 58,
            fontWeight: 900,
            lineHeight: 1.1,
            textAlign: "center",
            ...drop(frame, noteAt[i], i ? 2.5 : -3, 50),
          }}
        >
          <Tape
            width={120}
            rotate={i ? 6 : -6}
            style={
              i
                ? { top: -20, right: 30 }
                : {
                    top: -20,
                    left: 30,
                    backgroundColor: "rgba(255,255,255,0.75)",
                  }
            }
          />
          {n.text}
        </Paper>
      ))}
    </AbsoluteFill>
  );
};
