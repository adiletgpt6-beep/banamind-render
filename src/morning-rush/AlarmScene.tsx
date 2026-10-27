import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, MORNING_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeOut, pop } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import { AlarmClock, Backpack } from "./icons";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = MORNING_TEXT.alarm;

// 0–3 с: будильник звенит с первого кадра, стрелки бегут, выпрыгивает
// рюкзак; крупный вопрос появляется по словам вместе с голосом.
export const AlarmScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();

  // Звон: сильная тряска в начале, затем затихает.
  const ring = interpolate(frame, [0, 36], [1, 0], clamp);
  const shake = Math.sin(frame * 1.9) * 7 * ring;
  // Стрелки «бегут»: утро, 7:42 и дальше.
  const minute = 252 + frame * 4;
  const hour = 231 + frame * (4 / 12);

  const bagPop = pop(frame, fps, 10);
  const highlightAt = wordCue(timeline, "alarm", T.highlight, 14);
  const marker = interpolate(frame, [highlightAt, highlightAt + 8], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  const words = T.question.split(" ");

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      {/* жёлтый круг-подложка */}
      <div
        style={{
          position: "absolute",
          left: 540 - 270,
          top: SAFE.top + 120,
          width: 540,
          height: 540,
          borderRadius: "50%",
          backgroundColor: COLORS.yellowSoft,
          scale: `${interpolate(frame, [0, 10], [0.9, 1], { ...clamp, easing: easeOut })}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 240,
          top: SAFE.top + 140,
          width: 480,
          height: 480,
          rotate: `${shake}deg`,
          translate: `${Math.sin(frame * 2.3) * 6 * ring}px 0px`,
        }}
      >
        <AlarmClock size={480} hour={hour} minute={minute} ringing={ring} />
      </div>

      {/* рюкзак */}
      <div
        style={{
          position: "absolute",
          left: 690,
          top: SAFE.top + 440,
          rotate: `${interpolate(bagPop, [0, 1], [20, -8])}deg`,
          scale: `${bagPop}`,
          filter: `drop-shadow(0 18px 30px ${COLORS.shadow})`,
        }}
      >
        <Backpack size={210} />
      </div>

      {/* вопрос */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 740,
          left: SAFE.left,
          right: SAFE.left,
          textAlign: "center",
          fontSize: 92,
          fontWeight: 900,
          lineHeight: 1.12,
        }}
      >
        {words.map((w, i) => {
          const at = Math.max(
            2 + i * 3,
            wordCue(timeline, "alarm", w, 2 + i * 6) - 6,
          );
          const p = interpolate(frame, [at, at + 8], [0, 1], {
            ...clamp,
            easing: easeOut,
          });
          const isHighlight = w.startsWith(T.highlight);
          return (
            <span
              key={w}
              style={{
                display: "inline-block",
                margin: "0 12px",
                opacity: p,
                translate: `0px ${(1 - p) * 40}px`,
                position: "relative",
              }}
            >
              {isHighlight ? (
                <span
                  style={{
                    position: "absolute",
                    left: -10,
                    right: -10,
                    bottom: 6,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: COLORS.yellow,
                    transformOrigin: "left center",
                    scale: `${marker} 1`,
                  }}
                />
              ) : null}
              <span style={{ position: "relative" }}>{w}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
