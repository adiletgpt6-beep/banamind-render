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
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";

// Финал: логотип, слоган, большая жёлтая кнопка и подсказка про ссылку.
// После последнего слова кадр держится TIMING.ctaHoldSec секунд.
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoPop = pop(frame, fps, 0);
  const timeline = useTimeline();
  const titleAt = Math.max(0, wordCue(timeline, "cta", "БалаГо", 8) - 4);
  // Кнопка — с началом призыва, подпись про ссылку — со словом «шилтеме».
  const buttonStart = Math.max(
    titleAt + 12,
    segmentCue(timeline, "cta", "cta") - 4,
  );
  const linkAt = Math.max(
    buttonStart + 8,
    wordCue(timeline, "cta", "шилтеме", buttonStart + 30) - 4,
  );
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
            ...fadeUp(frame, titleAt, 14, 40),
          }}
        >
          {TEXT.cta.title}
        </div>
        <div
          style={{
            marginTop: 56,
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
        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 34px",
            borderRadius: 999,
            backgroundColor: COLORS.navy,
            color: COLORS.white,
            fontSize: 54,
            fontWeight: 800,
            ...fadeUp(frame, linkAt, 12, 30),
          }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52">
            <path
              d="M22 30 L30 22 M20 16 L25 11 A9 9 0 0 1 41 27 L36 32 M32 36 L27 41 A9 9 0 0 1 11 25 L16 20"
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          {TEXT.cta.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
