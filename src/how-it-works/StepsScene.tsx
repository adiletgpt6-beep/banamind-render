import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, HOW_TEXT, SAFE } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut, fadeUp } from "../components/anim";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { StepBadge, StepIcon } from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = HOW_TEXT.steps;
const ICONS = ["form", "school", "home"] as const;

// 0–3 с: заголовок и три шага видны с первого кадра; на слове
// «жөнөкөй» шаги по очереди «подпрыгивают», на «кадам» подсветка
// и стрелка ведут к первому шагу.
export const StepsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  const simpleAt = segmentCue(timeline, "steps", "simple");
  const threeAt = wordCue(timeline, "steps", "үч", simpleAt + 10);
  // Шаги «подпрыгивают» по очереди на слове «жөнөкөй».
  const bumpAt = wordCue(timeline, "steps", "жөнөкөй", simpleAt + 4);
  // На слове «кадам» подсветка переходит к шагу 1 и успевает завершиться
  // до перехода к следующей сцене.
  const focusStart = Math.min(
    Math.max(bumpAt + 22, wordCue(timeline, "steps", "кадам", threeAt + 3)),
    durationInFrames - timeline.timing.transitionFrames - 14,
  );
  const focus = interpolate(frame, [focusStart, focusStart + 12], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 70,
          left: SAFE.left - 20,
          right: SAFE.left - 20,
          textAlign: "center",
          fontSize: 104,
          fontWeight: 900,
          lineHeight: 1.08,
          // Читается с первого кадра; лёгкий «наезд» для живости.
          scale: interpolate(frame, [0, 10], [0.95, 1], {
            ...clamp,
            easing: easeOut,
          }),
        }}
      >
        {T.title}
      </div>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 380,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "16px 44px",
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            fontSize: 62,
            fontWeight: 900,
            boxShadow: `0 14px 36px ${COLORS.shadow}`,
            scale: `${1 + 0.06 * Math.sin(Math.PI * interpolate(frame, [threeAt, threeAt + 10], [0, 1], clamp))}`,
          }}
        >
          {T.subtitle}
        </div>
      </div>

      {/* Три шага: 1 → 2 → 3 */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 620,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 40,
        }}
      >
        {/* соединительная линия */}
        <div
          style={{
            position: "absolute",
            top: 145,
            left: 230,
            right: 230,
            height: 10,
            borderRadius: 5,
            backgroundColor: COLORS.block,
          }}
        />
        {ICONS.map((icon, i) => {
          const at = bumpAt + i * 6;
          const bump = interpolate(frame, [at, at + 10], [0, 1], clamp);
          const isFirst = i === 0;
          const dim = isFirst ? 1 : 1 - 0.45 * focus;
          return (
            <div
              key={icon}
              style={{
                position: "relative",
                width: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                opacity: dim,
                scale: `${1 + 0.08 * Math.sin(Math.PI * bump) + (isFirst ? 0.1 * focus : 0)}`,
              }}
            >
              <div
                style={{
                  width: 250,
                  height: 290,
                  borderRadius: 48,
                  backgroundColor: COLORS.white,
                  border: `6px solid ${isFirst && focus > 0.5 ? COLORS.yellow : COLORS.block}`,
                  boxSizing: "border-box",
                  boxShadow: `0 18px 44px ${COLORS.shadow}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <StepBadge n={i + 1} size={92} />
                <StepIcon kind={icon} size={124} />
              </div>
              <div style={{ fontSize: 52, fontWeight: 900 }}>{T.labels[i]}</div>
            </div>
          );
        })}
      </div>

      {/* Стрелка-подсказка: «начинаем с шага 1» */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 1050,
          left: 130,
          width: 260,
          display: "flex",
          justifyContent: "center",
          ...fadeUp(frame, focusStart + 2, 10, -30),
        }}
      >
        <svg width="90" height="90" viewBox="0 0 64 64">
          <path
            d="M32 54 V12 M16 28 L32 12 L48 28"
            fill="none"
            stroke={COLORS.yellow}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
