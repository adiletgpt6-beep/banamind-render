import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeOut, pop } from "../components/anim";
import { Backpack } from "../morning-rush/icons";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { AdultFigure, MiniClock } from "./icons";
import { DotGrid, Marker, Paper, Tape, camera, drop } from "./paper";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = FOUNDER_TEXT.family;
const ACCENTS = [COLORS.navy, COLORS.yellow, COLORS.navySoft, COLORS.yellow];
const CARD_W = 180;
const CARD_GAP = 16;
const ROW_X = (1080 - (4 * CARD_W + 3 * CARD_GAP)) / 2;

// 0–7 с: «Үй-бүлөдө төрт чоң киши» — четыре взрослых и рюкзак.
// На «эч кимдин» у каждого появляются часы (заняты), затем вопрос
// «Баланы ким жеткирет?».
export const FamilyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  const fourAt = wordCue(timeline, "family", "төрт", 10);
  const marker = interpolate(frame, [fourAt, fourAt + 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const qAt = Math.max(
    fourAt + 20,
    segmentCue(timeline, "family", "family2") - 2,
  );
  const busyAt = Math.max(
    qAt + 10,
    wordCue(timeline, "family", "эч", qAt + 40) - 4,
  );
  const bagPop = pop(frame, fps, Math.max(18, qAt - 16));
  const [line1, line2] = [
    T.title.split(" ").slice(0, 2),
    T.title.split(" ").slice(2),
  ];

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        color: COLORS.navy,
        ...camera(
          frame,
          [
            [0, 1],
            [durationInFrames, 1.05],
          ],
          540,
          760,
        ),
      }}
    >
      <DotGrid />
      {/* заголовок — читается с первого кадра */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 10,
          left: SAFE.left - 20,
          right: SAFE.left - 20,
          textAlign: "center",
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 1.08,
          scale: `${interpolate(frame, [0, 10], [0.96, 1], { ...clamp, easing: easeOut })}`,
        }}
      >
        {line1.map((w) => (
          <span key={w}>
            {w === T.highlight ? (
              <Marker progress={marker}>{w}</Marker>
            ) : (
              w
            )}{" "}
          </span>
        ))}
        <br />
        {line2.join(" ")}
      </div>

      {/* четыре взрослых */}
      {ACCENTS.map((accent, i) => {
        const at = 2 + i * 5;
        const busy = interpolate(
          frame,
          [busyAt + i * 4, busyAt + i * 4 + 8],
          [0, 1],
          clamp,
        );
        return (
          <Paper
            key={i}
            style={{
              left: ROW_X + i * (CARD_W + CARD_GAP),
              top: SAFE.top + 290,
              width: CARD_W,
              height: 230,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...drop(frame, at, [-3, 2, -1.5, 3][i]),
            }}
          >
            <Tape
              width={90}
              rotate={[-6, 4, -3, 5][i]}
              style={{ top: -18, left: 45 }}
            />
            <AdultFigure size={150} accent={accent} busy={busy} />
            <div
              style={{
                position: "absolute",
                right: -14,
                top: -14,
                scale: `${busy}`,
              }}
            >
              <MiniClock size={64} angle={frame * 6} />
            </div>
          </Paper>
        );
      })}

      {/* рюкзак — одна нерешённая задача */}
      <div
        style={{
          position: "absolute",
          left: 540 - 110,
          top: SAFE.top + 590,
          scale: `${bagPop}`,
          rotate: `${interpolate(bagPop, [0, 1], [12, -4])}deg`,
          filter: "drop-shadow(0 18px 30px rgba(20, 40, 90, 0.2))",
        }}
      >
        <Backpack size={220} />
        <div
          style={{
            position: "absolute",
            right: -70,
            top: -20,
            width: 92,
            height: 92,
            borderRadius: "50%",
            backgroundColor: COLORS.navy,
            color: COLORS.yellow,
            fontSize: 66,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: `${pop(frame, fps, qAt + 4)}`,
          }}
        >
          ?
        </div>
      </div>

      {/* вопрос */}
      <Paper
        style={{
          left: 130,
          right: 150,
          top: SAFE.top + 930,
          padding: "26px 30px",
          backgroundColor: COLORS.yellow,
          border: "none",
          textAlign: "center",
          fontSize: 70,
          fontWeight: 900,
          lineHeight: 1.1,
          ...drop(frame, qAt, -2),
        }}
      >
        <Tape
          width={130}
          rotate={6}
          style={{
            top: -22,
            right: 40,
            backgroundColor: "rgba(255,255,255,0.75)",
          }}
        />
        {T.question}
      </Paper>
    </AbsoluteFill>
  );
};
