import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SAFE, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { easeOut, fadeUp, pop } from "../components/anim";

// Будильник: стрелки быстро бегут — «утро, всё в спешке».
const Clock: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const minute = frame * 18;
  const hour = 210 + frame * 1.5;
  return (
    <svg width="230" height="230" viewBox="0 0 230 230">
      <circle cx="58" cy="44" r="26" fill={COLORS.yellow} />
      <circle cx="172" cy="44" r="26" fill={COLORS.yellow} />
      <circle
        cx="115"
        cy="122"
        r="92"
        fill={COLORS.white}
        stroke={COLORS.navy}
        strokeWidth="14"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x="111"
          y="44"
          width="8"
          height="16"
          rx="4"
          fill={i % 3 === 0 ? COLORS.navy : COLORS.block}
          transform={`rotate(${i * 30} 115 122)`}
        />
      ))}
      <rect
        x="110"
        y="72"
        width="10"
        height="56"
        rx="5"
        fill={COLORS.navy}
        transform={`rotate(${hour} 115 122)`}
      />
      <rect
        x="111.5"
        y="58"
        width="7"
        height="70"
        rx="3.5"
        fill={COLORS.yellow}
        transform={`rotate(${minute} 115 122)`}
      />
      <circle cx="115" cy="122" r="10" fill={COLORS.navy} />
    </svg>
  );
};

const Line: React.FC<{
  readonly text: string;
  readonly highlight?: string;
  readonly start: number;
  readonly highlightAt?: number;
  readonly fontSize: number;
  readonly frame: number;
  // marker — жёлтая подложка; color — слово окрашивается жёлтым.
  readonly mode?: "marker" | "color";
}> = ({
  text,
  highlight,
  start,
  highlightAt = start,
  fontSize,
  frame,
  mode = "marker",
}) => {
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: fontSize * 0.26,
        rowGap: 4,
        fontSize,
        fontWeight: 900,
        lineHeight: 1.12,
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const isHighlight =
          highlight !== undefined && word.startsWith(highlight);
        return (
          <span
            key={i}
            style={{
              position: "relative",
              display: "inline-block",
              ...fadeUp(frame, start + i * 2, 10, 40),
            }}
          >
            {isHighlight && mode === "marker" ? (
              <span
                style={{
                  position: "absolute",
                  left: -10,
                  right: -10,
                  bottom: fontSize * 0.08,
                  height: fontSize * 0.42,
                  borderRadius: 12,
                  backgroundColor: COLORS.yellow,
                  transformOrigin: "0% 50%",
                  scale: `${interpolate(
                    frame,
                    [highlightAt, highlightAt + 9],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: easeOut,
                    },
                  )} 1`,
                }}
              />
            ) : null}
            <span
              style={{
                position: "relative",
                color:
                  isHighlight && mode === "color" && frame >= highlightAt
                    ? COLORS.yellow
                    : undefined,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Крючок: вопрос, знакомый каждому родителю. Первый кадр уже с текстом.
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  const highlightAt = wordCue(timeline, "hook", TEXT.hook.highlight, 10);
  const line2Start = segmentCue(timeline, "hook", "hook2");
  const kimAt = wordCue(timeline, "hook", "ким", line2Start + 20);
  const clockPop = pop(frame + 6, fps, 0);

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          scale: interpolate(clockPop, [0, 1], [0.7, 1]),
          rotate: `${Math.sin(frame * 1.7) * (frame < 40 ? 4 : 1.5)}deg`,
        }}
      >
        <Clock frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 330,
          left: SAFE.left - 20,
          right: SAFE.left - 20,
          // Первый кадр уже читается целиком; лёгкий «наезд» для живости.
          scale: interpolate(frame, [0, 10], [0.94, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeOut,
          }),
        }}
      >
        <Line
          text={TEXT.hook.line1}
          highlight={TEXT.hook.highlight}
          start={-30}
          highlightAt={highlightAt}
          fontSize={100}
          frame={frame}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 740,
          left: SAFE.left,
          right: SAFE.left,
          padding: "34px 30px",
          borderRadius: 40,
          backgroundColor: COLORS.navy,
          color: COLORS.white,
          boxShadow: `0 24px 60px ${COLORS.shadow}`,
          ...fadeUp(frame, line2Start - 4, 12, 50),
        }}
      >
        <Line
          text={TEXT.hook.line2}
          highlight="ким"
          mode="color"
          start={line2Start - 2}
          highlightAt={kimAt}
          fontSize={76}
          frame={frame}
        />
      </div>
    </AbsoluteFill>
  );
};
