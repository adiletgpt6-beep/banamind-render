import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SAFE, TEXT } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { fadeUp, pop } from "../components/anim";

// 20–25 с: логотип, призыв и большая жёлтая кнопка.
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoPop = pop(frame, fps, 0);
  const buttonStart = Math.round(1.4 * fps);
  const buttonPop = pop(frame, fps, buttonStart);
  // Мягкая «пульсация» кнопки после появления.
  const pulse =
    frame > buttonStart + 20
      ? 1 +
        Math.sin(((frame - buttonStart - 20) / fps) * Math.PI * 2 * 0.8) * 0.03
      : 1;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 70,
          left: SAFE.left,
          right: SAFE.left,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Logo
          size={420}
          style={{
            scale: interpolate(logoPop, [0, 1], [0.6, 1]),
            opacity: interpolate(frame, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <div
          style={{
            marginTop: 48,
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.1,
            ...fadeUp(frame, 10, 18, 40),
          }}
        >
          {TEXT.cta.title}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 46,
            fontWeight: 700,
            lineHeight: 1.25,
            color: COLORS.navySoft,
            maxWidth: 820,
            ...fadeUp(frame, 22, 18, 30),
          }}
        >
          {TEXT.cta.subtitle}
        </div>
        <div
          style={{
            marginTop: 52,
            width: 820,
            padding: "36px 0",
            borderRadius: 999,
            backgroundColor: COLORS.yellow,
            fontSize: 72,
            fontWeight: 900,
            boxShadow: `0 22px 50px rgba(255, 180, 0, 0.45)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            opacity: interpolate(
              frame,
              [buttonStart, buttonStart + 6],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
            scale: interpolate(buttonPop, [0, 1], [0.7, 1]) * pulse,
          }}
        >
          {TEXT.cta.button}
          <svg width="60" height="44" viewBox="0 0 60 44">
            <path
              d="M4 22 H52 M36 6 L54 22 L36 38"
              fill="none"
              stroke={COLORS.navy}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
