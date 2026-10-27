import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SAFE, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { easeInOut, easeOut, fadeUp, pop } from "../components/anim";

// 0–5 с: вопрос родителю, затем логотип BalaGo и подпись.
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = TEXT.hook.question.split(" ");

  const wordDelay = 4;
  const moveStart = Math.round(2.6 * fps);
  const moveEnd = moveStart + Math.round(0.8 * fps);
  const logoStart = moveStart + 12;
  const taglineStart = logoStart + 18;
  const logoPop = pop(frame, fps, logoStart);

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          right: SAFE.left,
          top: interpolate(frame, [moveStart, moveEnd], [640, SAFE.top + 10], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeInOut,
          }),
          scale: interpolate(frame, [moveStart, moveEnd], [1, 0.74], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeInOut,
          }),
          transformOrigin: "50% 0%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 24,
          rowGap: 6,
          fontSize: 92,
          fontWeight: 900,
          lineHeight: 1.12,
          textAlign: "center",
        }}
      >
        {words.map((word, i) => {
          const isHighlight = word === TEXT.hook.highlight;
          const highlightStart = words.length * wordDelay + 6;
          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                ...fadeUp(frame, 4 + i * wordDelay, 16, 50),
              }}
            >
              {isHighlight ? (
                <span
                  style={{
                    position: "absolute",
                    left: -8,
                    right: -8,
                    bottom: 8,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: COLORS.yellow,
                    transformOrigin: "0% 50%",
                    scale: `${interpolate(
                      frame,
                      [highlightStart, highlightStart + 12],
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
              <span style={{ position: "relative" }}>{word}</span>
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 700,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
        }}
      >
        <Logo
          size={500}
          style={{
            opacity: interpolate(frame, [logoStart, logoStart + 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(logoPop, [0, 1], [0.6, 1]),
            rotate: `${interpolate(logoPop, [0, 1], [-8, 0])}deg`,
          }}
        />
        <div
          style={{
            padding: "20px 52px",
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            fontSize: 64,
            fontWeight: 900,
            boxShadow: `0 16px 40px ${COLORS.shadow}`,
            ...fadeUp(frame, taglineStart, 16, 40),
          }}
        >
          {TEXT.hook.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
